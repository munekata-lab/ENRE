"use client";

import React from "react";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { useBudouX } from "../hooks/useBudouX";

export default function LoadingComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const randomIds = [1, 3, 7];
  const [showModal, setShowModal] = useState(true); // モーダルの表示状態
  const [modalInfo, setModalInfo] = useState(false); // モーダル
  const [modalProgramId, setModalProgramId] = useState("0"); // モーダルのプログラムID
  const [modalTitle, setModalTitle] = useState(""); // モーダルのタイトル
  const [modalContent, setModalContent] = useState(""); // モーダルの内容
  const [modalPlace, setModalPlace] = useState(""); // モーダルの場所

  useEffect(() => {
    if (ref.current) return;
    (async () => {
      const qrId = searchParams.get("id") || "";
      const qrInfo = await fetchQrInfo(qrId);
      const programInfo = await fetchProgramInfo(`${qrInfo.programId}`);
      setTitle(programInfo.title);
      setContent(programInfo.content);
      setCompletionMessage(programInfo.completionMessage);
      setPoint(programInfo.point);
      setLoadingPoint(programInfo.loadingPoint);
      if (programInfo.type) {
        const programInfo2 = await fetchProgramInfo2(`${programInfo.type}`);
        setProcess(programInfo2.process);
        setCaution(programInfo2.caution);
        setCondition(programInfo2.condition);
      } else {
        console.warn("Type is empty, skipping fetchProgramInfo2.");
      }
      const place = `${qrInfo.placeId}-${qrInfo.placeNumber}`;
      await postCollectionInLogs(programInfo.title, place, "QRコード読み取り");
      await patchCurrentPlace(place);
      const participatedEvents = await fetchParticipatedEvents();
      if (participatedEvents[Number(qrId)] <= 0) {
        await patchReward2(`${qrInfo.loadingPoint}`, `${qrInfo.field}`);
      }
      if (qrInfo.type === "checkin") {
        if (participatedEvents[Number(qrId)] > 0) {
          setParticipated(true);
        }
        await patchCheckinProgramIds(`${qrInfo.programId}`);
        setCheckin(true);
        setLink(
          programInfo.link === null
            ? "/"
            : `${programInfo.link}?programId=${qrInfo.programId}&place=${place}&title=${programInfo.title}&content=${programInfo.content}&thema=${programInfo.thema}&completionMessage=${programInfo.completionMessage}&point=${programInfo.point}&field=${programInfo.field}&type=${programInfo.type}`
        );
      } else if (qrInfo.type === "checkout") {
        if (participatedEvents[Number(qrId)] > 0) {
          setParticipated(true);
        }
        await patchParticipatedEvents(qrId);
        await patchCheckoutProgramIds(`${qrInfo.programId}`);
        setCheckout(true);
        setTimeout(async () => {
          const randomId = randomIds[Math.floor(Math.random() * randomIds.length)];
          const programInfo3 = await fetchProgramInfo(String(randomId));
          setModalProgramId(String(randomId));
          setModalTitle(programInfo3.title);
          setModalContent(programInfo3.content);
          setModalPlace(programInfo3.place);
          setShowModal(true);
        }, 2000);
        setLink(
          `/photoalbum/postjoinshare?programId=${qrInfo.programId}&place=${place}&point=${programInfo.point}&field=${programInfo.field}`
        );
      } else { //今回使ってない
        if (participatedEvents[Number(qrId)] > 0) {
          setParticipated(true);
          return;
        }
        router.push(
          `${qrInfo.type}?programId=${qrInfo.programId}&place=${place}&point=${programInfo.point}&field=${programInfo.field}&type=${programInfo.type}`
        );
      }
    })();
    return () => {
      ref.current = true;
    };
  }, [router, searchParams]);

  const handleLogPost = async (title: string, state: string) => {
    try {
      await postCollectionInLogs(
        title,
        "P006-1",
        state
      );
    } catch (error: any) {
      console.error("ログ記録中にエラーが発生しました:", error.message);
    }
  };

  {/* okamoto手を加える */ }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen py-2">
      {/* {participated ? (
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
      ) : ( */}
      <>
        {!checkin && !checkout && (
          <div className="flex min-h-screen flex-col items-center justify-between pb-20">
            <LoadingAnimation />
          </div>
        )}

        {checkin && (
          <div className="flex min-h-screen flex-col items-center  mt-24 pb-20">

            <h1 className="text-xl font-bold text-center mb-3 text-red-500">
              {title}に<br />
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
                  {process.map((process, index) => (
                    <p key={index} className="text-xs mb-0 ml-3">
                      {`${index + 1}. ${process}`}
                    </p>))}
                </div>
                <p className="text-xs mb-0 ml-3 font-bold">【注意事項】</p>
                <div className="mb-2 ml-3">
                  {caution.map((caution, index) => (
                    <p key={index} className="text-xs mb-0 ml-3">
                      {`${index + 1}. ${caution}`}
                    </p>
                  ))}
                </div>
                <p className="text-xs mb-0 ml-3 font-bold">【付与条件】</p>
                <div className="mb-2 ml-3">
                  {/* loadingPoint が 0 の場合、point を表示 */}
                  <p className="text-xs mb-0 ml-3">
                      {`1. ${condition[0]}: ${
                          `${loadingPoint}` === "0" ? point : loadingPoint
                      }P`}
                  </p>
                  {/* condition[1] が存在する場合に表示 */}
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
                  <p className="text-sm mx-3 mb-3 mt-2">{completionMessage}</p>
                </Card.Body>
              </Card>

              <h1 className="text-sm font-bold text-center mb-3">
                獲得した報酬はホーム画面から確認できます。
              </h1>

              <div className="mt-3 border-b-2 h-1 border-green-600 border-opacity-30 drop-shadow-sm mb-4 w-11/12"></div>

              <h1 className="text-xl font-bold text-center mb-3 text-red-500">
                共有して追加ポイントGET!
              </h1>
              <h1 className="text-sm font-bold text-center mb-3 w-11/12">
                イベントに参加している様子を共有して、追加でポイントを獲得しよう！
              </h1>
              <Link href={link} className="no-underline">
                <button className="flex justify-center items-center bg-green-700 hover:bg-green-900 text-white font-bold py-2 px-4 rounded">
                  詳細
                </button>
              </Link>
              <Link href="/" className="mt-1">
                <button
                  className="text-xs underline my-4 text-gray-600"
                >ホームに戻る</button>
              </Link>
            </div>

            {/* オーバーレイ */}
            {showModal && (
              <div className="fixed inset-0 bg-opacity-90 z-40 pointer-events-auto">
                <LoadingAnimation />
              </div>
            )}

            {/* モーダル */}
            { modalTitle && (
              <Modal show={showModal} onHide={() => {
                setShowModal(false),
                handleLogPost("フリーコーヒー後の誘導モーダル閉じ", `ProgramId=${modalProgramId}へ案内`);
                }}
                centered
              >
                <Modal.Header closeButton>
                  <Modal.Title>{modalTitle}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <p>{modalContent}</p>
                  <div className="mt-auto mb-auto">
                      <div className="grid grid-cols-4 text-center border-b-2 border-green-700">
                          <p className="col-start-1 text-center bg-green-700 text-white mb-0 rounded-t-lg"><strong>場所</strong></p>
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
                  <button onClick={() => {
                    setShowModal(false), 
                    handleLogPost("フリーコーヒー後の誘導モーダル閉じ", `ProgramId=${modalProgramId}へ案内`);
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
      {/* )} */}
    </main>
  );
}
