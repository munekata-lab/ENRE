import PhotoAlbumComponent from "../ui/photoAlbum";
import MaintenanceComponent from "../ui/maintenance";
import HeaderComponent from "@/app/ui/header";
import FooterComponent from "@/app/ui/footer";
import { Suspense } from "react";
import { HeaderSkeleton } from "@/app/ui/skeletons";
import { fetchMode } from "@/lib/dbActions";
import { getUserFromCookie } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function PhotoAlbum() {
  const user = await getUserFromCookie();
  user === null && redirect("/login");
  const mode = await fetchMode(user?.uid);

  return (
    <main>
      <Suspense fallback={<HeaderSkeleton />}>
        <HeaderComponent />
      </Suspense>
      {(mode?.photoalbumMode && mode?.userMode) || !mode?.photoalbumMode ? ( //firestoreのmodeがtrue且つ開発者ユーザー、またはfirestoreのmodeがfalse
        <PhotoAlbumComponent />
      ) : (
        <MaintenanceComponent />
      )}
      <FooterComponent />
    </main>
  );
}
