import Link from "next/link";
import Image from "next/image";
import packageJson from "../../package.json";

export default function AboutComponent() {
  const version = packageJson.version;
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-3">
      <Image
        src="/applicationIcon_512.png"
        width={250}
        height={250}
        alt="charactor"
        priority
      />
      <Image src="/title.png" width={250} height={150} alt="title" />
      <h2 className="text-xl font-bold mt-5">しぜんとひとをつなぐ”Enre”って？</h2>
      <h2 className="text-xl font-bold mt-5">あなた史上最高のキャンパスライフを。</h2>
      <p className="text-lg text-center">
        混雑時の待機時間や空き時間を有効活用して、 気軽にイベント検索・参加・記録が可能なWebアプリ”Enre”を開発しました。学内には、様々なイベントや豊かな自然環境、学生による活動が満載です。
      </p>
      <p className="text-lg text-center mt-5">
        せっかくのイベント、せっかくのONE CAMPUS。きっと行ったことのない施設やイベント、自然環境、新たなコミュニティがたくさんあるはず！
      </p>
      <p className="text-lg text-center mt-5">
        無限大の可能性を秘めたキャンパスライフをさらに有意義にしてみませんか？
      </p>
      <Link href="https://kankyoseisaku.pupu.jp/enre/"
            target="_blank"
            className="m-0 mb-3 text-white no-underline">
        <button className="bg-green-700 py-2 px-4 rounded-md">
          Enre公式HP
        </button>
      </Link>
      <div className="mt-3 border-b-2 h-1 w-full border-green-600 border-opacity-30 drop-shadow-sm"></div>
      <h2 className="text-2xl font-bold mt-5">Enre（ver. {version}）の概要</h2>
      <p className="text-lg text-center mt-5">
        Enre（ver{version}）は2024年7月1日～7月5日のEnre weekを皮切りにEnre（ver1.1.0）は7月31日まで使用することが可能になっています。
      </p>
      <p className="text-lg text-center mt-5">
        Enreを使うことであなたの様々なイベントや活動への参加記録がEnreポイントやポイントを貯めることで成長するEnre公式キャラクター”ガマちゃん”によって簡単に把握することが出来ます。
      </p>
      <p className="text-lg text-center mt-5">
        更に、今回のEnre（ver{version}）ではver1.1.0には無かった機能が追加予定です！
      </p>
      <p className="text-lg text-center mt-5">
        ・混雑状況が確認できる
      </p>
      <p className="text-lg font-bold text-center">
        「Enreマップ」
      </p>
      <p className="text-lg text-center mt-5">
        ・イベント情報が一覧で見れる
      </p>
      <p className="text-lg font-bold text-center">
        「イベントリスト」
      </p>
      <p className="text-lg text-center mt-5">
        ・様々なイベントの様子をユーザー間で共有しよう！
      </p>
      <p className="text-lg font-bold text-center">
        「みんなのアルバム」
      </p>
      <p className="text-lg text-center mt-5">
        ・あなたのイベント参加を記録する
      </p>
      <p className="text-lg font-bold text-center">
        「あなたの参加記録」
      </p>
      <p className="text-lg text-center mt-5">
        ・学内1のEnreユーザーを目指そう！Enreユーザーの獲得ポイントランキングを表示
      </p>
      <p className="text-lg font-bold text-center">
        「ユーザーランキング」
      </p>
      <p className="text-lg text-center mt-5">
        ・3つのジャンルのイベントへの参加度合いで3種類の分岐成長を可能に！
      </p>
      <p className="text-lg font-bold text-center">
        「ガマちゃん分岐成長」
      </p>
      <p className="text-lg text-center mt-5">
        Enreはこれからも皆様と共に成長し、大学や様々な地域をイベントや環境貢献行動などを促すことで活性化するツールとして進んでいきます。
      </p>
      <p className="text-lg text-center mt-5">
        皆様の意見や参加をもとに今後もアップデートを続けていきます。ぜひご協力をお願いいたします。
      </p>
      <p className="text-lg font-bold text-center mt-5">
        さあ、はじめよう”Enre”！
      </p>
      <div className="mt-3 border-b-2 h-1 w-full border-green-600 border-opacity-30 drop-shadow-sm"></div>
      <p className="text-lg font-bold text-center mt-5"></p>
      <Image src="/title2.png" width={300} height={150} alt="title" />
      <p className="text-lg font-bold text-center mt-3">
        Enre week開催!!
      </p>
      <p className="text-lg font-bold text-center">
        7/1～7/5
      </p>
      <p className="text-lg text-center mt-5">
        Enreの実証実験を兼ねたリニューアルしたEnreのリリースを7月1日（月）～5日（金）の5日間で開催します。
      </p>
      <p className="text-lg text-center mt-5">
        ・様々な種類のイベントが一挙に集約
      </p>
      <p className="text-lg text-center">
        Enreを使ってイベントを探して参加・記録しよう！
      </p>
      <p className="text-lg text-center mt-5">
        ・イベント参加でEnreポイントがゲット可能
      </p>
      <p className="text-lg text-center">
        ポイントゲットで
        <span className="font-bold no-underline text-green-700">
          ガマちゃん
        </span>
        を成長させよう！
      </p>
      <div className="flex">
        <div className="w-1/2 flex justify-center items-center">
          <Link href={"/story"} className="no-underline">
            <Image src="/gama2.png" width={130} height={130} alt="charactor" />
          </Link>
        </div>
        <div className="w-1/2 flex justify-center items-center">
          <Link href={"/story"} className="no-underline text-black">
            <button className="text-sm font-bold rounded-md border-2 border-green-700">
              ガマちゃんって？
            </button>
          </Link>
        </div>
      </div>
      <div className="mt-3 border-b-2 h-1 w-full border-green-600 border-opacity-30 drop-shadow-sm"></div>
      <h2 className="text-2xl font-bold mt-5">企画・制作</h2>
      <p className="text-lg text-center">
        本取組は、グリーンインフラの社会実装に向けた研究活動として、以下の２つの研究室が協働しておこなっています。
      </p>
      <ul className="text-lg">
        <li className="before:content-['・'] ml-4 -indent-4">
          京都産業大学 生命科学部 産業生命科学科 西田研究室
        </li>
        <li className="before:content-['・'] ml-4 -indent-4">
          京都産業大学 情報理工学部 情報理工学科 棟方研究室
        </li>
      </ul>
      <p className="text-sm text-center">
        なお、本取組は、内閣府SIPスマートインフラマネジメントシステムの構築e-1「魅力的な国土・都市・地域づくりを評価するグリーンインフラに関する省庁連携基盤」の研究活動の一環です。
      </p>
      <Image src="/sip.png" width={100} height={150} alt="title" />
      <h2 className="text-2xl font-bold mt-5">お問い合わせ先</h2>
      <p className="text-lg">nisidalab@gmail.com</p>
      <p className="text-lg">（担当者：三鬼）</p>
      <Link href={"/"} className="no-underline text-white mt-4">
        <button className="text-lg bg-green-700 p-2 rounded-md">
          ホームに戻る
        </button>
      </Link>
    </main>
  );
}
