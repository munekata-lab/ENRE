"use client";

import { useState, useEffect } from "react";
import MenuComponent from "./menu";
import { getUserFromCookie, getIPAddress } from "@/lib/session";
import { useRouter } from "next/navigation";
import { NotificationComponent } from "./notification";
import { fetchUserSettings, fetchMode } from "@/lib/dbActions";
// import { fetchNotificationInfo } from "@/lib/dbActions";
// import { collection, onSnapshot, query } from "firebase/firestore";
// import { db } from "@/lib/firebase/client";
import Image from "next/image";
import Link from "next/link";

export default function HeaderComponent() {
  const router = useRouter();
  const [nickName, setNickName] = useState("");
  const [dev, setDev] = useState(false);
  const [ipAddress, setIPAddress] = useState<string | null>("");

  // TODO できれば 通知アイコン
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



  useEffect(() => {
    (async () => {
      const user = await getUserFromCookie();
      !user && router.push("/login");
      const userSettings = await fetchUserSettings();
      const mode = await fetchMode(user?.uid);
      const nickName = userSettings.nickName;
      const dev = mode?.userMode;
      setNickName(nickName);
      setDev(dev);
      const ipAddress = await getIPAddress();
      setIPAddress(ipAddress);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid grid-cols-3 items-center shadow-md fixed top-0 w-full z-10 bg-[#f5ffec] h-20">
      <div className="col-start-1 justify-self-start items-center ml-3">
        <Link href="/notification" >
          <Image src="/noffication.png" width={60} height={60} alt="noffication" />
          {/* {isReadAllNotification && (<Image src="/noffication.png" width={60} height={60} alt="noffication" />)} */}
          {/* {!isReadAllNotification &&(<Image src="/nofficationWithBudge.png" width={60} height={60} alt="noffication" />)} */}
        </Link>
        <NotificationComponent />
      </div>
      <div className="col-start-2 font-mono text-xl justify-self-center items-center">
      <Link href="/" >
        <Image src="/title.png" width={180} height={80} alt="title" />
      </Link>
      </div>
      <div className="col-start-3 font-mono text-sm justify-self-end mr-3">
        <MenuComponent nickName={nickName} dev={dev} />
      </div>
    </div >
  );
}
