"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faPen, faLeaf, faMugHot, faPersonWalking, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import Image from "next/image";
import React, { useEffect, useState } from "react";
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

// scheduleの型を新しい構造に合わせる
type Schedule = {
  day: string;
  open: string;
  close: string;
};

type Program = {
  id: string;
  title: string;
  content: string;
  place: string;
  owner: string;
  loadingPoint: number;
  point: number;
  totalPoint: number;
  field: string;
  type: string;
  schedule: Schedule[]; // dayからschedule配列に変更
  icon: any;
};

export default function ProgramsList() {
    const [programList, setProgramList] = useState<Program[]>([]);
    const [targetField, setTargetField] = useState<string>("0");
    const [sortOrder, setSortOrder] = useState<string>("none");
    const [visibleProgram, setVisibleProgram] = useState<Program | null>(null);
    const programData = packageJson.program_data;

    const pathname = usePathname();
    const handleLogPost = async (previousTitle: string, newTitle: string) => {
        try {
        await postCollectionInLogs(
            "ページ移動",
            `${previousTitle} → ${newTitle}`,
            "成功"
        );
        } catch (error: any) {
        console.error("ログ記録中にエラーが発生しました:", error.message);
        }
    };
    const currentPath = pathname?.replace(/^\//, "") || "home";

    useEffect(() => {
        const q =
        targetField === "0"
            ? query(collection(db, programData))
            : query(collection(db, programData), where("field", "==", targetField));
      
        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const programs = snapshot.docs
              .map((doc) => ({
                id: doc.id,
                ...doc.data(),
                totalPoint: Number(doc.data().point) + Number(doc.data().loadingPoint),
                icon:
                  doc.data().type === "postphoto"
                    ? faCamera
                    : doc.data().type === "expressfeelings"
                    ? faPen
                    : doc.data().type === "fallenleaves"
                    ? faLeaf
                    : doc.data().type === "walk"
                    ? faPersonWalking
                    : doc.data().type === "biome"
                    ? faMagnifyingGlass
                    : faMugHot,
              })) as Program[];
      
            let sortedPrograms = programs.filter(
              (program) =>
                !isNaN(Number(program.id)) && !isNaN(program.totalPoint)
            );
      
            sortedPrograms = sortedPrograms.sort((a, b) => {
              const idA = parseInt(a.id, 10);
              const idB = parseInt(b.id, 10);
              return idA - idB;
            });
      
            if (sortOrder === "pointDesc") {
              sortedPrograms = sortedPrograms.sort((a, b) => b.totalPoint - a.totalPoint);
            }
      
            setProgramList(sortedPrograms);
          },
          async (error) => {
            console.error("Firestore クエリ中にエラーが発生しました:", error.message);
            try {
                await postCollectionInLogs("イベントリスト取得", `失敗`, "失敗");
            } catch (logError: any) {
                console.error("ログ記録中にエラーが発生しました:", logError.message);
            }
          }
        );
      
        return () => unsubscribe();
      }, [targetField, sortOrder, programData]);

    const closeDetails = () => {
        setVisibleProgram(null);
    };

    const formatDay = (day: string) => {
        switch (day) {
            case "1": return "1/8(水)";
            case "2": return "1/9(木)";
            case "3": return "1/10(金)";
            default: return day;
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-0 text-center">
            <div className="justify-center mt-24 w-full h-full">
                <div className="fixed font-bold mb-0 top-20 w-full bg-[#fbe5d6] pt-6 pb-2 z-0">
                    <label htmlFor="day-select" className="mr-2 ml-2">ジャンル:</label>
                    <select
                    id="day-select"
                    value={targetField}
                    onChange={(e) => setTargetField(e.target.value)}
                    className="p-2 border rounded"
                    >
                    <option value="0">すべて</option>
                    <option value="1">しる</option>
                    <option value="2">つかう</option>
                    <option value="3">まもる</option>
                    </select>
                    <label htmlFor="sort-select" className="mr-2 ml-3">並び替え:</label>
                    <select
                    id="sort-select"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="p-2 border rounded"
                    >
                    <option value="none">指定なし</option>
                    <option value="pointDesc">得点順</option>
                    </select>
                </div>
                <div className="mt-20 mb-20 pt-10">
                {programList.length === 0 ? (
                    <div className="flex min-h-screen flex-col items-center justify-between pb-20">
                        <LoadingAnimation />
                    </div>
                    ) : (
                    programList.map((program) => (
                        <div key={program.id} className="mt-0 mb-0 w-full p-[2%] overflow-auto">
                        <div className="bg-green-700 rounded-sm p-1 flex flex-col leading-normal">
                            <button
                            onClick={() => {
                                setVisibleProgram(program)
                                handleLogPost(currentPath, "eventId:"+program.id)
                            }}
                            className="grid grid-cols-12 text-gray-900 font-bold text-base text-center bg-white p-1 rounded-sm hover:bg-gray-400"
                            >
                            <FontAwesomeIcon 
                                icon={program.icon} 
                                className="col-start-1 w-auto h-6 text-green-700"
                            />
                            <div className="col-start-2 col-span-11">
                                {program.title}
                            </div>
                            </button>
                        </div>
                        </div>
                    ))
    )           }  
                </div>
                {visibleProgram && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg w-[95%] max-w-5x h-4/5 p-2 relative overflow-auto flex flex-col">
                            <h2 className="text-2xl font-bold mt-1 mb-1">{visibleProgram.title}</h2>
                            <hr className="border-t-2 border-green-700 my-2" />
                            <p className="text-left mb-2">{visibleProgram.content}</p>
                            
                            <div className="text-left mb-2">
                                <strong>開催日時:</strong>
                                {(visibleProgram.schedule || []).map((s, index) => (
                                    <p key={index} className="ml-2 mb-0">
                                        {/* openとcloseが両方ある場合のみ時間を表示し、ない場合は「終日」と表示 */}
                                        {formatDay(s.day)} {s.open && s.close ? `${s.open} ~ ${s.close}` : <span className="font-bold text-red-500">終日</span>}
                                    </p>
                                ))}
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
                                        layout="responsive"
                                        width={0}
                                        height={0}
                                        alt="picture"
                                        priority
                                        className="w-full h-auto rounded-lg"
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