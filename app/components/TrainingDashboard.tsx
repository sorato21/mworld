'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { type DayPlan } from '../lib/menus'

type CheckInStatus = 'done' | 'rest'
type CheckIns = Record<string, CheckInStatus>

interface StoredMenu {
  plan: DayPlan[]
  level: string
}

interface ExerciseRecord {
  name: string
  setsReps: string
}

interface TrainingRecord {
  date: string
  focus: string
  exercises: ExerciseRecord[]
}

const STORAGE_KEY = 'mworld_checkins'
const MENU_KEY = 'mworld_generated_menu'
const LOG_KEY = 'mworld_training_logs'
const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土']

function getDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function calculateStreak(checkIns: CheckIns, todayKey: string): number {
  let streak = 0
  const base = new Date(todayKey + 'T00:00:00')
  const startOffset = checkIns[todayKey] === 'done' ? 0 : 1
  for (let i = startOffset; i < 365; i++) {
    const d = new Date(base)
    d.setDate(base.getDate() - i)
    if (checkIns[getDateKey(d)] === 'done') {
      streak++
    } else {
      break
    }
  }
  return streak
}

function getLast7Days(today: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - 6 + i)
    return d
  })
}

function streakMessage(streak: number): string {
  if (streak === 0) return 'さあ、今日から始めよう'
  if (streak < 3) return '良いスタート！続けていこう'
  if (streak < 7) return 'いい調子！習慣になってきた'
  if (streak < 30) return 'すごい！本物の習慣になってる'
  return '伝説級の継続力！'
}

function getTodaySession(
  menu: StoredMenu,
  dayOfWeek: number
): { focus: string; exercises: ExerciseRecord[] } | null {
  const dayLabel = DAY_LABELS[dayOfWeek]
  const dayPlan = menu.plan.find((p) => p.day === dayLabel)
  if (!dayPlan || dayPlan.isRest || !dayPlan.session) return null
  return {
    focus: dayPlan.session.focus,
    exercises: dayPlan.session.exercises.map((ex) => ({
      name: ex.name,
      setsReps: ex.setsReps,
    })),
  }
}

export default function TrainingDashboard() {
  const [checkIns, setCheckIns] = useState<CheckIns>({})
  const [trainingLogs, setTrainingLogs] = useState<TrainingRecord[]>([])
  const [menuError, setMenuError] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try { setCheckIns(JSON.parse(raw)) } catch { /* ignore */ }
    }
    const logsRaw = localStorage.getItem(LOG_KEY)
    if (logsRaw) {
      try { setTrainingLogs(JSON.parse(logsRaw)) } catch { /* ignore */ }
    }
    setMounted(true)
  }, [])

  const today = new Date()
  const todayKey = getDateKey(today)
  const todayStatus = checkIns[todayKey]
  const streak = calculateStreak(checkIns, todayKey)
  const last7 = getLast7Days(today)

  const checkIn = (status: CheckInStatus) => {
    if (status === 'done') {
      const menuRaw = localStorage.getItem(MENU_KEY)
      if (!menuRaw) {
        setMenuError(true)
        return
      }
      try {
        const menu: StoredMenu = JSON.parse(menuRaw)
        const session = getTodaySession(menu, today.getDay())
        const newLog: TrainingRecord = {
          date: todayKey,
          focus: session?.focus ?? '',
          exercises: session?.exercises ?? [],
        }
        const updatedLogs = [
          ...trainingLogs.filter((l) => l.date !== todayKey),
          newLog,
        ]
        setTrainingLogs(updatedLogs)
        localStorage.setItem(LOG_KEY, JSON.stringify(updatedLogs))
      } catch {
        setMenuError(true)
        return
      }
    }
    setMenuError(false)
    const updated = { ...checkIns, [todayKey]: status }
    setCheckIns(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  const undoToday = () => {
    const updated = { ...checkIns }
    delete updated[todayKey]
    setCheckIns(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  if (!mounted) return null

  const historyDays = [...getLast7Days(today)].reverse().map((date) => {
    const dateKey = getDateKey(date)
    return {
      date,
      dateKey,
      log: trainingLogs.find((l) => l.date === dateKey) ?? null,
      status: checkIns[dateKey] as CheckInStatus | undefined,
    }
  })

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center px-6 py-16 select-none">
      {/* Brand */}
      <div className="text-center mb-14">
        <h1 className="text-4xl font-black tracking-[0.25em] text-white uppercase">M.WORLD</h1>
        <p className="text-zinc-600 text-xs tracking-[0.2em] mt-1 uppercase">Fitness Habit Tracker</p>
      </div>

      {/* Streak */}
      <div className="text-center mb-10">
        <div
          className={`text-[7rem] font-black leading-none tabular-nums transition-colors duration-500 ${
            streak >= 7
              ? 'text-orange-400'
              : streak > 0
              ? 'text-amber-500'
              : 'text-zinc-700'
          }`}
        >
          {streak}
        </div>
        <p className="text-zinc-400 text-base mt-2 tracking-wide">
          {streak > 0 ? '🔥 ' : ''}連続トレーニング日数
        </p>
        <p className="text-zinc-600 text-sm mt-1">{streakMessage(streak)}</p>
      </div>

      {/* Last 7 days dots */}
      <div className="flex gap-2 mb-12">
        {last7.map((date) => {
          const key = getDateKey(date)
          const status = checkIns[key]
          const isToday = key === todayKey
          return (
            <div key={key} className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] text-zinc-600 uppercase">
                {DAY_LABELS[date.getDay()]}
              </span>
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ring-2 transition-all ${
                  isToday ? 'ring-white' : 'ring-transparent'
                } ${
                  status === 'done'
                    ? 'bg-orange-500 text-white'
                    : status === 'rest'
                    ? 'bg-zinc-800 text-zinc-500'
                    : 'bg-zinc-900 text-zinc-600'
                }`}
              >
                {status === 'done' ? '✓' : status === 'rest' ? '−' : date.getDate()}
              </div>
            </div>
          )
        })}
      </div>

      {/* Today info */}
      <div className="text-center mb-8">
        <p className="text-zinc-500 text-sm">
          {today.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'short',
          })}
        </p>
        {todayStatus && (
          <p
            className={`text-sm font-semibold mt-1 ${
              todayStatus === 'done' ? 'text-orange-400' : 'text-zinc-500'
            }`}
          >
            {todayStatus === 'done' ? '今日のトレーニング完了！' : '今日は休養日'}
          </p>
        )}
        {!todayStatus && (
          <p className="text-zinc-600 text-sm mt-1">今日はまだチェックインしていません</p>
        )}
      </div>

      {/* Actions */}
      {todayStatus ? (
        <button
          onClick={undoToday}
          className="text-zinc-700 text-xs hover:text-zinc-500 transition-colors mt-2"
        >
          やり直す
        </button>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-4">
            <button
              onClick={() => checkIn('done')}
              className="px-8 py-4 bg-orange-500 hover:bg-orange-400 active:scale-95 text-white font-bold text-lg rounded-2xl transition-all shadow-lg shadow-orange-500/20"
            >
              やった！
            </button>
            <button
              onClick={() => checkIn('rest')}
              className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-300 font-bold text-lg rounded-2xl transition-all"
            >
              休み
            </button>
          </div>
          {menuError && (
            <p className="text-orange-400 text-sm font-semibold">
              先にメニューを生成してください
            </p>
          )}
        </div>
      )}

      {/* Menu generator link */}
      <Link
        href="/menu"
        className="mt-10 flex items-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white text-sm font-semibold rounded-2xl transition-all active:scale-95"
      >
        <span className="text-base">🤖</span>
        AIメニュー自動生成
      </Link>

      {/* Training History */}
      <div className="w-full max-w-sm mt-12">
        <p className="text-zinc-400 text-xs tracking-widest uppercase mb-4">トレーニング履歴</p>
        <div className="space-y-3">
          {historyDays.map(({ date, dateKey, log, status }) => (
            <div
              key={dateKey}
              className="bg-zinc-900 rounded-xl p-4 border border-zinc-800"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-bold text-sm">
                  {date.toLocaleDateString('ja-JP', {
                    month: 'numeric',
                    day: 'numeric',
                    weekday: 'short',
                  })}
                </span>
                {status === 'done' && (
                  <span className="text-orange-500 text-xs font-semibold">✓ 完了</span>
                )}
                {status === 'rest' && (
                  <span className="text-zinc-500 text-xs">− 休養</span>
                )}
                {!status && (
                  <span className="text-zinc-700 text-xs">未記録</span>
                )}
              </div>
              {log && log.focus && (
                <p className="text-orange-400 text-xs font-semibold mb-2">{log.focus}</p>
              )}
              {log && log.exercises.length > 0 ? (
                <div className="space-y-1.5">
                  {log.exercises.map((ex, i) => (
                    <div key={i} className="flex items-start justify-between gap-3">
                      <span className="text-zinc-300 text-xs">▸ {ex.name}</span>
                      <span className="text-zinc-500 text-xs whitespace-nowrap">{ex.setsReps}</span>
                    </div>
                  ))}
                </div>
              ) : status === 'done' ? (
                <p className="text-zinc-700 text-xs">種目情報なし（休養日メニュー）</p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
