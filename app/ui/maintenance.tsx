import HeaderComponent from "./header";
import InstallMethodComponent from "./installMethod";
import Link from "next/link";

export default async function MaintenanceComponent() {
  return (
    <main className="grid grid-rows-base-layout h-screen w-full">
      {/* <HeaderComponent /> */}
      <div className="grid row-start-2 overflow-auto px-3">
        <h1 className="text-4xl text-center mt-5">メンテナンス</h1>
        <div className="text-lg text-center">
          <p>ただいまメンテナンス中のため、<br/>
             この機能はご利用いただけません。
          </p>
          <div className="bg-green-700 text-white">
            <p>終了予定時間</p>
          </div>
          <p>未定</p>
          <div className="bg-green-700 text-white">
            <p>メンテナンス内容</p>
          </div>
          <p>不具合の修正</p>
          <p>大変申し訳ございませんが、<br/>
             しばらくお待ちください。
          </p>
          <p></p>
        </div>
      </div>
    </main>
  );
}
