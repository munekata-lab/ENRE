import FirebaseEmailComponent from "../ui/firebaseEmail";
import { Suspense } from 'react';
import { LoadingAnimation } from "@/app/ui/skeletons";

export default function FirebaseEmail() {
  return (
    <main>
      <Suspense fallback={<LoadingAnimation />}>
        <FirebaseEmailComponent />
      </Suspense>
    </main>
  );
}