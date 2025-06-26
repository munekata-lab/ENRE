import DetailCardComponent from "./detailCard";
import { 
  fetchCheckinProgramIds, 
  fetchProgramInfo,
  fetchProgramInfo2 
} from "@/lib/dbActions";
import React from "react";

export default async function CheckinDetailComponent() {
  const checkinProgramIdList = await fetchCheckinProgramIds();
  const checkinProgramList = await Promise.all(
    checkinProgramIdList.map(async (programId) => {
      const programInfo = await fetchProgramInfo(programId);
      let programInfo2 = { process: [], caution: [], condition: [] }; // デフォルト値を設定
      if (programInfo.type) {
        programInfo2 = await fetchProgramInfo2(programInfo.type);
      }
      return { programId, programInfo, programInfo2 };
    })
  );
  
  const spotsInfo = checkinProgramList.map((item) => {
    // 共通のプロパティを定義
    const commonInfo = {
      title: item.programInfo.title,
      content: item.programInfo.content,
      thema: item.programInfo.thema,
      completionMessage: item.programInfo.completionMessage,
      place: item.programInfo.place,
      process: item.programInfo2.process,
      caution: item.programInfo2.caution,
      condition: item.programInfo2.condition,
      owner: item.programInfo.owner,
      loadingPoint: item.programInfo.loadingPoint,
      point: item.programInfo.point,
      field: item.programInfo.field,
      schedule: item.programInfo.schedule || [], 
    };

    if (item.programInfo.link) {
      return {
        ...commonInfo,
        link: `${item.programInfo.link}?programId=${item.programId}&title=${encodeURIComponent(item.programInfo.title)}&completionMessage=${encodeURIComponent(item.programInfo.completionMessage)}&content=${encodeURIComponent(item.programInfo.content)}&thema=${encodeURIComponent(item.programInfo.thema)}&point=${item.programInfo.point}&type=${item.programInfo.type}`,
      };
    }
    return commonInfo;
  });

  return (
    <div className="grid row-start-2 h-hull overflow-auto w-full px-5 justify-center">
      <div className="mt-5">
        <h1 className="text-xl font-bold text-center mb-10">
          チェックイン中のイベント
        </h1>
        <p className="text-right">{spotsInfo.length}件</p>
        {spotsInfo.length === 0 ? (
          <div className="text-center mt-10">
            <h1>現在チェックイン中のイベントはありません。</h1>
            <p className="mt-4">QRコードを読み取ってイベントに参加しよう！</p>
          </div>
        ) : (
          <>
            {spotsInfo.map((spotInfo, index) => {
              return (
                <div key={index}>
                  <DetailCardComponent
                    spotInfo={spotInfo}
                    thema="white"
                    textColor="dark"
                  />
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}