"use client";

import React, { useState, useEffect } from "react";
import Card from "react-bootstrap/Card";
import Link from "next/link";

// scheduleの型を新しい構造に合わせる
type Schedule = {
  day: string;
  open: string;
  close: string;
};

type Spots = {
  title: string;
  content: string;
  thema: string;
  completionMessage: string;
  place?: string;
  link?: string;
  process: string[];
  caution: string[];
  condition: string[];
  owner: string,
  loadingPoint: number;
  point: number;
  field: string;
  // dayからschedule配列に変更
  schedule: Schedule[];
};

type Props = {
  spotInfo: Spots;
  thema: string;
  textColor: string;
};

export default function DetailCardComponent({
  spotInfo,
  thema,
  textColor,
}: Props) {

  const [isExpanded, setIsExpanded] = useState(false);

  const formatDay = (day: string) => {
      switch (day) {
          case "1": return "1/8(水)";
          case "2": return "1/9(木)";
          case "3": return "1/10(金)";
          default: return day;
      }
  };

  return (
    <Card border="light" bg={thema} text={textColor} className="w-full drop-shadow mb-2">
      <Card.Header className="text-sm font-bold px-2 py-2.5 text-center">
        {spotInfo.title}
      </Card.Header>
      <Card.Body className="p-1">
        <p className="text-sm mx-3 mb-3 mt-2">{spotInfo.content}</p>
        <p className="text-xs text-end mb-1 mr-2">{spotInfo.owner} {spotInfo.place && (<>({spotInfo.place})</>)}</p>
        
        {/* スケジュール配列をループして表示するロジック */}
        {spotInfo.schedule && spotInfo.schedule.length > 0 && (
          <div className="mb-2 ml-3">
            <p className="text-xs mb-0 font-bold">【開催日時】</p>
            {spotInfo.schedule.map((item, index) => (
              <p key={index} className="text-xs mb-0 ml-3">
                {/* openとcloseが両方ある場合のみ時間を表示し、ない場合は「終日」と表示 */}
                {formatDay(item.day)} {item.open && item.close ? `${item.open}-${item.close}` : <span className="font-bold text-red-500">終日</span>}
              </p>
            ))}
          </div>
        )}

        {isExpanded && (
          <>
            <hr />
            <p className="text-xs mb-0 ml-3 font-bold">【手順】</p>
            <div className="mb-2 ml-3">
              {spotInfo.process.map((process, index) => (
                <p key={index} className="text-xs mb-0 ml-3">
                  {`${index + 1}. ${process}`}
                </p>))}
            </div>
            <p className="text-xs mb-0 ml-3 font-bold">【付与条件】</p> 
            <div className="mb-2 ml-3">
              <p className="text-xs mb-0 ml-3">
                  {`1. ${spotInfo.condition[0]}: ${
                      spotInfo.loadingPoint === 0 ? spotInfo.point : spotInfo.loadingPoint
                  }P`}
              </p>
              {spotInfo.condition[1] && (
                  <p className="text-xs mb-0 ml-3">
                      {`2. ${spotInfo.condition[1]}: ${spotInfo.point}P`}
                  </p>
              )}
            </div>
          </>
        )}

        <footer className="text-center text-xs underline mt-3 mb-2 text-gray-400">
          <button
            className="text-xs underline"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "詳細を折りたたむ" : "詳細を表示"}
          </button>
        </footer>
        {spotInfo.link && (
          <div className="flex justify-center items-center">
            <Link href={spotInfo.link || "/"}>
              <button className="text-sm bg-green-600 hover:bg-green-900 text-white font-bold py-2 px-4 rounded-lg m-2">
                イベントに戻る
              </button>
            </Link>
          </div>
        )}

      </Card.Body>
    </Card>
  );
}