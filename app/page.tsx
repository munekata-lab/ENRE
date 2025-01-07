import HeaderComponent from "@/app/ui/header";
import FooterComponent from "@/app/ui/footer";
import CharactorComponent from "./ui/charactor";
import AllEventsCardComponent from "./ui/allEventsCard";
import CheckinEventsCardComponent from "./ui/checkinEventsCard";
import WatchCardComponent from "./ui/watchCard";
import { fetchMode, fetchBoardInfo, fetchRewardProgressInfo } from "@/lib/dbActions";
import ComingSoonComponent from "./ui/comingSoon";
import { getUserFromCookie } from "@/lib/session";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import {
  HeaderSkeleton,
  CharacterSkeleton,
  CardSkeleton,
} from "./ui/skeletons";
import BoardComponent from "./ui/board";
import RewardModalComponent from "./ui/rewardModal";
import QuestionnaireComponent from "./ui/questionnaire";
import React from "react";
import { postCollectionInLogs } from "@/lib/dbActions";


export default async function Home() {
  const user = await getUserFromCookie();

  user === null && redirect("/login");
  const mode = await fetchMode(user?.uid); //modecollectionのdevを取ってる、usersのdev(usermode)
  const boardInfo = await fetchBoardInfo();
  const rewardProgressInfo = await fetchRewardProgressInfo();
  // console.log(rewardProgressInfo);
  const modalInfo = { //アンケートモーダル用
    title: boardInfo?.title || "",
    message: boardInfo?.message || "",
    buttonTitle: boardInfo?.buttonTitle || "",
    link: boardInfo?.link || "",
  };
  const modalInfo2 = { //インセンティブまでの進捗表示用
    title: rewardProgressInfo?.title || "",
    message: rewardProgressInfo?.message || "",
    progressId: rewardProgressInfo?.id || "",
  };

  const handleLogPost = async (previousTitle: string, newTitle: string) => {
        try {
          await postCollectionInLogs(
            "ページ移動",
            `${previousTitle} → ${newTitle}`,
            "成功"
          );
        } catch (error: any) {
          console.error("ログ記録中にエラーが発生しました:", error.message);
        }
      };
      const currentPath = "home";

  return (
    <>
      {(mode?.webMode && mode?.userMode) || !mode?.webMode ? ( //firestoreのmodeがtrue且つ開発者ユーザー、またはfirestoreのmodeがfalse
        <>
          <main className="grid grid-rows-base-layout min-h-screen w-full pb-40 overflow-auto justify-items-center items-center">
            <Suspense fallback={<HeaderSkeleton />}>
              <HeaderComponent />
            </Suspense>
            <div className="row-start-2 pt-2 ml-2 mr-2">
              <div className="grid grid-rows-max-content-layout-4 grid-cols-2 gap-2 w-full">
                <div className="row-start-1 col-start-1 col-end-3">
                  <Suspense fallback={<CharacterSkeleton />}>
                    <CharactorComponent />
                  </Suspense>
                </div>
                <div className="row-start-2 col-start-1 col-end-3 items-center justify-items-center">
                    <CheckinEventsCardComponent />
                </div>
                <div className="row-start-3 col-start-1 col-end-3">
                  {/* 表示速度の改善 */}
                  <WatchCardComponent />
                </div>
                <div className="row-start-4 col-start-1 col-end-2 text-shadow-lg">
                  <QuestionnaireComponent
                    link={`https://docs.google.com/forms/d/e/1FAIpQLScavjt8Kf2_ZfeY3jfWD6RCd8X848Hp9WMYe_gsn365aFf6ww/viewform?usp=pp_url&entry.296284400=${user.uid}`}
                    title="アンケート①"
                    detail="登録時"
                  />
                </div>
                <div className="row-start-4 col-start-2 col-end-3 text-shadow-lg">
                  <QuestionnaireComponent
                    link={`https://docs.google.com/forms/d/e/1FAIpQLSdcT2TQDyBV5vb5uqELWpT44n4DCoy74Z_lI1b1JWBQcq0l9g/viewform?usp=pp_url&entry.929680888=${user.uid}`}
                    title="アンケート②"
                    detail="体験後"
                  />
                </div>
              </div>
            </div>
            <FooterComponent />
          </main>
          {boardInfo !== null && <BoardComponent info={modalInfo} />}
          {rewardProgressInfo !== null && <RewardModalComponent info={modalInfo2} />}
        </>
      ) : (
        <ComingSoonComponent />
      )}
    </>
  );
}
