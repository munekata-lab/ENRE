import BiomeComponent from "../ui/biome";
import HeaderComponent from "../ui/header";
import FooterComponent from "../ui/footer";
import { Suspense } from 'react';
import { LoadingAnimation } from "@/app/ui/skeletons"; // ローディング中に表示するコンポーネント

export default function Biome() {
  return (
    <main className="grid grid-rows-base-layout h-screen w-full">
      <HeaderComponent />
      <Suspense fallback={<LoadingAnimation />}>
        <BiomeComponent />
      </Suspense>
      <FooterComponent />
    </main>
  );
}