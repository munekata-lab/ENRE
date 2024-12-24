"use client";

import React from "react";
import { db } from "@/lib/firebase/client";
import { getUserFromCookie } from "@/lib/session";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { useEffect, useRef, useState, FormEvent, useCallback, ChangeEvent } from "react";

type Props = {
    targetDay: string;
  };

export default function Admin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [login, setLogin] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    (async () => {
      const program = await getUserFromCookie();
      const uid = program.uid;
      if (!uid) return;

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
      {login && (
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
      )}
      {isAdmin ? (
        <div className="justify-center mt-24 w-full h-full">
          <div className="text-2xl font-bold top-24 w-full">
            <h1 className="text-center">管理画面</h1>
            <ProgramView />
            <Home />
            <div className="h-full">
                <ProgramListView />
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
    </main>
  );
}

function ProgramView() {
  const [programId, setProgramId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [place, setPlace] = useState("");
  const [owner, setOwner] = useState("");
  const [point, setPoint] = useState("");
  const [gip, setGip] = useState("");
  const [field, setField] = useState("");
  const [day, setDay] = useState("");
  const [open, setOpen] = useState("");
  const [close, setClose] = useState("");
  const [loading, setLoading] = useState(false); // ローディング状態を追加

  // 入力値をリセットする関数
  const resetForm = () => {
    setProgramId("");
    setTitle("");
    setContent("");
    setPlace("");
    setOwner("");
    setPoint("");
    setGip("");
    setField("");
    setDay("");
    setOpen("");
    setClose("");
  };

  // バリデーションチェック
  const validateForm = () => {
    if (!title || !content || !day) {
      alert("タイトル、内容、日付は必須です。");
      return false;
    }
    return true;
  };

  // 送信処理
  const onNotify = async () => {
    if (!validateForm()) return;

    const result = confirm("イベントを追加しますか？");
    if (!result) return;

    const message = {
      programId,
      title,
      content,
      place,
      owner,
      point,
      gip,
      field,
      day,
      open,
      close,
    };

    setLoading(true); // ローディング開始
    try {
      const query = collection(db, "test_program2");
      await addDoc(query, message); // Firestoreに追加
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
        id="programId"
        label="プログラムID"
        placeholder="例(フリーコーヒーの場合): fc010 fc + 01(全体のid) + 1(場所別)"
        value={programId}
        onChange={createChangeHandler(setProgramId)}
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
        label="内容"
        placeholder="Content"
        value={content}
        onChange={createChangeHandler(setContent)}
      />

      {/* 場所 */}
      <InputField
        id="place"
        label="場所"
        placeholder="Place"
        value={place}
        onChange={createChangeHandler(setPlace)}
      />

      {/* 運営 */}
      <InputField
        id="owner"
        label="運営"
        placeholder="Owner"
        value={owner}
        onChange={createChangeHandler(setOwner)}
      />

      {/* 点数 */}
      <InputField
        id="point"
        label="得点"
        placeholder="Point"
        value={point}
        onChange={createChangeHandler(setPoint)}
      />

      {/* 点数(gip) */}
      <InputField
        id="gip"
        label="GIP"
        placeholder="Gip"
        value={gip}
        onChange={createChangeHandler(setGip)}
      />

      {/* ジャンル */}
      <InputField
        id="field"
        label="ジャンル(3種類)"
        placeholder="Field"
        value={field}
        onChange={createChangeHandler(setField)}
      />

      {/* 日 */}
      <InputField
        id="day"
        label="日"
        placeholder="Day"
        value={day}
        onChange={createChangeHandler(setDay)}
      />

      {/* 開始 */}
      <InputField
        id="open"
        label="開始"
        placeholder="例: 13:00"
        value={open}
        onChange={createChangeHandler(setOpen)}
      />

      {/* 終了 */}
      <InputField
        id="close"
        label="終了"
        placeholder="例: 14:00"
        value={close}
        onChange={createChangeHandler(setClose)}
      />

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
  programId: string;
  title: string;
  content: string;
  place: string;
  owner: string;
  point: string;
  gip: string;
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
    const [programId, setProgramId] = useState(program.programId);
    const [title, setTitle] = useState(program.title);
    const [content, setContent] = useState(program.content);
    const [place, setPlace] = useState(program.place);
    const [owner, setOwner] = useState(program.owner);
    const [point, setPoint] = useState(program.point);
    const [gip, setGip] = useState(program.gip);
    const [field, setField] = useState(program.field);
    const [day, setDay] = useState(program.day);
    const [open, setOpen] = useState(program.open);
    const [close, setClose] = useState(program.close);
  
    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);
  
    const handleUpdate = async () => {
      const result = confirm("プログラムを更新しますか？");
      if (!result) return;
  
      try {
        const docRef = doc(db, "test_program2", program.id);
        await updateDoc(docRef, {
          programId,
          title,
          content,
          place,
          owner,
          point,
          gip,
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
                onClick={handleCloseModal}
              >
                ✕
              </button>
              <div className="flex flex-col space-y-4">
                <p className="mt-1 text-lg font-bold">イベント更新画面</p>
                <p className="mt-1 text-sm text-left">プログラムID</p>
                <input
                  type="text"
                  value={programId}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="programId"
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
                <p className="mt-1 text-sm text-left">内容</p>
                <input
                  type="text"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Content"
                  className="mt-1 text-sm w-full p-1 border rounded"
                />
                <p className="mt-1 text-sm text-left">場所</p>
                <input
                  type="text"
                  value={place}
                  onChange={(e) => setPlace(e.target.value)}
                  placeholder="Place"
                  className="mt-1 text-sm w-full p-1 border rounded"
                />
                <p className="mt-1 text-sm text-left">運営</p>
                <input
                  type="text"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  placeholder="Owner"
                  className="mt-1 text-sm w-full p-1 border rounded"
                />
                <p className="mt-1 text-sm text-left">得点</p>
                <input
                  type="text"
                  value={point}
                  onChange={(e) => setPoint(e.target.value)}
                  placeholder="Point"
                  className="mt-1 text-sm w-full p-1 border rounded"
                />
                <p className="mt-1 text-sm text-left">GIP</p>
                <input
                  type="text"
                  value={gip}
                  onChange={(e) => setGip(e.target.value)}
                  placeholder="Gip"
                  className="mt-1 text-sm w-full p-1 border rounded"
                />
                <p className="mt-1 text-sm text-left">ジャンル</p>
                <input
                  type="text"
                  value={field}
                  onChange={(e) => setField(e.target.value)}
                  placeholder="Field"
                  className="mt-1 text-sm w-full p-1 border rounded"
                />
                <p className="mt-1 text-sm text-left">日</p>
                <input
                  type="text"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  placeholder="Day"
                  className="mt-1 text-sm w-full p-1 border rounded"
                />
                <p className="mt-1 text-sm text-left">開始</p>
                <input
                  type="text"
                  value={open}
                  onChange={(e) => setOpen(e.target.value)}
                  placeholder="例: 13:00"
                  className="mt-1 text-sm w-full p-1 border rounded"
                />
                <p className="mt-1 text-sm text-left">終了</p>
                <input
                  type="text"
                  value={close}
                  onChange={(e) => setClose(e.target.value)}
                  placeholder="例: 14:00"
                  className="mt-1 text-sm w-full p-1 border rounded"
                />
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
  

// type ProgramRetouchViewProps = {
//     documentId: string;
//     initialData: {
//       title: string;
//       content: string;
//       place: string;
//       owner: string;
//       point: string;
//       day: string;
//       open: string;
//       close: string;
//     };
//     onClose: () => void;
//   };
  
//   // 更新画面
//   function ProgramRetouchView({
//     documentId,
//     initialData,
//     onClose,
//   }: ProgramRetouchViewProps) {
//     const [title, setTitle] = useState(initialData.title);
//     const [content, setContent] = useState(initialData.content);
//     const [place, setPlace] = useState(initialData.place);
//     const [owner, setOwner] = useState(initialData.owner);
//     const [point, setPoint] = useState(initialData.point);
//     const [day, setDay] = useState(initialData.day);
//     const [open, setOpen] = useState(initialData.open);
//     const [close, setClose] = useState(initialData.close);
  
//     const handleUpdate = async () => {
//       const result = confirm("プログラムを更新しますか？");
//       if (!result) return;
  
//       try {
//         const docRef = doc(db, "test_program2", documentId);
//         await updateDoc(docRef, {
//           title,
//           content,
//           place,
//           owner,
//           point,
//           day,
//           open,
//           close,
//         });
  
//         alert("プログラムが更新されました！");
//         onClose(); // 更新が成功したらモーダルを閉じる
//       } catch (error) {
//         console.error("更新中にエラーが発生しました:", error);
//         alert("更新に失敗しました。");
//       }
//     };
  
//     return (
//       <div className="flex flex-col space-y-4">
//         <p className="mt-1 text-lg font-bold">イベント更新画面</p>
//         <p className="text-base text-left">タイトル</p>
//         <input
//           type="text"
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//           placeholder="title"
//           className="text-sm w-full p-1 border rounded"
//         />
//         <p className="text-base text-left">内容</p>
//         <input
//           type="text"
//           value={content}
//           onChange={(e) => setContent(e.target.value)}
//           placeholder="content"
//           className="text-sm w-full p-1 border rounded"
//         />
//         <p className="text-base text-left">場所</p>
//         <input
//           type="text"
//           value={place}
//           onChange={(e) => setPlace(e.target.value)}
//           placeholder="place"
//           className="text-sm w-full p-1 border rounded"
//         />
//         <p className="text-base text-left">運営</p>
//         <input
//           type="text"
//           value={owner}
//           onChange={(e) => setOwner(e.target.value)}
//           placeholder="owner"
//           className="text-sm w-full p-1 border rounded"
//         />
//         <p className="text-base text-left">点数</p>
//         <input
//           type="text"
//           value={point}
//           onChange={(e) => setPoint(e.target.value)}
//           placeholder="point"
//           className="text-sm w-full p-1 border rounded"
//         />
//         <p className="text-base text-left">日</p>
//         <input
//           type="text"
//           value={day}
//           onChange={(e) => setDay(e.target.value)}
//           placeholder="day"
//           className="text-sm w-full p-1 border rounded"
//         />
//         <p className="text-base text-left">開始</p>
//         <input
//           type="text"
//           value={open}
//           onChange={(e) => setOpen(e.target.value)}
//           placeholder="open"
//           className="text-sm w-full p-1 border rounded"
//         />
//         <p className="text-base text-left">終了</p>
//         <input
//           type="text"
//           value={close}
//           onChange={(e) => setClose(e.target.value)}
//           placeholder="close"
//           className="text-sm w-full p-1 border rounded"
//         />
//         <button
//           onClick={handleUpdate}
//           className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
//         >
//           更新
//         </button>
//       </div>
//     );
// }

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
                <div className="grid grid-cols-5 h-full p-2 gap-1">
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
                    <div className="bg-blue-200 h-full">
                        <p className="mt-1 text-xl font-bold">4日目</p>
                        <ProgramsView targetDay="4"/>
                    </div>
                    <div className="bg-blue-200 h-full">
                        <p className="mt-1 text-xl font-bold">5日目</p>
                        <ProgramsView targetDay="5"/>
                    </div>
                </div>
            </div>
        </div>
    );
}

// 日単位のプログラムリスト取得と表示
function ProgramsView({ targetDay }: Props) {
    const [programList, setProgramList] = useState<Program[]>([]);
  
    useEffect(() => {
      const q = query(
        collection(db, "test_program2"),
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
              <div className="flex justify-between text-sm mt-2">
                <p className="text-gray-600">得点: {program.point}</p>
                <p className="text-gray-600">運営: {program.owner}</p>
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
  

// export function ProgramsView({ targetDay }: Props) {
//     const [programList, setProgramList] = useState<Program[]>([]);
//     const [retouchData, setRetouchData] = useState<Program | null>(null);
//     const [isModalOpen, setIsModalOpen] = useState(false);
  
//     useEffect(() => {
//       const q = query(
//         collection(db, "test_program2"),
//         where("day", "==", targetDay)
//       );
  
//       const unsubscribe = onSnapshot(q, (snapshot) => {
//         const programs = snapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         })) as Program[];
//         setProgramList(programs);
//       });
  
//       return () => unsubscribe();
//     }, [targetDay]);
  
//     const handleEditClick = useCallback((program: Program) => {
//       setRetouchData(program);
//       setIsModalOpen(true);
//     }, []);
  
//     const handleCloseModal = () => {
//       setRetouchData(null);
//       setIsModalOpen(false);
//     };
  
//     return (
//       <div className="grid grid-cols-1 w-full min-h-[98%] overflow-scroll">
//         {programList.map((program) => (
//           <div key={program.id} className="z-0 relative w-full p-[3%]">
//             <div className="bg-white rounded p-4 flex flex-col leading-normal">
//               <div className="w-full">
//                 <div className="text-gray-900 font-bold text-xl">{program.title}</div>
//                 <p className="text-gray-700">{program.content}</p>
//               </div>
//               <div className="flex justify-between text-sm mt-2">
//                 <p className="text-gray-600">得点: {program.point}</p>
//                 <button
//                   className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
//                   onClick={() => handleEditClick(program)}
//                 >
//                   編集
//                 </button>
//               </div>
//               <div className="grid grid-cols-2 mt-2">
//                 <div className="text-center">開始: {program.open}</div>
//                 <div className="text-center">終了: {program.close}</div>
//               </div>
//             </div>
//           </div>
//         ))}
  
//         {isModalOpen && retouchData && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
//             <div className="relative w-full max-w-3xl bg-white p-6 rounded-lg">
//               <button
//                 className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
//                 onClick={handleCloseModal}
//               >
//                 ✕
//               </button>
//               <ProgramRetouchView
//                 documentId={retouchData.id}
//                 initialData={{
//                   title: retouchData.title,
//                   content: retouchData.content,
//                   place: retouchData.place,
//                   owner: retouchData.owner,
//                   point: retouchData.point,
//                   day: retouchData.day,
//                   open: retouchData.open,
//                   close: retouchData.close,
//                 }}
//                 onClose={handleCloseModal}
//               />
//             </div>
//           </div>
//         )}
//       </div>
//     );
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
