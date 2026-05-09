'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  type StoredMenu,
  type ExerciseCompletion,
  MENU_KEY,
  COMPLETION_KEY,
  DAY_LABEL_TO_URL,
  getDateKey,
  getWeekDates,
} from '../lib/training'

export default function CalendarPage() {
  const [storedMenu, setStoredMenu] = useState<StoredMenu | null>(null)
  const [exerciseCompletion, setExerciseCompletion] = useState<ExerciseCompletion>({})
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const menuRaw = localStorage.getItem(MENU_KEY)
    if (menuRaw) { try { setStoredMenu(JSON.parse(menuRaw)) } catch { /* ignore */ } }
    const completionRaw = localStorage.getItem(COMPLETION_KEY)
    if (completionRaw) { try { setExerciseCompletion(JSON.parse(completionRaw)) } catch { /* ignore */ } }
    setMounted(true)
  }, [])

  if (!mounted) return null

  const today = new Date()
  const todayKey = getDateKey(today)
  const weekDates = getWeekDates(today)

  const weekDays = weekDates.map((date, i) => {
    const dateKey = getDateKey(date)
    const plan = storedMenu?.plan[i] ?? null
    const dayLabel = plan?.day ?? ['月', '火', '水', '木', '金', '土', '日'][i]
    const dayUrl = DAY_LABEL_TO_URL[dayLabel]
    const completionArr = exerciseCompletion[dateKey] ?? []
    const totalExercises = plan?.session?.exercises.length ?? 0
    const completedCount = completionArr.filter(Boolean).length
    const allDone = totalExercises > 0 && completedCount >= totalExercises
    const isToday = dateKey === todayKey
    return { date, dateKey, plan, dayLabel, dayUrl, totalExercises, completedCount, allDone, isToday }
  })

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-6 py-12 select-none">
      <div className="max-w-sm mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-xl font-black tracking-widest uppercase">M.WORLD</h1>
          <p className="text-zinc-600 text-xs">週間カレンダー</p>
        </div>

        <p className="text-zinc-400 text-xs tracking-widest uppercase mb-4">今週のメニュー</p>

        {!storedMenu ? (
          <div className="text-center py-12">
            <p className="text-zinc-600 text-sm mb-6">メニューが生成されていません</p>
            <Link
              href="/menu"
              className="px-6 py-3 bg-orange-500 hover:bg-orange-400 text-white text-sm font-bold rounded-2xl transition-all active:scale-95"
            >
              メニューを生成する
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {weekDays.map(({ dateKey, plan, dayLabel, dayUrl, totalExercises, completedCount, allDone, isToday }) => {
              const isRest = plan?.isRest ?? false
              const card = (
                <div
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    isToday
                      ? 'border-orange-500/40 bg-zinc-900'
                      : 'border-zinc-800 bg-zinc-900'
                  } ${!isRest ? 'active:scale-[0.98] cursor-pointer hover:border-zinc-700' : ''}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${
                      allDone
                        ? 'bg-green-500 text-white'
                        : isRest
                        ? 'bg-zinc-800 text-zinc-600'
                        : 'bg-orange-500/15 text-orange-400'
                    }`}
                  >
                    {allDone ? '✓' : isRest ? '−' : dayLabel}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-white text-sm font-bold">{dayLabel}曜日</p>
                      {isToday && (
                        <span className="text-orange-500 text-[10px] font-semibold bg-orange-500/10 px-1.5 py-0.5 rounded-full">
                          今日
                        </span>
                      )}
                    </div>
                    {isRest ? (
                      <p className="text-zinc-600 text-xs">休養日</p>
                    ) : (
                      <p className="text-zinc-500 text-xs truncate">
                        {plan?.session?.focus ?? '−'}
                      </p>
                    )}
                  </div>
                  {!isRest && totalExercises > 0 && (
                    <span
                      className={`text-xs font-semibold flex-shrink-0 ${
                        allDone ? 'text-green-400' : 'text-orange-400'
                      }`}
                    >
                      {completedCount}/{totalExercises}
                    </span>
                  )}
                  {!isRest && (
                    <span className="text-zinc-700 text-base flex-shrink-0">›</span>
                  )}
                </div>
              )

              return isRest ? (
                <div key={dateKey}>{card}</div>
              ) : (
                <Link key={dateKey} href={`/training/${dayUrl}`}>
                  {card}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
