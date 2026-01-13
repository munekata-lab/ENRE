import Link from "next/link";
import Image from "next/image";
import packageJson from "../../package.json";

export default function AboutComponent() {
  const version = packageJson.version;
  return (
    <main className="flex flex-col items-center justify-center min-h-screen"
      style={{
        width: '100%',
        margin: '0 auto',
      }}>
      {/* <Image
        src="/applicationIcon_512.png"
        width={250}
        height={250}
        alt="charactor"
        priority
      /> */}
      {/* <Image src="/title.png" width={250} height={150} alt="title" /> */}


      {/* -------------しぜんとひとをつなぐ”Enre”って？------------- */}
      <div
        className="flex flex-col items-center justify-center mt-5"
        style={{
          width: '100%', // 幅100%
          height: '100px',
          maxWidth: '100%', // 限制宽度
          textAlign: 'center', // 居中文本
        }}
      >
        <h2
          className="font-bold"
          style={{
            fontSize: 'clamp(16px, 5vw, 36px)', // オートフォントサイズ
            width: '100%',
            height: '50%',
            maxWidth: '100%',
            whiteSpace: 'nowrap',
          }}
        >
          しぜんとひとをつなぐ”Enre”って？
        </h2>
        <h2
          className="font-bold mt-3"
          style={{
            fontSize: 'clamp(16px, 5vw, 36px)',
            width: '100%',
            height: '50%',
            maxWidth: '100%',
            whiteSpace: 'nowrap',
          }}
        >
          あなた史上最高のキャンパスライフを。
        </h2>
      </div>

      <p className="text-base text-center"
      style={{
        width: '95%',
      }}>
        混雑時の待機時間や空き時間を有効活用して、 気軽にイベント検索・参加・記録が可能なWebアプリ”Enre”を開発しました。学内には、様々なイベントや豊かな自然環境、学生による活動が満載です。
      </p>
      <p className="text-base text-center mt-5"style={{
        width: '95%',
      }}>
        せっかくのイベント、せっかくのONE CAMPUS。きっと行ったことのない施設やイベント、自然環境、新たなコミュニティがたくさんあるはず！
      </p>
      <p className="text-base text-center mt-5"style={{
        width: '95%',
      }}>
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

      {/* -------------Enre nature------------- */}
      <div
        className="flex flex-col items-center justify-center mt-5 bg-white"
        style={{
          width: '100%', // 幅100%
          height: '310px',
          maxWidth: '100%', // 限制宽度
          textAlign: 'center', // 居中文本
        }}
      >
        <p className="text-base font-bold text-center mt-4"
          style={{
            fontSize: 'clamp(16px, 50vw, 50px)',
            width: '100%',
          }}
        >
          Enre nature
        </p>
        <p className="text-base text-center mt-2 mb-0">
          Enre 開催!
        </p>
        <p className="text-base text-center">
          1/13（火）～1/15（木）
        </p>
        <p className="text-base text-center mt-1 mb-0"
        style={{
          width: '80%',
        }}>
          7月に開催したEnre Weekから更にアップデートしたEnreをリリース！
        </p>
        <p className="text-base text-center mt-1"
        style={{
          width: '80%',
        }}>
          今回は「自然」にフォーカスしたイベントが満載！
        </p>
      </div>
      <p className="text-base text-center mt-5 mb-0">
        ・様々な種類のイベントが一挙に集約
      </p>
      <p className="text-base text-center">
        Enreを使ってイベントを探して参加・記録しよう！
      </p>

      <div
        className="flex flex-col items-center justify-center bg-white"
        style={{
          width: '105%', 
    maxWidth: '100vw',
          height: '100px',
          textAlign: 'center', // 居中文本
        }}
      >
      <p className="text-base text-center mt-3"
      style={{
        width: '80%',
      }}>
        ・イベント参加でEnreポイントがゲット可能
      </p>
      </div>
      <p className="text-base text-center mt-1">
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

      {/* -------------概要------------- */}
      <div
        className="flex flex-col items-center justify-center mt-5 bg-white"
        style={{
          width: '105%', 
    maxWidth: '100vw',
          height: '200px',
          textAlign: 'center', // 居中文本
        }}
      >
        <h2 className="mt-2"
          style={{
            fontSize: 'clamp(16px, 6.5vw, 36px)',
            width: '100%',
            height: '25%',
          }}>Enre（ver. {version}）の概要</h2>
        <p className="text-base text-center mt-1"
          style={{
            width: '80%',
            height: '75%',
          }}
        >
          Enre（ver{version}）は2025年1月13日～31日まで使用することが可能です。
        </p>
      </div>

      <p className="text-base text-center mt-5"style={{
        width: '95%',
      }}>
        Enreを使うことであなたの様々なイベントや活動への参加記録がsポイントを貯めることで成長するEnre公式キャラクター”ガマちゃん”によって簡単に把握することが出来ます。
      </p>
      {/* <p className="text-base text-center mt-5">
        更に、今回のEnre（ver{version}）ではver1.1.0には無かった機能が追加予定です！
      </p>
      <p className="text-base text-center mt-5">
        ・混雑状況が確認できる
      </p>
      <p className="text-base font-bold text-center">
        「Enreマップ」
      </p> */}

      <div
        className="flex flex-col items-center justify-center bg-white"
        style={{
          width: '105%', 
          maxWidth: '100vw',
          height: '160px',
          textAlign: 'center', // 居中文本
        }}
      >
        <p className="text-base text-center mt-4"
          style={{
            width: '80%',
            height: '75%',
          }}
        >
          Enre（ver{version}）では、遂にイベント情報可視化機能が再実装されます！
        </p>
      </div>

      <div
        className="flex items-center justify-center bg-white mt-3"
        style={{
          width: '105%', 
    maxWidth: '100vw',
          height: '100px',
          textAlign: 'center', // 居中文本
        }}
      >
        <p className="text-base text-center mt-3"
          style={{
            width: '80%',
          }}
        >
          ・混雑状況が一目でわかる
          「学内キャッチ」
        </p>
      </div>


      <p className="text-base text-center mt-5 mb-0 ">
        ・イベント情報が一覧で見れる
      </p>
      <p className="text-base font-bold text-center">
        「イベントリスト」
      </p>
      <p className="text-base text-center mt-5  mb-0">
        ・様々なイベントの様子をユーザー間で共有しよう！
      </p>
      <p className="text-base font-bold text-center">
        「みんなのアルバム」
      </p>
      {/* <p className="text-base text-center mt-5 mb-0">
        ・あなたのイベント参加を記録する
      </p>
      <p className="text-base font-bold text-center">
        「あなたの参加記録」
      </p>
      <p className="text-base text-center mt-5 mb-0">
        ・学内1のEnreユーザーを目指そう！Enreユーザーの獲得ポイントランキングを表示
      </p>
      <p className="text-base font-bold text-center">
        「ユーザーランキング」
      </p> */}
      <p className="text-base text-center mt-5 mb-0">
        ・3つのジャンルのイベントへの参加度合いで3種類の分岐成長を可能に！
      </p>
      <p className="text-base font-bold text-center">
        「ガマちゃん分岐成長」
      </p>
      <div
        className="flex flex-col items-center justify-center bg-white"
        style={{
          width: '105%', 
          maxWidth: '100vw',
          height: '100px',
          textAlign: 'center', // 居中文本
        }}
      > 
      <p className="text-base text-center mt-3 mb-0"
      style={{width:'95%'}}>
      ・知る、使う、守るの3つのジャンルの自然貢献活動を可視化する
       </p>
       <p className="text-base text-center">
      「グリーンインフラ（GI）ポイント」
       </p>
      </div>
      <p className="text-base text-center">
        などを促すことで活性化するツールとして進んでいきます。
      </p>
      <p className="text-base font-bold text-center">
        ・グリーンインフラ（GI）ポイントとは？
      </p>
      <p className="text-base text-center mt-1">
        GIポイントは自然環境貢献活動を記録し、可視化するためのポイントで、あなたの貢献活動を評価します。
      </p>
      <p className="text-base text-center mt-1">
        GIポイントは、参加したイベントが自然環境に貢献するイベントである場合に獲得することが出来ます！
      </p>
      <p className="text-base text-center mt-1">
        今回ガマちゃんを成長させるためにはGIポイントを貯める必要があります、イベントに参加してグリーンインフラポイントを貯めよう！
      </p>
      <p className="text-base text-center mt-5">
        皆様の意見や参加をもとに今後もアップデートを続けていきます。ぜひご協力をお願いいたします。
      </p>
      <p className="text-base font-bold text-center mt-5">
        さあ、はじめよう”Enre”！
      </p>
      <div className="mt-3 border-b-2 h-1 w-full border-green-600 border-opacity-30 drop-shadow-sm"></div>
      <p className="text-base font-bold text-center mt-5"></p>


      {/* <Image src="/title2.png" width={300} height={150} alt="title" />
      <p className="text-base font-bold text-center mt-3">
        Enre week開催!!
      </p>
      <p className="text-base font-bold text-center">
        7/1～7/5
      </p>
      <p className="text-base text-center mt-5">
        Enreの実証実験を兼ねたリニューアルしたEnreのリリースを7月1日（月）～5日（金）の5日間で開催します。
      </p>
      <p className="text-base text-center mt-5">
        ・様々な種類のイベントが一挙に集約
      </p>
      <p className="text-base text-center">
        Enreを使ってイベントを探して参加・記録しよう！
      </p>
      <p className="text-base text-center mt-5">
        ・イベント参加でEnreポイントがゲット可能
      </p>
      <p className="text-base text-center">
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
      </div> */}

      {/* -------------企画・制作------------- */}
      <h2 className="text-2xl font-bold mt-5">企画・制作</h2>
      <p className="text-base text-center">
        本取組は、グリーンインフラの社会実装に向けた研究活動として、以下の２つの研究室が協働しておこなっています。
      </p>
      <ul className="text-base text-left">
        <li className="before:content-['・'] -indent-4">
          京都産業大学 生命科学部 産業生命科学科 西田研究室
        </li>
        <li className="before:content-['・'] -indent-4">
          京都産業大学 情報理工学部 情報理工学科 棟方研究室
        </li>
      </ul>
      <p className="text-sm text-center">
        なお、本取組は、内閣府SIPスマートインフラマネジメントシステムの構築e-1「魅力的な国土・都市・地域づくりを評価するグリーンインフラに関する省庁連携基盤」の研究活動の一環です。
      </p>
      <Image src="/sip.png" width={100} height={150} alt="title" />
      <h2 className="text-2xl font-bold mt-5">お問い合わせ先</h2>
      <p className="text-base">nisidalab@gmail.com</p>
      <p className="text-base">（担当者：三鬼）</p>
      <Link href={"/"} className="no-underline text-white mt-4">
        <button className="text-base bg-green-700 p-2 rounded-md">
          ホームに戻る
        </button>
      </Link>
    </main>
  );
}
