export default function ConcentFormComponent() {
  return (
    <main className="p-3 text-black">
      <p className="font-bold">1．研究計画の概要に関する事項</p>
      <p className="mb-5">
        本実験は、Webアプリケーションを介した学内イベント活動に関する通知が，イベントへの関心を高めるのかを調査するために，実際にWebアプリケーションに登録してもらい，学内イベントの情報を確認し，参加したいと思えた場合に参加してもらいます．イベントの参加・不参加は自由です．実験後は簡単なアンケートへの回答にご協力をお願いします．実験ではイベントへの参加状況、アンケートの回答内容を実験データとして収集します．
      </p>
      <p className="font-bold">2．個人情報保護の方法に関する事項</p>
      <p>
        本実験は個人の能力を測定するものではなく，Webアプリケーションを介した情報推薦が，ユーザの行動変容を起こし得るのかを調査することを目的としています．実験データは全て統計処理を行い個人が特定できない形で管理・分析します．実験データを研究発表などで使用する場合には，全て統計処理を行い個人が特定できない形で使用します．
      </p>
      <p className="mb-5">
        実験データは全て統計処理を行い個人が特定できない形で管理・分析します。実験データを研究発表などで使用する場合には，全て統計処理を行い個人が特定できない形で使用します．
      </p>
      <p className="font-bold">3．安全管理に関する事項</p>
      <p className="mb-5">
        イベントへの参加・不参加は自由ですので，個人の判断で実験を中止してください．
      </p>
      <p className="font-bold">4．インフォームド・コンセントに関する事項</p>
      <ul className="mb-5">
        <li className="before:content-['・'] ml-4 -indent-3.5">
          本実験への参加は任意であり，強制するものではありません．また，実験中に中断を求める場合はいつでも申し出ることができます．
        </li>
        <li className="before:content-['・'] ml-4 -indent-3.5">
          実験後、実験への同意を撤回する場合はいつでも申し出てください．得られた実験データ等を破棄します．また，このことにより不利益をこうむることはありません．
        </li>
        <li className="before:content-['・'] ml-4 -indent-3.5">
          実験データの開示を請求された場合は開示します．
        </li>
        <li className="before:content-['・'] ml-4 -indent-3.5">
          得られた実験データおよびアンケート結果は，本研究のためのみに使用し，第三者に譲渡しません．
        </li>
        <li className="before:content-['・'] ml-4 -indent-3.5">
          本実験に関する研究成果は学会発表や論文発表等に使用する可能性があります．
        </li>
        <li className="before:content-['・'] ml-4 -indent-3.5">
          本実験への参加に対して，所定の条件を満たす場合に，所定の方法にて謝礼としてAmazonギフト券をお渡しします．
        </li>
      </ul>
      <p className="mb-5">
        私は、「環境活動への関心を高めるWebアプリケーションの評価実験」の研究・実験の実施について、研究実施計画の目的、個人情報保護の方法、安全管理での配慮などについて十分理解しましたので、計画に参加し、求められた私個人に係る情報、データ等を提供することに同意します。
      </p>
      <p className="mb-5">
        上記内容に同意して実験を受けられる方は、以下に氏名を入力したのち、「同意する」にチェックして下さい．
      </p>
    </main>
  );
}
