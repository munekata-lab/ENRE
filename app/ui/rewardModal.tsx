"use client";

import React from "react";
import { useState } from "react";
import { deleteDocumentByUID } from "@/lib/dbActions";

type RewardProgress = {
  info: {
    title: string;
    message: string;
    progressId: string;
  };
};

export default function RewardModalComponent({ info }: RewardProgress) {
  const [canceled, setCanceled] = useState(false);
  const [clicked, setClicked] = useState(false);

  const handleModalClick = async () => {
    // console.log("handleModalClick");
    setClicked(true);
    setCanceled(true);
    await deleteDocumentByUID(info.progressId);
  }

  return (
    <>
      {canceled ? (
        <></>
      ) : (
        <div className="bg-gray-700 bg-opacity-80 fixed top-0 left-0 w-full h-full">
          <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="p-4 bg-white rounded shadow-xl flex flex-col w-11/12 items-center justify-center">
              <h2 className="text-lg font-bold mb-2">{info.title}</h2>
              <p className="mb-4">{info.message}</p>
              <div className="flex space-x-4">
                {!clicked ? (
                  <button
                    onClick={() => {
                     handleModalClick();
                    }}
                    className="px-4 py-2 bg-white text-green-700 border border-green-700 rounded hover:bg-gray-500"
                  >
                    OK
                  </button>
                ) : (
                  <button className="px-4 py-2 bg-gray-500 text-white border border-green-700 rounded">
                    OK
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
