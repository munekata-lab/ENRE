"use client";

import { useState, useEffect, useCallback } from "react";
import { useZxing } from "react-zxing";
import { usePathname, useRouter } from "next/navigation";
import { db } from "@/lib/firebase/client"; // Firebaseの初期化ファイルをインポート
import { collection, query, where, getDocs } from "firebase/firestore"; // Firestore関連の関数をインポート
import packageJson from "../../package.json";
import { postCollectionInLogs } from "@/lib/dbActions";

export default function BarcodeScanner() {
  const router = useRouter();
  const [result, setResult] = useState("");
  const [programPass, setProgramPass] = useState(""); // 手動で入力されたイベントパス
  const [noResult, setNoResult] = useState(false); // 結果がない場合のフラグ
  const programData = packageJson.program_data;
  const { ref } = useZxing({
    onDecodeResult(result) {
      setResult(result.getText());
    },
  });

  const pathname = usePathname();
  const handleLogPost = useCallback(async (previousTitle: string, newTitle: string) => {
    try {
      await postCollectionInLogs(
        "qrコードのパス入力でのページ移動",
        `${previousTitle} → ${newTitle}`,
        "成功"
      );
    } catch (error: any) {
      console.error("ログ記録中にエラーが発生しました:", error.message);
    }
  }, []);
  const currentPath = pathname?.replace(/^\//, "") || "home";

  useEffect(() => {
    if (result === "") return;
    handleLogPost(currentPath, "qrReaderByScan");
    router.push(result);
  }, [router, result, currentPath, handleLogPost]);

  const handleSubmit = async () => {
    if (programPass) {
      const q = query(collection(db, programData), where("programPass", "==", programPass));
      handleLogPost(currentPath, "qrReaderByPass");
      try {
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          setNoResult(true); // 結果が空の場合はフラグを立てる
        } else {
          // 一致するドキュメントがあれば、ドキュメント名を取得
          const doc = querySnapshot.docs[0]; // 最初の一致するドキュメントを取得
          const documentName = doc.id; // ドキュメントID（ドキュメント名として使う）
          
          // 修正点: programIdとidの両方をクエリパラメータとして渡す
          const qrId = `${documentName}_1`; // 最初のQRコードのIDを想定
          handleLogPost(currentPath, "qrReaderByPass success: "+documentName);
          router.push(`/loading?programId=${documentName}&id=${qrId}`);
        }
      } catch (error) {
        console.error("Error getting documents: ", error);
      }
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-0 text-center">
      <div className="justify-center mt-24">
        <h1 className="text-2xl font-bold mb-2">QRコードリーダー</h1>
        {/* 'as' を使って型をキャスト */}
        <video ref={ref as React.RefObject<HTMLVideoElement>} className="m-auto w-full h-22 p-2" />
        <p className="pt-2 pl-5 pr-5">QRコードを読み取ってください</p>
        <p className="pt-2 pl-5 pr-5">
          カメラが起動しない場合は、ブラウザの設定からカメラを許可してください。
        </p>
        <p className="pt-2 pl-5 pr-5">
          それでも起動しない場合は、QRコードの下にあるイベントパスを以下に入力してください。
        </p>
        <div className="px-4">
          <input
            type="text"
            placeholder="Event Pass"
            className="text-sm w-full p-2 border rounded"
            value={programPass} // 入力フィールドにイベントパスをバインド
            onChange={(e) => setProgramPass(e.target.value)} // 入力の変更を管理
          />
        </div>
        <button
          onClick={handleSubmit} // 送信ボタンで遷移処理
          className="mt-2 bg-green-700 hover:bg-green-900 text-white px-4 py-2 rounded"
        >
          決定
        </button>
        {noResult && (
          <p className="mt-2 text-red-500">イベントパスが正しくありません</p> // メッセージを表示
        )}
      </div>
    </main>
  );
}