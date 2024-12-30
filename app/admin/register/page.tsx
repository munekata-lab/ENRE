"use client";

import React from "react";
import { db } from "@/lib/firebase/client";
import { getUserFromCookie } from "@/lib/session";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
  runTransaction, 
  setDoc,
} from "firebase/firestore";
import { useEffect, useRef, useState, FormEvent, useCallback, ChangeEvent } from "react";
import { fetchMode } from "@/lib/dbActions";
import { redirect } from "next/navigation";
import NotFound from "../../not-found";
import { LoadingAnimation } from "../../ui/skeletons";

type Props = {
    targetDay: string;
  };

export default function Admin() {
  const [isAdmin, setIsAdmin] = useState(true); // 最初のパスワード入力スキップ
  const [login, setLogin] = useState(false);
  const [password, setPassword] = useState("");
  const [userMode, setUserMode] = useState(undefined);

  useEffect(() => {
    (async () => {
      const user = await getUserFromCookie();
      user === null && redirect("/login");
      const uid = user.uid;
      if (!uid) return;

      const mode = await fetchMode(user?.uid); //modecollectionのdevを取ってる、usersのdev(usermode)
      setUserMode(mode?.userMode);

      const userDocRef = doc(db, "users", uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setLogin(data.dev);
      }
    })();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/adminAuth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });
      if (response.ok) {
        setIsAdmin(true);
        setLogin(false);
      } else {
        alert("Invalid password");
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-0 text-center">
      {/* {login && (
        <div className="flex flex-col justify-center items-center">
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Admin Password"
            />
            <button
              type="submit"
              className="m-2 mt-2 px-4 py-1 text-white font-semibold bg-green-700 rounded inline-block"
            >
              Login
            </button>
          </form>
        </div>
      )} */}
      {userMode === false ? (
        <NotFound />
      ) : userMode === undefined ? (
        <div className="flex min-h-screen flex-col items-center justify-between pb-20">
          <LoadingAnimation />
        </div>
      ) : (
        <div className="justify-center mt-24 w-full h-full">
          <div className="text-2xl font-bold top-24 w-full">
            <h1 className="text-center">管理画面</h1>
            <ProgramView />
            {/* <Home /> */}
            <div className="h-full">
              <ProgramListView />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function ProgramView() {
  const [programPass, setProgramPass] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [place, setPlace] = useState("");
  const [owner, setOwner] = useState("");
  const [loadingPoint, setLoadingPoint] = useState("");
  const [point, setPoint] = useState("");
  const [type, setType] = useState("");
  const [field, setField] = useState("");
  const [day, setDay] = useState("");
  const [open, setOpen] = useState("");
  const [close, setClose] = useState("");
  const [thema, setThema] = useState("");
  const [completionMessage, setCompletionMessage] = useState("");
  const [loading, setLoading] = useState(false); // ローディング状態を追加

  // 入力値をリセットする関数
  const resetForm = () => {
    setProgramPass("");
    setTitle("");
    setContent("");
    setPlace("");
    setOwner("");
    setLoadingPoint("");
    setPoint("");
    setType("");
    setField("");
    setDay("");
    setOpen("");
    setClose("");
    setThema("");
    setCompletionMessage("");
  };

  // バリデーションチェック
  const validateForm = () => {
    if (!title || !content || !day || !place || !owner || !loadingPoint || !point || !field) {
      alert("記入漏れがあります");
      return false;
    }
    return true;
  };

  // ドキュメント番号を決める関数
  const getNextDocumentNumber = async () => {
    const counterDocRef = doc(db, "counter", "programCounter");

    return await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterDocRef);

      if (!counterDoc.exists()) {
        // カウンターが存在しない場合は初期化
        transaction.set(counterDocRef, { count: 1 });
        return 1; // 最初の番号を返す
      } else {
        const currentCount = counterDoc.data().count;
        const nextCount = currentCount + 1;
        transaction.update(counterDocRef, { count: nextCount });
        return nextCount;
      }
    });
  };

  // イベントを追加する関数
  const onNotify = async () => {
    if (!validateForm()) return;

    const result = confirm("イベントを追加しますか？");
    if (!result) return;

    setLoading(true); // ローディング開始

    try {
      // ドキュメント番号を取得
      const programNumber = await getNextDocumentNumber();

      // type が空の場合 link を null に、それ以外は /type の形式
      const link = type ? `/${type}` : null;

      // 3桁形式で programNumber をフォーマット
      const programIdFormatted = String(programNumber).padStart(3, "0");
      const placeId = `P${programIdFormatted}`;

      // メッセージの作成
      const message = {
        programPass,
        title,
        content,
        thema,
        completionMessage,
        place,
        owner,
        loadingPoint: Number(loadingPoint),
        point: Number(point),
        type,
        field,
        day,
        open,
        close,
        link,
      };

      // Firestoreに追加
      const query = collection(db, "program2025_1");
      const docRef = doc(query, `${programNumber}`); // ドキュメントIDを手動で設定
      await setDoc(docRef, message);

      // QR2025_1 にもデータを追加
      const queryQR = collection(db, "QR2025_1");
      const docRefQR = doc(queryQR, `${programNumber}`); // 同じドキュメントID
      const qrData = {
        placeId,
        placeNumber: 1,
        loadingPoint: Number(loadingPoint),
        field,
        programId: programNumber, // ドキュメント番号をそのまま利用
        type: type ? "checkin" : "checkout", // type が空の場合は "checkout"、それ以外は "checkin"
      };
      await setDoc(docRefQR, qrData); // QR用に必要なデータを設定

      alert("イベントが正常に追加されました！");
      resetForm(); // フォームのリセット
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("イベントの追加に失敗しました。もう一度お試しください。");
    } finally {
      setLoading(false); // ローディング終了
    }
  };

  // 各フィールドの変更ハンドラ
  const createChangeHandler =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (event: React.ChangeEvent<HTMLInputElement>) =>
      setter(event.target.value);

  return (
    <div className="bg-orange-200 rounded p-5">
      <p className="text-xl font-bold mb-3">イベント画面</p>

      {/* プログラムID */}
      <InputField
        id="programPass"
        label="プログラムパスワード"
        placeholder="空けておいていてください"
        value={programPass}
        onChange={createChangeHandler(setProgramPass)}
      />

      {/* タイトル */}
      <InputField
        id="title"
        label="タイトル"
        placeholder="Title"
        value={title}
        onChange={createChangeHandler(setTitle)}
      />

      {/* 内容 */}
      <InputField
        id="content"
        label="概要"
        placeholder="Content"
        value={content}
        onChange={createChangeHandler(setContent)}
      />

      {/* お題 */}
      <InputField
        id="thema"
        label="お題"
        placeholder="任意"
        value={thema}
        onChange={createChangeHandler(setThema)}
      />

      {/* クリア後表示文 */}
      <InputField
        id="completionMessage"
        label="ミッションクリア時に表示する文章"
        placeholder="任意"
        value={completionMessage}
        onChange={createChangeHandler(setCompletionMessage)}
      />

      {/* 場所, 運営 */}
      <div className="flex space-x-4">
        <div className="flex flex-col w-full">
          <InputField
            id="place"
            label="場所"
            placeholder="Place"
            value={place}
            onChange={createChangeHandler(setPlace)}
          />
        </div>
        <div className="flex flex-col w-full">
          <InputField
            id="owner"
            label="運営"
            placeholder="Owner"
            value={owner}
            onChange={createChangeHandler(setOwner)}
          />
        </div>
      </div>

      {/* 点数 */}
      <div className="flex space-x-4">
        <div className="flex flex-col w-full">
          <InputField
            id="loadingPoint"
            label="得点1(QR読み取り時付与)"
            placeholder="半角数字"
            value={loadingPoint}
            onChange={createChangeHandler(setLoadingPoint)}
          />
        </div>
        <div className="flex flex-col w-full">
          <InputField
            id="point"
            label="得点2(イベント完遂時付与)"
            placeholder="半角数字"
            value={point}
            onChange={createChangeHandler(setPoint)}
          />
        </div>
      </div>

      <div className="flex space-x-4">
        {/* 形式(type) */}
        <div className="flex flex-col w-full">
          <label htmlFor="type" className="block text-left">イベント形式</label>
          <select
            id="type"
            value={field}
            onChange={(e) => setType((e.target.value))}
            className="bg-gray-50 border border-gray-300 text-sm rounded-lg w-full p-2.5"
          >
            <option value="">イベント形式を選択</option>
            <option value="biome">biome</option>
            <option value="fallenleaves">落ち葉投稿</option>
            <option value="postphoto">写真投稿系</option>
            <option value="expressfeelings">文章投稿系</option>
            <option value="walk">帰宅</option>
            <option value="">QR読み取りのみ(例：フリーコーヒー)</option>
          </select>
        </div>
        {/* ジャンル */}
        <div className="flex flex-col w-full">
          <label htmlFor="field" className="block text-left">ジャンル(3種類)</label>
          <select
            id="field"
            value={field}
            onChange={(e) => setField((e.target.value))}
            className="bg-gray-50 border border-gray-300 text-sm rounded-lg w-full p-2.5"
          >
            <option value="">ジャンルを選択</option>
            <option value="1">知る</option>
            <option value="2">使う</option>
            <option value="3">守る</option>
          </select>
        </div>
      </div>

      {/* Day (選択式) */}
      <div className="flex space-x-4 mt-2">
        <div className="flex flex-col w-full">
          <label htmlFor="day" className="block text-left">日</label>
          <select
            id="day"
            value={day}
            onChange={(e) => setDay((e.target.value))}
            className="bg-gray-50 border border-gray-300 text-sm rounded-lg w-full p-2.5"
          >
            <option value="">開催日を選択</option>
            <option value="1">1/8(水)</option>
            <option value="2">1/9(木)</option>
            <option value="3">1/10(金)</option>
            {/* <option value="4">4</option> */}
            {/* <option value="5">5</option> */}
          </select>
        </div>

        {/* 開始 */}
        <div className="flex flex-col w-full">
          <InputField
            id="open"
            label="開始"
            placeholder="例: 13:00"
            value={open}
            onChange={createChangeHandler(setOpen)}
          />
        </div>
        {/* 終了 */}
        <div className="flex flex-col w-full">
          <InputField
            id="close"
            label="終了"
            placeholder="例: 14:00"
            value={close}
            onChange={createChangeHandler(setClose)}
          />
        </div>
      </div>

      <button
        className="mt-3 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={onNotify}
        disabled={loading}
      >
        {loading ? "送信中..." : "送信"}
      </button>
    </div>
  );
}

type Program = {
  id: string;
  programPass: string;
  title: string;
  content: string;
  thema: string;
  completionMessage: string;
  place: string;
  owner: string;
  loadingPoint: string;
  point: string;
  type: string;
  field: string;
  day: string;
  open: string;
  close: string;
};
  
type ProgramRetouchViewProps = {
    program: Program; // 編集するプログラムデータ
};
  
function ProgramRetouchView({ program }: ProgramRetouchViewProps) {
    const [isModalOpen, setIsModalOpen] = useState(false); // モーダル状態の管理
    const [programPass, setProgramPass] = useState(program.programPass);
    const [title, setTitle] = useState(program.title);
    const [content, setContent] = useState(program.content);
    const [thema, setThema] = useState(program.thema);
    const [completionMessage, setCompletionMessage] = useState(program.completionMessage);
    const [place, setPlace] = useState(program.place);
    const [owner, setOwner] = useState(program.owner);
    const [loadingPoint, setLoadingPoint] = useState(program.loadingPoint);
    const [point, setPoint] = useState(program.point);
    const [type, setType] = useState(program.type);
    const [field, setField] = useState(program.field);
    const [day, setDay] = useState(program.day);
    const [open, setOpen] = useState(program.open);
    const [close, setClose] = useState(program.close);
  
    const handleOpenModal = () => {
      // 初期状態にリセット
      setProgramPass(program.programPass);
      setTitle(program.title);
      setContent(program.content);
      setThema(program.thema);
      setCompletionMessage(program.completionMessage);
      setPlace(program.place);
      setOwner(program.owner);
      setLoadingPoint(program.loadingPoint);
      setPoint(program.point);
      setType(program.type);
      setField(program.field);
      setDay(program.day);
      setOpen(program.open);
      setClose(program.close);
  
      setIsModalOpen(true); // モーダルを開く
    };
    const handleCancelModal = () => {
      const confirmClose = window.confirm("編集した内容は破棄されますがよろしいですか？");
      if (confirmClose) {
          setIsModalOpen(false); // モーダルを閉じる
      }
    };
    const handleCloseModal = () => {
        setIsModalOpen(false); // 警告なしでモーダルを閉じる
    };
  
    const handleUpdate = async () => {
      const result = confirm("プログラムを更新しますか？");
      if (!result) return;
  
      try {
        const docRef = doc(db, "program2025_1", program.id);
        await updateDoc(docRef, {
          programPass,
          title,
          content,
          thema,
          completionMessage,
          place,
          owner,
          loadingPoint,
          point,
          type,
          field,
          day,
          open,
          close,
        });
  
        alert("プログラムが更新されました！");
        handleCloseModal(); // 更新成功後にモーダルを閉じる
      } catch (error) {
        console.error("更新中にエラーが発生しました:", error);
        alert("更新に失敗しました。");
      }
    };
  
    return (
      <>
        {/* モーダルを開くボタン */}
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={handleOpenModal}
        >
          編集
        </button>
  
        {/* モーダルの表示 */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-0 flex justify-center items-center">
            <div className="relative w-full max-w-3xl bg-white p-6 rounded-lg shadow-lg">
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                onClick={handleCancelModal}
              >
                ✕
              </button>
              <div className="flex flex-col space-y-4">
                <p className="mt-1 text-lg font-bold">イベント更新画面</p>
                <p className="mt-1 text-sm text-left">プログラムID</p>
                <input
                  type="text"
                  value={programPass}
                  onChange={(e) => setProgramPass(e.target.value)}
                  placeholder="programPass"
                  className="mt-1 text-sm w-full p-1 border rounded"
                />
                <p className="mt-1 text-sm text-left">タイトル</p>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title"
                  className="mt-1 text-sm w-full p-1 border rounded"
                />
                <p className="mt-1 text-sm text-left">概要</p>
                <input
                  type="text"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Content"
                  className="mt-1 text-sm w-full p-1 border rounded"
                />
                <p className="mt-1 text-sm text-left">お題</p>
                <input
                  type="text"
                  value={thema}
                  onChange={(e) => setThema(e.target.value)}
                  placeholder="Thema"
                  className="mt-1 text-sm w-full p-1 border rounded"
                />
                <p className="mt-1 text-sm text-left">ミッションクリア時に表示する文章</p>
                <input
                  type="text"
                  value={completionMessage}
                  onChange={(e) => setCompletionMessage(e.target.value)}
                  placeholder="任意"
                  className="mt-1 text-sm w-full p-1 border rounded"
                />
                <div className="flex space-x-4 items-center mt-1">
                  <div className="flex flex-col w-full">
                    <p className="mt-0 text-sm text-left mb-0">場所</p>
                    <input
                      type="text"
                      value={place}
                      onChange={(e) => setPlace(e.target.value)}
                      placeholder="Place"
                      className="mt-1 text-sm w-full p-1 border rounded"
                    />
                  </div>
                  <div className="flex flex-col w-full">
                    <p className="mt-0 text-sm text-left mb-0">運営</p>
                    <input
                      type="text"
                      value={owner}
                      onChange={(e) => setOwner(e.target.value)}
                      placeholder="Owner"
                      className="mt-1 text-sm w-full p-1 border rounded"
                    />
                  </div>
                </div>
                <div className="flex space-x-4 items-center mt-1">
                  <div className="flex flex-col w-full">
                    <p className="mt-0 text-sm text-left mb-0">得点1</p>
                    <input
                      type="text"
                      value={loadingPoint}
                      onChange={(e) => setLoadingPoint(e.target.value)}
                      placeholder=""
                      className="mt-1 text-sm w-full p-1 border rounded"
                    />
                  </div>
                  <div className="flex flex-col w-full">
                    <p className="mt-0 text-sm text-left mb-0">得点2</p>
                    <input
                      type="text"
                      value={point}
                      onChange={(e) => setPoint(e.target.value)}
                      placeholder=""
                      className="mt-1 text-sm w-full p-1 border rounded"
                    />
                  </div>
                </div>
                <div className="flex space-x-4 items-center mt-1">
                  <div className="flex flex-col w-full">
                    <p className="mt-0 mb-0 text-sm text-left">形式</p>
                    <input
                      type="text"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      placeholder="イベント形式"
                      className="mt-1 text-sm w-full p-1 border rounded"
                    />
                  </div>
                  <div className="flex flex-col w-full">
                    <p className="mt-0 mb-0 text-sm text-left">ジャンル(半角数字)</p>
                    <input
                      type="text"
                      value={field}
                      onChange={(e) => setField(e.target.value)}
                      placeholder="1:知る 2:使う 3:守る"
                      className="mt-1 text-sm w-full p-1 border rounded"
                    />
                  </div>
                </div>
                <div className="flex space-x-4 items-center mt-1">
                  <div className="flex flex-col w-full">
                    <p className="mt-0 text-sm text-left mb-0">日</p>
                    <input
                      type="text"
                      value={day}
                      onChange={(e) => setDay(e.target.value)}
                      placeholder="1と入力してください"
                      className="mt-1 text-sm w-full p-1 border rounded"
                    />
                  </div>
                  <div className="flex flex-col w-full">
                    <p className="mt-0 text-sm text-left mb-0">開始</p>
                    <input
                      type="text"
                      value={open}
                      onChange={(e) => setOpen(e.target.value)}
                      placeholder="例: 13:00"
                      className="mt-1 text-sm w-full p-1 border rounded"
                    />
                  </div>
                  <div className="flex flex-col w-full">
                    <p className="mt-0 text-sm text-left mb-0">終了</p>
                    <input
                      type="text"
                      value={close}
                      onChange={(e) => setClose(e.target.value)}
                      placeholder="例: 14:00"
                      className="mt-1 text-sm w-full p-1 border rounded"
                    />
                  </div>
                </div>
                <button
                  onClick={handleUpdate}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  更新
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
}

// 再利用可能な入力フィールドコンポーネント
type InputFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  placeholder,
  value,
  onChange,
}) => (
  <div className="mb-2">
    <label htmlFor={id} className="block text-left">
      {label}
    </label>
    <input
      id={id}
      className="bg-gray-50 border border-gray-300 text-sm rounded-lg w-full p-2.5"
      placeholder={placeholder}
      type="text"
      value={value}
      onChange={onChange}
    />
  </div>
);

// プログラムリスト表示
function ProgramListView() {
    return (
        <div className="bg-blue-500 rounded">
            <p className="mt-1 text-xl font-bold">イベント一覧</p>
            <div className="p-2">
                <div className="grid grid-cols-3 h-full p-2 gap-1">
                    <div className="bg-blue-200 h-full">
                        <p className="mt-1 text-xl font-bold">1/8(水) 1日目</p>
                        <ProgramsView targetDay="1"/>
                    </div>
                    <div className="bg-blue-200 h-full">
                        <p className="mt-1 text-xl font-bold">1/9(水) 2日目</p>
                        <ProgramsView targetDay="2"/>
                    </div>
                    <div className="bg-blue-200 h-full">
                        <p className="mt-1 text-xl font-bold">1/10(水) 3日目</p>
                        <ProgramsView targetDay="3"/>
                    </div>
                    {/* <div className="bg-blue-200 h-full">
                        <p className="mt-1 text-xl font-bold">4日目</p>
                        <ProgramsView targetDay="4"/>
                    </div>
                    <div className="bg-blue-200 h-full">
                        <p className="mt-1 text-xl font-bold">5日目</p>
                        <ProgramsView targetDay="5"/>
                    </div> */}
                </div>
            </div>
        </div>
    );
}

// // 日単位のプログラムリスト取得と表示
function ProgramsView({ targetDay }: Props) {
    const [programList, setProgramList] = useState<Program[]>([]);
  
    useEffect(() => {
      const q = query(
        collection(db, "program2025_1"),
        where("day", "==", targetDay)
      );
  
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const programs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Program[];
        setProgramList(programs);
      });
  
      return () => unsubscribe();
    }, [targetDay]);
  
    return (
      <div className="w-full min-h-[98%] overflow-scroll">
        {programList.map((program) => (
          <div key={program.id} className="mb-3 w-full p-[3%]">
            <div className="bg-white rounded p-4 flex flex-col leading-normal">
              <div className="w-full">
                <div className="text-gray-900 font-bold text-xl">
                  {program.title}
                </div>
                <p className="text-gray-700 text-sm">{program.content}</p>
              </div>
              {/* <div className="flex justify-between text-sm mt-2"> */}
              <div className="grid grid-cols-2 mt-2 text-sm">
                <p className="text-gray-600">得点1: {program.loadingPoint}</p>
                <p className="text-gray-600">得点2: {program.point}</p>
              </div>
              <div className="grid grid-cols-2 mt-2 text-sm">
                <p className="text-gray-600">運営: {program.owner}</p>
                <p className="text-gray-600">場所: {program.place}</p>
              </div>
              <div className="grid grid-cols-2 mt-2 text-sm">
                <div className="text-center">開始: {program.open}</div>
                <div className="text-center">終了: {program.close}</div>
              </div>
              <div className="font-bold mt-2 text-sm">
                {/* 各プログラムごとに編集ボタンを表示 */}
                <ProgramRetouchView program={program} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
}

// function ProgramsView({ targetDay }: Props) {
//   const [programList, setProgramList] = useState<Program[]>([]);
//   const [qrList, setQrList] = useState<Record<string, any>[]>([]); // QR2025_1 データ用

//   useEffect(() => {
//     const qProgram = query(
//       collection(db, "program2025_1"),
//       where("day", "==", targetDay)
//     );

//     const unsubscribeProgram = onSnapshot(qProgram, (snapshot) => {
//       const programs = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       })) as Program[];
//       setProgramList(programs);
//     });

//     return () => unsubscribeProgram();
//   }, [targetDay]);

//   useEffect(() => {
//     // QR2025_1 コレクションの全データを取得
//     const qQR = collection(db, "QR2025_1");

//     const unsubscribeQR = onSnapshot(qQR, (snapshot) => {
//       const qrData = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setQrList(qrData);
//     });

//     return () => unsubscribeQR();
//   }, []);

//   // `programList` と `qrList` を結合して表示する
//   const combinedList = programList.map((program) => {
//     const qrData = qrList.find((qr) => qr.id === program.id) || {};
//     return { ...program, ...qrData };
//   });

//   return (
//     <div className="w-full min-h-[98%] overflow-scroll">
//       {combinedList.map((program) => (
//         <div key={program.id} className="mb-3 w-full p-[3%]">
//           <div className="bg-white rounded p-4 flex flex-col leading-normal">
//             <div className="w-full">
//               <div className="text-gray-900 font-bold text-xl">
//                 {program.title}
//               </div>
//               <p className="text-gray-700 text-sm">{program.content}</p>
//             </div>
//             <div className="flex justify-between text-sm mt-2">
//               {program.loadingPoint !== undefined && (
//                 <p className="text-gray-600">得点1: {program.loadingPoint}</p>
//               )}
//               <p className="text-gray-600">得点2: {program.point}</p>
//               <p className="text-gray-600">運営: {program.owner}</p>
//               <p className="text-gray-600">場所: {program.place}</p>
//             </div>
//             <div className="grid grid-cols-2 mt-2 text-sm">
//               <div className="text-center">開始: {program.open}</div>
//               <div className="text-center">終了: {program.close}</div>
//             </div>
//             <div className="font-bold mt-2 text-sm">
//               {/* 各プログラムごとに編集ボタンを表示 */}
//               <ProgramRetouchView program={program} />
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

function Home() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!file) {
      alert('ファイルを選択してください');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/uploadPrograms', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        alert('ファイルがアップロードされました');
      } else {
        const errorData = await res.json();
        alert(`エラー: ${errorData.error}`);
      }
    } catch (error) {
      console.error('アップロードエラー:', error);
      alert('アップロードに失敗しました');
    }
  };

  return (
    <div>
      <h1>CSVファイルアップロード</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".csv" onChange={handleFileChange} />
        <button type="submit">アップロード</button>
      </form>
    </div>
  );
}
