"use client";

import React from "react";
import { db } from "@/lib/firebase/client";
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
import { getProgramsByDay } from "@/lib/dbActions";

type Props = {
    targetDay: string;
  };

type Program = {
    id: string;
    title: string;
    content: string;
    place: string;
    owner: string;
    point: string;
    day: string;
    open: string;
    close: string;
  };
  
export default function ProgramsList() {
    const [programList, setProgramList] = useState<Program[]>([]);
    const [targetDay, setTargetDay] = useState<string>("0");
    const [sortOrder, setSortOrder] = useState<string>("none"); // 並び替え基準
    
    useEffect(() => {
        // クエリを動的に構築
        let q = targetDay === "0"
        ? query(collection(db, "test_program2"))
        : query(collection(db, "test_program2"), where("day", "==", targetDay));

        // const q = query(
        // collection(db, "test_program2"),
        // where("day", "==", targetDay)
        // );

        if (sortOrder === "pointDesc") {
            q = query(q, orderBy("point", "desc"));
          } else if (sortOrder === "pointAsc") {
            q = query(q, orderBy("point", "asc"));
          }
    
        const unsubscribe = onSnapshot(q, (snapshot) => {
        const programs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Program[];
        setProgramList(programs);
        });
    
        return () => unsubscribe();
    }, [targetDay, sortOrder]);
    
    return (
        <div className="mt-10 h-full w-full">
            <div className="mb-4">
                <label htmlFor="day-select" className="mr-2 ml-2">対象日:</label>
                <select
                    id="day-select"
                    value={targetDay}
                    onChange={(e) => setTargetDay(e.target.value)}
                    className="p-2 border rounded"
                >
                    <option value="0">すべて</option>
                    <option value="1">1/8(水)</option>
                    <option value="2">1/9(木)</option>
                    <option value="3">1/10(金)</option>
                    {/* <option value="4">4日目</option>
                    <option value="5">5日目</option> */}
                </select>
                {/* 並び替え条件選択 */}
                <label htmlFor="sort-select" className="mr-2 ml-3">得点:</label>
                    <select
                    id="sort-select"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="p-2 border rounded"
                    >
                    <option value="none">指定なし</option>
                    <option value="pointDesc">高い順</option>
                    <option value="pointAsc">低い順</option>
                </select>
            </div>
            {programList.map((program) => (
                <div key={program.id} className="mb-3 w-full p-[3%]">
                    <div className="bg-white rounded p-4 flex flex-col leading-normal">
                        <div className="w-full">
                            <div className="text-gray-900 font-bold text-xl text-center">
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
                    </div>
                </div>
            ))}
            <div className="w-full text-center mt-10">
                これ以上はありません
            </div>
        </div>
    );
}