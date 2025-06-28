"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { NotificationComponent } from "./notification";
import Image from "next/image";
import { getUserFromCookie } from "@/lib/session";
import { fetchNotificationInfo, postCollectionInLogs } from "@/lib/dbActions";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export default function FooterComponent() {
  const currentPath = usePathname();

  const icons = ["/home.png", "/map.png", "/album.png", "/qr.png"];
  const title = ["ホーム", "イベント", "アルバム", "QRコード"];
  const paths = ["/", "/programList", "/photoalbum", "/qrreader"];

  const selectedIndex = paths.indexOf(currentPath);
  const [selectedIcon, setSelectedIcon] = useState(selectedIndex);
  
  const pathname = usePathname();
  const handleLogPost = async (previousTitle: string, newTitle: string) => {
    try {
      await postCollectionInLogs(
        "ページ移動",
        `${previousTitle} → ${newTitle}`,
        "成功"
      );
    } catch (error: any) {
      console.error("ログ記録中にエラーが発生しました:", error.message);
    }
  };
    const currentPAth = pathname?.replace(/^\//, "") || "home";
  // const handleLogPost = async (previousTitle: string, newTitle: string) => {
  //   try {
  //     await postCollectionInLogs(
  //       "ページ移動",
  //       `${previousTitle} → ${newTitle}`,
  //       "成功"
  //     );
  //   } catch (error: any) {
  //     console.error("ログ記録中にエラーが発生しました:", error.message);
  //   }
  // };

  // const [notificationUpdateFlag, setNotificationUpdateFlag] = useState(true);
  // const [isReadAllNotification, setIsReadAllNotification] = useState(true);

  // const checkReadAllNotification = async (uid: string) => {
  //   const notifications = await fetchNotificationInfo();
  //   const pushedNotifications = notifications.filter((notification) => {
  //     if (notification.pushUser.length === 0) {
  //       // 特定のユーザが指定されていなければ通知対象
  //       return true;
  //     }
  //     if (notification.pushUser.includes(uid)) {
  //       // 通知対象に入っていれば通知
  //       return true;
  //     }
  //     // それ以外は通知対象外
  //     return false;
  //   });
  //   pushedNotifications.forEach((notification: any) => {
  //     // 未読の通知が存在すればfalseに設定
  //     if (!notification.readUser.includes(uid)) {
  //       setIsReadAllNotification(false);
  //     }
  //   });
  // };

  // useEffect(() => {
  //   const notificationInfoCollectionRef = query(
  //     collection(db, "notificationInfo")
  //   );
  //   const unsubscribe = () =>
  //     onSnapshot(notificationInfoCollectionRef, (querySnapshot) => {
  //       setNotificationUpdateFlag(true);
  //     });
  //   return () => {
  //     unsubscribe();
  //   };
  // }, []);

  // useEffect(() => {
  //   (async () => {
  //     const user = await getUserFromCookie();
  //     if (!user) return;
  //     const uid = user.uid;
  //     if (notificationUpdateFlag) {
  //       await checkReadAllNotification(uid);
  //       setNotificationUpdateFlag(false);
  //     }
  //   })();
  // }, [notificationUpdateFlag]);

  return (
    <div className="fixed bottom-0 w-full border-t border-gray-300 z-30 bg-[#f5ffec] h-20">
      <div className="flex justify-around pt-2 pb-3 mx-4">
        {icons.map((icon, index) => (
          <Link href={paths[index]} key={index} className="justify-self-center items-self-center" >
            <button
              key={index}
              onClick={() => {
                // const previousTitle = title[selectedIcon];
                const newTitle = paths[index].replace(/^\//, "");
                setSelectedIcon(index);
                handleLogPost(currentPAth, newTitle); // ログ記録を実行
              }}
            >
              <Image src={icon} width={45} height={45} alt={icon}  />
              <div
                className={`text-xs mb-2 ${selectedIcon === index
                  ? "text-green-600 font-bold underline"
                  : "text-black"
                  }`}
              >
                {title[index]}
              </div>
            </button>
          </Link>
        ))}
      </div>
      <NotificationComponent />
    </div>
  );
}
