"use client";

import React, { useState, useEffect, type ReactNode } from "react";
import { getUserFromCookie } from "@/lib/session";
import { fetchMode } from "@/lib/dbActions";
import { redirect } from "next/navigation";
import NotFound from "../not-found";
import { LoadingAnimation } from "../ui/skeletons";
import Link from "next/link";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
          <Link href="/admin" className="text-white hover:underline">ダッシュボード</Link>
          <Link href="/admin/events" className="text-white hover:underline">イベント管理</Link>
          <Link href="/admin/users" className="text-white hover:underline">ユーザー管理</Link>
          <Link href="/admin/notifications" className="text-white hover:underline">通知管理</Link>
          <Link href="/admin/export" className="text-white hover:underline">データ出力</Link>
        </nav>
      </div>
      <div className="w-full p-4">
        {children}
      </div>
    </main>
  );
}