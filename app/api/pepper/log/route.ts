import { adminDB } from "@/lib/firebase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Pepperから送られてくるJSONデータを取得
    const body = await request.json();
    const { uid, nickname } = body;

    // バリデーション
    if (!uid) {
      return NextResponse.json({ error: "UID is required" }, { status: 400 });
    }

    // ログデータの作成
    // lib/dbActions.ts の logs コレクション構造に合わせています
    const logData = {
      title: "Pepper連携",
      place: "Pepper",
      state: `${nickname || 'ユーザー'}さんがPepperと対話しました`, // 必要に応じてメッセージを変更
      date: new Date(),
      uid: uid,
    };

    // Firestoreのlogsコレクションに追加
    await adminDB.collection("logs").add(logData);

    return NextResponse.json({ message: "Log created successfully" }, { status: 200 });

  } catch (error: any) {
    console.error("Pepper Log Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}