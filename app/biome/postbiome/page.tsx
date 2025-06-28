import HeaderComponent from "../../ui/header";
import FooterComponent from "../../ui/footer";
import PostBiomeComponent from "../../ui/postBiome";
import { Suspense } from 'react';
import { LoadingAnimation } from "@/app/ui/skeletons";

export default function PostBiome() {
  return (
    <main className="grid grid-rows-base-layout h-screen w-full">
      <HeaderComponent />
      <Suspense fallback={<LoadingAnimation />}>
        <PostBiomeComponent />
      </Suspense>
      <FooterComponent />
    </main>
  );
}