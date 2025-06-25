import { NextApiResponse } from "next";

export async function POST(req: Request) {
  if (req.method !== "POST") {
    return Response.json({ ok: false, message: "Method Not Allowed" }, { status: 405 });
  }

  try {
    // 環境変数から管理者パスワードを取得。未設定の場合は空文字''をデフォルト値とする。
    const adminPassword = process.env.ADMIN_PASSWORD || "";

    // リクエストからパスワードを取得
    const body = await req.json();
    const submittedPassword = body.password;
    
    // データ型が不正な場合はエラー
    if (typeof submittedPassword !== 'string') {
        return Response.json({ ok: false, message: "Invalid request" }, { status: 400 });
    }

    if (submittedPassword === adminPassword) {
      // パスワードが一致する場合、認証成功
      return Response.json({ ok: true });
    } else {
      // パスワードが一致しない場合、認証失敗
      return Response.json({ ok: false, message: "Invalid password" });
    }
  } catch (error) {
    // JSONのパースエラーなど
    return Response.json({ ok: false, message: "Bad request" }, { status: 400 });
  }
}

