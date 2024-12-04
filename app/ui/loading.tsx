"use client";

import React from "react";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  fetchQrInfo,
  fetchProgramInfo,
  patchReward,
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
import { useBudouX } from "../hooks/useBudouX";

export default function LoadingComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [checkin, setCheckin] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [link, setLink] = useState("");
  const [process, setProcess] = useState<string[]>([]);
  const [caution, setCaution] = useState<string[]>([]);
  const [condition, setCondition] = useState<string[]>([]);
  const ref = useRef(false);
  const [participated, setParticipated] = useState(false);
  const { parse } = useBudouX();

  useEffect(() => {
    if (ref.current) return;
    (async () => {
      const qrId = searchParams.get("id") || "";
      const qrInfo = await fetchQrInfo(qrId);
      const programInfo = await fetchProgramInfo(`${qrInfo.programId}`);
      setTitle(programInfo.title);
      setContent(programInfo.content);
      setProcess(programInfo.process);
      setCaution(programInfo.caution);
      setCondition(programInfo.condition);
      const place = `${qrInfo.placeId}-${qrInfo.placeNumber}`;
      await postCollectionInLogs(programInfo.title, place, "QRコード読み取り");
      await patchCurrentPlace(place);
      const participatedEvents = await fetchParticipatedEvents();
      if (participatedEvents[Number(qrId)] <= 0) {
        await patchReward(`${qrInfo.rewardPoint}`, `${qrInfo.rewardField}`, `${qrInfo.rewardGIP}`);
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
            : `${programInfo.link}?programId=${qrInfo.programId}&rewardPoint=${programInfo.rewardPoint}&rewardField=${programInfo.rewardField}&rewardGIP=${programInfo.rewardGIP}`
        );
      } else if (qrInfo.type === "checkout") {
        if (participatedEvents[Number(qrId)] > 0) {
          setParticipated(true);
        } else if (qrInfo.type === "checkout") {
          await patchParticipatedEvents(qrId);
        }
        await patchCheckoutProgramIds(`${qrInfo.programId}`);
        setCheckout(true);
        setLink(
          `/photoalbum/postjoinshare?programId=${qrInfo.programId}&rewardPoint=${programInfo.rewardPoint}&rewardField=${programInfo.rewardField}&rewardGIP=${programInfo.rewardGIP}`
        );
      } else {
        if (participatedEvents[Number(qrId)] > 0) {
          setParticipated(true);
          return;
        }
        router.push(
          `${qrInfo.type}?programId=${qrInfo.programId}&place=${place}&rewardPoint=${programInfo.rewardPoint}&rewardField=${programInfo.rewardField}&rewardGIP=${programInfo.rewardGIP}`
        );
      }
    })();
    return () => {
      ref.current = true;
    };
  }, [router, searchParams]);

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
                {/* <p className="text-xs text-end mb-1 mr-2">{owner} {place && (<>({place})</>)}</p> */}


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
                    <p key={index} className="text-sm mb-0 ml-3">
                      {caution}
                    </p>
                  ))}
                </div>
                <p className="text-xs mb-0 ml-3 font-bold">【付与条件】</p>
                <div className="mb-2 ml-3">
                  {condition.map((condition, index) => (
                    <p key={index} className="text-xs mb-0 ml-3">
                      {condition}
                    </p>
                  ))}
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
              {/* <h1 className="text-2xl font-bold mb-10 text-center">
                {parse ? parse(title) : title}
              </h1> */}
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
                  <p className="text-sm mx-3 mb-3 mt-2">{content}</p>
                  {/* <p className="text-xs text-end mb-1 mr-2">{owner} {place && (<>({place})</>)}</p> */}


                  <hr />
                  <p className="text-xs mb-0 ml-3 font-bold">【手順】</p>
                  <div className="mb-2 ml-3">
                    {process.map((process, index) => (
                      <p key={index} className="text-xs mb-0 ml-3">
                        {`${index + 1}. ${process}`}
                      </p>))}
                  </div>
                  <p className="text-xs mb-0 ml-3 font-bold">【付与条件】</p>
                  <div className="mb-2 ml-3">
                    {condition.map((condition, index) => (
                      <p key={index} className="text-xs mb-0 ml-3">
                        {condition}
                      </p>
                    ))}
                  </div>
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
          </>
        )}
      </>
      {/* )} */}
    </main>
  );
}
