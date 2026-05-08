'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getWeekPlan, type Goal, type TrainingLocation, type Level, type DayPlan } from '../lib/menus'

interface FormState {
  goal: Goal
  frequency: number
  location: TrainingLocation
  level: Level
}

function Chip<T extends string>({
  value,
  selected,
  onClick,
}: {
  value: T
  selected: boolean
  onClick: (v: T) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
        selected
          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
      }`}
    >
      {value}
    </button>
  )
}

function youtubeUrl(name: string, level: Level): string {
  const suffix = level === '初心者' ? 'フォーム 初心者 解説' : 'フォーム 正しいやり方 効果的'
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(name + ' ' + suffix)}`
}

function WeekPlanView({ plan, level }: { plan: DayPlan[]; level: Level }) {
  return (
    <div className="space-y-4">
      {plan.map(({ day, isRest, session }) => (
        <div key={day}>
          <div className={`font-black text-xl mb-2 ${isRest ? 'text-zinc-600' : 'text-orange-400'}`}>
            {day}曜日
            {isRest && <span className="text-sm font-normal ml-2">休養日</span>}
            {session && <span className="text-sm font-normal text-zinc-400 ml-2">{session.focus}</span>}
          </div>
          {session && (
            <div className="space-y-2 pl-1">
              {session.exercises.map((ex, i) => (
                <div key={i} className="bg-zinc-900 rounded-xl p-3 border border-zinc-800">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-orange-500 text-xs">▸</span>
                    <span className="text-white font-bold text-sm">{ex.name}</span>
                    <span className="text-zinc-500 text-xs ml-auto">{ex.setsReps}</span>
                  </div>
                  <p className="text-zinc-500 text-xs italic pl-4 mb-2">{ex.advice}</p>
                  <a
                    href={youtubeUrl(ex.name, level)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 w-fit ml-4 px-3 py-1.5 bg-red-600 hover:bg-red-500 active:scale-95 text-white text-xs font-semibold rounded-lg transition-all"
                  >
                    ▶ フォームを見る
                  </a>
                </div>
              ))}
            </div>
          )}
          {isRest && (
            <p className="text-zinc-700 text-sm pl-1">しっかり休んで次のトレーニングに備えよう</p>
          )}
        </div>
      ))}
    </div>
  )
}

export default function MenuPage() {
  const [form, setForm] = useState<FormState>({
    goal: '筋肉をつけたい',
    frequency: 3,
    location: 'ジム',
    level: '初心者',
  })
  const [result, setResult] = useState<{ plan: DayPlan[]; level: Level } | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const plan = getWeekPlan(form.goal, form.location, form.level, form.frequency)
    const generated = { plan, level: form.level }
    setResult(generated)
    localStorage.setItem('mworld_generated_menu', JSON.stringify(generated))
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-6 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <Link
            href="/"
            className="text-zinc-600 hover:text-zinc-400 transition-colors text-sm"
          >
            ← ホーム
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-widest uppercase">M.WORLD</h1>
            <p className="text-zinc-600 text-xs tracking-wider">週間トレーニングメニュー</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8 mb-10">
          {/* Goal */}
          <div>
            <p className="text-zinc-400 text-xs tracking-widest uppercase mb-3">目標</p>
            <div className="flex flex-wrap gap-2">
              {(['筋肉をつけたい', '痩せたい', '健康維持'] as Goal[]).map((g) => (
                <Chip
                  key={g}
                  value={g}
                  selected={form.goal === g}
                  onClick={(v) => setForm((f) => ({ ...f, goal: v }))}
                />
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div>
            <p className="text-zinc-400 text-xs tracking-widest uppercase mb-3">
              週のトレーニング頻度
            </p>
            <div className="flex flex-wrap gap-2">
              {[2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, frequency: n }))}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                    form.frequency === n
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  週{n}回
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <p className="text-zinc-400 text-xs tracking-widest uppercase mb-3">場所</p>
            <div className="flex flex-wrap gap-2">
              {(['自宅', 'ジム'] as TrainingLocation[]).map((l) => (
                <Chip
                  key={l}
                  value={l}
                  selected={form.location === l}
                  onClick={(v) => setForm((f) => ({ ...f, location: v }))}
                />
              ))}
            </div>
          </div>

          {/* Level */}
          <div>
            <p className="text-zinc-400 text-xs tracking-widest uppercase mb-3">レベル</p>
            <div className="flex flex-wrap gap-2">
              {(['初心者', '中級者'] as Level[]).map((lv) => (
                <Chip
                  key={lv}
                  value={lv}
                  selected={form.level === lv}
                  onClick={(v) => setForm((f) => ({ ...f, level: v }))}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-orange-500 hover:bg-orange-400 text-white font-bold text-lg rounded-2xl transition-all active:scale-95 shadow-lg shadow-orange-500/20"
          >
            メニューを見る
          </button>
        </form>

        {/* Result */}
        {result && (
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <WeekPlanView plan={result.plan} level={result.level} />
          </div>
        )}
      </div>
    </div>
  )
}
