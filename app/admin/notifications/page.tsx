"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase/client";
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from "firebase/firestore";
import { fetchNotificationInfo } from "@/lib/dbActions";

function NotifyView() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const onNotify = async () => {
    if (!title || !body) {
        alert("タイトルと本文を入力してください。");
        return;
    }
    if (!confirm("この内容で全ユーザーに通知を送信しますか？")) return;

    const message = {
      title,
      body,
      pushUser: [],
      readUser: [],
      createdAt: serverTimestamp(),
    };
    
    try {
        await addDoc(collection(db, "notificationInfo"), message);
        alert("通知を送信しました。");
        setTitle("");
        setBody("");
    } catch (e) {
        console.error("通知の送信に失敗しました:", e);
        alert("通知の送信に失敗しました。");
    }
  };

  return (
    <div className="bg-orange-200 rounded p-4">
      <h3 className="text-xl font-bold mb-3">通知送信</h3>
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-left font-medium">タイトル</label>
          <input
            id="title"
            className="w-full p-2 border rounded"
            placeholder="通知のタイトル"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="message" className="block text-left font-medium">メッセージ</label>
          <input
            id="message"
            className="w-full p-2 border rounded"
            placeholder="通知の本文"
            type="text"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
          onClick={onNotify}
        >
          送信
        </button>
      </div>
    </div>
  );
}

function NotificationHistoryView() {
  const [notificationList, setNotificationList] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "notificationInfo"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate()?.toLocaleString('ja-JP') || 'N/A';
        return { id: doc.id, ...data, postDate: createdAt };
      });
      setNotificationList(notifications);
    });
    
    // 初期ロード
    (async () => {
        const initialNotifications = await fetchNotificationInfo();
        setNotificationList(initialNotifications);
    })();

    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-indigo-100 rounded p-4 mt-8">
      <h3 className="text-xl font-bold mb-3">送信済み通知一覧</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {notificationList.map((notification) => (
          <div key={notification.id} className="bg-white p-3 rounded shadow">
            <p className="font-bold">{notification.title}</p>
            <p className="text-sm">{notification.body}</p>
            <div className="text-xs text-gray-500 mt-2 flex justify-between">
              <span>{notification.postDate}</span>
              <span>既読: {notification.readUser?.length || 0}人</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminNotificationsPage() {
    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">通知管理</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <NotifyView />
                <NotificationHistoryView />
            </div>
        </div>
    );
}