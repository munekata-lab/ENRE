"use client";

import Link from "next/link";
import { postCollectionInLogs } from "@/lib/dbActions";

export default function BusPoolLinkComponent() {
  const handleLogPost = async () => {
    try {
      await postCollectionInLogs("ページ移動", "home → busWebcam", "成功");
    } catch (error: any) {
      console.error("ログ記録中にエラーが発生しました:", error.message);
    }
  };

  return (
    <div className="justify-self-center items-center text-center mt-2">
      <Link
        href="https://jweb.kyoto-su.ac.jp/webcam/"
        className="text-sm text-white bg-green-700 py-2 px-4 rounded-md font-bold no-underline"
        onClick={handleLogPost} 
      >
        バスプールをアイキャッチ
      </Link>
    </div>
  );
}
