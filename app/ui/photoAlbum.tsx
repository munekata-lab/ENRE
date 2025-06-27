"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import PhotoDetailsCardComponent from "./photoDetailsCard";
import {
  fetchLikesPhoto,
  fetchLimitedNumberPhotosInfo,
  postCollectionInLogs,
} from "@/lib/dbActions";
import { usePathname } from "next/navigation";

export default function PhotoAlbumComponent() {
  const [photosList, setPhotosList] = useState<any[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState("");
  const [likes, setLikes] = useState<string[]>([]);
  const [displayCount, setDisplayCount] = useState(9);
  const [hasMorePhotos, setHasMorePhotos] = useState(true); // State to track if more photos are available
  const [pushHasMorePhotos, setPushHasMorePhotos] = useState(true);

  const pathname = usePathname();
      const handleLogPost = async (previousTitle: string, newTitle: string) => {
        try {
          await postCollectionInLogs(
            "ページ移動",
            `${previousTitle} → ${newTitle}`,
            "成功"
          );
        } catch (error: any) {
          console.error("ログ記録中にエラーが発生しました:", error.message);
        }
      };
        const currentPath = pathname?.replace(/^\//, "") || "home";
  
  const handlePhotoClick = (photo: any) => {
    setSelectedPhoto(photo);
  };

  const handleOnClose = () => {
    setSelectedPhoto("");
  };

  const handleLoadMore = () => {
    setDisplayCount((prevCount) => prevCount + 9);
    setPushHasMorePhotos(false);
  };

  useEffect(() => {
    (async () => {
      const photos = await fetchLimitedNumberPhotosInfo(displayCount);
      if (photos.length < displayCount) {
        setHasMorePhotos(false); // No more photos to load
      } else {
        setHasMorePhotos(true); // Still more photos available
      }
      setPhotosList(photos);
      const currentLikes = await fetchLikesPhoto();
      setLikes(currentLikes);
    })();
  }, [displayCount]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-0 text-center">
      <div className="justify-center mt-24 w-full h-full">
        <div className="fixed text-2xl font-bold mb-20 top-24 w-full">
          <h1 className="text-center">ピックアップ写真</h1>
        </div>
        <div
          className="grid grid-cols-3 gap-0 p-1 w-full overflow-auto mt-20 min-h-full"
          style={{ maxHeight: "calc(100vh - 192px - 4rem)" }}
        >
          {photosList.map((photo, index) => (
            <div key={index} className="border border-gray-700 z-0">
              {photo !== "" ? (
                <div
                  className="relative overflow-scroll w-full h-0 pb-[100%] border border-white"
                  onClick={() => handlePhotoClick(photo)}
                >
                  <Image
                    src={photo.url}
                    alt={`写真${index + 1}`}
                    fill
                    style={{
                      objectFit: "cover",
                    }}
                    sizes="100%"
                    priority={index < 3}
                    className="absolute top-0 left-0 w-full h-full"
                  />
                </div>
              ) : (
                <></>
              )}
            </div>
          ))}
        </div>
        {hasMorePhotos && pushHasMorePhotos && (
          <button
            onClick={() => {
              handleLogPost(currentPath, "readMorePhotos");
              handleLoadMore();
            }}
            className="mt-4 px-6 py-2 bg-green-700 text-white rounded hover:bg-green-900 text-center"
          >
            さらに表示
          </button>
        )}
        <PhotoDetailsCardComponent
          photo={selectedPhoto}
          likes={likes}
          onSetLikes={(newLikes: string[]) => setLikes(newLikes)}
          onClose={() => handleOnClose()}
        />
      </div>
    </main>
  );
}

