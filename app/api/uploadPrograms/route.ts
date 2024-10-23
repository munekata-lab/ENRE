import { adminDB } from "@/lib/firebase/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (file && file.size > 0) {
    const data = await file.arrayBuffer();
    const buffer = Buffer.from(data);
    const text = buffer.toString('utf8').replace(/\r/g,"");
    const results: any = [];
    const lines = text.split('\n');
    const headers = lines[0].split(',');
    lines.slice(1).forEach((line) => {
      const values = line.split(',');
      if (values.length === headers.length) { 
          const obj: any = {};
          headers.forEach((header: string, index) => {
            obj[header] = values[index];
          });
        results.push(obj);
      }
    });
    // console.log(results);
    results.forEach(async (result: any) => {
      await adminDB.collection("test_program2").add(result);
    });
    return Response.json({ message: "success" });
  }else {
    return Response.json({ message: "error" });
  }
}