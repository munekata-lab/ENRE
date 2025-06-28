import LoadingComponent from "../ui/loading";
import HeaderComponent from "../ui/header";
import FooterComponent from "../ui/footer";
import { Suspense } from 'react';
import { LoadingAnimation } from "@/app/ui/skeletons";

export default function Loading() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen pb-20">
      <HeaderComponent />
      <Suspense fallback={<LoadingAnimation />}>
        <LoadingComponent />
      </Suspense>
      <FooterComponent />
    </main>
  );
}