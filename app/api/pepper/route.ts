// app/api/pepper/route.ts
import { adminDB } from "@/lib/firebase/server";

// ▼ 追加: ブラウザでのアクセス確認用 (GET)
export async function GET() {
  return Response.json({ message: "Pepper API endpoint is ready." });
}

// ▼ 既存: Pepperからのデータ受信用 (POST)
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body) {
      return Response.json({ ok: false, message: "No data provided" }, { status: 400 });
    }

    const pepperData = {
      ...body,
      receivedAt: new Date(),
    };

    await adminDB.collection("pepper_messages").add(pepperData);
    return Response.json({ ok: true, message: "Data received successfully" });

  } catch (error) {
    console.error("Error processing request from Pepper:", error);
    return Response.json({ ok: false, message: "Internal Server Error" }, { status: 500 });
  }
}