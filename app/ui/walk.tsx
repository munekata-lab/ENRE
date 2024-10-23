"use client";

import { useState, useEffect } from "react";
import {
  fetchCurrentPlace,
  fetchProgramInfo,
  patchCurrentPlace,
  patchReward,
  patchParticipatedEvents,
  patchCheckinProgramIds,
  patchCheckoutProgramIds,
} from "@/lib/dbActions";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function WalkComponent() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [process, setProcess] = useState<string[]>([]);
  const [caution, setCaution] = useState<string[]>([]);
  const [condition, setCondition] = useState<string[]>([]);
  const [isWalking, setIsWalking] = useState<boolean | null>(null);
  const [isFinished, setIsFinished] = useState<boolean | null>(null);
  const searchParams = useSearchParams();
  const reward = searchParams.get("rewardPoint") || "";
  const rewardField = searchParams.get("rewardField") || "";
  const rewardGIP = searchParams.get("rewardGIP") || "";
  const programId = searchParams.get("programId") || "";

  useEffect(() => {
    (async () => {
      const programInfo = await fetchProgramInfo(programId);
      setTitle(programInfo.title);
      setContent(programInfo.content);
      setProcess(programInfo.process);
      setCaution(programInfo.caution);
      setCondition(programInfo.condition);
      const currentPlace = await fetchCurrentPlace();
      if (currentPlace === "walking") {
        setIsWalking(true);
        setIsFinished(false);
      } else if (currentPlace === "Home") {
        setIsFinished(true);
        setIsWalking(false);
      } else {
        setIsWalking(false);
        setIsFinished(false);
      }
    })();
  }, []);

  const handleStartWalking = () => {
    (async () => {
      await patchCheckinProgramIds(programId);
      await patchCurrentPlace("walking");
      setIsWalking(true);
    })();
  };

  const handleFinishWalking = () => {
    (async () => {
      await patchCheckoutProgramIds(programId);
      await patchParticipatedEvents(programId);
      await patchCurrentPlace("Home");
      await patchReward(reward, rewardField, rewardGIP);
      setIsWalking(false);
      setIsFinished(true);
    })();
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-3 overflow-x-scroll">
      <div className="w-full h-10"></div>
      <h2 className="text-2xl font-bold">{title}</h2>
      {isWalking === null || isFinished === null ? (
        <p className="text-sm text-green-700 font-bold m-0 p-2">
          読み込み中...
        </p>
      ) : (
        <>
          {!isWalking && !isFinished && (
            <button
              onClick={handleStartWalking}
              className="text-sm bg-green-700 p-2 rounded-md text-white"
            >
              今から歩いて帰る
            </button>
          )}
          {isWalking && (
            <>
              <p className="text-sm text-green-700 font-bold m-0 p-2">
                帰宅中...
              </p>
              <button
                onClick={handleFinishWalking}
                className="text-sm bg-green-700 p-2 rounded-md text-white"
              >
                帰宅したら押してください
              </button>
            </>
          )}
          {isFinished && (
            <Link href="/">
              <button className="text-sm bg-green-700 p-2 rounded-md no-underline text-white">
                お疲れ様でした（ホームに戻る）
              </button>
            </Link>
          )}
        </>
      )}

      <div className="mt-4 border-b-2 h-1 border-green-600 border-opacity-30 drop-shadow-sm mb-4 w-11/12"></div>

      <div className="p-2">
        <p className="text-sm mb-0 text-left">{content}</p>
        <p className="text-md mb-1 font-bold mt-3">手順</p>
        <div className="mb-2 text-left">
          {process.map((process, index) => (
            <p key={index} className="text-xs mb-0 ml-3">
              {`${index + 1}. ${process}`}
            </p>
          ))}
        </div>
        <p className="text-md mb-1 font-bold">注意事項</p>
        <div className="mb-2 text-left">
          {caution.map((caution, index) => (
            <p key={index} className="text-xs mb-0 ml-3">
              {caution}
            </p>
          ))}
        </div>
        <p className="text-md mb-1 font-bold">付与条件</p>
        <div className="mb-2">
          {condition.map((condition, index) => (
            <p key={index} className="text-xs mb-0 ml-3">
              {condition}
            </p>
          ))}
        </div>
      </div>
      <div className="w-full h-10"></div>
    </main>
  );
}
