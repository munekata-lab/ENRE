import { adminDB } from "@/lib/firebase/server";
import { FieldValue } from "firebase-admin/firestore";

// ▼ 追加: ブラウザでのアクセス確認用 (GET)
export async function GET() {
  return Response.json({ message: "Pepper API endpoint is ready." });
}

// ▼ Pepperからのデータ受信用 (POST)
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body) {
      return Response.json({ ok: false, message: "No data provided" }, { status: 400 });
    }

    // ボディから必要な情報を抽出 (Pepper側がこの形式で送ってくると仮定)
    // 送信データ例: { "uid": "user_xxx", "pepper_id": "pepper_01", ... }
    const { token, event_id, uid } = body;

    // 必須項目のチェック（必要に応じて）
    if (!token || !event_id || !uid) {
      return Response.json({ ok: false, message: "Missing uid or pepper_id or token" }, { status: 400 });
    }

    // pepper_logs コレクションに追加
    await adminDB.collection("pepper_logs").add({
      uid: uid,
      token: token,
      title: "通信成功",
      date: FieldValue.serverTimestamp(), // または new Date()
      pepper_id: event_id
    });

    return Response.json({ ok: true, message: "Log saved successfully" });

  } catch (error) {
    console.error("Error processing request from Pepper:", error);
    return Response.json({ ok: false, message: "Internal Server Error" }, { status: 500 });
  }
}