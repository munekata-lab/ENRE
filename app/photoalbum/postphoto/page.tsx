import HeaderComponent from "@/app/ui/header";
import PostPhotoComponent from "@/app/ui/postPhoto";
import FooterComponent from "@/app/ui/footer";
import { Suspense } from "react";
import { HeaderSkeleton, LoadingAnimation } from "@/app/ui/skeletons";

export default function PostPhoto() {
  return (
    <main>
      <Suspense fallback={<HeaderSkeleton />}>
        <HeaderComponent />
      </Suspense>
      <Suspense fallback={<LoadingAnimation />}>
        <PostPhotoComponent />
      </Suspense>
      <FooterComponent />
    </main>
  );
}