"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  fetchQrInfo,
  fetchProgramInfo,
  fetchProgramInfo2,
  patchReward2,
  patchCheckinProgramIds,
  patchCheckoutProgramIds,
  postCollectionInLogs,
  fetchParticipatedEvents,
  patchParticipatedEvents,
  patchCurrentPlace,
} from "@/lib/dbActions";
import { LoadingAnimation } from "./skeletons";
import { ParticipatedView, CheckinView, CheckoutView, RobotCheckoutView } from "./loadingViews";

export default function LoadingComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [checkin, setCheckin] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [isRobot, setIsRobot] = useState(false); // 追加: ロボットイベントかどうかのフラグ
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [completionMessage, setCompletionMessage] = useState("");
  const [link, setLink] = useState("");
  const [process, setProcess] = useState<string[]>([]);
  const [caution, setCaution] = useState<string[]>([]);
  const [condition, setCondition] = useState<string[]>([]);
  const ref = useRef(false);
  const [participated, setParticipated] = useState(false);
  const [point, setPoint] = useState("");
  const [loadingPoint, setLoadingPoint] = useState("");
  
  const [showModal, setShowModal] = useState(false);

  const currentPath = pathname?.replace(/^\//, "") || "home";

  const handleLogPost = useCallback(async (title: string, state: string) => {
    try {
      await postCollectionInLogs(title, "P006-1", state);
    } catch (error: any) {
      console.error("ログ記録中にエラーが発生しました:", error.message);
    }
  }, []);

  useEffect(() => {
    if (ref.current) return;
    ref.current = true;

    (async () => {
      const programId = searchParams.get("programId") || "";
      const qrId = searchParams.get("id") || "";

      if (!programId || !qrId) {
        console.error("URLにprogramIdまたはidが含まれていません。");
        setTitle("エラー");
        setContent("無効なQRコードです。");
        return;
      }

      const qrInfo = await fetchQrInfo(programId, qrId);
      const programInfo = await fetchProgramInfo(programId);

      if (!qrInfo || !programInfo) {
        console.error("QR情報またはプログラム情報の取得に失敗しました。");
        setTitle("エラー");
        setContent("イベント情報の取得に失敗しました。");
        return;
      }

      // Stateの更新
      setTitle(programInfo.title);
      setContent(programInfo.content);
      setCompletionMessage(programInfo.completionMessage);
      setPoint(programInfo.point);
      setLoadingPoint(programInfo.loadingPoint);

      if (programInfo.type) {
        // robotタイプ以外の場合は追加情報を取得（robotにはexplainがないと仮定、あるなら分岐調整）
        if (programInfo.type !== 'robot') {
            const programInfo2 = await fetchProgramInfo2(programInfo.type);
            setProcess(programInfo2.process);
            setCaution(programInfo2.caution);
            setCondition(programInfo2.condition);
        }
      }

      const place = `${qrInfo.placeId}-${qrInfo.placeNumber}`;
      await postCollectionInLogs(programInfo.title, place, "QRコード読み取り");
      await patchCurrentPlace(place);

      const participatedEvents = await fetchParticipatedEvents();
      if (participatedEvents[Number(programId)] <= 0) {
        await patchReward2(
          programInfo.loadingPoint.toString(),
          programInfo.field
        );
      }

      if (qrInfo.type === "checkin") {
        if (participatedEvents[Number(programId)] > 0) {
          setParticipated(true);
        }
        await patchCheckinProgramIds(programId);
        setCheckin(true);
        setLink(
          programInfo.link === null
            ? "/"
            : `${programInfo.link}?programId=${programId}&place=${place}&title=${programInfo.title}&content=${programInfo.content}&thema=${programInfo.thema}&completionMessage=${programInfo.completionMessage}&point=${programInfo.point}&field=${programInfo.field}&type=${programInfo.type}`
        );
      } else if (qrInfo.type === "checkout") {
        if (participatedEvents[Number(programId)] > 0) {
          setParticipated(true);
        }
        await patchParticipatedEvents(programId);
        await patchCheckoutProgramIds(programId);
        
        // ▼▼▼ 追加: robotタイプの場合の処理 ▼▼▼
        if (programInfo.type === "robot") {
            setIsRobot(true);
        }
        // ▲▲▲ 追加終わり ▲▲▲

        setCheckout(true);
        setLink(
          `/photoalbum/postjoinshare?programId=${programId}&place=${place}&point=${programInfo.point}&field=${programInfo.field}`
        );
      } else {
        if (participatedEvents[Number(programId)] > 0) {
          setParticipated(true);
          return;
        }
        router.push(
          `${programInfo.type}?programId=${programId}&place=${place}&point=${programInfo.point}&field=${programInfo.field}&type=${programInfo.type}`
        );
      }
    })();
  }, [router, searchParams, pathname]);


  return (
    <main className="flex flex-col items-center justify-center min-h-screen py-2">
      {participated ? (
        <ParticipatedView />
      ) : (
        <>
          {!checkin && !checkout && (
            <div className="flex min-h-screen flex-col items-center justify-between pb-20">
              <LoadingAnimation />
            </div>
          )}

          {checkin && (
            <CheckinView 
              title={title}
              content={content}
              process={process}
              caution={caution}
              condition={condition}
              loadingPoint={loadingPoint}
              point={point}
              link={link}
            />
          )}

          {checkout && (
             // ロボットイベントならRobotCheckoutViewを表示
            isRobot ? (
                <RobotCheckoutView 
                    title={title}
                    completionMessage={completionMessage}
                    onLogPost={handleLogPost}
                    currentPath={currentPath}
                    eventId={searchParams.get("programId") || ""}
                />
            ) : (
                <CheckoutView 
                    title={title}
                    completionMessage={completionMessage}
                    onLogPost={handleLogPost}
                    currentPath={currentPath}
                />
            )
          )}
          
          {showModal && (
            <div className="fixed inset-0 bg-opacity-90 z-40 pointer-events-auto">
              <LoadingAnimation />
            </div>
          )}
        </>
      )}
    </main>
  );
}