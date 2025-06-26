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
import { addQrCodeToProgram } from "@/lib/dbActions";

// --- 型定義 ---
type Schedule = {
  day: string;
  open: string;
  close: string;
};

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
  schedule: Schedule[];
  days: string[];
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

// --- 共通コンポーネント ---
const InputField: React.FC<InputFieldProps> = ({ id, label, placeholder, value, onChange, as = 'input', options = [] }) => (
  <div className="mb-2">
    <label htmlFor={id} className="block text-left text-sm font-medium text-gray-700">
      {label}
    </label>
    {as === 'input' ? (
      <input
        id={id}
        name={id}
        className="mt-1 bg-gray-50 border border-gray-300 text-sm rounded-lg w-full p-2.5"
        placeholder={placeholder}
        type="text"
        value={value}
        onChange={onChange}
      />
    ) : (
      <select
        id={id}
        name={id}
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
    const [schedule, setSchedule] = useState<Schedule[]>([{ day: "", open: "", close: "" }]);
    const [programPass, setProgramPass] = useState("");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [place, setPlace] = useState("");
    const [owner, setOwner] = useState("");
    const [loadingPoint, setLoadingPoint] = useState("");
    const [point, setPoint] = useState("");
    const [type, setType] = useState("");
    const [field, setField] = useState("");
    const [thema, setThema] = useState("");
    const [completionMessage, setCompletionMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleScheduleChange = (index: number, e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const newSchedule = [...schedule];
        newSchedule[index] = { ...newSchedule[index], [name]: value };
        setSchedule(newSchedule);
    };

    const addScheduleInput = () => {
        setSchedule([...schedule, { day: "", open: "", close: "" }]);
    };

    const removeScheduleInput = (index: number) => {
        const newSchedule = schedule.filter((_, i) => i !== index);
        setSchedule(newSchedule);
    };

    const resetForm = () => {
        setSchedule([{ day: "", open: "", close: "" }]);
        setProgramPass(""); setTitle(""); setContent(""); setPlace(""); setOwner("");
        setLoadingPoint(""); setPoint(""); setType(""); setField("");
        setThema(""); setCompletionMessage("");
    };

    const validateForm = () => {
        if (!title || !place || !owner || !loadingPoint || !point || !field) {
            alert("タイトル、場所、運営、得点、ジャンルは必須項目です。");
            return false;
        }
        if (schedule.some(s => !s.day || !s.open || !s.close)) {
            alert("すべての開催日に日付、開始・終了時刻を入力してください。");
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
            const programId = String(programNumber);
            const link = !type ? null : type === "postphoto" ? `/photoalbum/${type}` : `/${type}`;
            const daysData = schedule.map(s => s.day);

            const programDocRef = doc(db, "new_program", programId);
            await setDoc(programDocRef, {
                programPass, title, content, thema, completionMessage, place, owner,
                loadingPoint: Number(loadingPoint), point: Number(point), type, field, link,
                schedule: schedule, days: daysData,
            });

            const placeId = `P${programId.padStart(3, '0')}`;
            const firstQrId = `${programId}_1`;
            const qrData = { placeId, placeNumber: 1, type: type ? "checkin" : "checkout", createdAt: new Date() };
            await addQrCodeToProgram(programId, qrData);

            alert("イベントが正常に追加されました。");
            resetForm();
        } catch (error) {
            console.error("Error adding document: ", error);
            alert("イベントの追加に失敗しました。");
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="bg-orange-200 rounded p-5 mt-8">
          <h3 className="text-2xl font-bold mb-4">イベント新規作成</h3>
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
                        { value: "", label: "QR読み取りのみ" }, { value: "biome", label: "biome" },
                        { value: "fallenleaves", label: "コンポスト" }, { value: "postphoto", label: "写真投稿" },
                        { value: "expressfeelings", label: "文字投稿" }, { value: "walk", label: "歩いて帰ろう" },
                    ]}
                />
                <InputField id="field" label="ジャンル" value={field} as="select" onChange={(e) => setField(e.target.value)}
                    options={[
                        { value: "", label: "選択してください" }, { value: "1", label: "知る" },
                        { value: "2", label: "使う" }, { value: "3", label: "守る" },
                    ]}
                />
            </div>
            <div className="mt-4">
                <label className="block text-left text-sm font-medium text-gray-700 mb-2">開催日時</label>
                {schedule.map((s, index) => (
                    <div key={index} className="grid grid-cols-4 gap-2 items-center mb-2">
                        <input type="date" name="day" value={s.day} onChange={(e) => handleScheduleChange(index, e)} className="col-span-1 bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5" />
                        <input name="open" type="text" placeholder="開始 (例: 13:00)" value={s.open} onChange={(e) => handleScheduleChange(index, e)} className="col-span-1 bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5" />
                        <input name="close" type="text" placeholder="終了 (例: 14:00)" value={s.close} onChange={(e) => handleScheduleChange(index, e)} className="col-span-1 bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5" />
                        {schedule.length > 1 && <button onClick={() => removeScheduleInput(index)} className="col-span-1 bg-red-500 text-white text-xs py-1 px-2 rounded hover:bg-red-700">削除</button>}
                    </div>
                ))}
                <button onClick={addScheduleInput} className="mt-2 bg-gray-500 text-white text-sm py-1 px-3 rounded hover:bg-gray-600">開催日を追加</button>
            </div>
            <button className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleCreate} disabled={loading} >
                {loading ? "作成中..." : "イベント作成"}
            </button>
        </div>
    );
}

function ProgramBulkUploadView() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('ファイルを選択してください。');
      return;
    }

    setIsUploading(true);
    setMessage('アップロード中...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      // 既存のAPIルートを呼び出す
      const response = await fetch('/api/uploadPrograms', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(`成功: ${result.message}`);
      } else {
        setMessage(`エラー: ${result.message}`);
      }
    } catch (error: any) {
      setMessage(`エラー: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-teal-100 rounded p-5 mt-8">
      <h3 className="text-2xl font-bold mb-4">イベント一括追加 (CSV)</h3>
      <p className="text-sm text-gray-700 mb-2">
        指定フォーマットのCSVファイルをアップロードして、複数のイベントを一度に追加します。<br/>
        ヘッダーには `title`, `content`, `day1`, `open1`, `close1`, `day2`, `open2`, `close2` ... などを含めてください。
      </p>
      <div className="flex items-center gap-4">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
        />
        <button
          onClick={handleUpload}
          disabled={isUploading || !file}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400"
        >
          {isUploading ? '処理中...' : 'アップロード'}
        </button>
      </div>
      {message && <p className="mt-4 text-sm text-gray-800">{message}</p>}
    </div>
  );
}
// --- 追加コンポーネントここまで ---

// --- イベント編集モーダル (ここからが修正箇所です) ---
function ProgramRetouchView({ program, onClose }: { program: Program; onClose: () => void; }) {
    const [formData, setFormData] = useState<Program>(program);
    
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleScheduleChange = (index: number, e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const newSchedule = [...formData.schedule];
        newSchedule[index] = { ...newSchedule[index], [name]: value };
        setFormData(prev => ({ ...prev, schedule: newSchedule }));
    };
    
    const addScheduleInput = () => {
        setFormData(prev => ({...prev, schedule: [...(prev.schedule || []), { day: "", open: "", close: ""}]}));
    };

    const removeScheduleInput = (index: number) => {
        const newSchedule = formData.schedule.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, schedule: newSchedule }));
    };

    const handleUpdate = async () => {
        if (!confirm("この内容でプログラムを更新しますか？")) return;
        try {
            // --- 1. 親ドキュメントの更新（ここは変更なし） ---
            const docRef = doc(db, "new_program", program.id);
            const updatedLink = !formData.type ? null : formData.type === "postphoto" ? `/photoalbum/${formData.type}` : `/${formData.type}`;
            const daysData = formData.schedule.map(s => s.day);
            const { id, ...dataToUpdate } = formData;
            
            await updateDoc(docRef, { 
                ...dataToUpdate, 
                link: updatedLink, 
                days: daysData,
                loadingPoint: Number(formData.loadingPoint),
                point: Number(formData.point),
            });

            // --- 2. サブコレクション内のQRコード情報を更新する処理を追加 ---
            const qrCodesCollectionRef = collection(db, "new_program", program.id, "qr_codes");
            const qrDocsSnapshot = await getDocs(qrCodesCollectionRef);
            
            const newQrType = formData.type ? "checkin" : "checkout";

            // バッチ書き込みを使用して、複数のドキュメントを効率的に更新
            const batch = runTransaction(db, async (transaction) => {
                qrDocsSnapshot.forEach((qrDoc) => {
                    const qrDocRef = doc(db, "new_program", program.id, "qr_codes", qrDoc.id);
                    transaction.update(qrDocRef, { type: newQrType });
                });
            });

            await batch;
            // --- 追加処理ここまで ---

            alert("プログラムと関連QRコードが更新されました！");
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
                  <InputField id="title" label="タイトル" value={formData.title} onChange={handleChange} />
                  <InputField id="content" label="概要" value={formData.content} onChange={handleChange} />
                  <InputField id="thema" label="お題" value={formData.thema} onChange={handleChange} />
                  <InputField id="completionMessage" label="クリア時メッセージ" value={formData.completionMessage} onChange={handleChange} />
                  <InputField id="place" label="場所" value={formData.place} onChange={handleChange} />
                  <InputField id="owner" label="運営" value={formData.owner} onChange={handleChange} />
                  <InputField id="loadingPoint" label="得点1" value={String(formData.loadingPoint)} onChange={handleChange} />
                  <InputField id="point" label="得点2" value={String(formData.point)} onChange={handleChange} />
                  <InputField id="type" label="イベント形式" value={formData.type} as="select" onChange={handleChange} options={[{value: "", label: "QR読み取りのみ"}, {value: "postphoto", label: "写真投稿"}, {value: "biome", label: "biome"}, {value: "fallenleaves", label: "コンポスト"}, {value: "expressfeelings", label: "文字投稿"}, {value: "walk", label: "歩いて帰ろう"}]}/>
                  <InputField id="field" label="ジャンル" value={formData.field} as="select" onChange={handleChange} options={[{value: "", label: "選択してください"}, {value: "1", label: "知る"}, {value: "2", label: "使う"}, {value: "3", label: "守る"}]}/>
                </div>
                <div className="mt-4">
                    <label className="block text-left text-sm font-medium text-gray-700 mb-2">開催日時</label>
                    {(formData.schedule || []).map((s, index) => (
                        <div key={index} className="grid grid-cols-4 gap-2 items-center mb-2">
                            <input type="date" name="day" value={s.day} onChange={(e) => handleScheduleChange(index, e)} className="col-span-1 bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5" />
                            <input name="open" type="text" placeholder="開始" value={s.open} onChange={(e) => handleScheduleChange(index, e)} className="col-span-1 bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5" />
                            <input name="close" type="text" placeholder="終了" value={s.close} onChange={(e) => handleScheduleChange(index, e)} className="col-span-1 bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5" />
                            <button onClick={() => removeScheduleInput(index)} className="col-span-1 bg-red-500 text-white text-xs py-1 px-2 rounded hover:bg-red-700">削除</button>
                        </div>
                    ))}
                    <button onClick={addScheduleInput} className="mt-2 bg-gray-500 text-white text-sm py-1 px-3 rounded hover:bg-gray-600">開催日を追加</button>
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">キャンセル</button>
                    <button onClick={handleUpdate} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700">更新</button>
                </div>
            </div>
        </div>
    );
}
// --- イベント編集モーダルここまで ---

// --- カレンダー関連のコンポーネント ---
const getEventCountsByDay = (programs: Program[]) => {
  const counts: { [key: string]: number } = {};
  programs.forEach(program => {
    (program.days || []).forEach(day => {
      counts[day] = (counts[day] || 0) + 1;
    });
  });
  return counts;
};

const CalendarView = ({ onDateClick, eventCounts }: { onDateClick: (date: string) => void; eventCounts: { [key: string]: number } }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const daysOfWeek = ["日", "月", "火", "水", "木", "金", "土"];
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDate = new Date(startOfMonth);
  startDate.setDate(startDate.getDate() - startDate.getDay());
  const dates: Date[] = [];
  for (let i = 0; i < 42; i++) {
    dates.push(new Date(startDate));
    startDate.setDate(startDate.getDate() + 1);
  }
  const changeMonth = (offset: number) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => changeMonth(-1)} className="px-3 py-1 bg-gray-200 rounded">&lt; 前月</button>
        <h3 className="text-xl font-bold">{currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月</h3>
        <button onClick={() => changeMonth(1)} className="px-3 py-1 bg-gray-200 rounded">次月 &gt;</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {daysOfWeek.map(day => <div key={day} className="font-bold text-gray-600">{day}</div>)}
        {dates.map((date, index) => {
          const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();
          const eventCount = eventCounts[dateString] || 0;
          return (
            <div key={index} className={`p-2 border rounded-md cursor-pointer ${isCurrentMonth ? 'bg-white' : 'bg-gray-100 text-gray-400'} hover:bg-blue-100`} onClick={() => onDateClick(dateString)}>
              <div>{date.getDate()}</div>
              {eventCount > 0 && <div className="mt-1 text-xs bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center mx-auto">{eventCount}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

function EventsForDayView({ programs, selectedDate }: { programs: Program[], selectedDate: string }) {
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const filteredPrograms = programs.filter(p => p.days && p.days.includes(selectedDate));
  if (!selectedDate) return <div className="text-center text-gray-500 mt-4">カレンダーの日付を選択してください。</div>;
  
  return (
    <div className="mt-6">
      <h3 className="text-2xl font-bold mb-4">{selectedDate}のイベント</h3>
      {filteredPrograms.length === 0 ? <p>この日のイベントはありません。</p> : (
        <div className="space-y-4">
          {filteredPrograms.map(program => (
             <div key={program.id} className="bg-white rounded p-4 shadow-md">
                <p className="font-bold text-lg text-left">No.{program.id}: {program.title}</p>
                <div className="text-sm text-left mt-2">
                    {(program.schedule || []).map((s, index) => (
                        <div key={index}>
                            {s.day === selectedDate && (
                                <p>
                                    <strong>開催時間:</strong> {s.open && s.close ? `${s.open} ~ ${s.close}` : <span className="font-bold text-red-500">終日</span>}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
                <div className="text-right mt-2">
                    <button onClick={() => setEditingProgram(program)} className="bg-blue-500 text-white px-3 py-1 text-sm rounded hover:bg-blue-700">編集</button>
                </div>
            </div>
          ))}
        </div>
      )}
      {editingProgram && <ProgramRetouchView program={editingProgram} onClose={() => setEditingProgram(null)} />}
    </div>
  )
}

// --- メインページコンポーネント ---
export default function AdminEventsPage() {
    const [allPrograms, setAllPrograms] = useState<Program[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [eventCounts, setEventCounts] = useState<{ [key: string]: number }>({});
    
    useEffect(() => {
        const q = query(collection(db, "new_program")); // "new_program" を使用
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const programs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Program));
            setAllPrograms(programs);
            setEventCounts(getEventCountsByDay(programs));
        });
        return () => unsubscribe();
    }, []);

    return (
      <div>
        <h2 className="text-3xl font-bold mb-6">イベント管理</h2>
        
        {/* 作成フォームと一括追加フォームを並べて表示 */}
        <ProgramCreateView />
        <ProgramBulkUploadView />

        <div className="mt-10">
          <h3 className="text-2xl font-bold mb-4">イベントカレンダー</h3>
          <CalendarView onDateClick={setSelectedDate} eventCounts={eventCounts} />
          <EventsForDayView programs={allPrograms} selectedDate={selectedDate} />
        </div>
      </div>
    );
}