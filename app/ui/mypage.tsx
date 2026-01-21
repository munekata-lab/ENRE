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
    const [user, setUser] = useState<User | null>(null);
    const [uid, setUid] = useState<string | null>(null);
    const [idToken, setIdToken] = useState<string | null>(null);
    const [qrToken, setQrToken] = useState<string>(""); // 追加: QR用トークン
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
            if (authUser) {
                setUid(authUser.uid);
                
                try {
                    const token = await authUser.getIdToken();
                    setIdToken(token);
                } catch (error) {
                    console.error("IDトークンの取得に失敗しました", error);
                }

                const userRef = doc(db, 'users', authUser.uid);
                const docSnap = await getDoc(userRef);
                if (docSnap.exists()) {
                    setUser(docSnap.data() as User);
                    
                    // ▼▼▼ 追加: ユーザーデータ取得完了後に新しいトークンを生成 ▼▼▼
                    // 固定のプレフィックス: "qr_"
                    // ランダムな識別子: UUID (バージョン4)
                    const uuid = crypto.randomUUID();
                    setQrToken(`qr_${uuid}`);
                    // ▲▲▲ 追加終わり ▲▲▲

                } else {
                    setUser(null);
                }
            } else {
                setUser(null);
                setUid(null);
                setIdToken(null);
                setQrToken("");
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (isLoading) {
        return <div className="flex justify-center items-center h-full pt-20"><LoadingAnimation /></div>;
    }

    if (!user || !uid) {
        return <div className="text-center mt-10">ユーザー情報が見つかりません。再ログインしてください。</div>;
    }

    // ▼▼▼ Entryフラグの計算ロジック ▼▼▼
    const borderDate = new Date('2025-12-25T00:00:00'); 
    let entry = 0;

    if (user.createdAt) {
        const createdAtDate = (user.createdAt as any).toDate 
            ? (user.createdAt as any).toDate() 
            : new Date(user.createdAt as any);

        if (createdAtDate >= borderDate) {
            entry = 1;
        }
    }

    // QRコードデータを作成
    const qrData = {
        token: qrToken, // 生成した動的トークンを使用
        payload: {
            uid: uid, 
            // id_token: idToken,
            nickname: user.settings.nickName,
            // country: "Japan", 
            // i18nextLng: "ja", 
            event_id: "10",
            entry: entry 
        }
    };

    const totalParticipated = Object.values(user.participated || {}).reduce((sum, count) => sum + count, 0);

    return (
        <div className="container mx-auto p-4">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold">{user.settings.nickName}の情報</h1>
            </div>

            {/* QRコード表示エリア */}
            <div className="flex flex-col items-center justify-center bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold mb-4">連携用QRコード</h2>
                {qrToken ? (
                    <QRCodeCanvas 
                        value={JSON.stringify(qrData)} 
                        size={200}
                        level={"L"}
                        bgColor={"#FFFFFF"}
                        fgColor={"#000000"}
                    />
                ) : (
                    <LoadingAnimation />
                )}
                <p className="text-sm text-gray-500 mt-2">受付端末等で読み取ってください</p>
                {/* <p className="text-xs text-gray-400 mt-1">Token: {qrToken}</p> */}
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