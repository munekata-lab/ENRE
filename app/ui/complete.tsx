"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Card from "react-bootstrap/Card";

export default function CompleteComponent() {
  const searchParams = useSearchParams();
  const programId = searchParams.get("programId") || "";
  const title = searchParams.get("title") || "";
  const completionMessage = searchParams.get("completionMessage") || "";
  const point = searchParams.get("point") || "";
  const field = searchParams.get("field") || "";

  return (
    <div className="flex min-h-screen flex-col justify-between pb-20">
        <div className="justify-center mt-24">
            <h1 className="text-xl font-bold text-center mb-10 bg-white mx-2">
            ミッションクリア
            </h1>

            <div className="text-xl font-bold text-center mb-10 bg-white mx-2">
            {title}
            <p className="text-sm mx-3 mb-3 mt-2">{completionMessage}</p>
            <p className="text-sm mx-3 mb-3 mt-2">{`${point}P`}</p>
            </div>

            <h1 className="text-sm font-bold text-center mb-3">
            獲得した報酬はホーム画面から確認できます。
            </h1>

            <Link href="/" className="mt-1">
            <button
                className="text-xs underline my-4 text-gray-600"
            >ホームに戻る</button>
            </Link>
        </div>
    </div>
  );
}
