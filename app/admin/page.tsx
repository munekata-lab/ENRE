"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase/client";
import { collection, query, onSnapshot } from "firebase/firestore";
import { getPlace } from "@/lib/dbActions";

function CameraStatusView() {
  const [placeList, setPlaceList] = useState<any[]>([]);

  useEffect(() => {
    const placeCollectionRef = query(collection(db, "place"));
    const unsubscribe = onSnapshot(placeCollectionRef, (snapshot) => {
      const places = snapshot.docs.map((place: any) => {
        const data = place.data();
        const updatedAt = data.updatedAt;
        if (updatedAt === undefined) return undefined;

        const currentDate = new Date();
        const setPostDateString = (postDate: Date) => {
          const diffDate = currentDate.getTime() - postDate.getTime();
          if (diffDate < 3600000) return `${Math.floor(diffDate / 60000)}分前`;
          if (diffDate < 86400000) return `${Math.floor(diffDate / 3600000)}時間前`;
          if (diffDate < 604800000) return `${Math.floor(diffDate / 86400000)}日前`;
          return `${postDate.getFullYear()}年${postDate.getMonth() + 1}月${postDate.getDate()}日`;
        };
        const dateString = setPostDateString(updatedAt.toDate());

        return {
          congestion: data.congestion,
          id: data.id,
          name: data.name,
          updatedAt: dateString,
        };
      });
      const result = places.filter((place) => place !== undefined);
      setPlaceList(result);
    });

    // 初期データ取得
    (async () => {
      const initialPlaces = await getPlace();
      if(initialPlaces) {
        setPlaceList(initialPlaces);
      }
    })();
    
    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-blue-200 rounded p-4">
      <p className="mt-1 text-2xl font-bold">カメラ状況一覧</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {placeList.map((place, index) => (
          <div key={index} className="bg-white rounded p-4 shadow">
            <div className="text-gray-900 font-bold text-xl text-left">{place.id}</div>
            <p className="text-gray-700 text-base text-left">{place.name}: {place.congestion}人</p>
            <p className="text-gray-600 text-sm text-right">最終更新: {place.updatedAt}</p>
          </div>
        ))}
      </div>
    </div>
  );
}


export default function AdminDashboardPage() {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">ダッシュボード</h2>
      <CameraStatusView />
      {/* 他のサマリー情報もここに追加可能 */}
    </div>
  );
}