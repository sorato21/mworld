'use client'

import { useState } from 'react'
import { upsertRecord, SKIP_RECORD_KEY } from '../lib/records'
import { getDateKey } from '../lib/training'

interface Props {
  onSaved: () => void
  onSkip: () => void
}

export default function DailyRecordModal({ onSaved, onSkip }: Props) {
  const [weight, setWeight] = useState('')
  const [bodyFat, setBodyFat] = useState('')
  const [error, setError] = useState('')

  const handleSave = () => {
    const w = parseFloat(weight)
    if (isNaN(w) || w <= 0) {
      setError('体重を正しく入力してください')
      return
    }
    const today = getDateKey(new Date())
    upsertRecord({
      date: today,
      weight: w,
      bodyFat: bodyFat ? parseFloat(bodyFat) || undefined : undefined,
    })
    onSaved()
  }

  const handleSkip = () => {
    const today = getDateKey(new Date())
    localStorage.setItem(SKIP_RECORD_KEY, today)
    onSkip()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-zinc-900 rounded-t-3xl border-t border-zinc-800 p-6 pb-10">
        <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-5" />

        <h2 className="text-white font-black text-lg tracking-widest uppercase mb-1">今日の記録</h2>
        <p className="text-zinc-600 text-xs mb-6">
          {new Date().toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })}
        </p>

        {/* 体重 */}
        <div className="mb-4">
          <label className="text-zinc-400 text-xs tracking-widest uppercase block mb-2">
            体重 <span className="text-orange-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="decimal"
              value={weight}
              onChange={(e) => { setWeight(e.target.value); setError('') }}
              placeholder="例：68.5"
              className="flex-1 bg-zinc-800 border border-zinc-700 focus:border-orange-500 text-white text-xl font-bold text-center rounded-2xl px-4 py-3 outline-none transition-colors placeholder:text-zinc-600"
            />
            <span className="text-zinc-400 text-sm font-semibold">kg</span>
          </div>
        </div>

        {/* 体脂肪率 */}
        <div className="mb-6">
          <label className="text-zinc-400 text-xs tracking-widest uppercase block mb-2">
            体脂肪率 <span className="text-zinc-600 text-[10px] normal-case">（任意）</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="decimal"
              value={bodyFat}
              onChange={(e) => setBodyFat(e.target.value)}
              placeholder="例：18.0"
              className="flex-1 bg-zinc-800 border border-zinc-700 focus:border-orange-500 text-white text-xl font-bold text-center rounded-2xl px-4 py-3 outline-none transition-colors placeholder:text-zinc-600"
            />
            <span className="text-zinc-400 text-sm font-semibold">%</span>
          </div>
        </div>

        {error && (
          <p className="text-orange-400 text-sm font-semibold mb-4">{error}</p>
        )}

        <button
          onClick={handleSave}
          className="w-full py-4 bg-orange-500 hover:bg-orange-400 active:scale-95 text-white font-bold text-base rounded-2xl transition-all shadow-lg shadow-orange-500/20 mb-3"
        >
          記録する
        </button>
        <button
          onClick={handleSkip}
          className="w-full py-3 text-zinc-600 hover:text-zinc-400 text-sm transition-colors"
        >
          あとで
        </button>
      </div>
    </div>
  )
}
