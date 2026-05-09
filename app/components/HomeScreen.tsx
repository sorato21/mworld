'use client'

import Link from 'next/link'

const NAV_CARDS = [
  {
    href: '/checkin',
    icon: '🔥',
    title: '今日のチェックイン',
    desc: 'ストリークを記録',
  },
  {
    href: '/menu',
    icon: '🤖',
    title: 'AIメニュー生成',
    desc: '週間メニューを作成',
  },
  {
    href: '/calendar',
    icon: '📅',
    title: '週間カレンダー',
    desc: '今週の進捗を確認',
  },
  {
    href: '/history',
    icon: '📊',
    title: 'トレーニング履歴',
    desc: '過去の記録を確認',
  },
]

export default function HomeScreen() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center px-6 py-16 select-none">
      {/* Brand */}
      <div className="text-center mb-14">
        <h1 className="text-4xl font-black tracking-[0.25em] text-white uppercase">M.WORLD</h1>
        <p className="text-zinc-600 text-xs tracking-[0.2em] mt-1 uppercase">Fitness Habit Tracker</p>
      </div>

      {/* Nav grid */}
      <div className="w-full max-w-sm grid grid-cols-2 gap-3">
        {NAV_CARDS.map(({ href, icon, title, desc }) => (
          <Link key={href} href={href} className="block">
            <div className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 active:scale-95 rounded-2xl p-5 h-full flex flex-col gap-2 transition-all">
              <span className="text-2xl">{icon}</span>
              <p className="text-white font-bold text-sm leading-tight">{title}</p>
              <p className="text-zinc-500 text-xs">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Feedback */}
      <a
        href="https://forms.gle/8289i9sDHX6j4qwB9"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-14 mb-2 text-orange-500 hover:text-orange-400 text-sm font-semibold transition-colors"
      >
        📝 フィードバックを送る
      </a>
    </div>
  )
}
