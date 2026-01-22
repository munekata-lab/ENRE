"use client";

import React, { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { auth, db } from '@/lib/firebase/client';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { User, postCollectionInLogs } from '@/lib/dbActions';
import { LoadingAnimation } from '@/app/ui/skeletons';

type QRCodeGeneratorProps = {
    eventId: string;
};

export default function QRCodeGenerator({ eventId }: QRCodeGeneratorProps) {
    const [user, setUser] = useState<User | null>(null);
    const [uid, setUid] = useState<string | null>(null);
    const [qrToken, setQrToken] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
            if (authUser) {
                setUid(authUser.uid);
                try {
                    const userRef = doc(db, 'users', authUser.uid);
                    const docSnap = await getDoc(userRef);
                    if (docSnap.exists()) {
                        setUser(docSnap.data() as User);
                        
                        // QRトークン生成 (UUID v4)
                        const uuid = crypto.randomUUID();
                        const newToken = `qr_${uuid}`;
                        setQrToken(newToken);

                        // ログ保存
                        try {
                            postCollectionInLogs("QR生成", eventId, newToken)
                                .catch(err => console.error("ログ保存に失敗しました:", err));
                        } catch (e) {
                            console.error("ログ送信エラー:", e);
                        }

                    } else {
                        setUser(null);
                    }
                } catch (error) {
                    console.error("ユーザー情報の取得エラー:", error);
                    setUser(null);
                }
            } else {
                setUser(null);
                setUid(null);
            }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [eventId]);

    // QRコードデータを作成 (robotmeetを削除)
    const qrData = (user && uid) ? {
        uid: uid,
        nickname: user.settings.nickName,
        event_id: eventId,
        qrtoken: qrToken,
        // robotmeet: user.robotMeet || [] // 削除しました
    } : null;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-6 bg-white rounded-lg shadow-md mb-8">
                <LoadingAnimation />
            </div>
        );
    }

    if (!qrData || !qrToken) {
        return (
            <div className="flex justify-center items-center p-6 bg-white rounded-lg shadow-md mb-8">
                <p className="text-sm text-red-500">QRコードを生成できませんでした。</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-lg font-semibold mb-4">ロボットに提示してください</h2>
            <QRCodeCanvas 
                value={JSON.stringify(qrData)} 
                size={200}
                level={"L"}
                bgColor={"#FFFFFF"}
                fgColor={"#000000"}
            />
            <p className="text-sm text-gray-500 mt-2">受付端末等で読み取ってください</p>
        </div>
    );
}