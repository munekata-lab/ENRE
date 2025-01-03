"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase/client";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import packageJson from "../../package.json";

type Program = {
  id: string;
  title: string;
  content: string;
  place: string;
  owner: string;
  loadingPoint: number;
  point: number;
  day: string;
  open: string;
  close: string;
};

export default function ProgramsList() {
  const [programList, setProgramList] = useState<Program[]>([]);
  const [targetField, setTargetField] = useState<string>("0");
  const [sortOrder, setSortOrder] = useState<string>("none");
  const [visibleProgram, setVisibleProgram] = useState<Program | null>(null); // Full-screen modal data
  const programData = packageJson.program_data;

  useEffect(() => {
    let q =
      targetField === "0"
        ? query(collection(db, programData))
        : query(collection(db, programData), where("field", "==", targetField));
  
    if (sortOrder === "pointDesc") {
      q = query(q, orderBy("point", "desc"));
    }
  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const programs = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Program[];
  
      // idを数字の小さい順に並び替え
      const sortedPrograms = programs.sort((a, b) => {
        const idA = parseInt(a.id, 10); // idを整数に変換
        const idB = parseInt(b.id, 10); // idを整数に変換
        return idA - idB; // idの数値が小さい順にソート
      });
  
      setProgramList(sortedPrograms);
    });
  
    return () => unsubscribe();
  }, [targetField, sortOrder]);

  const closeDetails = () => {
    setVisibleProgram(null);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-0 text-center">
        <div className="justify-center mt-24 w-full h-full">
            <div className="fixed font-bold mb-20 top-24 w-full">
                <label htmlFor="day-select" className="mr-2 ml-2">ジャンル:</label>
                <select
                id="day-select"
                value={targetField}
                onChange={(e) => setTargetField(e.target.value)}
                className="p-2 border rounded"
                >
                <option value="0">すべて</option>
                <option value="1">知る</option>
                <option value="2">使う</option>
                <option value="3">守る</option>
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
            {programList.map((program) => (
                <div key={program.id} className="mb-3 w-full p-[3%] overflow-auto mt-20">
                    <div className="bg-green-700 rounded-sm p-2 flex flex-col leading-normal">
                        <button
                            onClick={() => setVisibleProgram(program)}
                            className="text-gray-900 font-bold text-xl text-center bg-white p-2 rounded-sm hover:bg-gray-400"
                        >
                            {program.title}
                        </button>
                    </div>
                </div>
            ))}
            {visibleProgram && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-[95%] max-w-5x h-4/5 p-2 relative overflow-auto flex flex-col">
                        <h2 className="text-2xl font-bold mt-1 mb-1">{visibleProgram.title}</h2>
                        <hr className="border-t-2 border-green-700 my-2" />
                        <p className="text-left mb-2">{visibleProgram.content}</p>
                        <p className="text-left mb-2">
                            <strong>開催時間:</strong>{" "}
                            {visibleProgram.open && visibleProgram.close
                                ? `${visibleProgram.open} ~ ${visibleProgram.close}`
                                : "全日"}
                        </p>
                        <p className="text-left mb-2"><strong>得点:</strong> {visibleProgram.point + visibleProgram.loadingPoint}P</p>
                        <p className="text-right mb-0"><strong>運営:</strong> {visibleProgram.owner}</p>
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
            {/* <div className="w-full text-center mt-10">
                これ以上はありません
            </div> */}
        </div>
    </main>
  );
}
