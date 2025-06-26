"use client";

import React from "react";
import { useCallback, useState, useRef } from "react";
import DetailCardComponent from "./detailCard";
import { LoadingAnimation } from "./skeletons";

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
  place: string;
  link?: string;
  process: string[];
  caution: string[];
  condition: string[];
  owner: string,
  loadingPoint: number,
  point: number,
  field: string;
  schedule: Schedule[];
}[];

type Props = {
  spotsInfo: Spots;
};

export default function EventListComponent({ spotsInfo }: Props) {
  const [filteredSpotsInfo, setFilteredSpotsInfo] = useState(spotsInfo);

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