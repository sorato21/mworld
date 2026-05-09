'use client'

import { useState, useEffect } from 'react'
import { CHECKIN_KEY, LOG_KEY, getDateKey } from '../lib/training'

type CheckInStatus = 'done' | 'rest'
type CheckIns = Record<string, CheckInStatus>

interface ExerciseRecord {
  name: string
  setsReps: string
}

interface TrainingRecord {
  date: string
  focus: string
  exercises: ExerciseRecord[]
}

function getLast7Days(today: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - 6 + i)
    return d
  })
}

export default function HistoryPage() {
  const [checkIns, setCheckIns] = useState<CheckIns>({})
  const [trainingLogs, setTrainingLogs] = useState<TrainingRecord[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem(CHECKIN_KEY)
    if (raw) { try { setCheckIns(JSON.parse(raw)) } catch { /* ignore */ } }
    const logsRaw = localStorage.getItem(LOG_KEY)
    if (logsRaw) { try { setTrainingLogs(JSON.parse(logsRaw)) } catch { /* ignore */ } }
    setMounted(true)
  }, [])

  if (!mounted) return null

  const today = new Date()
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
    <div className="min-h-screen bg-zinc-950 text-white px-6 py-12 select-none">
      <div className="max-w-sm mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-xl font-black tracking-widest uppercase">M.WORLD</h1>
          <p className="text-zinc-600 text-xs">トレーニング履歴</p>
        </div>

        <p className="text-zinc-400 text-xs tracking-widest uppercase mb-4">過去7日間</p>

        <div className="space-y-3">
          {historyDays.map(({ date, dateKey, log, status }) => (
            <div key={dateKey} className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
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
              {log?.focus && (
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
