// type: uploaded file

import { adminDB } from "@/lib/firebase/server";
import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";

export async function POST(request: Request) {
  try {
    // Pepperから送られてくるJSONデータを取得
    // Java側送信データ: { "token": "...", "event_id": 1 }
    const body = await request.json();
    const { token } = body;
    // Javaはbodyにevent_idを含めますが、PythonロジックはDB(トークン)内のevent_idを優先するため、
    // ここでもトークン情報からevent_idを取得するロジックを基本とします。
    // ※フォールバックとしてbodyのevent_idを使用することも可能です。
    let reqEventId = body.event_id; 

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    // 1. トークンの検証 (Python: user_qr_token テーブルの確認)
    const tokenRef = adminDB.collection("user_qr_tokens").doc(token);
    const tokenSnap = await tokenRef.get();

    if (!tokenSnap.exists) {
      return NextResponse.json({ error: "Invalid token" }, { status: 404 });
    }

    const tokenData = tokenSnap.data();
    const uid = tokenData?.user_id;
    const expiresAt = tokenData?.expires_at; // Firestore Timestamp
    const isUsed = tokenData?.used;
    const dbEventId = tokenData?.event_id;

    // トークンに紐づくイベントIDがあればそれを優先使用
    const targetEventId = dbEventId !== undefined ? dbEventId : reqEventId;

    // 使用済みチェック
    if (isUsed) {
      return NextResponse.json({ error: "Token already used" }, { status: 409 });
    }

    // 期限切れチェック
    const now = Timestamp.now();
    if (expiresAt && expiresAt.seconds < now.seconds) {
      return NextResponse.json({ error: "Token expired" }, { status: 410 });
    }

    // 2. トークンを使用済みに更新
    await tokenRef.update({ used: true });

    // 3. ユーザーデータの取得と更新 (Python: event_robot テーブルへの追加と集計)
    // Enreでは users コレクションの participated フィールドで回数を管理します
    const userRef = adminDB.collection("users").doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userSnap.data();
    // participated: { [key: number]: number }
    const participated = userData?.participated || {};

    // カウントアップ
    const currentCount = participated[targetEventId] || 0;
    const newCount = currentCount + 1;
    participated[targetEventId] = newCount;

    // 更新実行
    await userRef.update({
      participated: participated
    });

    // ログにも記録 (Enreの既存機能に合わせる)
    try {
      await adminDB.collection("logs").add({
        title: "Pepper連携",
        place: `Pepper-${targetEventId}`,
        state: `イベントID:${targetEventId} に参加しました (${newCount}回目)`,
        date: new Date(),
        uid: uid,
      });
    } catch (e) {
      console.error("Log write failed", e);
    }

    // 4. レスポンスの作成 (Javaが期待する形式に合わせる)
    // Python戻り値: user_id, inserted_event_id, event_log_count, event_list, event_counts

    // event_list: 参加したイベントIDのリスト
    const event_list = Object.keys(participated).map(Number).sort((a, b) => a - b);
    
    // event_counts: イベントIDごとの回数マップ (Javaはここで "1", "10", "11" などのキーを探します)
    const event_counts = participated;

    return NextResponse.json({
      message: "event_robot に登録しました",
      user_id: uid,
      inserted_event_id: targetEventId,
      event_log_count: newCount,
      event_list: event_list,
      event_counts: event_counts,
    }, { status: 200 });

  } catch (error: any) {
    console.error("Pepper Log Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}