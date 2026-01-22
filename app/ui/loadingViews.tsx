"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Card from "react-bootstrap/Card";
import Script from "next/script";
import { useBudouX } from "../hooks/useBudouX";
import { QRCodeCanvas } from "qrcode.react";
import { auth, db } from '@/lib/firebase/client';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { User } from '@/lib/dbActions';
import { LoadingAnimation } from '@/app/ui/skeletons';

// --- 1. 参加済み画面 ---
export function ParticipatedView() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center pb-20">
      <h1 className="text-2xl font-bold text-center mb-10">
        このQRコードからは
        <br />
        参加済みです
      </h1>
      <Link href="/" className="no-underline">
        <button className="flex justify-center items-center bg-green-700 hover:bg-green-900 text-white font-bold py-2 px-4 rounded">
          ホームに戻る
        </button>
      </Link>
    </div>
  );
}

// --- 2. チェックイン完了画面 ---
type CheckinViewProps = {
  title: string;
  content: string;
  process: string[];
  caution: string[];
  condition: string[];
  loadingPoint: string;
  point: string;
  link: string;
};

export function CheckinView({
  title,
  content,
  process,
  caution,
  condition,
  loadingPoint,
  point,
  link,
}: CheckinViewProps) {
  return (
    <div className="flex min-h-screen flex-col items-center mt-24 pb-20">
      <h1 className="text-xl font-bold text-center mb-3 text-red-500">
        {title}に
        <br />
        チェックインしました！
      </h1>
      <h1 className="text-sm font-bold text-center mb-4">
        ホーム画面からいつでも確認できます
      </h1>

      <Card border="light" className="w-11/12 drop-shadow mb-4">
        <Card.Header className="text-sm font-bold px-2 py-2.5 text-center">
          {title}
        </Card.Header>
        <Card.Body className="p-1">
          <p className="text-sm mx-3 mb-3 mt-2">{content}</p>
          <hr />
          <p className="text-xs mb-0 ml-3 font-bold">【手順】</p>
          <div className="mb-2 ml-3">
            {process.map((p, index) => (
              <p key={index} className="text-xs mb-0 ml-3">
                {`${index + 1}. ${p}`}
              </p>
            ))}
          </div>
          <p className="text-xs mb-0 ml-3 font-bold">【注意事項】</p>
          <div className="mb-2 ml-3">
            {caution.map((c, index) => (
              <p key={index} className="text-xs mb-0 ml-3">
                {`${index + 1}. ${c}`}
              </p>
            ))}
          </div>
          <p className="text-xs mb-0 ml-3 font-bold">【付与条件】</p>
          <div className="mb-2 ml-3">
            <p className="text-xs mb-0 ml-3">
              {`1. ${condition[0] || 'QR読取'}: ${
                `${loadingPoint}` === "0" ? point : loadingPoint
              }P`}
            </p>
            {condition[1] && (
              <p className="text-xs mb-0 ml-3">
                {`2. ${condition[1]}: ${point}P`}
              </p>
            )}
          </div>
        </Card.Body>
      </Card>

      <Link href={link} className="no-underline">
        <button className="flex justify-center items-center bg-green-700 hover:bg-green-900 text-white font-bold py-2 px-4 rounded">
          イベント詳細
        </button>
      </Link>
    </div>
  );
}

// --- 3. チェックアウト完了画面 ---
type CheckoutViewProps = {
  title: string;
  completionMessage: string;
  onLogPost: (title: string, type: string) => void;
  currentPath: string;
};

export function CheckoutView({
  title,
  completionMessage,
  onLogPost,
  currentPath,
}: CheckoutViewProps) {
  const { parse } = useBudouX();

  return (
    <>
      <div className="w-full h-24"></div>
      <div className="flex min-h-screen flex-col items-center justify-center pb-20">
        <h1 className="text-xl font-bold text-center mb-10 text-red-500">
          ご参加
          <br />
          ありがとうございます！
        </h1>

        <Card border="light" className="w-11/12 drop-shadow mb-4">
          <Card.Header className="text-sm font-bold px-2 py-2.5 text-center">
            {parse ? parse(title) : title}
          </Card.Header>
          <Card.Body className="p-1">
            <p className="text-sm mx-3 mb-3 mt-2">{completionMessage}</p>
          </Card.Body>
        </Card>

        <h1 className="text-sm font-bold text-center mb-3">
          獲得した報酬はホーム画面から確認できます。
        </h1>

        <div className="mt-3 border-b-2 h-1 border-green-600 border-opacity-30 drop-shadow-sm mb-4 w-11/12"></div>

        <h1 className="text-sm font-bold text-center mb-3 w-11/12">
          イベントに参加している様子を共有しよう！
        </h1>
        <div>
          <a
            href="https://twitter.com/share?ref_src=twsrc%5Etfw"
            className="twitter-share-button"
            data-size="large"
            data-text={`「${title}」に参加しました`}
            data-url="https://www.enre-official.com/"
            data-hashtags="Enre #京都産業大学"
            data-show-count="true"
            onClick={() => onLogPost(currentPath, "Twitter")}
          >
            Tweet
          </a>
          <Script
            src="https://platform.twitter.com/widgets.js"
            strategy="lazyOnload"
          />
        </div>
        <Link href="/" className="mt-1">
          <button
            className="text-xs underline my-4 text-gray-600"
            onClick={() => onLogPost(currentPath + title, "Home")}
          >
            ホームに戻る
          </button>
        </Link>
      </div>
    </>
  );
}

// --- 4. ロボットイベント用完了画面（修正版） ---
type RobotCheckoutViewProps = {
  title: string;
  completionMessage: string;
  onLogPost: (title: string, type: string) => void;
  currentPath: string;
  eventId: string; // ★追加: event_idを受け取る
};

export function RobotCheckoutView({
    title,
    completionMessage,
    onLogPost,
    currentPath,
    eventId, // ★追加
  }: RobotCheckoutViewProps) {
    const { parse } = useBudouX();
    const [user, setUser] = useState<User | null>(null);
    const [uid, setUid] = useState<string | null>(null); // ★追加: UIDを保持
    const [qrToken, setQrToken] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
            if (authUser) {
                setUid(authUser.uid); // ★追加
                const userRef = doc(db, 'users', authUser.uid);
                const docSnap = await getDoc(userRef);
                if (docSnap.exists()) {
                    setUser(docSnap.data() as User);
                    const uuid = crypto.randomUUID();
                    setQrToken(`qr_${uuid}`);
                } else {
                    setUser(null);
                }
            } else {
                setUser(null);
                setUid(null);
            }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // ★修正: 指定されたフィールドを含むフラットなオブジェクトを作成
    const qrData = (user && uid) ? {
        uid: uid,
        nickname: user.settings.nickName,
        event_id: eventId,
        qrtoken: qrToken,
        robotmeet: user.robotMeet || []
    } : null;

    return (
      <>
        <div className="w-full h-24"></div>
        <div className="flex min-h-screen flex-col items-center justify-center pb-20">
          <h1 className="text-xl font-bold text-center mb-6 text-red-500">
            クリア！
          </h1>
  
          <Card border="light" className="w-11/12 drop-shadow mb-8">
            <Card.Header className="text-sm font-bold px-2 py-2.5 text-center">
              {parse ? parse(title) : title}
            </Card.Header>
            <Card.Body className="p-1">
              <p className="text-sm mx-3 mb-3 mt-2">{completionMessage}</p>
            </Card.Body>
          </Card>

          <div className="flex flex-col items-center justify-center bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-lg font-semibold mb-4">ロボットに提示してください</h2>
            {isLoading ? (
                <LoadingAnimation />
            ) : (qrData && qrToken) ? (
                <QRCodeCanvas 
                    value={JSON.stringify(qrData)} 
                    size={200}
                    level={"L"}
                    bgColor={"#FFFFFF"}
                    fgColor={"#000000"}
                />
            ) : (
                <p className="text-sm text-red-500">QRコード生成エラー</p>
            )}
            <p className="text-sm text-gray-500 mt-2">受付端末等で読み取ってください</p>
          </div>
  
          <Link href="/" className="mt-1">
            <button
              className="text-xs underline my-4 text-gray-600"
              onClick={() => onLogPost(currentPath + title, "Home")}
            >
              ホームに戻る
            </button>
          </Link>
        </div>
      </>
    );
  }