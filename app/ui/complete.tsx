"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import Card from "react-bootstrap/Card";
import { postCollectionInLogs } from "@/lib/dbActions";

export default function CompleteComponent() {
  const searchParams = useSearchParams();
  const programId = searchParams.get("programId") || "";
  const title = searchParams.get("title") || "";
  const completionMessage = searchParams.get("completionMessage") || "";
  const point = searchParams.get("point") || "";
  const field = searchParams.get("field") || "";

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

            <h1 className="text-sm font-bold text-center mb-3 w-11/12">
                イベントに参加している様子を共有しよう！
            </h1>

            <div>
                <a
                    href="https://twitter.com/share?ref_src=twsrc%5Etfw"
                    className="twitter-share-button"
                    data-size="large"
                    data-text={`「${title}」に参加しました`}
                    data-url="https://www.enre-official.com/"
                    data-hashtags="Enre #京都産業大学"
                    data-show-count="true"
                    onClick={ ()=>handleLogPost(currentPath, "Twitter")}
                >
                    Tweet
                </a>
                <Script
                    src="https://platform.twitter.com/widgets.js"
                    strategy="lazyOnload"
                />
            </div>

            <Link href="/" className="mt-1">
            <button
                className="text-xs underline my-4 text-gray-600"
                onClick={()=>{handleLogPost(currentPath, "home"), console.log("home")}} 
            >ホームに戻る</button>
            </Link>
        </div>
    </div>
  );
}
