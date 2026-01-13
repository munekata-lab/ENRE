"use server";

import { adminDB } from "@/lib/firebase/server";
import * as admin from 'firebase-admin';
import { arrayUnion } from "firebase/firestore";
import { getUserFromCookie } from "@/lib/session";
import { number, z } from "zod";
import type { Place } from "@/lib/type";
import SettingsGuideComponent from "@/app/ui/settingsGuide";
import { Timestamp } from 'firebase-admin/firestore';
import { collection, query, getDocs, limit, orderBy } from "firebase/firestore";
import { db } from "./firebase/client";

export type User = {
  checkinProgramIds: string[];
  createdAt: Timestamp;
  currentPlace: string;
  dev: boolean;
  form: { [key: string]: boolean };
  giPoint: number;
  likes: string[];
  notification: {
    createdAt: Timestamp;
    id: string;
    isNotify: boolean;
  };
  participated: { [key: number]: number };
  prevReward: number;
  reward: number;
  rewardField: {
    C: number;
    N: number;
    O: number;
    field1: number;
    field2: number;
    field3: number;
  };
  settings: {
    modeOfTransportation: string;
    nickName: string;
    notification: boolean;
    timeTable: { [key: number]: boolean[] };
  };
  settingsGuide: boolean;
  totalReward: number;
  university: boolean;
  biomeUserName?: string;
};
// ★★★ ここまで追加 ★★★

// --- Photos ---

export async function fetchLimitedNumberPhotosInfo(num: Number) {
  const photosCollection = await adminDB
    .collection("photos")
    .orderBy("date", "desc")
    .limit(num)
    .get();

  const photosPathList = await Promise.all(
    photosCollection.docs.map(async (photo: any) => {
      const id = photo.id;
      const photoData = photo.data();
      const userInfoMatchUid = await adminDB
        .collection("users")
        .doc(photoData.uid)
        .get();
      const nickName = userInfoMatchUid.data().settings.nickName;
      const currentDate = new Date();
      const postDate = photoData.date.toDate();

      const setPostDateString = (postDate: Date) => {
        const diffDate = currentDate.getTime() - postDate.getTime();
        if (diffDate < 3600000) {
          return `${Math.floor(diffDate / 60000)}分前`;
        } else if (diffDate < 86400000) {
          return `${Math.floor(diffDate / 3600000)}時間前`;
        } else if (diffDate < 604800000) {
          return `${Math.floor(diffDate / 86400000)}日前`;
        }
        return `${postDate.getFullYear()}年${postDate.getMonth() + 1}月${postDate.getDate()}日`;
      };

      const postDateString = setPostDateString(postDate);

      return {
        id: id,
        nickName: nickName,
        fav: photoData.fav,
        url: photoData.url,
        place: photoData.place,
        postDate: postDateString,
      };
    })
  );
  return photosPathList;
}

export async function fetchLikesPhoto() {
  const user = await getUserFromCookie();
  if (!user) return null;
  const uid = user.uid;
  const userRef = await adminDB.collection("users").doc(uid).get();
  const likes = userRef.data().likes;
  return likes;
}

export async function patchUserLikesPhoto(likes: string[]) {
  const user = await getUserFromCookie();
  if (!user) return false;
  const uid = user.uid;
  await adminDB
    .collection("users")
    .doc(uid)
    .set({ likes: likes }, { merge: true })
    .catch((error: Error) => {
      return false;
    });
  return true;
}

export async function patchPhotoFavNum(photoId: string, newFavNum: number) {
  try {
    await adminDB.collection("photos").doc(photoId).update({ fav: newFavNum });
    return true;
  } catch (error) {
    return false;
  }
}

// --- Logs ---

export async function postCollectionInLogs(
  title: string,
  place: string,
  state: string
) {
  const user = await getUserFromCookie();
  if (!user) throw new Error("ログインしてください");
  const uid = user.uid;
  const logData = {
    title: title,
    place: place,
    state: state,
    date: new Date(),
    uid: uid,
  };
  await adminDB
    .collection("logs")
    .add(logData)
    .catch((error: Error) => {
      throw new Error(error.message);
    });
}

// --- Documents ---

export async function postDocument(
  programId: string,
  document: string,
) {
  const user = await getUserFromCookie();
  if (!user) throw new Error("ログインしてください");
  const uid = user.uid;
  const logData = {
    programId: programId,
    document: document,
    date: new Date(),
    uid: uid,
  };
  await adminDB
    .collection("expressFeelings")
    .add(logData)
    .catch((error: Error) => {
      throw new Error(error.message);
    });
}

// --- User ---

export async function postUserInfo(uid: string, nickName: string) {
  const initialTimeTable: { [key: number]: boolean[] } = Object.fromEntries(
    Array.from({ length: 6 }, (_, i) => [i, Array(3).fill(false)])
  );
  const userInfo = {
    checkinProgramIds: [],
    likes: [],
    createdAt: new Date(),
    reward: 0,
    totalReward: 0,
    currentPlace: "none",
    notification: {
      isNotify: false,
      id: "",
      createdAt: new Date(),
    },
    settings: {
      nickName: nickName,
      modeOfTransportation: "",
      timeTable: initialTimeTable,
    },
    settingsGuido: true,
    dev: false,
    university: false,
    form: {
      1: false,
      2: false,
    },
    rewardField: {
      C: 0,
      N: 0,
      O: 0,
      field1: 0,
      field2: 0,
      field3: 0,
    },
    giPoint: 0,
  };
  await adminDB
    .collection("users")
    .doc(uid)
    .set(userInfo)
    .catch((error: Error) => {
      console.log(error);
    });
}

export async function postUserSettings(prevState: any, formData: FormData) {
  const user = await getUserFromCookie();
  if (!user) throw new Error("ログインしてください");
  const uid = user.uid;

  const schema = z.object({
    nickName: z.string().max(10, "ニックネームは10文字以内で入力してください"),
  });

  try {
    const { nickName } = schema.parse({
      nickName: formData.get("nickName"),
    } as z.infer<typeof schema>);

    const settings = {
      notification: true,
      nickName: nickName,
      modeOfTransportation:
        formData.get("modeOfTransportation")?.toString() || "",
      timeTable: JSON.parse(formData.get("timeTable") as string),
    };
    await adminDB
      .collection("users")
      .doc(uid)
      .set({ settings }, { merge: true });
    return {
      message: "success",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        message: error.issues[0].message,
      };
    }
    return {
      message: "パスワードが間違っているか、アカウントが存在しません",
    };
  }
}

export async function fetchUserSettings() {
  const user = await getUserFromCookie();
  if (!user) return null;
  const uid = user.uid;
  const userRef = await adminDB.collection("users").doc(uid).get();
  const settings = userRef.data().settings;

  const newSettings = settings as any;
  return newSettings;
}

// --- Programs ---

export async function fetchQrInfo(programId: string, qrId: string) {
  const qrRef = await adminDB
    .collection("new_program")
    .doc(programId)
    .collection("qr_codes")
    .doc(qrId)
    .get();
  const qrInfo = qrRef.data();

  // Timestampを文字列に変換
  if (qrInfo && qrInfo.createdAt) {
    qrInfo.createdAt = qrInfo.createdAt.toDate().toISOString();
  }

  return qrInfo;
}

export async function fetchProgramInfo(programId: string) {
  // サーバーサイドのAdmin SDKを使用していることを確認
  const programRef = await adminDB.collection("new_program").doc(programId).get();

  if (!programRef.exists) {
    console.error(`Program with ID: ${programId} not found.`);
    // 存在しない場合は、エラー処理に適した空のオブジェクトやnullを返す
    // ここでは、必須フィールドを含むデフォルトオブジェクトを返して、型エラーを回避する
    return {
      title: "Not Found",
      content: "",
      thema: "",
      completionMessage: "",
      place: "",
      owner: "",
      loadingPoint: 0,
      point: 0,
      field: "",
      type: "",
      schedule: [], // scheduleの空配列を必ず含める
    };
  }

  const programData = programRef.data();

  // schedule内のTimestampを文字列に変換
  if (programData.schedule) {
    programData.schedule = programData.schedule.map((s: any) => {
      const newS = { ...s };
      if (newS.open && newS.open.toDate) {
        newS.open = newS.open.toDate().toISOString();
      }
      if (newS.close && newS.close.toDate) {
        newS.close = newS.close.toDate().toISOString();
      }
      return newS;
    });
  }

  // ドキュメントの全データをそのまま返す
  return programData;
}

export async function fetchProgramInfo2(type: string) {
  const programRef2 = await adminDB.collection("explain").doc(type).get();
  const programInfo2 = programRef2.data();
  return programInfo2;
}

// --- Rewards ---

export async function fetchReward2() {
  const user = await getUserFromCookie();
  if (!user) return { currentReward: 0, prevReward: 0 , reward1: 0, reward2: 0, reward3: 0 , enre2024_7reward: 0 };
  const uid = user.uid;
  const userRef = await adminDB.collection("users").doc(uid).get();
  const enre2024_7reward: number = userRef.data().reward || 0;
  const currentReward: number = userRef.data().totalReward || enre2024_7reward;
  const prevReward: number = userRef.data().prevReward || 0;
  {/* 各属性のポイントを取得しないといけない */}
  const rewardField = userRef.data().rewardField || {}; // rewardFieldが存在しない場合に空のオブジェクトをデフォルトで設定する
  const reward1: number = rewardField.field1 || 0;
  const reward2: number = rewardField.field2 || 0;
  const reward3: number = rewardField.field3 || 0;
  // console.log(currentReward, reward1, reward2, reward3, enre2024_7reward);

  return { currentReward, prevReward, reward1, reward2, reward3, enre2024_7reward };
}

export async function patchReward2(point: string, field: string) {
  const user = await getUserFromCookie();
  if (!user) return;
  const uid = user.uid;
  try {
    const { currentReward, reward1, reward2, reward3 } = await fetchReward2();
    const nextReward = currentReward + Number(point);
    let next1 = reward1;
    let next2 = reward2;
    let next3 = reward3;
    if (field === "1") {
      next1 = reward1 + Number(point);
    }
    if (field === "2") {
      next2 = reward2 + Number(point);
    }
    if (field === "3") {
      next3 = reward3 + Number(point);
    }
    if (currentReward === 0 && nextReward > 0) {
      try {
        // ログに記録
        await postCollectionInLogs("初回報酬", "start", "start");
    
        // Firestoreのuids配列にUIDを追加
        const rewardRef = await adminDB.collection("rewardProgress").doc("01");
        await rewardRef.update({
          uids: admin.firestore.FieldValue.arrayUnion(uid),
        });
      } catch (error) {
        console.error("初回報酬の処理中にエラーが発生しました:", error);
      }
    }
    if (nextReward >= 100 && currentReward < 100) {
      await postCollectionInLogs("100ポイント達成", "100", "100");
    }
    if (nextReward >= 500 && currentReward < 500) {
      await postCollectionInLogs("500ポイント達成", "500", "500");
    }

    const evoThresholdList = [0, 6, 50, 100, 500];
    const getEvoState = (reward: number) => {
        if (reward < evoThresholdList[1]) return 1;
        if (reward < evoThresholdList[2]) return 2;
        if (reward < evoThresholdList[3]) return 3;
        return 4;
    };

    const currentEvoState = getEvoState(currentReward);
    const nextEvoState = getEvoState(nextReward);

    if (nextEvoState > currentEvoState) {
        await postCollectionInLogs(`ガマちゃんがLv.${nextEvoState}に進化した`, "evolution", `Lv.${currentEvoState} -> Lv.${nextEvoState}`);
    }

    await adminDB.collection("users").doc(uid).set(
      {
        totalReward: nextReward,
        prevReward: currentReward,
        rewardField: {
          field1: next1,
          field2: next2,
          field3: next3,
        },
      },
      { merge: true }
    );
  } catch (error) {
    console.log(error);
  }
}

// --- Settings ---

export async function patchSettingsGuide() {
  const user = await getUserFromCookie();
  if (!user) return;
  const uid = user.uid;
  try {
    try {
      // ログに記録
      await postCollectionInLogs("初期設定完了", "start", "start");

    } catch (error) {
      console.error("初気設定の処理中にエラーが発生しました:", error);
    }
    await adminDB.collection("users").doc(uid).set(
      {
        settingsGuide: false,
      },
      { merge: true }
    );
  } catch (error) {
    console.log(error);
  }
}

// --- Check-in ---

export async function patchCheckinProgramIds(programId: string) {
  const user = await getUserFromCookie();
  if (!user) return;
  const uid = user.uid;
  try {
    const userRef = await adminDB.collection("users").doc(uid).get();
    const checkinProgramIds = userRef.data().checkinProgramIds || [];
    checkinProgramIds.push(programId);
    const newCheckinProgramIds = [...new Set(checkinProgramIds)];
    await adminDB
      .collection("users")
      .doc(uid)
      .set({ checkinProgramIds: newCheckinProgramIds }, { merge: true });
  } catch (error) {
    console.log(error);
  }
}

export async function patchCheckoutProgramIds(programId: string) {
  const user = await getUserFromCookie();
  if (!user) return;
  const uid = user.uid;
  try {
    const userRef = await adminDB.collection("users").doc(uid).get();
    const checkinProgramIds = userRef.data().checkinProgramIds || [];
    const newCheckinProgramIds = checkinProgramIds.filter(
      (id: string) => id !== programId
    );
    await adminDB
      .collection("users")
      .doc(uid)
      .set({ checkinProgramIds: newCheckinProgramIds }, { merge: true });
  } catch (error) {
    console.log(error);
  }
}

export async function fetchCheckinProgramIds() {
  const user = await getUserFromCookie();
  if (!user) return [];
  const uid = user.uid;
  try {
    const userRef = await adminDB.collection("users").doc(uid).get();
    const checkinProgramIds: any[] = userRef.data().checkinProgramIds || [];
    return checkinProgramIds;
  } catch (error) {
    console.log(error);
    throw new Error("プログラムの取得に失敗しました");
  }
}

// --- Programs (All) ---

export async function fetchAllOnlinePrograms() {
  try {
    const programRef = await adminDB
      .collection("program")
      .where("isOpen", "==", true)
      .get();
    const programList: any[] = programRef.docs.map((program: any) => {
      const programData = program.data();
      return programData;
    });
    return programList;
  } catch (error) {
    console.log(error);
    throw new Error("プログラムの取得に失敗しました");
  }
}

// --- Signature ---

export async function postSignature(sign: string) {
  try {
    const signatureRef = await adminDB.collection("signature").add({
      sign: sign,
      date: new Date(),
    });
    return signatureRef.id;
  } catch (error) {
    console.log(error);
  }
}

// --- Place ---

export async function fetchPlace2(docId: string) {
  try {
    if (!docId) return { placeName: "ドキュメントがない", placeCongestion: 0 };

    const placeRef = await adminDB.collection("place").doc(docId).get();
    const placeData = placeRef.data();

    if (!placeData) {
      return { placeName: "(取得失敗)", placeCongestion: 0, placeThreshold: [10,20,30] };
    }

    const placeName: string = placeData.name || "";
    const placeCongestion: number = placeData.congestion || 0;
    const placeThreshold: Array<number> = placeData.threshold || [10,20,30];

    return { placeName, placeCongestion, placeThreshold };
  } catch (error) {
    console.log(error);
    // エラーが発生した場合、エラー処理を行うか、適切なデフォルト値を返すことも考慮する
    return { placeName: "エラー発生", placeCongestion: 0 };
  }
}

export async function fetchCurrentPlace() {
  const user = await getUserFromCookie();
  if (!user) return "none";
  const uid = user.uid;
  try {
    const userRef = await adminDB.collection("users").doc(uid).get();
    const biomeUserName: string = userRef.data().currentPlace || "none";
    return biomeUserName;
  } catch (error) {
    console.log(error);
    return "none";
  }
}

export async function patchCurrentPlace(place: string) {
  const user = await getUserFromCookie();
  if (!user) return null;
  const uid = user.uid;
  try {
    await adminDB
      .collection("users")
      .doc(uid)
      .set({ currentPlace: place }, { merge: true });
  } catch (error) {
    console.log(error);
    return null;
  }
}

/**
 * いずれかの場所の最新の更新日時を取得します。
 * @returns {Promise<Timestamp | null>} FirestoreのTimestampオブジェクト、またはデータがない場合はnull。
 */
export const getLatestPlaceUpdateTime = async () => {
  try {
    const placeCollectionRef = query(
      collection(db, "place"),
      orderBy("updatedAt", "desc"), // updatedAtで降順に並び替え
      limit(1) // 最初の1件のみ取得
    );
    const snapshot = await getDocs(placeCollectionRef);
    if (snapshot.empty) {
      return null;
    }
    const docData = snapshot.docs[0].data();
    return docData.updatedAt; // Timestampオブジェクトを返す
  } catch (error) {
    console.error("Error fetching latest place update time:", error);
    return null;
  }
};

// --- Mode ---

export async function fetchMode(uid: string) {
  try {
    const modeRef = await adminDB.collection("mode").doc("mode").get();
    const modeDev = modeRef.data().dev;
    const modeProgramList = modeRef.data().programList;
    const modePhotoalbum = modeRef.data().photoalbum;
    const form = modeRef.data().form;
    const userRef = await adminDB.collection("users").doc(uid).get();
    const userMode = userRef.data().dev;
    const userSettingsGuideMode = userRef.data().settingsGuide;
    return {
      webMode: modeDev,
      programListMode: modeProgramList,
      photoalbumMode: modePhotoalbum,
      form: form,
      userMode: userMode,
      settingsGuide: userSettingsGuideMode,
    };
  } catch (error) {
    console.log(error);
  }
}

// --- Biome ---

export async function patchBiomeUserName(prevState: any, formData: FormData) {
  const user = await getUserFromCookie();
  if (!user) return { message: "ログインしてください" };
  const uid = user.uid;
  const schema = z.object({
    userName: z.string(),
  });
  try {
    const { userName } = schema.parse({
      userName: formData.get("biomeName"),
    } as z.infer<typeof schema>);
    const trimmedUserName = userName.trimStart();
    await adminDB
      .collection("users")
      .doc(uid)
      .set({ biomeUserName: trimmedUserName }, { merge: true });
    return { message: "success" };
  } catch (error) {
    console.log(error);
    return { message: "ユーザー名の登録に失敗しました" };
  }
}

export async function fetchBiomeUserName() {
  const user = await getUserFromCookie();
  if (!user) return "";
  const uid = user.uid;
  try {
    const userRef = await adminDB.collection("users").doc(uid).get();
    const biomeUserName = userRef.data().biomeUserName || "";
    return biomeUserName;
  } catch (error) {
    console.log(error);
    return "";
  }
}

// --- Events ---

export async function fetchParticipatedEvents() {
  // const initialParticipatedEvents: { [key: number]: number } = {
  //   1: 0,
  //   2: 0,
  //   3: 0,
  //   4: 0,
  //   5: 0,
  //   6: 0,
  //   7: 0,
  //   8: 0,
  //   9: 0,
  //   10: 0,
  //   11: 0,
  //   12: 0,
  // };
  const initialParticipatedEvents: { [key: number]: number } = {};
  {/* ゆくゆくは自動でイベント数用意されるようにしたい */}
  for (let i = 1; i <= 13; i++) {
    initialParticipatedEvents[i] = 0;
  }
  const user = await getUserFromCookie();
  if (!user) return initialParticipatedEvents;
  const uid = user.uid;
  try {
    const userRef = await adminDB.collection("users").doc(uid).get();
    const participatedEvents: { [key: number]: number } =
      userRef.data().participated || initialParticipatedEvents;
    return participatedEvents;
  } catch (error) {
    console.log(error);
    return initialParticipatedEvents;
  }
}

export async function patchParticipatedEvents(eventId: string) {
  const user = await getUserFromCookie();
  if (!user) return;
  const uid = user.uid;
  try {
    const participatedEvents = await fetchParticipatedEvents();
    participatedEvents[Number(eventId)] += 1;
    await adminDB
      .collection("users")
      .doc(uid)
      .set({ participated: participatedEvents }, { merge: true });
  } catch (error) {
    console.log(error);
    return;
  }
}

// --- Notifications ---

export async function fetchNotificationInfo() {
  const notificationsCollection = await adminDB
    .collection("notificationInfo")
    .orderBy("createdAt", "desc")
    .get();

  const notificationsList = await Promise.all(
    notificationsCollection.docs.map(async (notification: any) => {
      const id = notification.id;
      const title = notification.data().title;
      const body = notification.data().body;
      const readUser = notification.data().readUser;
      const pushUser = notification.data().pushUser
        ? notification.data().pushUser
        : [];
      const createdAt = notification.data().createdAt.toDate();
      const currentDate = new Date();

      const setPostDateString = (postDate: Date) => {
        const diffDate = currentDate.getTime() - postDate.getTime();
        if (diffDate < 3600000) {
          return `${Math.floor(diffDate / 60000)}分前`;
        } else if (diffDate < 86400000) {
          return `${Math.floor(diffDate / 3600000)}時間前`;
        } else if (diffDate < 604800000) {
          return `${Math.floor(diffDate / 86400000)}日前`;
        }
        return `${postDate.getFullYear()}年${postDate.getMonth() + 1}月${postDate.getDate()}日`;
      };

      const postDateString = setPostDateString(createdAt);

      return {
        id: id,
        title: title,
        body: body,
        postDate: postDateString,
        isRead: false,
        readUser: readUser,
        pushUser: pushUser,
      };
    })
  );

  return notificationsList;
}

// --- Board ---

export async function fetchBoardInfo(): Promise<any | null> {
  const user = await getUserFromCookie();
  if (!user) return null;
  const uid = user.uid;
  try {
    const boardRef = await adminDB
      .collection("board")
      .orderBy("createdAt", "desc")
      .get();
    const boardInfo = boardRef.docs.map((doc: any) => {
      const boardData = doc.data();
      if (!boardData.uids.includes(uid)) {
        return null;
      }
      return boardData;
    });
    const fileteredBoardInfo = boardInfo.filter((board: any) => board !== null);
    if (fileteredBoardInfo.length === 0) return null;
    return fileteredBoardInfo[0];
  } catch (error) {
    console.log(error);
    return null;
  }
}

// --- Admin/Export ---

export async function fetchRewardProgressInfo(): Promise<any | null> {
  const user = await getUserFromCookie();
  if (!user) return null;
  const uid = user.uid;
  // console.log("uid: ", uid);
  try {
    const rewardProgressRef = await adminDB
      .collection("rewardProgress")
      .orderBy("createdAt", "desc")
      .get();
    // console.log("rewardProgressRef: ", rewardProgressRef);
    const rewardProgressInfo = rewardProgressRef.docs.map((doc: any) => {
      const rewardProgressData = doc.data();
      if (!rewardProgressData.uids.includes(uid)) {
        return null;
      }
      return { ...rewardProgressData, id: doc.id };
    });
    // console.log("rewardProgressInfo: ",rewardProgressInfo)
    const fileteredRewardProgressInfo = rewardProgressInfo.filter((rewardProgress: any) => rewardProgress !== null);
    // console.log(fileteredRewardProgressInfo);
    if (fileteredRewardProgressInfo.length === 0) return null;
    return fileteredRewardProgressInfo[0];
  } catch (error) {
    console.log(error);
    return null;
  }
}

// UID に基づいてデータを削除
export async function deleteDocumentByUID(collectionName: string) {
  // console.log("通過");
  const user = await getUserFromCookie(); // 現在のユーザーを取得
  if (!user) return null; // ユーザーがいない場合は終了

  const uid = user.uid; // 現在のユーザーの UID を取得

  try {
    // Firestore ドキュメントの参照を取得
    const userRef = await adminDB.collection("rewardProgress").doc(collectionName).get();
    // console.log("userRef: ", userRef);

    // ドキュメントが存在しない場合
    if (!userRef.exists) {
      return { message: "Document does not exist" };
    }

    // uid フィールドの値を取得
    const userData = userRef.data();
    // console.log("userData: ", userData);
    const userArray = userData?.uids || [];
    // console.log("userArray: ", userArray);

    // UID 配列に現在の UID が含まれている場合、その UID を削除
    if (userArray.includes(uid)) {
      // UID を削除
      await adminDB.collection("rewardProgress")
        .doc(collectionName)
        .update({
          uids: admin.firestore.FieldValue.arrayRemove(uid)
        });
      return { message: "UID deleted successfully" };
    } else {
      return { message: "UID not found in array" };
    }
  } catch (error) {
    console.error(`Error deleting UID from document ${collectionName}: `, error);
    return { message: "Deletion failed", error };
  }
}

export async function getBiomeCollection() {
  const biomeCollection = await adminDB
    .collection("biome")
    .orderBy("date", "desc")
    .get();
  const biomes = biomeCollection.docs.map((biome: any) => {
    const data = biome.data();
    const date = data.date.toDate();

    const year = date.getFullYear().toString().padStart(4, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hour = date.getHours().toString().padStart(2, "0");
    const minute = date.getMinutes().toString().padStart(2, "0");
    const second = date.getSeconds().toString().padStart(2, "0");

    const datestring = `${year}年${month}月${day}日 ${hour}:${minute}:${second}`;

    return {
      date: datestring,
      fullPath: data.fullPath,
      name: data.name,
      note: data.note,
      reward: data.reward,
      uid: data.uid,
      url: data.url,
    };
  });
  return biomes;
}

export async function getLeavesCollection() {
  const leavesCollection = await adminDB
    .collection("fallenLeaves")
    .orderBy("date", "desc")
    .get();
  const leaves = leavesCollection.docs.map((leave: any) => {
    const data = leave.data();
    const date = data.date.toDate();
    const fullPath = data.fullPath;
    const place = data.place;
    const reward = data.reward;
    const uid = data.uid;
    const url = data.url;

    const year = date.getFullYear().toString().padStart(4, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hour = date.getHours().toString().padStart(2, "0");
    const minute = date.getMinutes().toString().padStart(2, "0");
    const second = date.getSeconds().toString().padStart(2, "0");

    const datestring = `${year}年${month}月${day}日 ${hour}:${minute}:${second}`;

    return {
      date: datestring,
      fullPath: fullPath,
      place: place,
      reward: reward,
      uid: uid,
      url: url,
    };
  });

  return leaves;
}

export async function getLogsCollection(startDate?: string, endDate?: string) {
  let query: admin.firestore.Query = adminDB.collection("logs");

  if (startDate) {
    query = query.where("date", ">=", admin.firestore.Timestamp.fromDate(new Date(startDate)));
  }
  if (endDate) {
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999); // 該当日を丸ごと含めるために時刻を23:59:59に設定
    query = query.where("date", "<=", admin.firestore.Timestamp.fromDate(endOfDay));
  }

  const logsCollection = await query.orderBy("date", "desc").get();

  const logs = logsCollection.docs.map((log: any) => {
    const data = log.data();
    const date = data.date.toDate();

    // JSTに変換してフォーマット
    const jstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
    const dateString = jstDate.toISOString().replace('T', ' ').substring(0, 19);

    return {
      date: dateString,
      state: data.state || "",
      title: data.title || "",
      place: data.place || "",
      uid: data.uid || "",
    };
  });

  return logs;
}

export async function getUsers() {
  const usersCollection = await adminDB
    .collection("users")
    .orderBy("createdAt", "desc")
    .get();
  const users = usersCollection.docs.map((user: any) => {
    const userData = user.data();
    const uid = user.id;
    const biomeName = userData.biomeUserName ? userData.biomeUserName : "";
    const checkinProgramIds = userData.checkinProgramIds;
    const reward = userData.reward;
    const settings = userData.settings;
    const modeOfTransportation = settings.modeOfTransportation;
    const nickName = settings.nickName;
    const university = userData.university;
    const dev = userData.dev || false; 
    const participated = userData.participated || {};

    return {
      uid: uid,
      biomeUserName: biomeName,
      checkinProgramIds: checkinProgramIds,
      reward: reward,
      modeOfTransportation: modeOfTransportation,
      nickName: nickName,
      university: university,
      dev: dev,
      participated: participated,
    };
  });

  return users;
}

export async function getPlace() {
  const placeCollection = await adminDB
    .collection("place")
    .orderBy("id", "asc")
    .get();
  const places = placeCollection.docs.map((place: any) => {
    const data = place.data();
    const center = data.center;
    const congestion = data.congestion;
    const id = data.id;
    const name = data.name;
    const updatedAt = data.updatedAt;
    if (updatedAt === undefined) return;

    const currentDate = new Date();

    const setPostDateString = (postDate: Date) => {
      const diffDate = currentDate.getTime() - postDate.getTime();
      if (diffDate < 3600000) {
        return `${Math.floor(diffDate / 60000)}分前`;
      } else if (diffDate < 86400000) {
        return `${Math.floor(diffDate / 3600000)}時間前`;
      } else if (diffDate < 604800000) {
        return `${Math.floor(diffDate / 86400000)}日前`;
      }
      return `${postDate.getFullYear()}年${postDate.getMonth() + 1}月${postDate.getDate()}日`;
    };
    const dateString = setPostDateString(updatedAt.toDate());

    return {
      congestion: congestion,
      id: id,
      name: name,
      updatedAt: dateString,
    };
  });

  const result = places.filter((place: any) => place !== undefined);
  return result;
}

// 引数に qrId?: string を追加
export async function addQrCodeToProgram(programId: string, qrData: object, qrId?: string) {
  try {
    const qrCodesCollectionRef = adminDB
      .collection("new_program")
      .doc(programId)
      .collection("qr_codes");

    if (qrId) {
      // IDが指定されている場合は doc(qrId).set() を使用
      await qrCodesCollectionRef.doc(qrId).set(qrData);
      console.log("指定IDでドキュメントを追加しました。ID:", qrId);
      return qrId;
    } else {
      // ID指定がない場合は add() で自動生成
      const newQrDocRef = await qrCodesCollectionRef.add(qrData);
      console.log("サブコレクションに自動IDで追加しました。ID:", newQrDocRef.id);
      return newQrDocRef.id;
    }

  } catch (error) {
    console.error("サブコレクションへのドキュメント追加に失敗しました:", error);
    throw error;
  }
}


// --- Unused Functions ---

/*
export async function fetchPhotosInfo() {
  const photosCollection = await adminDB
    .collection("photos")
    .orderBy("date", "desc")
    .get();
  const photosPathList = await Promise.all(
    photosCollection.docs.map(async (photo: any) => {
      const id = photo.id;
      const photoData = photo.data();
      const userInfoMatchUid = await adminDB
        .collection("users")
        .doc(photoData.uid)
        .get();
      const nickName = userInfoMatchUid.data().settings.nickName;
      const currentDate = new Date();
      const postDate = photoData.date.toDate();

      const setPostDateString = (postDate: Date) => {
        const diffDate = currentDate.getTime() - postDate.getTime();
        if (diffDate < 3600000) {
          return `${Math.floor(diffDate / 60000)}分前`;
        } else if (diffDate < 86400000) {
          return `${Math.floor(diffDate / 3600000)}時間前`;
        } else if (diffDate < 604800000) {
          return `${Math.floor(diffDate / 86400000)}日前`;
        }
        return `${postDate.getFullYear()}年${postDate.getMonth()}月${postDate.getDate()}日`;
      };
      
      const postDateString = setPostDateString(postDate);

      return {
        id: id,
        nickName: nickName,
        fav: photoData.fav,
        url: photoData.url,
        place: photoData.place,
        postDate: postDateString,
      };
    })
  );
  return photosPathList;
}

export async function fetchReward() {
  const user = await getUserFromCookie();
  if (!user) return { currentReward: 0, prevReward: 0 , rewardC: 0, rewardN: 0, rewardO: 0, gip: 0};
  const uid = user.uid;
  const userRef = await adminDB.collection("users").doc(uid).get();
  const currentReward: number = userRef.data().reward || 0;
  const prevReward: number = userRef.data().prevReward || 0;
  const rewardFieldCNO = userRef.data().rewardField || {}; 
  const rewardC: number = rewardFieldCNO.C || 0;
  const rewardN: number = rewardFieldCNO.N || 0;
  const rewardO: number = rewardFieldCNO.O || 0;

  const gip: number = userRef.data().giPoint || 0;
  return { currentReward, prevReward, rewardC, rewardN, rewardO, gip};
}

export async function patchReward(rewardPoint: string, rewardField: string, gipoint: string) {
  const user = await getUserFromCookie();
  if (!user) return;
  const uid = user.uid;
  try {
    const { currentReward, rewardC, rewardN, rewardO, gip } = await fetchReward();
    const nextReward = currentReward + Number(rewardPoint);
    let nextgip = gip + Number(gipoint);
    let nextC = rewardC;
    let nextN = rewardN;
    let nextO = rewardO;
    if (rewardField === "C") {
      nextC = rewardC + Number(rewardPoint);
    }
    if (rewardField === "N") {
      nextN = rewardN + Number(rewardPoint);
    }
    if (rewardField === "O") {
      nextO = rewardO + Number(rewardPoint);
    }
    if (currentReward === 0 && nextReward > 0) {
      try {
        await postCollectionInLogs("初回報酬", "start", "start");
    
        const rewardRef = await adminDB.collection("rewardProgress").doc("01");
        await rewardRef.update({
          uids: admin.firestore.FieldValue.arrayUnion(uid),
        });
      } catch (error) {
        console.error("初回報酬の処理中にエラーが発生しました:", error);
      }
    }
    if (nextReward >= 100 && currentReward < 100) {
      await postCollectionInLogs("100ポイント達成", "100", "100");
    }
    if (nextReward >= 500 && currentReward < 500) {
      await postCollectionInLogs("500ポイント達成", "500", "500");
    }
    await adminDB.collection("users").doc(uid).set(
      {
        reward: nextReward,
        prevReward: currentReward,
        rewardField: {
          C: nextC,
          N: nextN,
          O: nextO,
        },
        giPoint: nextgip,
      },
      { merge: true }
    );
  } catch (error) {
    console.log(error);
  }
}

export async function fetchAllPrograms() {
  console.log("Program fetch Executed!")
  const programRef = await adminDB.collection("new_program").get();
  const programList: any[] = programRef.docs.map((program: any) => {
    const programData = program.data();
    return programData;
  });
  return programList;
}

export async function fetchPlace(docId?: string) {
  try {
    const placeRef = docId
      ? await adminDB.collection("place").doc(docId).get()
      : await adminDB.collection("place").get();
    const placeList = placeRef.docs.map((place: any) => {
      const placeData: Place = place.data();
      return placeData;
    });
    return placeList;
  } catch (error) {
    console.log(error);
  }
}

export async function getProgramsByDay(targetDay: string) {
  const ProgramsCollection = await adminDB
    .collection("new_program")
    .where("days", "array-contains", targetDay) 
    .get();

  const programs = ProgramsCollection.docs.map((doc: any) => {
    const data = doc.data();
    return {
      uid: doc.id,
      title: data.title,
      content: data.content,
      place: data.place,
      owner: data.owner,
      point: data.point,
      schedule: data.schedule,
      open: data.open, 
      close: data.close, 
    };
  });

  return programs;
}

export async function getNotificationToken() {
  const notificationTokenCollection = await adminDB
    .collection("notificationToken")
    .get();

  const tokens = notificationTokenCollection.docs.map((doc: any) => {
    const uid = doc.data().uid;
    return uid;
  });
  return tokens;
}
*/