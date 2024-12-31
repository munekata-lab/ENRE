"use client";

import React from "react";
import { useCallback, useState, useRef } from "react";
import DetailCardComponent from "./detailCard";
import { LoadingAnimation } from "./skeletons";

type Spots = {
  spotsInfo: {
    title: string;
    content: string;
    thema: string;
    completionMessage: string;
    place: string;
    link?: string;
    process: string[];
    caution: string[];
    condition: string[];
    owner: string,
    loadingPoint: number,
    point: number,
    field: string;
    // schedule: {open: string, close: string, day: string}[];
    // isOpen: boolean,
    // exit: string,
  }[];
};

export default function EventListComponent({ spotsInfo }: Spots) {
  const [spotInfo] = useState(spotsInfo[0]);
  const [filteredSpotsInfo, setFilteredSpotsInfo] = useState(spotsInfo);

  // // 日付が同じイベントを表示
  // const filterSpotsInfoByDate = (
  //   date: Date,
  //   spotsInfo: {
  //     title: string;
  //     content: string;
  //     place: string;
  //     link?: string;
  //     process: string[];
  //     caution: string[];
  //     condition: string[];
  //     owner: string,
  //     // schedule: {open: string, close: string, day: string}[];
  //     // isOpen: boolean,
  //     // exit: string,
  // }[]) => {
  //   let month = date.getMonth() + 1
  //   let day = date.getDate()

  //   let filteredSpotInfo = spotsInfo.filter((item) => {
  //     if (item.schedule == null) {return false;}

  //     var result = false
  //     item.schedule.forEach((sch) => {
  //       let eventMonth = Number(sch.day.split("/")[0])
  //       let eventDate = Number(sch.day.split("/")[1])

  //       // 日付が同じなら，イベントを表示する
  //       if (month == eventMonth && day == eventDate) {
  //         result = true;
  //       }
  //     })
  //     return result;
  //   })
  //   return filteredSpotInfo
  // }

  // // 既に終わっているイベントを非表示
  // const filterEndEvent = (
  //   date: Date, 
  //   spotsInfo: {
  //     title: string;
  //     content: string;
  //     place: string;
  //     link?: string;
  //     process: string[];
  //     caution: string[];
  //     condition: string[];
  //     owner: string,
  //     schedule: {open: string, close: string, day: string}[];
  //     isOpen: boolean,
  //     exit: string,
  // }[]) => {
  //   let year = date.getFullYear()
  //   let month = date.getMonth() + 1
  //   let day = date.getDate()

  //   let filteredSpotInfo = spotsInfo.filter((item) => {
  //     if (item.schedule == null) {return false;}

  //     var result = false

  //     // trueが一つでもあれば終了していない
  //     item.schedule.forEach((sch) => {
  //       let eventMonth = Number(sch.day.split("/")[0]) - 1
  //       let eventDate = Number(sch.day.split("/")[1])
        
  //       let eventEndHour = Number(sch.close.split(":")[0])
  //       let eventEndMin = Number(sch.close.split(":")[1])

  //       let eventEndDate = new Date(year, eventMonth, eventDate, eventEndHour, eventEndMin, 0, 0);

  //       // 現在の日時がイベント終了前だった場合
  //       if (date <= eventEndDate) {result = true}
  //     })
  //     return result;
  //   })
  //   return filteredSpotInfo
  // }


  // 表示
  // - 開催中
  // - これから

  // useEffect(() => {
  //   let now = new Date()
  //   let filteredSpotInfo = filterEndEvent(
  //       now,
  //       filterSpotsInfoByDate(now, spotsInfo)
  //   )

  //   setFilteredSpotsInfo(filteredSpotInfo)
  // }, [spotsInfo])

  return (
    <>
      <div className="flex justify-center h-screen w-full">
        <div className="absolute p-1 w-full md:w-5/12 items-center">
          {filteredSpotsInfo.map((spotInfo, index) => {
            return (
              <div key={index} className="mb-2 mx-1">
                <DetailCardComponent
                  spotInfo={spotInfo}
                  thema="white"
                  textColor="dark"
                />
              </div>
            );
          })}
        {/* スクロールで隠れる問題わからなかったので無理やり対処 */}
        <div className="absolute p-1 h-28 w-full md:w-5/12 items-center"></div>
        </div>
      </div>
    </>
  );
}
