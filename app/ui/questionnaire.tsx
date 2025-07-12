"use client";

import Link from "next/link";
import { postCollectionInLogs } from "@/lib/dbActions";
import { usePathname } from "next/navigation";

type Props = {
  link: string;
  title: string;
  isEnabled: boolean;
};

export default function QuestionnaireComponent({ link, title, isEnabled }: Props) {

  const detail = isEnabled ? "受付中" : "受付期間外";

  const handleClick = async () => {
    if (!isEnabled) return;
    await postCollectionInLogs(
      "アンケート回答クリック",
      "アンケート",
      "アンケート"
    );
  };
  return (
    <div className="w-full bg-yellow-100 rounded-xl overflow-hidden md:max-w-2xl">
      <div className="grid grid-rows-max-content-layout-3 grid-cols-max-content-layout-2 gap-2 p-3">
        <div className="row-start-1 col-start-1 col-end-3 justify-items-center items-center text-center uppercase tracking-wide text-sm text-green-700 font-semibold">
          {title}
        </div>
        <div className="row-start-2 col-start-1 col-end-3 justify-items-center items-center text-center tracking-wide text-xs">
          {detail}
        </div>
        <div className="row-start-3 col-start-1 col-end-3 grid place-items-center">
          <Link
            href={isEnabled ? link : '#'}
            target="_blank"
            className={`m-0 text-white no-underline ${!isEnabled && 'pointer-events-none'}`}
          >
            <button
              className={`text-sm py-2 px-4 rounded-md font-bold ${isEnabled ? 'bg-green-700' : 'bg-gray-400'}`}
              onClick={handleClick}
              disabled={!isEnabled}
            >
              回答する
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}