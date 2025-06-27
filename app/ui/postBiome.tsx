"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import Link from "next/link";
import React from "react";
import { useImageUpload } from "../hooks/useImageUpload";
import { storage } from "@/lib/firebase/client";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export default function PostBiomeComponent() {
  const router = useRouter();
  const {
    photo,
    error,
    createObjectURL,
    isCompressing,
    compressionProgress,
    uploadToClient,
    setError,
    reset,
  } = useImageUpload();

  const [isPushButton, setIsPushButton] = useState(false);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [sendComplete, setSendComplete] = useState(false);
  const searchParams = useSearchParams();
  const programId = searchParams.get("programId") || "";
  const point = searchParams.get("point") || "";
  const field = searchParams.get("field") || "";
  const type = searchParams.get("type") || "";
  const programTitle = searchParams.get("title") || ""; //クリア画面で使用
  const completionMessage = searchParams.get("completionMessage") || ""; //クリア画面で使用
  const href = `/biome?programId=${programId}&title=${programTitle}&completionMessage=${completionMessage}&point=${point}&field=${field}&type=${type}`;

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
        router.push(`/complete?&programId=${programId}&title=${programTitle}&completionMessage=${completionMessage}&point=${point}&field=${field}`);
      })();
    },
    rightOnClick: () => {
      (async () => {
        await patchReward2(point, field);
        reset();
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
        <div className="text-black flex flex-col items-center">
          <div className="flex justify-center items-center w-full">
            {error !== "" && <p className="text-red-500">{error}</p>}
          </div>
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
