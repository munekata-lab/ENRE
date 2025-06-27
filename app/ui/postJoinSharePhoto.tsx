"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { faPlusSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  postCollectionInLogs,
  fetchProgramInfo,
  fetchProgramInfo2,
  patchReward2,
} from "@/lib/dbActions";
import { postLogEvent } from "@/lib/firebase/client";
import Image from "next/image";
import React from "react";
import { useImageUpload } from "../hooks/useImageUpload";
import { storage } from "@/lib/firebase/client";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export default function PostJoinShareComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"detail" | "post">("detail");
  const [field, setField] = useState("");
  const [isPushButton, setIsPushButton] = useState(false);
  const programId = searchParams.get("programId") || "";

  const {
    photo,
    error,
    createObjectURL,
    isCompressing,
    compressionProgress,
    uploadToClient,
    setError,
  } = useImageUpload();

  useEffect(() => {
    (async () => {
      const programInfo = await fetchProgramInfo(programId);
      setField(programInfo.field);
    })();
  }, [programId]);

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
      const place = searchParams.get("programId") || "";
      const result = await uploadBytes(uploadRef, photo);
      const uploadUrl = await getDownloadURL(uploadRef);
      const postData = {
        date: new Date(result.metadata.timeCreated),
        url: uploadUrl,
        place: place,
        fullPath: fullPath,
      };
      const resPostPhoto = await fetch("/api/postPhoto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postData }),
      });
      if (resPostPhoto.ok) {
        // 得点,ジャンル
        await patchReward2("5", field);
        const title = "写真を共有しました";
        const state = "postPhoto";
        await postCollectionInLogs(title, place, state);
        postLogEvent("写真投稿成功");
        router.push("/photoalbum");
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
            <p className="text-sm mb-0 text-left">
              イベントの様子や風景を共有してポイントをゲットしよう！
            </p>
            <p className="text-lg mb-0 font-bold mt-2">手順</p>
            <div className="mb-2 text-left">
              1. カメラボタンから撮影へ<br/>
              2. イベントに参加している様子を撮影！素敵な写真を撮ってください<br/>
              3. 撮影した写真をEnreに投稿
            </div>
            <p className="text-lg mb-0 font-bold">注意事項</p>
            <div className="mb-2 text-left">
              1. 本イベントは「学内」で実施して下さい<br/>
              2. 安全に配慮して行って下さい<br/>
              3. 公序良俗に反する写真の投稿は禁止です<br/>
              4. プライバシー侵害に十分注意して下さい
            </div>
            <p className="text-lg mb-0 font-bold">付与条件</p>
            <div className="mb-2">
              Enreへの投稿: 5P
            </div>
          </div>
        )}
        {tab === "post" && (
          <>
            <div className="flex justify-between items-center w-full p-5">
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
            <div className="text-black flex flex-col items-center">
            {isCompressing ? (
                <div className="relative w-32 h-32 mb-4">
                  <CircularProgressbar
                    value={compressionProgress}
                    text={`${compressionProgress}%`}
                    styles={buildStyles({
                      textColor: "black",
                      pathColor: "#28a745",
                      trailColor: "#d6d6d6",
                    })}
                  />
                   <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-center">
                    写真を
                    <br />
                    圧縮中...
                  </p>
                </div>
              ) : createObjectURL ? (
                <Image
                  src={createObjectURL}
                  alt="Uploaded image"
                  width={100}
                  height={100}
                  priority
                  className="bg-gray-800 w-full pt-10 pb-10 pr-5 pl-5"
                />
              ) : null}
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
