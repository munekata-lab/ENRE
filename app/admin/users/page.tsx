"use client";

import React, { useState, useEffect, useMemo } from "react";
import { getUsers } from "@/lib/dbActions";

// ユーザーの型を定義
type User = {
  uid: string;
  nickName: string;
  reward: number;
  modeOfTransportation: string;
  checkinProgramIds: string[];
  dev: boolean;
  participated: { [key: string]: number };
};

// 1ページあたりの表示ユーザー数
const USERS_PER_PAGE = 50;

export default function AdminUsersPage() {
  const [userList, setUserList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // ソート設定用のState
  const [sortConfig, setSortConfig] = useState<{ key: keyof User; direction: 'ascending' | 'descending' } | null>({ key: 'reward', direction: 'descending' });
  
  // 絞り込み用のState
  const [uidSearch, setUidSearch] = useState('');
  const [excludeDevs, setExcludeDevs] = useState(false);

  // ★変更点1: ページネーション用のStateを追加
  const [currentPage, setCurrentPage] = useState(1);

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

  // ★変更点4: フィルタ条件が変わったらページをリセットする
  useEffect(() => {
    setCurrentPage(1);
  }, [uidSearch, excludeDevs]);

  // 絞り込みとソートを適用するuseMemo
  const filteredAndSortedUserList = useMemo(() => {
    let filteredUsers = [...userList];

    // 1. devフラグによる絞り込み
    if (excludeDevs) {
      filteredUsers = filteredUsers.filter(user => !user.dev);
    }

    // 2. UIDによる絞り込み
    if (uidSearch) {
      filteredUsers = filteredUsers.filter(user =>
        user.uid.toLowerCase().includes(uidSearch.toLowerCase())
      );
    }

    // 3. 絞り込まれたリストをソート
    if (sortConfig !== null) {
      filteredUsers.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filteredUsers;
  }, [userList, uidSearch, excludeDevs, sortConfig]);

  const requestSort = (key: keyof User) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: keyof User) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
  };
  
  // ★変更点2: ページネーションのロジック
  const totalPages = Math.ceil(filteredAndSortedUserList.length / USERS_PER_PAGE);
  const startIndex = (currentPage - 1) * USERS_PER_PAGE;
  const endIndex = startIndex + USERS_PER_PAGE;
  const paginatedUserList = filteredAndSortedUserList.slice(startIndex, endIndex);

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="bg-green-100 rounded p-4">
      <h2 className="text-2xl font-bold mb-4">ユーザーリスト ({filteredAndSortedUserList.length}人)</h2>
      
      <div className="flex flex-wrap items-center gap-4 mb-4 p-4 bg-white rounded-lg shadow">
        <div>
          <label htmlFor="uid-search" className="block text-sm font-medium text-gray-700">UIDで検索</label>
          <input
            type="text"
            id="uid-search"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={uidSearch}
            onChange={(e) => setUidSearch(e.target.value)}
            placeholder="UIDの一部を入力..."
          />
        </div>
        <div className="flex items-center pt-6">
          <input
            id="exclude-devs"
            type="checkbox"
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            checked={excludeDevs}
            onChange={(e) => setExcludeDevs(e.target.checked)}
          />
          <label htmlFor="exclude-devs" className="ml-2 block text-sm text-gray-900">
            開発者を除外
          </label>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-2 px-4 cursor-pointer" onClick={() => requestSort('nickName')}>
                ニックネーム{getSortIndicator('nickName')}
              </th>
              <th className="py-2 px-4 cursor-pointer" onClick={() => requestSort('reward')}>
                ポイント{getSortIndicator('reward')}
              </th>
              <th className="py-2 px-4">交通手段</th>
              <th className="py-2 px-4">チェックイン中</th>
              <th className="py-2 px-4">参加済みイベントID</th>
              <th className="py-2 px-4">UID</th>
            </tr>
          </thead>
          <tbody>
            {/* ★変更点: paginatedUserList を使用 */}
            {paginatedUserList.map((user, index) => (
              <tr key={index} className={`border-b hover:bg-gray-100 ${user.dev ? 'bg-yellow-200' : ''}`}>
                <td className="py-2 px-4">{user.nickName}</td>
                <td className="py-2 px-4">{user.reward} pt</td>
                <td className="py-2 px-4">{transpotationMethod(user.modeOfTransportation)}</td>
                <td className="py-2 px-4">{user.checkinProgramIds?.join(', ') || 'なし'}</td>
                <td className="py-2 px-4">
                  {user.participated
                    ? Object.entries(user.participated)
                        .filter(([_, count]) => count > 0) // 参加回数が1以上のものだけ抽出
                        .map(([id]) => id)
                        .sort((a, b) => Number(a) - Number(b)) // ID順にソート
                        .join(', ')
                    : 'なし'}
                </td>
                <td className="py-2 px-4 text-xs text-gray-500">{user.uid}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

       {/* ★変更点3: ページネーションUIを追加 */}
       <div className="mt-4 flex justify-between items-center">
        <button
          onClick={() => setCurrentPage(prev => prev - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 hover:bg-gray-400"
        >
          前へ
        </button>
        <span>
          ページ {totalPages > 0 ? currentPage : 0} / {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(prev => prev + 1)}
          disabled={currentPage >= totalPages}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 hover:bg-gray-400"
        >
          次へ
        </button>
      </div>

    </div>
  );
}