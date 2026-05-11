'use client'

const STEPS = [
  {
    icon: '📋',
    title: 'メニューを作る',
    lines: [
      '「メニュー」タブから目標・頻度・場所・レベルを',
      '選んで「メニューを見る」を押すと',
      '週間トレーニングメニューが自動生成される。',
    ],
  },
  {
    icon: '✏️',
    title: 'メニューをカスタマイズする',
    lines: [
      '「カレンダー」から曜日をタップ→',
      '右上の「編集」ボタンで種目・セット数・',
      'レップ数を自由に変更できる。',
    ],
  },
  {
    icon: '✅',
    title: '毎日チェックインする',
    lines: [
      '「カレンダー」から今日の曜日をタップ→',
      '種目ごとにチェックを入れる→',
      'ホームで「やった！」を押してストリークを伸ばす。',
    ],
  },
  {
    icon: '💪',
    title: '重量を記録する',
    lines: [
      '種目カードの「重量」欄に使った重量を入力すると',
      '総重量とXPが自動で計算される。',
    ],
  },
  {
    icon: '▶️',
    title: 'フォームを確認する',
    lines: [
      '各種目の「▶ フォームを見る」ボタンで',
      'YouTubeの解説動画を確認できる。',
    ],
  },
]

export default function GuideModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-sm bg-zinc-900 rounded-t-3xl border-t border-zinc-800 flex flex-col max-h-[85dvh]">
        {/* ハンドルバー */}
        <div className="flex-shrink-0 pt-4 pb-2 px-6">
          <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-4" />
          <h2 className="text-white font-black text-lg tracking-widest uppercase">
            M.WORLD 使い方ガイド
          </h2>
          <p className="text-zinc-600 text-xs mt-1">5ステップでトレーニングを習慣に</p>
        </div>

        {/* スクロールエリア */}
        <div className="flex-1 overflow-y-auto px-6 pb-2 space-y-4 mt-4">
          {STEPS.map((step, idx) => (
            <div
              key={idx}
              className="bg-zinc-800/60 border border-zinc-800 rounded-2xl p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                  style={{ background: 'rgba(249,115,22,0.18)', color: '#f97316' }}
                >
                  {idx + 1}
                </span>
                <span className="text-base leading-none">{step.icon}</span>
                <span className="text-white font-bold text-sm">{step.title}</span>
              </div>
              <div className="pl-10 space-y-0.5">
                {step.lines.map((line, li) => (
                  <p key={li} className="text-zinc-400 text-xs leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          ))}

          {/* 補足 */}
          <div className="px-1 pb-2">
            <p className="text-zinc-600 text-xs text-center leading-relaxed">
              ストリークを積み上げてレベルアップを目指そう🔥
            </p>
          </div>
        </div>

        {/* 閉じるボタン */}
        <div className="flex-shrink-0 px-6 pb-10 pt-3 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="w-full py-4 bg-orange-500 hover:bg-orange-400 active:scale-95 text-white font-bold text-base rounded-2xl transition-all shadow-lg shadow-orange-500/20"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}
