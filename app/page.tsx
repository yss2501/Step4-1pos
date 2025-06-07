'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [datetime, setDatetime] = useState('');

  const updateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const date = String(now.getDate()).padStart(2, '0');
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    const day = dayNames[now.getDay()];
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    setDatetime(`${year}年\n${month}月${date}日\n（${day}）\n${hours}:${minutes}`);
  };

  useEffect(() => {
    updateTime(); // 初期化
    const timer = setInterval(updateTime, 60 * 1000); // 1分ごとに更新
    return () => clearInterval(timer); // クリーンアップ
  }, []);

  const handleStart = () => {
    router.push('/pos');
  };

  return (
    <main className="flex flex-col h-screen">
      {/* 上部60%：画像表示 + 重ね要素 */}
      <div className="h-[60%] relative">
        <img
          src="/pic/top.png"
          alt="ショップ店員のイラスト"
          className="w-full h-full object-cover"
        />
        <h1 className="absolute bottom-4 left-4 text-white text-2xl font-bold shadow-md">
          mobile-POS
        </h1>
        {/* 日時表示 */}
        <div className="absolute bottom-4 right-4 text-right text-white whitespace-pre text-sm leading-tight font-bold shadow-md">
          {datetime}
        </div>
      </div>

      {/* 下部40%：ボタンエリア */}
      <div className="h-[40%] flex flex-col justify-center items-center bg-white">
        <button
          onClick={handleStart}
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-2xl py-4 px-10 rounded-full"
        >
          会計 開始
        </button>
      </div>
    </main>
  );
}
