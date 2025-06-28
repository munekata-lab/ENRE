"use client";

import React from "react";
import { useState, useEffect, useRef, useCallback } from "react"; // useCallbackをインポート
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
import Link from "next/link";
import Card from "react-bootstrap/Card";
import Modal from "react-bootstrap/Modal";
import Image from "next/image";
import Script from "next/script";
import { useBudouX } from "../hooks/useBudouX";

// スケジュールの型定義
type Schedule = {
  day: string;
  open: string;
  close: string;
};

// コンポーネントの外で定数を定義
const randomIds = [2, 5, 8];

export default function LoadingComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [checkin, setCheckin] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [completionMessage, setCompletionMessage] = useState("");
  const [link, setLink] = useState("");
  const [process, setProcess] = useState<string[]>([]);
  const [caution, setCaution] = useState<string[]>([]);
  const [condition, setCondition] = useState<string[]>([]);
  const ref = useRef(false);
  const [participated, setParticipated] = useState(false);
  const { parse } = useBudouX();
  const [point, setPoint] = useState("");
  const [loadingPoint, setLoadingPoint] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");
  const [modalPlace, setModalPlace] = useState("");
  const [modalProgramId, setModalProgramId] = useState("0");

  const currentPath = pathname?.replace(/^\//, "") || "home";

  const handleLogPOst = useCallback(async (previousTitle: string, newTitle: string) => {
    try {
      await postCollectionInLogs(
        "ページ移動",
        `${previousTitle} → ${newTitle}`,
        "成功"
      );
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
        const programInfo2 = await fetchProgramInfo2(programInfo.type);
        setProcess(programInfo2.process);
        setCaution(programInfo2.caution);
        setCondition(programInfo2.condition);
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
        setCheckout(true);
        setTimeout(async () => {
          const randomId =
            randomIds[Math.floor(Math.random() * randomIds.length)];
          const programInfo3 = await fetchProgramInfo(String(randomId));
          setModalProgramId(String(randomId));
          setModalTitle(programInfo3.title);
          setModalContent(programInfo3.content);
          setModalPlace(programInfo3.place);
          setShowModal(true);
        }, 2000);
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

  const handleLogPost = useCallback(async (title: string, state: string) => {
    try {
      await postCollectionInLogs(title, "P006-1", state);
    } catch (error: any) {
      console.error("ログ記録中にエラーが発生しました:", error.message);
    }
  }, []);

  // スケジュール表示部分のヘルパー関数
  const renderSchedule = (schedule: Schedule[] | undefined) => {
    if (!schedule || schedule.length === 0) {
      return (
        <p className="text-xs mb-0 ml-3">
          開催日時はイベント詳細をご確認ください。
        </p>
      );
    }
    return schedule.map((s, index) => (
      <p key={index} className="text-xs mb-0 ml-3">
        {s.day} {s.open} - {s.close}
      </p>
    ));
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen py-2">
      {participated ? (
        <div className="flex min-h-screen flex-col items-center justify-center pb-20">
          <h1 className="text-2xl font-bold text-center mb-10">
            このQRコードからは
            <br />
            参加済みです
          </h1>
          <Link href="/" className="no-underline">
            <button className="flex justify-center items-center bg-green-700 hover:bg-green-900 text-white font-bold py-2 px-4 rounded">
              ホームに戻る
            </button>
          </Link>
        </div>
      ) : (
        <>
          {!checkin && !checkout && (
            <div className="flex min-h-screen flex-col items-center justify-between pb-20">
              <LoadingAnimation />
            </div>
          )}

          {checkin && (
            <div className="flex min-h-screen flex-col items-center  mt-24 pb-20">
              <h1 className="text-xl font-bold text-center mb-3 text-red-500">
                {title}に
                <br />
                チェックインしました！
              </h1>
              <h1 className="text-sm font-bold text-center mb-4">
                ホーム画面からいつでも確認できます
              </h1>

              <Card border="light" className="w-11/12 drop-shadow mb-4">
                <Card.Header className="text-sm font-bold px-2 py-2.5 text-center">
                  {title}
                </Card.Header>
                <Card.Body className="p-1">
                  <p className="text-sm mx-3 mb-3 mt-2">{content}</p>
                  <hr />
                  <p className="text-xs mb-0 ml-3 font-bold">【手順】</p>
                  <div className="mb-2 ml-3">
                    {process.map((p, index) => (
                      <p key={index} className="text-xs mb-0 ml-3">
                        {`${index + 1}. ${p}`}
                      </p>
                    ))}
                  </div>
                  <p className="text-xs mb-0 ml-3 font-bold">【注意事項】</p>
                  <div className="mb-2 ml-3">
                    {caution.map((c, index) => (
                      <p key={index} className="text-xs mb-0 ml-3">
                        {`${index + 1}. ${c}`}
                      </p>
                    ))}
                  </div>
                  <p className="text-xs mb-0 ml-3 font-bold">【付与条件】</p>
                  <div className="mb-2 ml-3">
                    <p className="text-xs mb-0 ml-3">
                      {`1. ${condition[0]}: ${
                        `${loadingPoint}` === "0" ? point : loadingPoint
                      }P`}
                    </p>
                    {condition[1] && (
                      <p className="text-xs mb-0 ml-3">
                        {`2. ${condition[1]}: ${point}P`}
                      </p>
                    )}
                  </div>
                </Card.Body>
              </Card>

              <Link href={link} className="no-underline">
                <button className="flex justify-center items-center bg-green-700 hover:bg-green-900 text-white font-bold py-2 px-4 rounded">
                  イベント詳細
                </button>
              </Link>
            </div>
          )}

          {checkout && (
            <>
              <div className="w-full h-24"></div>
              <div className="flex min-h-screen flex-col items-center justify-center pb-20">
                <h1 className="text-xl font-bold text-center mb-10 text-red-500">
                  ご参加
                  <br />
                  ありがとうございます！
                </h1>

                <Card border="light" className="w-11/12 drop-shadow mb-4">
                  <Card.Header className="text-sm font-bold px-2 py-2.5 text-center">
                    {parse ? parse(title) : title}
                  </Card.Header>
                  <Card.Body className="p-1">
                    <p className="text-sm mx-3 mb-3 mt-2">
                      {completionMessage}
                    </p>
                  </Card.Body>
                </Card>

                <h1 className="text-sm font-bold text-center mb-3">
                  獲得した報酬はホーム画面から確認できます。
                </h1>

                <div className="mt-3 border-b-2 h-1 border-green-600 border-opacity-30 drop-shadow-sm mb-4 w-11/12"></div>

                <h1 className="text-sm font-bold text-center mb-3 w-11/12">
                  イベントに参加している様子を共有しよう！
                </h1>
                <div>
                  <a
                    href="https://twitter.com/share?ref_src=twsrc%5Etfw"
                    className="twitter-share-button"
                    data-size="large"
                    data-text={`「${title}」に参加しました`}
                    data-url="https://www.enre-official.com/"
                    data-hashtags="Enre #京都産業大学"
                    data-show-count="true"
                    onClick={() => handleLogPOst(currentPath, "Twitter")}
                  >
                    Tweet
                  </a>
                  <Script
                    src="https://platform.twitter.com/widgets.js"
                    strategy="lazyOnload"
                  />
                </div>
                <Link href="/" className="mt-1">
                  <button
                    className="text-xs underline my-4 text-gray-600"
                    onClick={() =>
                      handleLogPost(currentPath + title, "Home")
                    }
                  >
                    ホームに戻る
                  </button>
                </Link>
              </div>

              {showModal && (
                <div className="fixed inset-0 bg-opacity-90 z-40 pointer-events-auto">
                  <LoadingAnimation />
                </div>
              )}

              {modalTitle && (
                <Modal
                  show={showModal}
                  onHide={() => {
                    setShowModal(false),
                      handleLogPost(
                        "フリーコーヒー後の誘導モーダル閉じ",
                        `ProgramId=${modalProgramId}へ案内`
                      );
                  }}
                  centered
                >
                  <Modal.Header>
                    <Modal.Title>他のイベントにも参加しませんか？</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <p className="text-lg">{modalTitle}</p>
                    <p>{modalContent}</p>
                    <div className="mt-auto mb-auto">
                      <div className="grid grid-cols-4 text-center border-b-2 border-green-700">
                        <p className="col-start-1 text-center bg-green-700 text-white mb-0 rounded-t-lg">
                          <strong>場所</strong>
                        </p>
                      </div>
                      <p className="text-left mb-2">{modalPlace}</p>
                      <div className="w-full flex justify-center">
                        <Image
                          src={"/programPlace" + modalProgramId + ".jpg"}
                          layout="responsive"
                          width={0}
                          height={0}
                          alt="placePicture"
                          priority
                          className="w-full h-auto rounded-lg"
                        />
                      </div>
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <button
                      onClick={() => {
                        setShowModal(false),
                          handleLogPost(
                            "フリーコーヒー後の誘導モーダル閉じ",
                            `ProgramId=${modalProgramId}へ案内`
                          );
                      }}
                      className="px-4 py-2 bg-green-700 hover:bg-green-900 text-white text-gl font-bold rounded"
                    >
                      とじる
                    </button>
                  </Modal.Footer>
                </Modal>
              )}
            </>
          )}
        </>
      )}
    </main>
  );
}