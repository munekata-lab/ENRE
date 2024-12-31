"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  postCollectionInLogs,
  postDocument,
  fetchProgramInfo,
  fetchProgramInfo2,
  patchReward2,
  patchCheckoutProgramIds,
  patchParticipatedEvents,
} from "@/lib/dbActions";
import { postLogEvent } from "@/lib/firebase/client";
import React from "react";

export default function ExpressFeelingsComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"detail" | "post">("detail");
  const [document, setDocument] = useState(""); // 投稿内容
  const [process, setProcess] = useState<string[]>([]);
  const [caution, setCaution] = useState<string[]>([]);
  const [condition, setCondition] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isPushButton, setIsPushButton] = useState(false);
  const programId = searchParams.get("programId") || "";
  const place = searchParams.get("place") || "";
  const content = searchParams.get("content") || "";
  const point = searchParams.get("point") || "";
  const field = searchParams.get("field") || "";
  const type = searchParams.get("type") || "";
  const title = searchParams.get("title") || ""; //クリア画面で使用
  const completionMessage = searchParams.get("completionMessage") || ""; //クリア画面で使用

  useEffect(() => {
    (async () => {
      const programInfo2 = await fetchProgramInfo2(type);
      setProcess(programInfo2.process);
      setCaution(programInfo2.caution);
      setCondition(programInfo2.condition);
    })();
  }, []);

  const handlePost = async () => {
    if (!document.trim()) {
      setError("投稿内容を入力してください。");
      return;
    }

    setError("");
    setIsPushButton(true);

    try {
      await patchReward2(point, field);
      await patchCheckoutProgramIds(programId);
      await postDocument(programId, document);
    //   alert("投稿が成功しました！");
      const title2 = "自然の空間で感じることを投稿しました";
      const state = "expressfeelings";
      await postCollectionInLogs(title2, place, state);
      await patchParticipatedEvents(programId);
      setDocument("");
      setIsPushButton(false);
      router.push(`/complete?&programId=${programId}&title=${title}&completionMessage=${completionMessage}&point=${point}&field=${field}`); // 例: 投稿完了ページへ遷移
    } catch (err) {
      console.error(err);
      setError("投稿中にエラーが発生しました。");
      setIsPushButton(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col justify-between pb-20">
      <div className="justify-center mt-24">
        <div className="grid grid-cols-4 text-center border-b-2 border-green-700 m-2">
          <button
            className={`col-start-2 text-lg ${
              tab === "detail"
                ? "bg-green-700 text-white font-bold rounded-t-lg"
                : "text-green-700 underline"
            }`}
            onClick={() => setTab("detail")}
          >
            詳細
          </button>
          <button
            className={`col-start-3 text-lg ${
              tab === "post"
                ? "bg-green-700 text-white font-bold rounded-t-lg"
                : "text-green-700 underline"
            }`}
            onClick={() => setTab("post")}
          >
            投稿
          </button>
        </div>
        {tab === "detail" && (
          <div className="p-2 overflow-auto bg-white mx-2">
            <p className="text-sm mb-0 text-left">{content}</p>
            <p className="text-lg mb-0 font-bold mt-2">手順</p>
                <div className="mb-2 text-left">
                  {process.map((process, index) => (
                    <p key={index} className="text-sm mb-0 ml-3">
                      {`${index + 1}. ${process}`}
                    </p>
                  ))}
                </div>
            <p className="text-lg mb-0 font-bold">注意事項</p>
            <div className="mb-2 text-left">
              {caution.map((caution, index) => (
                <p key={index} className="text-sm mb-0 ml-3">
                  {`${index + 1}. ${caution}`}
                </p>
              ))}
            </div>
            <p className="text-lg mb-0 font-bold">付与</p>
            <div className="mb-2">
              <p className="text-sm mb-0 ml-3">
                {`${point}P`}
              </p>
            </div>
          </div>
        )}
        {tab === "post" && (
        <>
            <div className="flex flex-col justify-center items-center w-full p-5">
              <textarea
                className="w-full h-32 border p-2 rounded"
                placeholder="投稿内容を入力してください..."
                value={document}
                onChange={(e) => setDocument(e.target.value)}
              />
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>
            <div className="flex justify-center items-center w-full p-5">
              <button
                onClick={handlePost}
                className={`flex justify-center items-center ${
                  isPushButton ? "bg-gray-600" : "bg-green-700 hover:bg-green-900"
                } text-white font-bold py-2 px-4 rounded`}
                disabled={isPushButton}
              >
                {isPushButton ? "投稿中..." : "投稿"}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
