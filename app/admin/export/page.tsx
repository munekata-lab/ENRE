"use client";

import React, { useRef, useState } from "react";
import { getBiomeCollection, getLeavesCollection, getUsers, getLogsCollection } from "@/lib/dbActions";

function CSVExportButton({ onExport, title, description, children }: { onExport: () => void; title: string; description: string, children?: React.ReactNode }) {
  return (
    <div className="bg-gray-100 rounded p-4 shadow">
      <h4 className="text-lg font-bold">{title}</h4>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      {children}
      <button
        onClick={onExport}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        CSVダウンロード
      </button>
    </div>
  );
}

export default function AdminExportPage() {
  const anchorRef = useRef<HTMLAnchorElement>(null);
  const [logStartDate, setLogStartDate] = useState('');
  const [logEndDate, setLogEndDate] = useState('');

  const downloadCSV = (csv: string, filename: string) => {
    if (!anchorRef.current) return;
    const now = new Date();
    const datestring = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
    
    const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
    const blob = new Blob([bom, csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    anchorRef.current.href = url;
    anchorRef.current.download = `${datestring}_${filename}`;
    anchorRef.current.click();
  };

  const handleExport = async (fetcher: () => Promise<any[]>, headers: string[], rowMapper: (item: any) => string, filename: string) => {
    try {
        const data = await fetcher();
        if (!data || data.length === 0) {
            alert("エクスポートするデータがありません。");
            return;
        }
        const header = headers.join(",") + "\n";
        const rows = data.map(rowMapper).join("\n");
        downloadCSV(header + rows, filename);
    } catch (e) {
        console.error("CSVエクスポートエラー:", e);
        alert("データのエクスポートに失敗しました。");
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">データエクスポート</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CSVExportButton
            title="ログデータ"
            description="ユーザーの行動ログをCSV形式で出力します。日付を指定しない場合は全てのログが出力されます。"
            onExport={() => handleExport(
                () => getLogsCollection(logStartDate, logEndDate),
                ["uid", "date", "place", "title", "state"],
                (item) => `"${item.uid}","${item.date}","${item.place}","${item.title}","${item.state}"`,
                "logs.csv"
            )}
        >
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div>
              <label htmlFor="log-start-date" className="block text-left text-sm font-medium text-gray-700">開始日</label>
              <input
                type="date"
                id="log-start-date"
                value={logStartDate}
                onChange={(e) => setLogStartDate(e.target.value)}
                className="mt-1 p-2 border rounded-md w-full"
              />
            </div>
            <div>
              <label htmlFor="log-end-date" className="block text-left text-sm font-medium text-gray-700">終了日</label>
              <input
                type="date"
                id="log-end-date"
                value={logEndDate}
                onChange={(e) => setLogEndDate(e.target.value)}
                className="mt-1 p-2 border rounded-md w-full"
              />
            </div>
          </div>
        </CSVExportButton>
        <CSVExportButton
            title="Biome投稿データ"
            description="Biome連携機能で投稿された生き物のデータをCSVで出力します。"
            onExport={() => handleExport(
                getBiomeCollection,
                ["date", "name", "uid", "reward", "fullPath", "url", "note"],
                (item) => `"${item.date}","${item.name}","${item.uid}",${item.reward},"${item.fullPath}","${item.url}","${item.note}"`,
                "biome_posts.csv"
            )}
        />
        <CSVExportButton
            title="落ち葉投稿データ"
            description="コンポスト（落ち葉拾い）イベントで投稿されたデータをCSVで出力します。"
            onExport={() => handleExport(
                getLeavesCollection,
                ["date", "place", "uid", "reward", "fullPath", "url"],
                (item) => `"${item.date}","${item.place}","${item.uid}",${item.reward},"${item.fullPath}","${item.url}"`,
                "fallen_leaves.csv"
            )}
        />
        <CSVExportButton
            title="Biomeユーザー名"
            description="ユーザーが登録したBiomeのユーザー名を一覧で出力します。"
            onExport={() => handleExport(
                getUsers,
                ["uid", "biomeUserName"],
                (item) => `"${item.uid}","${item.biomeUserName || ''}"`,
                "biome_usernames.csv"
            )}
        />
      </div>
      {/* 非表示のアンカータグ */}
      <a ref={anchorRef} className="hidden"></a>
    </div>
  );
}