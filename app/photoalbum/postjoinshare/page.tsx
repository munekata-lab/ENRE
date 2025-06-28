import HeaderComponent from "@/app/ui/header";
import PostJoinShareComponent from "@/app/ui/postJoinSharePhoto";
import FooterComponent from "@/app/ui/footer";
import { Suspense } from "react";
import { HeaderSkeleton, LoadingAnimation } from "@/app/ui/skeletons";

export default function PostJoinSharePhoto() {
  return (
    <main>
      <Suspense fallback={<HeaderSkeleton />}>
        <HeaderComponent />
      </Suspense>
      <Suspense fallback={<LoadingAnimation />}>
        <PostJoinShareComponent />
      </Suspense>
      <FooterComponent />
    </main>
  );
}