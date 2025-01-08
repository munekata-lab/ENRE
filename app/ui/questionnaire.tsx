"use client";

import Link from "next/link";
import { postCollectionInLogs } from "@/lib/dbActions";
import { usePathname } from "next/navigation";

type Props = {
  link: string;
  title: string;
  detail: string;
  className: string;
};

export default function QuestionnaireComponent({ link, title, detail, className }: Props) {

  // const pathname = usePathname();
  // const handleLogPost = async (previousTitle: string, newTitle: string) => {
  //   try {
  //     await postCollectionInLogs(
  //       "ページ移動",
  //       `${previousTitle} → ${newTitle}`,
  //       "成功"
  //     );
  //   } catch (error: any) {
  //     console.error("ログ記録中にエラーが発生しました:", error.message);
  //   }
  // };
  // const currentPath = pathname?.replace(/^\//, "") || "home";

  const handleClick = async () => {
    await postCollectionInLogs(
      "アンケート回答クリック",
      "アンケート",
      "アンケート"
    );
    // await handleLogPost(currentPath, "questionnaire");


  };
  return (
    <div className="w-full bg-yellow-100 rounded-xl shadow-md overflow-hidden md:max-w-2xl">
      <div className="grid grid-rows-max-content-layout-3 grid-cols-max-content-layout-2 gap-2 p-3">
        <div className="row-start-1 col-start-1 col-end-3 justify-items-center items-center text-center uppercase tracking-wide text-sm text-green-700 font-semibold">
          {title}
        </div>
        <div className="row-start-2 col-start-1 col-end-3 justify-items-center items-center text-center tracking-wide text-xs">
          {detail}
        </div>
        <div className="row-start-3 col-start-1 col-end-3 grid place-items-center">
          <Link
            href={link}
            target="_blank"
            className="m-0 text-white no-underline"
          >
            <button
              className={className}
              onClick={handleClick}
            >
              回答する
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
