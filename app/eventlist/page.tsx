import HeaderComponent from "../ui/header";
import FooterComponent from "@/app/ui/footer";
import EventButtonComponent from "../ui/eventbutton";
import EventDetail2Component from "../ui/eventDetail2";
import { Suspense } from "react";
import { HeaderSkeleton } from "../ui/skeletons";
import Link from "next/link";

export default function EventList(
  {
    searchParams,
  }: {
    searchParams?: {
      key?: string;
      value?: string;
    };
  }
) {
  const key = searchParams?.key || '';
  const value = searchParams?.value || '';

  return (
    <main className="grid grid-rows-base-layout min-h-screen w-full pb-40 overflow-auto justify-items-center items-center mt-20">
        <Suspense fallback={<HeaderSkeleton />}>
            <HeaderComponent />
        </Suspense>
        {/* TODO 1 マップ 絞り込み(ButtonCompornentをけしてDetailに書く) 一番下 */}
        <EventButtonComponent />
        <EventDetail2Component key={key} value={value} />

        {/* <p className="text-lg font-bold text-center">
          現在メンテナンス中です
        </p>
        <Link
            href="https://kankyoseisaku.pupu.jp/enre/#about"
            target="_blank"
            className="m-0 text-blue-600 underline"
          >
            イベントリストはこちらから
          </Link> */}
        <FooterComponent />
    </main>
  );
}
