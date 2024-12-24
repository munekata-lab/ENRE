"use client";

import { useState, useEffect } from "react";
import { useZxing } from "react-zxing";
import { useRouter } from "next/navigation";

export default function BarcodeScanner() {
  const router = useRouter();
  const [result, setResult] = useState("");
  const [eventId, setEventId] = useState(""); // 手動で入力されたイベントID
  const { ref } = useZxing({
    onDecodeResult(result) {
      setResult(result.getText());
    },
  });

  useEffect(() => {
    if (result === "") return;
    router.push(result);
  }, [router, result]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEventId(e.target.value); // 手動入力のイベントIDを状態にセット
  };

  const handleSubmit = () => {
    if (eventId) {
      // 手動で入力されたイベントIDで遷移
      // router.push(`https://www.enre-official.com/loading?id=${eventId}`);
      router.push(`https://localhost:3000/loading?id=${eventId}`);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-0 text-center">
      <div className="justify-center mt-24">
        <h1 className="text-2xl font-bold mb-4">QRコードリーダー</h1>
        <video ref={ref} className="m-auto w-full h-22" />
        <p className="pt-5 pl-5 pr-5">QRコードを読み取ってください</p>
        <p className="pt-5 pl-5 pr-5">
          カメラが起動しない場合は、ブラウザの設定からカメラを許可してください。
        </p>
        <p className="pt-5 pl-5 pr-5">
          それでも起動しない場合は、QRコードの下にあるイベントIDを以下に入力してください。
        </p>
        <input
          type="text"
          placeholder="Event Id"
          className="text-sm w-full p-1 border rounded"
          value={eventId} // 入力フィールドにイベントIDをバインド
          onChange={handleInputChange} // 入力の変更を管理
        />
        <button
          onClick={handleSubmit} // 送信ボタンで遷移処理
          className="mt-4 bg-green-700 text-white px-4 py-2 rounded"
        >
          イベントIDで遷移
        </button>
      </div>
    </main>
  );
}
