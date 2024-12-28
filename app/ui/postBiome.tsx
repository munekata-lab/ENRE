"use client";

import { useState } from "react";
import { storage } from "@/lib/firebase/client";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import imageCompression from "browser-image-compression";
import { useRouter } from "next/navigation";
import { faPlusSquare, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  postCollectionInLogs,
  patchCheckoutProgramIds,
  patchReward2,
} from "@/lib/dbActions";
import { postLogEvent } from "@/lib/firebase/client";
import Image from "next/image";
import ModalComponent from "./modal";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import React from "react";

export default function PostBiomeComponent() {
  const router = useRouter();
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [createObjectURL, setCreateObjectURL] = useState("");
  const [isPushButton, setIsPushButton] = useState(false);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [sendComplete, setSendComplete] = useState(false);
  const searchParams = useSearchParams();
  const programId = searchParams.get("programId") || "";
  const point = searchParams.get("point") || "";
  const field = searchParams.get("field") || "";
  const href = `/biome?programId=${programId}&rewardPoint=${point}&field=${field}`;

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
      const result = await uploadBytes(uploadRef, photo);
      const uploadUrl = await getDownloadURL(uploadRef);
      const postData = {
        date: new Date(result.metadata.timeCreated),
        url: uploadUrl,
        fullPath: fullPath,
        name: name,
        note: note,
      };
      const resPostPhoto = await fetch("/api/postBiome", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postData }),
      });
      if (resPostPhoto.ok) {
        const title = "Biomeを投稿しました";
        const state = "postBiome";
        await postCollectionInLogs(title, "Biome", state);
        postLogEvent("Biome投稿成功");
        setSendComplete(true);
      } else {
        setError("投稿に失敗しました");
        setIsPushButton(false);
      }
    } catch (error) {
      console.error(error);
      setError("投稿に失敗しました");
      setIsPushButton(false);
    }
  };

  const modalInfo = {
    modalTitle: "投稿完了",
    mainMessage: "調査ありがとうございました",
    leftTitle: "調査を完了",
    rightTitle: "続けて投稿",
    leftOnClick: () => {
      (async () => {
        await patchReward2(point, field);
        await patchCheckoutProgramIds(programId);
        router.push("/");
      })();
    },
    rightOnClick: () => {
      (async () => {
        await patchReward2(point, field);
        setPhoto(null);
        setError("");
        setCreateObjectURL("");
        setIsPushButton(false);
        setName("");
        setNote("");
        setSendComplete(false);
      })();
    },
  };

  return (
    <main className="flex min-h-screen flex-col justify-between pb-40 overflow-auto">
      <div className="justify-center mt-24">
        <Link href={href} className="text-green-700 hover:text-green-900">
          <button className="items-center justify-center underline">
            <FontAwesomeIcon
              icon={faArrowLeft}
              style={{ width: "20px", height: "20px", margin: "0 5px" }}
            />
            詳細に戻る
          </button>
        </Link>
        <div className="flex justify-between items-center w-full p-3">
          <h1 className="text-left text-2xl">新規投稿</h1>
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
          <div className="flex justify-center items-center w-full">
            {error !== "" && <p className="text-red-500">{error}</p>}
          </div>
          {createObjectURL && (
            <div className="flex flex-col justify-start items-center w-full">
              <Image
                src={createObjectURL}
                alt="Uploaded image"
                width={100}
                height={100}
                priority
                className="bg-gray-800 w-full pt-5 pb-10 pr-5 pl-5"
              />
              <div className="w-full px-5 m-2">
                <label htmlFor="name" className="mb-2">
                  生き物の名前:
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="生き物の名前を入力"
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="w-full px-5 m-2">
                <label htmlFor="name" className="mb-2">
                  備考:
                </label>
                <input
                  id="note"
                  type="text"
                  name="note"
                  placeholder="生き物の状態・場所・感想など"
                  onChange={(e) => setNote(e.target.value)}
                  className="appearance-none rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
            </div>
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
            accept="image/*,.heic,.HEIC"
            name="myImage"
            onChange={(event) => {
              setError("");
              uploadToClient(event);
            }}
          />
        </div>
      </div>
      {sendComplete && (
        <div className="bg-gray-700 bg-opacity-80 absolute top-0 left-0 w-full h-full ">
          <ModalComponent info={modalInfo} />
        </div>
      )}
    </main>
  );
}
