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
      const programInfo2 = await fetchProgramInfo2(programInfo.type);
      return { programId, programInfo, programInfo2 };
    })
  );
  const spotsInfo = checkinProgramList.map((item) => {
    if (item.programInfo.link !== null) {
      return {
        title: item.programInfo.title,
        content: item.programInfo.content,
        thema: item.programInfo.thema,
        completionMessage: item.programInfo.completionMessage,
        process: item.programInfo2.process,
        caution: item.programInfo2.caution,
        condition: item.programInfo2.condition,
        link: `${item.programInfo.link}?programId=${item.programId}&title=${item.programInfo.title}&completionMessage=${item.programInfo.completionMessage}&content=${item.programInfo.content}&thema=${item.programInfo.thema}&point=${item.programInfo.point}&type=${item.programInfo.type}`,
        owner: item.programInfo.owner,
        loadingPoint: item.programInfo.loadingPoint,
        point: item.programInfo.point,
        field: item.programInfo.field,
        // schedule: item.programInfo.schedule,
        // isOpen: item.programInfo.isOpen,
        // exit: item.programInfo.exit,
      };
    }
    return {
      title: item.programInfo.title,
      content: item.programInfo.content,
      thema: item.programInfo.thema,
      completionMessage: item.programInfo.completionMessage,
      process: item.programInfo2.process,
      caution: item.programInfo2.caution,
      condition: item.programInfo2.condition,
      owner: item.programInfo.owner,
      loadingPoint: item.programInfo.loadingPoint,
      point: item.programInfo.point,
      field: item.programInfo.field,
      // schedule: item.programInfo.schedule,
      // isOpen: item.programInfo.isOpen,
      // exit: item.programInfo.exit,
    };
  });

  return (
    <div className="grid row-start-2 h-hull overflow-auto w-full px-5 justify-center">
      <div className="mt-5">
        <h1 className="text-xl font-bold text-center mb-10">
          チェックイン中のイベント
        </h1>
        <p className="text-right">{spotsInfo.length}件</p>
        {spotsInfo.length === 0 ? (
          <h1>イベントはありません</h1>
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
