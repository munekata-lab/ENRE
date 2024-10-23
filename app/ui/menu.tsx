"use client";

import { useState, useRef, useEffect } from "react";
import { logout } from "@/lib/authentication";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import packageJson from "../../package.json";
import Image from "next/image";

export default function MenuComponent({ nickName }: { nickName: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const version = packageJson.version;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  return (
    <div className="relative inline-block text-left z-20" ref={menuRef}>
      <div className="justify-self-center items-center">
          <Image src="/settings.png" width={60} height={60} alt="settings" onClick={() => setMenuOpen(!menuOpen)} />
      </div>
      {menuOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-[#f5ffec] ring-1 ring-black ring-opacity-5">
          <div
            className="py-1 flex flex-col justify-end"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            <p className="block m-0 px-4 pt-2 pb-1 text-sm text-black text-right">
              <FontAwesomeIcon icon={faUser} className="mr-2" />
              <span>{nickName}</span>
            </p>
            <p className="block m-0 px-4 pb-2 text-xs text-black text-right border-b-2 border-gray-300">
              <span>Enre ver {version}</span>
            </p>
            <Link href="/about" className="text-right">
              <button
                className="inline-block px-4 py-2 text-sm w-full text-black hover:bg-white text-right"
                role="menuitem"
              >
                Enreについて
              </button>
            </Link>
            <Link href="/settings" className="text-right">
              <button
                className="inline-block px-4 py-2 text-sm w-full text-black hover:bg-white text-right"
                role="menuitem"
              >
                設定
              </button>
            </Link>
            <Link href="/changepassword" className="text-right">
              <button
                className="inline-block px-4 py-2 text-sm w-full text-black hover:bg-white text-right"
                role="menuitem"
              >
                パスワード変更
              </button>
            </Link>
            <button
              onClick={() => logout()}
              className="inline-block px-4 py-2 text-sm w-full text-red-500 hover:bg-white text-right"
              role="menuitem"
            >
              ログアウト
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
