"use client";

import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase/client';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faLeaf, faUser, faCalendarCheck } from '@fortawesome/free-solid-svg-icons';
import { LoadingAnimation } from '@/app/ui/skeletons';
import { User } from '@/lib/dbActions';
import { QRCodeCanvas } from 'qrcode.react';

export default function MyPageComponent() {
    const [uid, setUid] = useState<string | null>(null); // 追加: UID保存用ステート
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
            if (authUser) {
                setUid(authUser.uid); // 追加: UIDを保存
                const userRef = doc(db, 'users', authUser.uid);
                const docSnap = await getDoc(userRef);
                if (docSnap.exists()) {
                    setUser(docSnap.data() as User);
                } else {
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (isLoading) {
        return <div className="flex justify-center items-center h-full pt-20"><LoadingAnimation /></div>;
    }

    if (!user) {
        return <div className="text-center mt-10">ユーザー情報が見つかりません。再ログインしてください。</div>;
    }

    const totalParticipated = Object.values(user.participated || {}).reduce((sum, count) => sum + count, 0);

    const qrData = {
        token: "qr_add0524e7ea04d56a764a248613f4f0f",
        payload: {
            uid: uid,
            nickname: user.settings.nickName, // ユーザーのニックネームを動的に設定
            country: "Japan",
            i18nextLng: "ja",
            event_id: "10"
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold">{user.settings.nickName}の情報</h1>
            </div>

            {/* 追加: QRコード表示エリア */}
            <div className="flex flex-col items-center justify-center bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold mb-4">連携用QRコード</h2>
                <QRCodeCanvas 
                    value={JSON.stringify(qrData)} 
                    size={200}
                    level={"M"}
                    bgColor={"#FFFFFF"}
                    fgColor={"#000000"}
                />
                <p className="text-sm text-gray-500 mt-2">このQRコードを別のアプリで読み取ってください</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <FontAwesomeIcon icon={faStar} className="text-3xl text-yellow-400 mb-2" />
                    <h2 className="text-xl font-semibold">総獲得ポイント</h2>
                    <p className="text-2xl font-bold">{user.totalReward || 0} P</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <FontAwesomeIcon icon={faLeaf} className="text-3xl text-green-500 mb-2" />
                    <h2 className="text-xl font-semibold">GIポイント</h2>
                    <p className="text-2xl font-bold">{user.giPoint || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <FontAwesomeIcon icon={faCalendarCheck} className="text-3xl text-blue-500 mb-2" />
                    <h2 className="text-xl font-semibold">イベントクリア数</h2>
                    <p className="text-2xl font-bold">{totalParticipated} 回</p>
                </div>
            </div>
        </div>
    );
}