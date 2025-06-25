"use client";

import React, { useState, useEffect } from "react";
import { getUsers } from "@/lib/dbActions";

export default function AdminUsersPage() {
  const [userList, setUserList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const transpotationMethod = (method: string) => {
    switch (method) {
      case "kitaooji": return "北大路";
      case "kokusai": return "国際会館";
      case "demachi": return "出町柳";
      case "niken": return "二軒茶屋";
      case "kamigamo": return "上賀茂";
      case "walk": return "徒歩";
      case "bicycle": return "自転車";
      case "bike": return "バイク";
      case "other": return "その他";
      default: return "未設定";
    }
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const users = await getUsers();
      setUserList(users);
      setIsLoading(false);
    })();
  }, []);

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="bg-green-100 rounded p-4">
      <h2 className="text-2xl font-bold mb-4">ユーザーリスト ({userList.length}人)</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-2 px-4">ニックネーム</th>
              <th className="py-2 px-4">ポイント</th>
              <th className="py-2 px-4">交通手段</th>
              <th className="py-2 px-4">チェックイン中</th>
              <th className="py-2 px-4">UID</th>
            </tr>
          </thead>
          <tbody>
            {userList.map((user, index) => (
              <tr key={index} className="border-b hover:bg-gray-100">
                <td className="py-2 px-4">{user.nickName}</td>
                <td className="py-2 px-4">{user.reward} pt</td>
                <td className="py-2 px-4">{transpotationMethod(user.modeOfTransportation)}</td>
                <td className="py-2 px-4">{user.checkinProgramIds?.join(', ') || 'なし'}</td>
                <td className="py-2 px-4 text-xs text-gray-500">{user.uid}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}