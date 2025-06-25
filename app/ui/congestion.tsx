import { fetchPlace2 } from "@/lib/dbActions";
import React from "react";

type Props = {
  key: number,
  docId: string,
}

export default async function CongestionComponent({ key, docId }: Props) {

    const placeList = await fetchPlace2(docId);
    const name = placeList.placeName;
    const congestion = placeList.placeCongestion;
    // const congestion = 15;
    const threshold = placeList.placeThreshold;

  const congestionLevel =
    threshold && congestion < threshold[0] ? 1 :
    threshold && threshold[0] <= congestion && congestion < threshold[1] ? 2 :
    threshold && threshold[1] <= congestion && congestion < threshold[2] ? 3 :
    threshold && threshold[2] <= congestion ? 4 : 1;

  // const congestionLevelColor = ["blue-500","green-500","yellow-500","red-500"][congestionLevel-1];
  const congestionLevelColorCode = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"][congestionLevel - 1];
  const congestionLevelMarker = "■".repeat(congestionLevel) + "□".repeat(5 - congestionLevel);

  return (
    <>
      <div className="col-start-1 col-end-2 text-sm pl-2 py-1 mt-0 mb-1 border-l-4 border-solid justify-self-start" style={{ borderColor: congestionLevelColorCode }}>{name}</div>
      <div className="col-start-2 col-end-3 text-sm py-1 mt-0 mb-1 justify-self-end" style={{ color: congestionLevelColorCode }}>{congestionLevelMarker}</div>
    </>
  );
}
