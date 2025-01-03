import React from "react";
import { db } from "@/lib/firebase/client";
import { getUserFromCookie } from "@/lib/session";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { useEffect, useRef, useState, FormEvent, useCallback, ChangeEvent } from "react";
import HeaderComponent from "../ui/header";
import FooterComponent from "@/app/ui/footer";
import { Suspense } from "react";
import { HeaderSkeleton } from "../ui/skeletons";
import ProgramsList from "../ui/programList";
import MaintenanceComponent from "../ui/maintenance";
import { fetchMode } from "@/lib/dbActions";
import { redirect } from "next/navigation";

type Props = {
    targetDay: string;
  };

  export default async function ProgramListView() {
    const user = await getUserFromCookie();
    user === null && redirect("/login");
    const mode = await fetchMode(user?.uid);

    return (
        <main>
            <Suspense fallback={<HeaderSkeleton />}>
                <HeaderComponent />
            </Suspense>
            {(mode?.programListMode && mode?.userMode) || !mode?.programListMode ? ( //firestoreのmodeがtrue且つ開発者ユーザー、またはfirestoreのmodeがfalse
                <ProgramsList />
            ) : (
                <div className="mt-5 h-full w-full">
                  <MaintenanceComponent />
                </div>
            )}
            <FooterComponent />
        </main>
      );
}