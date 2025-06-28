import HeaderComponent from "@/app/ui/header";
import CompleteComponent from "../ui/complete";
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
        <CompleteComponent />
      </Suspense>
      <FooterComponent />
    </main>
  );
}