"use client";

import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { db } from "@/lib/firebase/client";
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  onSnapshot,
  query,
  where,
  runTransaction,
  setDoc,
} from "firebase/firestore";

// --- 型定義 ---
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
  link: string;
  field: string;
  day: string;
  open: string;
  close: string;
};

type InputFieldProps = {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  as?: 'input' | 'select';
  options?: { value: string, label: string }[];
};

type ProgramsViewProps = {
    targetDay: string;
};

// --- 共通コンポーネント ---
const InputField: React.FC<InputFieldProps> = ({ id, label, placeholder, value, onChange, as = 'input', options = [] }) => (
  <div className="mb-2">
    <label htmlFor={id} className="block text-left text-sm font-medium text-gray-700">
      {label}
    </label>
    {as === 'input' ? (
      <input
        id={id}
        className="mt-1 bg-gray-50 border border-gray-300 text-sm rounded-lg w-full p-2.5"
        placeholder={placeholder}
        type="text"
        value={value}
        onChange={onChange}
      />
    ) : (
      <select
        id={id}
        value={value}
        onChange={onChange}
        className="mt-1 bg-gray-50 border border-gray-300 text-sm rounded-lg w-full p-2.5"
      >
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    )}
  </div>
);


// --- イベント登録フォーム ---
function ProgramCreateView() {
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
    const [loading, setLoading] = useState(false);

    const resetForm = () => {
        setProgramPass(""); setTitle(""); setContent(""); setPlace(""); setOwner("");
        setLoadingPoint(""); setPoint(""); setType(""); setField(""); setDay("");
        setOpen(""); setClose(""); setThema(""); setCompletionMessage("");
    };

    const validateForm = () => {
        if (!title || !content || !day || !place || !owner || !loadingPoint || !point || !field) {
            alert("必須項目が未入力です。");
            return false;
        }
        return true;
    };

    const getNextDocumentNumber = async () => {
        const counterDocRef = doc(db, "counter", "programCounter");
        return await runTransaction(db, async (transaction) => {
            const counterDoc = await transaction.get(counterDocRef);
            if (!counterDoc.exists()) {
                transaction.set(counterDocRef, { count: 1 });
                return 1;
            } else {
                const newCount = counterDoc.data().count + 1;
                transaction.update(counterDocRef, { count: newCount });
                return newCount;
            }
        });
    };

    const handleCreate = async () => {
        if (!validateForm()) return;
        if (!confirm("この内容でイベントを追加しますか？")) return;

        setLoading(true);
        try {
            const programNumber = await getNextDocumentNumber();
            const link = !type ? null : type === "postphoto" ? `/photoalbum/${type}` : `/${type}`;
            const programIdFormatted = String(programNumber).padStart(3, "0");
            const placeId = `P${programIdFormatted}`;

            const programDocRef = doc(db, "program2025_1", String(programNumber));
            await setDoc(programDocRef, {
                programPass, title, content, thema, completionMessage, place, owner,
                loadingPoint: Number(loadingPoint), point: Number(point), type, field, day, open, close, link,
            });

            const qrDocRef = doc(db, "QR2025_1", String(programNumber));
            await setDoc(qrDocRef, {
                placeId, placeNumber: 1, loadingPoint: Number(loadingPoint), field,
                programId: programNumber, type: type ? "checkin" : "checkout",
            });

            alert("イベントが正常に追加されました。");
            resetForm();
        } catch (error) {
            console.error("Error adding document: ", error);
            alert("イベントの追加に失敗しました。");
        } finally {
            setLoading(false);
        }
    };
    
    // ... フォームのJSX ...
    return (
        <div className="bg-orange-200 rounded p-5 mt-8">
          <h3 className="text-2xl font-bold mb-4">イベント新規作成</h3>
          {/* フォームフィールド */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField id="title" label="タイトル" placeholder="イベントタイトル" value={title} onChange={(e) => setTitle(e.target.value)} />
                <InputField id="content" label="概要" placeholder="イベントの概要" value={content} onChange={(e) => setContent(e.target.value)} />
                <InputField id="thema" label="お題 (任意)" placeholder="写真投稿のお題など" value={thema} onChange={(e) => setThema(e.target.value)} />
                <InputField id="completionMessage" label="クリア時メッセージ (任意)" placeholder="ミッションクリア時の文章" value={completionMessage} onChange={(e) => setCompletionMessage(e.target.value)} />
                <InputField id="place" label="場所" placeholder="開催場所" value={place} onChange={(e) => setPlace(e.target.value)} />
                <InputField id="owner" label="運営" placeholder="運営団体" value={owner} onChange={(e) => setOwner(e.target.value)} />
                <InputField id="loadingPoint" label="得点1 (QR読取時)" placeholder="半角数字" value={loadingPoint} onChange={(e) => setLoadingPoint(e.target.value)} />
                <InputField id="point" label="得点2 (完遂時)" placeholder="半角数字" value={point} onChange={(e) => setPoint(e.target.value)} />
                <InputField id="type" label="イベント形式" value={type} as="select" onChange={(e) => setType(e.target.value)}
                    options={[
                        { value: "", label: "QR読み取りのみ" },
                        { value: "biome", label: "biome" },
                        { value: "fallenleaves", label: "コンポスト" },
                        { value: "postphoto", label: "写真投稿" },
                        { value: "expressfeelings", label: "文字投稿" },
                        { value: "walk", label: "歩いて帰ろう" },
                    ]}
                />
                <InputField id="field" label="ジャンル" value={field} as="select" onChange={(e) => setField(e.target.value)}
                    options={[
                        { value: "", label: "選択してください" },
                        { value: "1", label: "知る" },
                        { value: "2", label: "使う" },
                        { value: "3", label: "守る" },
                    ]}
                />
                 <InputField id="day" label="開催日" value={day} as="select" onChange={(e) => setDay(e.target.value)}
                    options={[
                        { value: "", label: "選択してください" },
                        { value: "1", label: "1/8(水)" },
                        { value: "2", label: "1/9(木)" },
                        { value: "3", label: "1/10(金)" },
                    ]}
                />
                <InputField id="open" label="開始時刻" placeholder="例: 13:00" value={open} onChange={(e) => setOpen(e.target.value)} />
                <InputField id="close" label="終了時刻" placeholder="例: 14:00" value={close} onChange={(e) => setClose(e.target.value)} />
            </div>

            <button
                className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={handleCreate}
                disabled={loading}
            >
                {loading ? "作成中..." : "イベント作成"}
            </button>
        </div>
    );
}

// --- イベント編集モーダル ---
function ProgramRetouchView({ program, onClose }: { program: Program; onClose: () => void; }) {
    // 状態管理
    const [formData, setFormData] = useState(program);
    
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleUpdate = async () => {
        if (!confirm("この内容でプログラムを更新しますか？")) return;
        try {
            const docRef = doc(db, "program2025_1", program.id);
            const updatedLink = !formData.type ? null : formData.type === "postphoto" ? `/photoalbum/${formData.type}` : `/${formData.type}`;
            await updateDoc(docRef, { ...formData, link: updatedLink });
            alert("プログラムが更新されました！");
            onClose();
        } catch (error) {
            console.error("更新エラー:", error);
            alert("更新に失敗しました。");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="relative w-full max-w-2xl bg-white p-6 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
                <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-800" onClick={onClose}>✕</button>
                <h3 className="text-xl font-bold mb-4">イベント編集 (No.{program.id})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 各フォームフィールド */}
                  <InputField id="title" label="タイトル" value={formData.title} onChange={handleChange} placeholder="Title"/>
                  <InputField id="content" label="概要" value={formData.content} onChange={handleChange} placeholder="Content"/>
                  <InputField id="thema" label="お題" value={formData.thema} onChange={handleChange} placeholder="Thema"/>
                  <InputField id="completionMessage" label="クリア時メッセージ" value={formData.completionMessage} onChange={handleChange} placeholder="Completion Message"/>
                  <InputField id="place" label="場所" value={formData.place} onChange={handleChange} placeholder="Place"/>
                  <InputField id="owner" label="運営" value={formData.owner} onChange={handleChange} placeholder="Owner"/>
                  <InputField id="loadingPoint" label="得点1" value={String(formData.loadingPoint)} onChange={handleChange} placeholder="Loading Point"/>
                  <InputField id="point" label="得点2" value={String(formData.point)} onChange={handleChange} placeholder="Point"/>
                  <InputField id="type" label="イベント形式" value={formData.type} onChange={handleChange} placeholder="Type"/>
                  <InputField id="field" label="ジャンル" value={formData.field} onChange={handleChange} placeholder="Field"/>
                  <InputField id="day" label="開催日" value={formData.day} onChange={handleChange} placeholder="Day"/>
                  <InputField id="open" label="開始時刻" value={formData.open} onChange={handleChange} placeholder="Open"/>
                  <InputField id="close" label="終了時刻" value={formData.close} onChange={handleChange} placeholder="Close"/>
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">キャンセル</button>
                    <button onClick={handleUpdate} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700">更新</button>
                </div>
            </div>
        </div>
    );
}

// --- 日付ごとのイベント一覧 ---
function ProgramsByDayView({ targetDay }: ProgramsViewProps) {
    const [programList, setProgramList] = useState<Program[]>([]);
    const [editingProgram, setEditingProgram] = useState<Program | null>(null);

    useEffect(() => {
        const q = query(collection(db, "program2025_1"), where("day", "==", targetDay));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const programs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Program));
            // IDを数値としてソート
            programs.sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10));
            setProgramList(programs);
        });
        return () => unsubscribe();
    }, [targetDay]);

    return (
        <div className="w-full min-h-full overflow-y-auto">
            {programList.map((program) => (
                <div key={program.id} className="mb-3 p-2">
                    <div className="bg-white rounded p-4 shadow-md">
                        <p className="font-bold text-lg text-left">No.{program.id}: {program.title}</p>
                        <p className="text-gray-600 text-sm text-left">{program.content}</p>
                        <div className="mt-2 text-xs text-left grid grid-cols-2 gap-1">
                          <p><strong>場所:</strong> {program.place}</p>
                          <p><strong>運営:</strong> {program.owner}</p>
                          <p><strong>得点1:</strong> {program.loadingPoint}</p>
                          <p><strong>得点2:</strong> {program.point}</p>
                          <p><strong>時間:</strong> {program.open || 'N/A'} - {program.close || 'N/A'}</p>
                        </div>
                        <div className="text-right mt-2">
                            <button onClick={() => setEditingProgram(program)} className="bg-blue-500 text-white px-3 py-1 text-sm rounded hover:bg-blue-700">編集</button>
                        </div>
                    </div>
                </div>
            ))}
            {editingProgram && <ProgramRetouchView program={editingProgram} onClose={() => setEditingProgram(null)} />}
        </div>
    );
}


// --- メインページコンポーネント ---
export default function AdminEventsPage() {
    return (
      <div>
        <h2 className="text-3xl font-bold mb-6">イベント管理</h2>
        
        {/* 新規作成セクション */}
        <ProgramCreateView />
        
        {/* イベント一覧セクション */}
        <div className="mt-10">
          <h3 className="text-2xl font-bold mb-4">登録済みイベント一覧</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-100 rounded-lg p-2">
                  <h4 className="text-xl font-bold text-center mb-2">1/8(水) 1日目</h4>
                  <ProgramsByDayView targetDay="1"/>
              </div>
              <div className="bg-green-100 rounded-lg p-2">
                  <h4 className="text-xl font-bold text-center mb-2">1/9(木) 2日目</h4>
                  <ProgramsByDayView targetDay="2"/>
              </div>
              <div className="bg-yellow-100 rounded-lg p-2">
                  <h4 className="text-xl font-bold text-center mb-2">1/10(金) 3日目</h4>
                  <ProgramsByDayView targetDay="3"/>
              </div>
          </div>
        </div>
      </div>
    );
}