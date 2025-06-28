import HeaderComponent from "../ui/header";
import ChangePasswordComponent from "../ui/changePassword";
import FooterComponent from "../ui/footer";
import { Suspense } from "react";
import { HeaderSkeleton, LoadingAnimation } from "../ui/skeletons";

export default function ChangePassword() {
  return (
    <main>
      <Suspense fallback={<HeaderSkeleton />}>
        <HeaderComponent />
      </Suspense>
      <Suspense fallback={<LoadingAnimation />}>
        <ChangePasswordComponent />
      </Suspense>
      {/* <FooterComponent /> */}
    </main>
  );
}