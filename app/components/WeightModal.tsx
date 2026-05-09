'use client'

import { useState } from 'react'

interface Props {
  initialWeight?: number
  isFirstTime?: boolean
  onSave: (weight: number) => void
  onClose?: () => void
}

export default function WeightModal({
  initialWeight,
  isFirstTime = false,
  onSave,
  onClose,
}: Props) {
  const [value, setValue] = useState(initialWeight != null ? String(initialWeight) : '')
  const [error, setError] = useState(false)

  const handleSave = () => {
    const num = parseFloat(value)
    if (isNaN(num) || num <= 0 || num > 300) {
      setError(true)
      return
    }
    onSave(Math.round(num * 10) / 10)
  }

  return (
    /* オーバーレイ: overflow-y-auto でキーボード表示時もスクロールでモーダルにアクセス可能 */
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 背景 */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
      {/* 中央揃えコンテナ: min-h-full で常に画面中央に固定 */}
      <div className="relative flex min-h-full items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">⚖️</div>
            <h2 className="text-white font-black text-xl">
              {isFirstTime ? 'ようこそ！' : '体重を変更'}
            </h2>
            <p className="text-zinc-500 text-sm mt-2">
              あなたの体重を教えてください
            </p>
          </div>

          {/* Input */}
          <div className="flex items-center gap-3 mb-2">
            <input
              type="number"
              inputMode="decimal"
              value={value}
              onChange={(e) => {
                setValue(e.target.value)
                setError(false)
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="65.0"
              className={`flex-1 bg-zinc-800 border rounded-2xl px-4 py-4 text-white text-3xl font-black text-center outline-none transition-colors appearance-none ${
                error
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-zinc-700 focus:border-orange-500'
              }`}
              autoFocus
            />
            <span className="text-zinc-400 font-bold text-xl flex-shrink-0">kg</span>
          </div>

          {error && (
            <p className="text-red-400 text-xs text-center mb-4">
              正しい体重を入力してください（1〜300kg）
            </p>
          )}
          {!error && <div className="mb-4" />}

          {/* Buttons */}
          <button
            onClick={handleSave}
            className="w-full py-4 bg-orange-500 hover:bg-orange-400 active:scale-95 text-white font-bold text-base rounded-2xl transition-all shadow-lg shadow-orange-500/20"
          >
            保存する
          </button>

          {!isFirstTime && onClose && (
            <button
              onClick={onClose}
              className="w-full mt-3 py-3 text-zinc-600 hover:text-zinc-400 text-sm transition-colors"
            >
              キャンセル
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
