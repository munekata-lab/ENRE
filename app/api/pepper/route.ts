// app/api/pepper/route.ts

import { adminDB } from "@/lib/firebase/server";

export async function POST(req: Request) {
  try {
    // Pepperから送信されたJSONデータを取得
    const body = await req.json();

    // データが空の場合のチェック
    if (!body) {
      return Response.json({ ok: false, message: "No data provided" }, { status: 400 });
    }

    // 保存するデータを作成 (受信日時などを追加)
    const pepperData = {
      ...body,
      receivedAt: new Date(), // 受信時刻をサーバー側で記録
    };

    // Firestoreの 'pepper_messages' コレクションに保存
    // ※コレクション名は用途に合わせて変更してください
    await adminDB.collection("pepper_messages").add(pepperData);

    // Pepper側に成功レスポンスを返す
    return Response.json({ ok: true, message: "Data received successfully" });

  } catch (error) {
    console.error("Error processing request from Pepper:", error);
    return Response.json({ ok: false, message: "Internal Server Error" }, { status: 500 });
  }
}