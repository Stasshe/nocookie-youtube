'use client';

export default function Instructions() {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg text-black">
      <h1 className="text-3xl font-bold text-center mb-8 text-black">
        YouTube視聴管理システム
      </h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3 text-black">使い方</h2>
          <ol className="list-decimal list-inside space-y-2 text-black">
            <li>上部のアドレスバーに見たいYouTubeのURLを入力してください</li>
            <li>動画が自動的にnocookie形式で表示されます</li>
            <li>複数の動画を見たい場合は、新しいタブを開くことができます</li>
            <li>視聴時間は自動的に記録され、30秒ごとに保存されます</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-black">タブの使い方</h2>
          <ul className="list-disc list-inside space-y-2 text-black">
            <li>右上の「+」ボタンで新しいタブを開けます</li>
            <li>タブをクリックして切り替えることができます</li>
            <li>タブの「×」ボタンでタブを閉じることができます</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-black">注意事項</h2>
          <ul className="list-disc list-inside space-y-2 text-black">
            <li>管理者により制限時間が設定されている場合があります</li>
            <li>制限時間を超過すると動画の視聴ができなくなります</li>
            <li>視聴時間は継続的に記録されています</li>
          </ul>
        </section>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-blue-800 text-center">
          <strong>準備完了！</strong> 上部のアドレスバーにYouTubeのURLを入力して動画を楽しんでください。
        </p>
      </div>
    </div>
  );
}
