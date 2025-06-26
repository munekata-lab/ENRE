import { adminDB } from "@/lib/firebase/server";
import { FieldValue } from "firebase-admin/firestore";

/**
 * CSVの一行を解析し、フィールドの配列を返す関数。
 * ダブルクォーテーションで囲まれたフィールドや、フィールド内のカンマを正しく処理します。
 * @param line - CSVの単一行の文字列
 * @returns 文字列の配列
 */
function parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let currentField = '';
    let inQuotedField = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (inQuotedField && line[i + 1] === '"') {
                // エスケープされたダブルクォート
                currentField += '"';
                i++; // 次の文字をスキップ
            } else {
                // クォートの開始または終了
                inQuotedField = !inQuotedField;
            }
        } else if (char === ',' && !inQuotedField) {
            // フィールドの区切り
            result.push(currentField);
            currentField = '';
        } else {
            // 通常の文字
            currentField += char;
        }
    }
    // 最後のフィールドを追加
    result.push(currentField);
    return result;
}


// 新しいプログラムIDの開始番号を取得し、カウンターを更新する関数
async function getNextProgramStartId(count: number): Promise<number> {
    const counterDocRef = adminDB.collection("counter").doc("programCounter");
    
    return adminDB.runTransaction(async (transaction: any) => {
        const counterDoc = await transaction.get(counterDocRef);
        let currentCount = 0;
        if (counterDoc.exists) {
            currentCount = counterDoc.data().count || 0;
        }
        
        const newTotalCount = currentCount + count;
        if (counterDoc.exists) {
            transaction.update(counterDocRef, { count: newTotalCount });
        } else {
            transaction.set(counterDocRef, { count: newTotalCount });
        }
        
        return currentCount + 1;
    });
};

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file || file.size === 0) {
    return new Response(JSON.stringify({ message: "ファイルが提供されていません。" }), { status: 400 });
  }

  try {
    const data = await file.arrayBuffer();
    const buffer = Buffer.from(data);
    const text = buffer.toString('utf8').replace(/^\uFEFF/, '').replace(/\r/g,"");
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length <= 1) {
      return new Response(JSON.stringify({ message: "CSVにデータが含まれていません。" }), { status: 400 });
    }

    const headers = parseCsvLine(lines[0]).map(h => h.trim()); // ヘッダーも正しくパース
    const programs: any[] = [];

    lines.slice(1).forEach((line) => {
      // 修正点: line.split(',') の代わりに新しいパーサーを使用
      const values = parseCsvLine(line);
      const programData: any = {};
      const schedule: any[] = [];
      
      headers.forEach((header, index) => {
        const value = values[index] || "";
        const scheduleMatch = header.match(/^(day|open|close)(\d+)$/);

        if (scheduleMatch) {
          const key = scheduleMatch[1];
          const scheduleIndex = parseInt(scheduleMatch[2], 10) - 1;
          if (!schedule[scheduleIndex]) schedule[scheduleIndex] = {};
          schedule[scheduleIndex][key] = value;
        } else {
          programData[header] = value;
        }
      });
      
      programData.schedule = schedule.filter(s => s && s.day);
      programData.days = programData.schedule.map((s: any) => s.day);
      programs.push(programData);
    });

    if (programs.length === 0) {
        return new Response(JSON.stringify({ message: "処理対象のイベントがありません。" }), { status: 400 });
    }

    const startId = await getNextProgramStartId(programs.length);
    
    const batch = adminDB.batch();

    programs.forEach((program, index) => {
      const programId = String(startId + index);
      const docRef = adminDB.collection("new_program").doc(programId);
      
      const link = !program.type ? null : program.type === "postphoto" ? `/photoalbum/${program.type}` : `/${program.type}`;

      batch.set(docRef, {
        ...program,
        link: link,
        loadingPoint: Number(program.loadingPoint) || 0,
        point: Number(program.point) || 0,
      });

      const firstQrId = `${programId}_1`;
      const qrDocRef = docRef.collection("qr_codes").doc(firstQrId);
      batch.set(qrDocRef, {
        placeId: `P${programId.padStart(3, '0')}`,
        placeNumber: 1,
        type: program.type ? "checkin" : "checkout",
        createdAt: FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();

    return new Response(JSON.stringify({ message: `${programs.length}件のイベントが正常に追加されました。` }), { status: 200 });

  } catch (error: any) {
    console.error("一括アップロード処理でエラーが発生しました:", error);
    return new Response(JSON.stringify({ message: `一括追加に失敗しました: ${error.message}` }), { status: 500 });
  }
}