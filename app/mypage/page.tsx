import HeaderComponent from "@/app/ui/header";
import FooterComponent from "@/app/ui/footer";
import MyPageComponent from "@/app/ui/mypage";
import { Suspense } from "react";
import { HeaderSkeleton, LoadingAnimation } from "@/app/ui/skeletons";

export default function MyPage() {
  return (
    <main>
      <Suspense fallback={<HeaderSkeleton />}>
        <HeaderComponent />
      </Suspense>
      <div className="mt-20 pb-20">
        <Suspense fallback={<LoadingAnimation />}>
          <MyPageComponent />
        </Suspense>
      </div>
      <FooterComponent />
    </main>
  );
}