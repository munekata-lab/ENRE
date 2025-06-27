import { useState } from "react";
import imageCompression from "browser-image-compression";

export const useImageUpload = () => {
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [createObjectURL, setCreateObjectURL] = useState("");
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0); // 圧縮率の状態

  const uploadToClient = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files?.[0]) {
      const file = event.target.files?.[0];
      const ext = file.name.split(".").pop()?.toLowerCase();
      const allowedExtensions = ["jpg", "jpeg", "png", "gif", "heic"];

      if (!ext || !allowedExtensions.includes(ext)) {
        setError(`許可されていないファイル形式です。(${ext})`);
        return;
      }

      try {
        setIsCompressing(true);
        setCompressionProgress(0); // 圧縮開始時にリセット

        let options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          initialQuality: 0.8,
          alwaysKeepResolution: true,
          exifOrientation: undefined,
          onProgress: (progress: number) => {
            setCompressionProgress(Math.round(progress)); // 圧縮率を更新
          },
        };

        let compressedFile = await imageCompression(file, options);

        while (
          compressedFile.size / 1024 / 1024 > 1 &&
          options.initialQuality > 0.4
        ) {
          options.initialQuality -= 0.2;
          compressedFile = await imageCompression(file, options);
        }

        const avifFile = await convertToAVIF(compressedFile, 0.8);

        setPhoto(avifFile);
        setCreateObjectURL(URL.createObjectURL(avifFile));
      } catch (error) {
        console.error("圧縮エラー:", error);
        setError("画像の圧縮中にエラーが発生しました。");
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const convertToAVIF = async (file: File, quality: number): Promise<File> => {
    return new Promise<File>((resolve, reject) => {
      const img: HTMLImageElement = document.createElement("img");
      const url = URL.createObjectURL(file);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Canvasコンテキストの取得に失敗しました。"));
          return;
        }

        ctx.drawImage(img, 0, 0);

        const isAVIFSupported = canvas
          .toDataURL("image/avif")
          .startsWith("data:image/avif");

        const outputFormat = isAVIFSupported ? "image/avif" : "image/webp";
        const outputQuality = isAVIFSupported ? quality : 0.8;

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const newExtension =
                outputFormat === "image/avif" ? ".avif" : ".webp";
              const newFile = new File(
                ([blob] as any),
                file.name.replace(/\.\w+$/, newExtension),
                {
                  type: outputFormat,
                  lastModified: Date.now(),
                }
              );
              resolve(newFile);
            } else {
              reject(new Error("画像の変換に失敗しました。"));
            }
          },
          outputFormat,
          outputQuality
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("画像の読み込みに失敗しました。"));
      };

      img.src = url;
    });
  };

  const reset = () => {
    setPhoto(null);
    setError("");
    setCreateObjectURL("");
    setIsCompressing(false);
    setCompressionProgress(0); // リセット時に圧縮率もリセット
  };

  return {
    photo,
    error,
    createObjectURL,
    isCompressing,
    compressionProgress, // 追加
    uploadToClient,
    setError,
    reset,
  };
};