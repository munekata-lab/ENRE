"use client";

import React, { useState, useEffect, type ReactNode } from "react";
import { getUserFromCookie } from "@/lib/session";
import { fetchMode } from "@/lib/dbActions";
import { redirect, usePathname } from "next/navigation"; // usePathnameをインポート
import NotFound from "../not-found";
import { LoadingAnimation } from "../ui/skeletons";
import Link from "next/link";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname(); // 現在のパスを取得

  useEffect(() => {
    (async () => {
      const user = await getUserFromCookie();
      if (!user) {
        redirect("/login");
        return;
      }

      const mode = await fetchMode(user.uid);
      if (mode?.userMode) {
        setIsAdmin(true);
      }
      setIsLoading(false);
    })();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <LoadingAnimation />
      </div>
    );
  }

  if (!isAdmin) {
    return <NotFound />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-0 text-center">
      <div className="w-full bg-gray-800 text-white p-4">
        <h1 className="text-2xl font-bold">Enre 管理画面</h1>
        <nav className="flex justify-center gap-4 mt-2">
          <Link href="/" className="text-white hover:underline">ホームへ戻る</Link>
          <Link 
            href="/admin/cameras" 
            className={`text-white hover:underline ${pathname === "/admin" ? "font-bold text-yellow-400" : ""}`}
          >
            カメラ情報
          </Link>
          <Link 
            href="/admin/events" 
            className={`text-white hover:underline ${pathname === "/admin/events" ? "font-bold text-yellow-400" : ""}`}
          >
            イベント管理
          </Link>
          <Link 
            href="/admin/users" 
            className={`text-white hover:underline ${pathname === "/admin/users" ? "font-bold text-yellow-400" : ""}`}
          >
            ユーザー管理
          </Link>
          <Link 
            href="/admin/notifications" 
            className={`text-white hover:underline ${pathname === "/admin/notifications" ? "font-bold text-yellow-400" : ""}`}
          >
            通知管理
          </Link>
          <Link 
            href="/admin/export" 
            className={`text-white hover:underline ${pathname === "/admin/export" ? "font-bold text-yellow-400" : ""}`}
          >
            データ出力
          </Link>
        </nav>
      </div>
      <div className="w-full p-4">
        {children}
      </div>
    </main>
  );
}