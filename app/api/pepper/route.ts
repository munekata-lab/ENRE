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

    // ボディから必要な情報を抽出
    const { token, event_id, uid } = body;

    // 必須項目のチェック
    if (!token || !event_id || !uid) {
      return Response.json({ ok: false, message: "Missing uid or event_id or token" }, { status: 400 });
    }

    // 1. pepper_logs コレクションに追加
    await adminDB.collection("pepper_logs").add({
      uid: uid,
      token: token,
      title: "通信成功",
      date: FieldValue.serverTimestamp(),
      pepper_id: event_id
    });

    // ▼▼▼ 修正箇所: 更新前のデータを取得して返す ▼▼▼
    const userRef = adminDB.collection("users").doc(uid);
    
    // 2. 更新前のユーザーデータを取得
    const userSnap = await userRef.get();
    const userData = userSnap.data();
    // 更新前の配列を取得（データがない場合は空配列）
    const robotMeet = userData?.robotMeet || []; 

    // 3. users コレクションの robotMeet 配列に event_id を追加
    // (すでに存在する場合は重複しない)
    await userRef.update({
        robotMeet: FieldValue.arrayUnion(event_id)
    });

    // 4. レスポンスに「更新前」の robotMeet を含めて返す
    return Response.json({ 
        ok: true, 
        message: "Log saved successfully", 
        robotMeet: robotMeet 
    });

  } catch (error) {
    console.error("Error processing request from Pepper:", error);
    return Response.json({ ok: false, message: "Internal Server Error" }, { status: 500 });
  }
}