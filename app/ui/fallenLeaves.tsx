"use client";

import { useState, useEffect } from "react";
import { storage } from "@/lib/firebase/client";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import imageCompression from "browser-image-compression";
import { useSearchParams, useRouter } from "next/navigation";
import { faPlusSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  postCollectionInLogs,
  fetchProgramInfo,
  fetchProgramInfo2,
  patchReward2,
  patchParticipatedEvents,
  patchCheckoutProgramIds,
} from "@/lib/dbActions";
import { postLogEvent } from "@/lib/firebase/client";
import Image from "next/image";

export default function FallenLeavesComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"detail" | "post">("detail");
  const [content, setContent] = useState("");
  const [process, setProcess] = useState<string[]>([]);
  const [caution, setCaution] = useState<string[]>([]);
  const [condition, setCondition] = useState<string[]>([]);
  const [rewardPoint, setRewardPoint] = useState("");
  const [rewardField, setRewardField] = useState("");
  const [rewardGIP, setRewardGIP] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [createObjectURL, setCreateObjectURL] = useState("");
  const [isPushButton, setIsPushButton] = useState(false);
  const programId = searchParams.get("programId") || "";
  const point = searchParams.get("point") || "";
  const field = searchParams.get("field") || "";
  const type = searchParams.get("type") || "";
  const href = `/biome?programId=${programId}&point=${point}&field=${field}$type=${type}`;

  useEffect(() => {
    (async () => {
      const programInfo = await fetchProgramInfo(programId);
      const programInfo2 = await fetchProgramInfo2(type);
      setContent(programInfo.content);
      setProcess(programInfo2.process);
      setCaution(programInfo2.caution);
      setCondition(programInfo2.condition);
      setRewardPoint(programInfo.point);
      setRewardField(programInfo.field);
      // setRewardGIP(programInfo.rewardGIP);
    })();
  }, []);

  const uploadToClient = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const ext = file.name.split('.').pop()?.toLowerCase();
      const allowedExtensions = [
        'jpg', 'jpeg', 'png', 'gif', 'heic',
      ];
     
      if (!ext || !allowedExtensions.includes(ext)) {
        setError(`許可されていないファイル形式です。(${ext})`);
        return;
      }
     
      try {
        // 初期の圧縮オプション設定
        let options = {
          maxSizeMB: 1, // 最大1MB
          maxWidthOrHeight: 1920, // 最大幅または高さ
          useWebWorker: true,
          initialQuality: 0.8, // 初期品質を高めに設定
          alwaysKeepResolution: true, // 解像度を維持
          exifOrientation: undefined, // EXIFデータを削除
        };
     
        // 圧縮処理
        let compressedFile = await imageCompression(file, options);
      
        // 圧縮後のファイルサイズが1MBを超えている場合、品質を段階的に下げて再圧縮
        while (compressedFile.size / 1024 / 1024 > 1 && options.initialQuality > 0.5) {
          options.initialQuality -= 0.1;
          compressedFile = await imageCompression(file, options);
        }
      
        // AVIFへの変換
        const avifFile = await convertToAVIF(compressedFile, 0.8);
      
        // 圧縮および変換されたファイルを状態にセット
        setPhoto(avifFile);
        setCreateObjectURL(URL.createObjectURL(avifFile));
      } catch (error) {
        console.error('圧縮エラー:', error);
        setError('画像の圧縮中にエラーが発生しました。');
      }
    }
  };

  const convertToAVIF = async (file: File, quality: number): Promise<File> => {
    return new Promise<File>((resolve, reject) => {
      const img: HTMLImageElement = document.createElement("img");
      const url = URL.createObjectURL(file);
  
      img.onload = () => {
        // Canvasを作成
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
  
        if (!ctx) {
          reject(new Error('Canvasコンテキストの取得に失敗しました。'));
          return;
        }
  
        // 画像をCanvasに描画
        ctx.drawImage(img, 0, 0);
  
        // AVIFがサポートされているかチェック
        const isAVIFSupported = canvas.toDataURL('image/avif').startsWith('data:image/avif');
  
        const outputFormat = isAVIFSupported ? 'image/avif' : 'image/webp';
        const outputQuality = isAVIFSupported ? quality : 0.8; // WebPの品質を調整
  
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const newExtension = outputFormat === 'image/avif' ? '.avif' : '.webp';
              const newFile = new File([blob], file.name.replace(/\.\w+$/, newExtension), {
                type: outputFormat,
                lastModified: Date.now(),
              });
              resolve(newFile);
            } else {
              reject(new Error('画像の変換に失敗しました。'));
            }
          },
          outputFormat,
          outputQuality
        );
      };
  
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('画像の読み込みに失敗しました。'));
      };
  
      img.src = url;
    });
  };

  const uploadToServer = async () => {
    if (!photo?.name) {
      setError("写真を選択してください");
      setIsPushButton(false);
      return;
    }
    try {
      const storageRef = ref(storage);
      const ext = photo.name.split(".").pop();
      const hashName = Math.random().toString(36).slice(-8);
      const fullPath = "/images/" + hashName + "." + ext;
      const uploadRef = ref(storageRef, fullPath);
      const place = searchParams.get("place") || "";
      const result = await uploadBytes(uploadRef, photo);
      const uploadUrl = await getDownloadURL(uploadRef);
      const postData = {
        date: new Date(result.metadata.timeCreated),
        url: uploadUrl,
        place: place,
        fullPath: fullPath,
      };
      const resPostPhoto = await fetch("/api/postFallenLeaves", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postData }),
      });
      if (resPostPhoto.ok) {
        await patchReward2(point, field);
        await patchCheckoutProgramIds(programId);
        const title = "落ち葉を投稿しました";
        const state = "fallenLeaves";
        await postCollectionInLogs(title, place, state);
        await patchParticipatedEvents(programId);
        postLogEvent("写真投稿成功");
        router.push("/");
      } else {
        setError("投稿に失敗しました");
      }
    } catch (error) {
      console.error(error);
      setError("投稿に失敗しました");
      setIsPushButton(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col justify-between pb-20">
      <div className="justify-center mt-24">
        <div className="grid grid-cols-4 text-center border-b-2 border-green-700 m-2">
          <button
            className={`col-start-2 text-lg ${
              tab === "detail"
                ? "bg-green-700 text-white font-bold rounded-t-lg"
                : "text-green-700 underline"
            }`}
            onClick={() => setTab("detail")}
          >
            詳細
          </button>
          <button
            className={`col-start-3 text-lg ${
              tab === "post"
                ? "bg-green-700 text-white font-bold rounded-t-lg"
                : "text-green-700 underline"
            }`}
            onClick={() => setTab("post")}
          >
            投稿
          </button>
        </div>
        {tab === "detail" && (
          <div className="p-2 overflow-auto">
            <p className="text-sm mb-0 text-left">{content}</p>
            <p className="text-lg mb-0 font-bold mt-2">手順</p>
            <div className="mb-2 text-left">
              {process.map((process, index) => (
                <p key={index} className="text-sm mb-0 ml-3">
                  {`${index + 1}. ${process}`}
                </p>
              ))}
            </div>
            <p className="text-lg mb-0 font-bold">注意事項</p>
            <div className="mb-2 text-left">
              {caution.map((caution, index) => (
                <p key={index} className="text-sm mb-0 ml-3">
                  {`${index + 1}. ${caution}`}
                </p>
              ))}
            </div>
            <p className="text-lg mb-0 font-bold">付与条件</p>
            <div className="mb-2">
              {condition.map((condition, index) => (
                <p key={index} className="text-sm mb-0 ml-3">
                  {`${condition}: ${point}P`}
                </p>
              ))}
            </div>
          </div>
        )}
        {tab === "post" && (
          <>
            <div className="flex justify-between items-center w-full p-3">
              <h1 className="text-left text-2xl m-0">集めた落ち葉</h1>
              {isPushButton ? (
                <button className="flex justify-center items-center bg-gray-600 text-white font-bold py-2 px-4 rounded">
                  投稿
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsPushButton(true);
                    uploadToServer();
                  }}
                  className="flex justify-center items-center bg-green-700 hover:bg-green-900 text-white font-bold py-2 px-4 rounded"
                >
                  投稿
                </button>
              )}
            </div>
            <div className="text-black">
              {createObjectURL && (
                <Image
                  src={createObjectURL}
                  alt="Uploaded image"
                  width={100}
                  height={100}
                  priority
                  className="bg-gray-800 w-full pt-10 pb-10 pr-5 pl-5"
                />
              )}
              <label
                htmlFor="file-input"
                className="flex justify-center items-center px-4 py-2 rounded mb-6 w-full"
              >
                <FontAwesomeIcon
                  icon={faPlusSquare}
                  style={{ width: "25px", height: "25px", margin: "0 5px" }}
                />
                写真を選択する
              </label>
              <input
                id="file-input"
                className="hidden"
                type="file"
                accept="image/*"
                name="myImage"
                onChange={(event) => {
                  setError("");
                  uploadToClient(event);
                }}
              />
            </div>
            <div className="flex justify-center items-center w-full p-5">
              {error !== "" && <p className="text-red-500">{error}</p>}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
