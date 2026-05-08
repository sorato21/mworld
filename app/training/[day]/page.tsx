'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import {
  type StoredMenu,
  type ExerciseCompletion,
  MENU_KEY,
  CHECKIN_KEY,
  LOG_KEY,
  COMPLETION_KEY,
  DAY_URL_TO_LABEL,
  DAY_PLAN_INDEX,
  getDateKey,
  getWeekDayDate,
} from '../../lib/training'

function youtubeUrl(name: string, level: string): string {
  const suffix = level === '初心者' ? 'フォーム 初心者 解説' : 'フォーム 正しいやり方 効果的'
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(name + ' ' + suffix)}`
}

export default function TrainingDayPage({
  params,
}: {
  params: Promise<{ day: string }>
}) {
  const { day } = use(params)
  const dayLabel = DAY_URL_TO_LABEL[day] ?? null

  const [menu, setMenu] = useState<StoredMenu | null>(null)
  const [completion, setCompletion] = useState<boolean[]>([])
  const [allDone, setAllDone] = useState(false)
  const [mounted, setMounted] = useState(false)

  const today = new Date()
  const dayIndex = dayLabel != null ? DAY_PLAN_INDEX[dayLabel] : 0
  const dayDate = getWeekDayDate(today, dayIndex)
  const dateKey = getDateKey(dayDate)

  useEffect(() => {
    const menuRaw = localStorage.getItem(MENU_KEY)
    if (menuRaw) {
      try { setMenu(JSON.parse(menuRaw)) } catch { /* ignore */ }
    }
    const completionRaw = localStorage.getItem(COMPLETION_KEY)
    if (completionRaw) {
      try {
        const all: ExerciseCompletion = JSON.parse(completionRaw)
        setCompletion(all[dateKey] ?? [])
      } catch { /* ignore */ }
    }
    setMounted(true)
  }, [dateKey])

  const dayPlan = menu?.plan.find((p) => p.day === dayLabel) ?? null
  const exercises = dayPlan?.session?.exercises ?? []

  useEffect(() => {
    if (exercises.length > 0) {
      setAllDone(
        completion.length >= exercises.length &&
          completion.slice(0, exercises.length).every(Boolean)
      )
    }
  }, [completion, exercises.length])

  const toggleExercise = (index: number) => {
    const updated = [...completion]
    updated[index] = !updated[index]
    setCompletion(updated)

    const completionRaw = localStorage.getItem(COMPLETION_KEY)
    const all: ExerciseCompletion = completionRaw ? JSON.parse(completionRaw) : {}
    all[dateKey] = updated
    localStorage.setItem(COMPLETION_KEY, JSON.stringify(all))

    const nowAllDone =
      exercises.length > 0 &&
      updated.slice(0, exercises.length).every(Boolean)

    if (nowAllDone) {
      // Auto check-in
      const checkinsRaw = localStorage.getItem(CHECKIN_KEY)
      const checkins = checkinsRaw ? JSON.parse(checkinsRaw) : {}
      if (checkins[dateKey] !== 'done') {
        checkins[dateKey] = 'done'
        localStorage.setItem(CHECKIN_KEY, JSON.stringify(checkins))
      }

      // Save training log
      const logsRaw = localStorage.getItem(LOG_KEY)
      const logs = logsRaw ? JSON.parse(logsRaw) : []
      const newLog = {
        date: dateKey,
        focus: dayPlan?.session?.focus ?? '',
        exercises: exercises.map((ex) => ({ name: ex.name, setsReps: ex.setsReps })),
      }
      const updatedLogs = [
        ...logs.filter((l: { date: string }) => l.date !== dateKey),
        newLog,
      ]
      localStorage.setItem(LOG_KEY, JSON.stringify(updatedLogs))

      setAllDone(true)
    } else {
      setAllDone(false)
    }
  }

  if (!mounted) return null

  if (!dayLabel) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center px-6">
        <p className="text-zinc-500 mb-4">無効なURLです</p>
        <Link href="/" className="text-orange-500 text-sm">← ホームへ</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-6 py-12">
      <div className="max-w-sm mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="text-zinc-600 hover:text-zinc-400 transition-colors text-sm"
          >
            ← ホーム
          </Link>
          <div>
            <h1 className="text-xl font-black tracking-widest uppercase">M.WORLD</h1>
            <p className="text-zinc-600 text-xs">{dayLabel}曜日のトレーニング</p>
          </div>
        </div>

        {/* Date */}
        <p className="text-zinc-500 text-sm mb-6">
          {dayDate.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'short',
          })}
        </p>

        {/* No menu */}
        {!menu && (
          <div className="text-center py-16">
            <p className="text-zinc-500 text-sm mb-6">メニューが生成されていません</p>
            <Link
              href="/menu"
              className="px-6 py-3 bg-orange-500 hover:bg-orange-400 text-white text-sm font-bold rounded-2xl transition-all active:scale-95"
            >
              メニューを生成する
            </Link>
          </div>
        )}

        {/* Rest day */}
        {menu && dayPlan?.isRest && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">😴</div>
            <p className="text-zinc-400 font-bold text-lg">今日は休養日</p>
            <p className="text-zinc-600 text-sm mt-2">
              しっかり休んで次のトレーニングに備えよう
            </p>
          </div>
        )}

        {/* Exercises */}
        {menu && !dayPlan?.isRest && exercises.length > 0 && (
          <>
            {/* Focus label */}
            {dayPlan?.session?.focus && (
              <p className="text-orange-500 text-xs font-semibold tracking-widest uppercase mb-6">
                {dayPlan.session.focus}
              </p>
            )}

            {/* Completion banner */}
            {allDone && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-2xl text-center">
                <p className="text-green-400 font-bold">今日のトレーニング完了！</p>
                <p className="text-zinc-500 text-xs mt-1">ストリークが更新されました</p>
              </div>
            )}

            {/* Exercise cards */}
            <div className="space-y-3">
              {exercises.map((ex, i) => {
                const done = completion[i] ?? false
                return (
                  <div
                    key={i}
                    className={`rounded-2xl p-4 border transition-all ${
                      done
                        ? 'bg-zinc-900/40 border-zinc-800/40 opacity-60'
                        : 'bg-zinc-900 border-zinc-800'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <button
                        type="button"
                        onClick={() => toggleExercise(i)}
                        className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all active:scale-95 mt-0.5 ${
                          done
                            ? 'bg-orange-500 border-orange-500 text-white'
                            : 'border-zinc-600 hover:border-orange-500'
                        }`}
                      >
                        {done && <span className="text-[10px] font-bold leading-none">✓</span>}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span
                            className={`font-bold text-sm ${
                              done ? 'line-through text-zinc-500' : 'text-white'
                            }`}
                          >
                            {ex.name}
                          </span>
                          <span className="text-zinc-500 text-xs whitespace-nowrap flex-shrink-0">
                            {ex.setsReps}
                          </span>
                        </div>
                        <p className="text-zinc-600 text-xs italic mb-3">{ex.advice}</p>
                        <a
                          href={youtubeUrl(ex.name, menu.level)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 w-fit px-3 py-1.5 bg-red-600 hover:bg-red-500 active:scale-95 text-white text-xs font-semibold rounded-lg transition-all"
                        >
                          ▶ フォームを見る
                        </a>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Progress bar */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-zinc-600 text-xs">進捗</span>
                <span
                  className={`text-xs font-semibold ${
                    allDone ? 'text-green-400' : 'text-orange-400'
                  }`}
                >
                  {completion.filter(Boolean).length} / {exercises.length}
                </span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    allDone ? 'bg-green-500' : 'bg-orange-500'
                  }`}
                  style={{
                    width: `${(completion.filter(Boolean).length / exercises.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
