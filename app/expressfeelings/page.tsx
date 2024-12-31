import HeaderComponent from "@/app/ui/header";
import ExpressFeelingsComponent from "../ui/expressfeelings";
import FooterComponent from "@/app/ui/footer";
import { Suspense } from "react";
import { HeaderSkeleton } from "@/app/ui/skeletons";

export default function PostExpressFeelings() {
  return (
    <main>
      <Suspense fallback={<HeaderSkeleton />}>
        <HeaderComponent />
      </Suspense>
      <ExpressFeelingsComponent />
      <FooterComponent />
    </main>
  );
}