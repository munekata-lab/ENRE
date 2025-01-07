"use client";

import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface SettingsGuideComponentProps {
    settingsMode: boolean; // 引数の型を定義
  }

export default function SettingsGuideComponent({ settingsMode }: SettingsGuideComponentProps) {
  const [canceled, setCanceled] = useState(false);
  const [clicked, setClicked] = useState(false);
  const router = useRouter();
  const title = "初期設定";
  const content = "ニックネームや帰宅方法、時間割についての登録をしてください。";
  //   console.log(`SettingsCompo: ${settingsMode}`);

  const handleModalClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    // console.log("handleModalClick");
    setClicked(true);
    setCanceled(true);
    // 設定画面へ
    router.push(`/settings`);
  }

  // settingsMode が true の場合のみ表示
  if (!settingsMode) return null;

  return (
    <>
      {canceled ? (
        <></>
      ) : (
        <div className="bg-gray-700 bg-opacity-80 fixed top-0 left-0 w-full h-full">
          <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="p-4 bg-white rounded shadow-xl flex flex-col w-11/12 items-center justify-center">
              <h2 className="text-lg font-bold mb-2 text-black">{title}</h2>
              <p className="mb-4 text-black">{content}</p>
              <p className="mt-1 mb-1 text-xs text-black">※設定後に表示される場合があります。お手数ですが、再読み込みまたはページ移動後に戻ってきてください。</p>
              <div className="flex space-x-4">
                {!clicked ? (
                  <button
                    onClick={handleModalClick}
                    className="px-4 py-2 bg-white text-green-700 border border-green-700 rounded hover:bg-gray-500"
                  >
                    今すぐ設定する
                  </button>
                ) : (
                  <button className="px-4 py-2 bg-gray-500 text-white border border-green-700 rounded">
                    今すぐ設定する
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
