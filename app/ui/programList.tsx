"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faPen, faLeaf, faMugHot, faPersonWalking, faMagnifyingGlass, faSort, faStar, faCalendarDays, faRobot } from '@fortawesome/free-solid-svg-icons';
import Image from "next/image";
import React, { useEffect, useState, useMemo } from "react";
import { db } from "@/lib/firebase/client";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { LoadingAnimation } from "./skeletons";
import packageJson from "../../package.json";
import { postCollectionInLogs } from "@/lib/dbActions";
import { usePathname } from "next/navigation";
import ProgramTimeline from './ProgramTimeline';

// --- 型定義 ---
export type Schedule = {
  day: string;
  open: string;
  close: string;
};

export type Program = {
  id:string;
  title: string;
  content: string;
  place: string;
  owner: string;
  loadingPoint: number;
  point: number;
  totalPoint: number;
  field: string;
  type: string;
  schedule: Schedule[];
  icon: any;
  isOngoing: boolean;
  remainingTime?: string;
};

// --- UIコンポーネント ---

const DateNavigator = ({ selectedDate, setSelectedDate, onShowCalendar }: {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  onShowCalendar: () => void;
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const displayDates = Array.from({ length: 3 }).map((_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return date;
  });

  const formatDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  
  const daysOfWeek = ['(日)', '(月)', '(火)', '(水)', '(木)', '(金)', '(土)'];
  const displayFormat = (date: Date) => `${date.getMonth() + 1}/${date.getDate()}${daysOfWeek[date.getDay()]}`;

  const isAfterThreeDays = selectedDate > displayDates[2];

  return (
    <div className="flex items-center justify-center space-x-1 sm:space-x-2 my-4 px-2">
      {displayDates.map(date => (
        <button
          key={date.toISOString()}
          onClick={() => setSelectedDate(date)}
          className={`flex-1 px-2 py-2 rounded text-xs sm:text-sm transition-colors ${formatDate(date) === formatDate(selectedDate) && !isAfterThreeDays ? 'bg-green-700 text-white shadow-md' : 'bg-white hover:bg-green-100'}`}
        >
          {displayFormat(date)}
        </button>
      ))}
       <button
        onClick={onShowCalendar}
        className={`px-3 py-2 rounded text-xs sm:text-sm transition-colors flex items-center space-x-2 ${isAfterThreeDays ? 'bg-green-700 text-white shadow-md' : 'bg-white hover:bg-green-100'}`}
      >
        <FontAwesomeIcon icon={faCalendarDays} />
        <span>他の日</span>
      </button>
    </div>
  );
};

const CalendarModal = ({ onSelectDate, onClose }: { onSelectDate: (date: Date) => void; onClose: () => void; }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const daysOfWeek = ["日", "月", "火", "水", "木", "金", "土"];
    
    // ★★★ 修正点 ★★★
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const oneMonthLater = new Date(today.getFullYear(), today.getMonth() + 1, 1);

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

    const handleDateClick = (date: Date) => {
        if (date < today) return;
        onSelectDate(date);
        onClose();
    }

    const disablePrev = currentDate.getFullYear() < today.getFullYear() || (currentDate.getFullYear() === today.getFullYear() && currentDate.getMonth() <= today.getMonth());
    const disableNext = currentDate.getFullYear() > oneMonthLater.getFullYear() || (currentDate.getFullYear() === oneMonthLater.getFullYear() && currentDate.getMonth() >= oneMonthLater.getMonth());

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
                <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        {!disablePrev && <button onClick={() => changeMonth(-1)} className="px-3 py-1 bg-gray-200 rounded">&lt;</button>}
                        <h3 className="text-lg font-bold">{currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月</h3>
                        {!disableNext && <button onClick={() => changeMonth(1)} className="px-3 py-1 bg-gray-200 rounded">&gt;</button>}
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-sm">
                        {daysOfWeek.map(day => <div key={day} className="font-bold text-gray-600">{day}</div>)}
                        {dates.map((date, index) => {
                            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                            const isPast = date < today;
                            return (
                                <div key={index}
                                    className={`p-2 rounded-md cursor-pointer ${isCurrentMonth ? 'text-black' : 'text-gray-300'} ${isPast ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-blue-100'}`}
                                    onClick={() => handleDateClick(date)}>
                                    {date.getDate()}
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 text-right">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">閉じる</button>
                </div>
            </div>
        </div>
    );
};


const GenreFilter = ({ targetField, setTargetField }: { targetField: string, setTargetField: (field: string) => void }) => {
    const genres = [{value: "0", label: "すべて"}, {value: "1", label: "しる"}, {value: "2", label: "つかう"}, {value: "3", label: "まもる"}];
    return (
        <div className="flex justify-center bg-gray-200 rounded-lg p-1 mx-4">
            {genres.map(genre => (
                <button
                    key={genre.value}
                    onClick={() => setTargetField(genre.value)}
                    className={`flex-1 px-3 py-1 text-sm font-semibold rounded-md transition-all ${targetField === genre.value ? 'bg-white text-green-700 shadow' : 'text-gray-600'}`}
                >
                    {genre.label}
                </button>
            ))}
        </div>
    );
};

const SortToggle = ({ sortOrder, setSortOrder }: { sortOrder: string, setSortOrder: (order: string) => void }) => {
    const isTimeSort = sortOrder === 'time';
    return (
        <button
            onClick={() => setSortOrder(isTimeSort ? 'pointDesc' : 'time')}
            className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-sm text-gray-700 hover:bg-gray-50"
        >
            <FontAwesomeIcon icon={isTimeSort ? faSort : faStar} className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">{isTimeSort ? '時間順' : '得点順'}</span>
        </button>
    );
};


// --- メインコンポーネント ---
export default function ProgramsList() {
    const [allPrograms, setAllPrograms] = useState<Program[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [targetField, setTargetField] = useState<string>("0");
    const [sortOrder, setSortOrder] = useState<string>("time");
    const [visibleProgram, setVisibleProgram] = useState<Program | null>(null);
    const [selectedDate, setSelectedDate] = useState(() => { const d = new Date(); d.setHours(0,0,0,0); return d; });
    const [showCalendar, setShowCalendar] = useState(false);
    const programData = packageJson.program_data;
    const pathname = usePathname();

    const handleLogPost = async (previousTitle: string, newTitle: string) => {
        try {
        await postCollectionInLogs("ページ移動", `${previousTitle} → ${newTitle}`, "成功" );
        } catch (error: any) { console.error("ログ記録中にエラーが発生しました:", error.message); }
    };
    const formatRemainingTime = (endDate: Date): string => {
        const now = new Date();
        const diff = endDate.getTime() - now.getTime();

        if (diff <= 0) return "まもなく終了";
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days > 0) return `残り${days}日`;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours > 0) return `残り${hours}時間`;
        const minutes = Math.floor(diff / (1000 * 60));
        return `残り${minutes}分`;
    };

    useEffect(() => {
        setIsLoading(true);
        const selectedDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
        const q = query(collection(db, programData), where("days", "array-contains", selectedDateStr));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const now = new Date();
            
            const programs = snapshot.docs.map((doc) => {
                const data = doc.data();
                const allSchedules: Schedule[] = data.schedule || [];

                const schedulesForSelectedDay = allSchedules.filter(s => s.day === selectedDateStr);
                if (schedulesForSelectedDay.length === 0) return null;

                const latestEndTime = new Date(Math.max(...schedulesForSelectedDay.map(s => {
                    const closeTime = s.close && s.close.includes(':') ? s.close : '23:59:59';
                    return new Date(`${s.day}T${closeTime}:00`).getTime();
                })));

                if (latestEndTime < now) return null;

                let isOngoing = false;
                let remainingTime: string | undefined = undefined;
                
                if (selectedDateStr === `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`) {
                    for (const s of schedulesForSelectedDay) {
                        const startTime = s.open && s.open.includes(':') ? new Date(`${s.day}T${s.open}:00`) : new Date(s.day + "T00:00:00");
                        const endTime = s.close && s.close.includes(':') ? new Date(`${s.day}T${s.close}:00`) : new Date(s.day + "T23:59:59");
                        if (now >= startTime && now <= endTime) {
                            isOngoing = true;
                            remainingTime = formatRemainingTime(endTime);
                            break;
                        }
                    }
                }

                return {
                  id: doc.id, ...data, totalPoint: Number(data.point) + Number(data.loadingPoint),
                  icon: data.type === "postphoto" ? faCamera : data.type === "expressfeelings" ? faPen : data.type === "fallenleaves" ? faLeaf : data.type === "walk" ? faPersonWalking : data.type === "biome" ? faMagnifyingGlass : data.type === "robot" ? faRobot : faMugHot,
                  isOngoing: isOngoing,
                  remainingTime: remainingTime,
                } as Program;
              }).filter(p => p !== null) as Program[];
              
            setAllPrograms(programs);
            setIsLoading(false);
        }, (error) => {
            console.error("Firestore クエリ中にエラーが発生しました:", error.message);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [selectedDate, programData]);

    const filteredAndSortedPrograms = useMemo(() => {
        let programs = allPrograms.filter(p => targetField === "0" || p.field === targetField);
        if (sortOrder === 'pointDesc') {
            return [...programs].sort((a, b) => b.totalPoint - a.totalPoint);
        }
        
        return [...programs].sort((a, b) => {
            const selectedDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
            const aSchedule = a.schedule?.find(s => s.day === selectedDateStr);
            const bSchedule = b.schedule?.find(s => s.day === selectedDateStr);
            
            const aIsAllDay = !aSchedule?.open || !aSchedule.open.includes(':');
            const bIsAllDay = !bSchedule?.open || !bSchedule.open.includes(':');

            if (aIsAllDay && !bIsAllDay) return -1;
            if (!aIsAllDay && bIsAllDay) return 1;

            const aOpen = aSchedule?.open || "00:00";
            const bOpen = bSchedule?.open || "00:00";
            return aOpen.localeCompare(bOpen);
        });
    }, [allPrograms, targetField, sortOrder, selectedDate]);


    const closeDetails = () => setVisibleProgram(null);
    const handleSelectProgram = (program: Program) => {
        setVisibleProgram(program);
        handleLogPost(pathname?.replace(/^\//, "") || "home", `eventId:${program.id}`);
    };

    const formatDay = (day: string) => {
        const date = new Date(day + 'T00:00:00');
        const month = date.getMonth() + 1;
        const dayOfMonth = date.getDate();
        const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
        return `${month}/${dayOfMonth}(${dayOfWeek})`;
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-between pb-20">
            <div className="justify-center mt-24 w-full h-full">
                <div className="fixed font-bold w-full bg-[#fbe5d6] pt-2 pb-2 z-20 top-20">
                    <DateNavigator selectedDate={selectedDate} setSelectedDate={setSelectedDate} onShowCalendar={() => setShowCalendar(true)} />
                    <div className="flex justify-between items-center px-4 mt-2">
                      <GenreFilter targetField={targetField} setTargetField={setTargetField} />
                      <SortToggle sortOrder={sortOrder} setSortOrder={setSortOrder} />
                    </div>
                </div>

                <div className="mt-48">
                    {isLoading ? (
                        <div className="pt-20"><LoadingAnimation /></div>
                    ) : filteredAndSortedPrograms.length === 0 ? (
                        <p className="text-center text-gray-500 mt-16">この日のイベントはありません。</p>
                    ) : (
                        <ProgramTimeline programs={filteredAndSortedPrograms} onSelectProgram={handleSelectProgram} selectedDate={selectedDate}/>
                    )}
                </div>
                
                {showCalendar && (
                    <CalendarModal
                        onSelectDate={(date) => setSelectedDate(date)}
                        onClose={() => setShowCalendar(false)}
                    />
                )}
                
                {visibleProgram && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg w-[95%] max-w-5xl h-4/5 p-2 relative overflow-auto flex flex-col">
                            <h2 className="text-2xl font-bold mt-1 mb-1">{visibleProgram.title}</h2>
                            <hr className="border-t-2 border-green-700 my-2" />
                            <p className="text-left mb-2">{visibleProgram.content}</p>

                            <div className="text-left mb-2">
                                <strong>開催日時:</strong>
                                {(visibleProgram.schedule || [])
                                  .filter(s => {
                                    const now = new Date();
                                    const endTime = s.close && s.close.includes(':')
                                      ? new Date(`${s.day}T${s.close}:00`)
                                      : new Date(`${s.day}T23:59:59`);
                                    return endTime >= now;
                                  })
                                  .map((s, index) => {
                                    const now = new Date();
                                    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                                    const isToday = s.day === todayStr;
                                    let isCurrentlyOngoing = false;

                                    if (isToday) {
                                      const startTime = s.open && s.open.includes(':') ? new Date(`${s.day}T${s.open}:00`) : new Date(`${s.day}T00:00:00`);
                                      const endTime = s.close && s.close.includes(':') ? new Date(`${s.day}T${s.close}:00`) : new Date(`${s.day}T23:59:59`);
                                      if (now >= startTime && now <= endTime) {
                                        isCurrentlyOngoing = true;
                                      }
                                    }

                                    return (
                                      <p key={index} className="ml-2 mb-0">
                                        {formatDay(s.day)}{' '}
                                        <span className={isCurrentlyOngoing ? "font-bold text-red-500" : ""}>
                                          {s.open && s.close ? `${s.open} ~ ${s.close}` : <span className="font-bold text-red-500">終日</span>}
                                        </span>
                                      </p>
                                    )
                                })}
                            </div>

                            <div className="flex justify-between mb-0">
                                <p className="text-left mb-0"><strong>得点:</strong> {visibleProgram.totalPoint}P</p>
                                <p className="text-right mb-0"><strong>運営:</strong> {visibleProgram.owner}</p>
                            </div>
                            <div className="mt-auto mb-auto">
                                <div className="grid grid-cols-4 text-center border-b-2 border-green-700">
                                    <p className="col-start-1 text-center bg-green-700 text-white mb-0 rounded-t-lg"><strong>場所</strong></p>
                                </div>
                                <p className="text-left mb-2">{visibleProgram.place}</p>
                                <div className="w-full flex justify-center">
                                    <Image
                                        src={"/programPlace" + visibleProgram.id + ".jpg"}
                                        width={0}
                                        height={0}
                                        sizes="100vw"
                                        style={{ width: '100%', height: 'auto' }}
                                        alt="picture"
                                        priority
                                        className="rounded-lg"
                                    />
                                </div>
                            </div>
                            <button
                            onClick={closeDetails}
                            className="mt-auto px-4 py-2 bg-green-700 text-white text-xl font-bold rounded hover:bg-green-900"
                            >
                            とじる
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}