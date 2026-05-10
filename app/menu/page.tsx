'use client'

import { useState, useEffect } from 'react'
import { getWeekPlan, getAdviceForExercise, type Goal, type TrainingLocation, type Level, type DayPlan } from '../lib/menus'
import { MENU_KEY } from '../lib/training'

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
  const [editMode, setEditMode] = useState(false)
  const [editablePlan, setEditablePlan] = useState<DayPlan[]>([])

  useEffect(() => {
    const raw = localStorage.getItem(MENU_KEY)
    if (raw) { try { setResult(JSON.parse(raw)) } catch { /* ignore */ } }
  }, [])

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    const plan = getWeekPlan(form.goal, form.location, form.level, form.frequency)
    const generated = { plan, level: form.level }
    setResult(generated)
    localStorage.setItem(MENU_KEY, JSON.stringify(generated))
  }

  const enterEditMode = () => {
    if (!result) return
    setEditablePlan(JSON.parse(JSON.stringify(result.plan)))
    setEditMode(true)
  }

  const cancelEdit = () => setEditMode(false)

  const saveEdit = () => {
    if (!result) return
    const updated = { ...result, plan: editablePlan }
    setResult(updated)
    localStorage.setItem(MENU_KEY, JSON.stringify(updated))
    setEditMode(false)
  }

  const toggleDayRest = (i: number) => {
    setEditablePlan((prev) =>
      prev.map((d, idx) =>
        idx !== i
          ? d
          : d.isRest
          ? { ...d, isRest: false, session: { focus: '', exercises: [{ name: '', setsReps: '', advice: '' }] } }
          : { ...d, isRest: true, session: null }
      )
    )
  }

  const updateFocus = (i: number, value: string) => {
    setEditablePlan((prev) =>
      prev.map((d, idx) =>
        idx !== i || !d.session ? d : { ...d, session: { ...d.session, focus: value } }
      )
    )
  }

  const updateExercise = (dayIdx: number, exIdx: number, field: 'name' | 'setsReps', value: string) => {
    setEditablePlan((prev) =>
      prev.map((d, idx) => {
        if (idx !== dayIdx || !d.session) return d
        const exs = d.session.exercises.map((ex, ei) => {
          if (ei !== exIdx) return ex
          const updated = { ...ex, [field]: value }
          if (field === 'name') {
            const advice = getAdviceForExercise(value)
            if (advice) updated.advice = advice
          }
          return updated
        })
        return { ...d, session: { ...d.session, exercises: exs } }
      })
    )
  }

  const addExercise = (dayIdx: number) => {
    setEditablePlan((prev) =>
      prev.map((d, idx) => {
        if (idx !== dayIdx || !d.session) return d
        return {
          ...d,
          session: {
            ...d.session,
            exercises: [...d.session.exercises, { name: '', setsReps: '', advice: '' }],
          },
        }
      })
    )
  }

  const removeExercise = (dayIdx: number, exIdx: number) => {
    setEditablePlan((prev) =>
      prev.map((d, idx) => {
        if (idx !== dayIdx || !d.session) return d
        return {
          ...d,
          session: { ...d.session, exercises: d.session.exercises.filter((_, ei) => ei !== exIdx) },
        }
      })
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white px-6 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl font-black tracking-widest uppercase">M.WORLD</h1>
          <p className="text-zinc-600 text-xs tracking-wider">週間トレーニングメニュー</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8 mb-10">
          {/* Goal */}
          <div>
            <p className="text-zinc-400 text-xs tracking-widest uppercase mb-3">目標</p>
            <div className="flex flex-wrap gap-2">
              {(['筋肉をつけたい', '痩せたい', '健康維持'] as Goal[]).map((g) => (
                <Chip key={g} value={g} selected={form.goal === g} onClick={(v) => setForm((f) => ({ ...f, goal: v }))} />
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div>
            <p className="text-zinc-400 text-xs tracking-widest uppercase mb-3">週のトレーニング頻度</p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={7}
                value={form.frequency}
                onChange={(e) => {
                  const v = Math.min(7, Math.max(1, parseInt(e.target.value) || 1))
                  setForm((f) => ({ ...f, frequency: v }))
                }}
                className="w-20 px-4 py-2 rounded-xl text-sm font-semibold bg-zinc-800 text-white border border-zinc-700 focus:border-orange-500 focus:outline-none text-center"
              />
              <span className="text-zinc-400 text-sm">回 / 週（1〜7）</span>
            </div>
          </div>

          {/* Location */}
          <div>
            <p className="text-zinc-400 text-xs tracking-widest uppercase mb-3">場所</p>
            <div className="flex flex-wrap gap-2">
              {(['自宅', 'ジム'] as TrainingLocation[]).map((l) => (
                <Chip key={l} value={l} selected={form.location === l} onClick={(v) => setForm((f) => ({ ...f, location: v }))} />
              ))}
            </div>
          </div>

          {/* Level */}
          <div>
            <p className="text-zinc-400 text-xs tracking-widest uppercase mb-3">レベル</p>
            <div className="flex flex-wrap gap-2">
              {(['初心者', '中級者'] as Level[]).map((lv) => (
                <Chip key={lv} value={lv} selected={form.level === lv} onClick={(v) => setForm((f) => ({ ...f, level: v }))} />
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

        {/* Result — 通常表示 */}
        {result && !editMode && (
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            <div className="flex items-center justify-between mb-6">
              <span className="text-zinc-400 text-xs tracking-widest uppercase">今週のメニュー</span>
              <button
                onClick={enterEditMode}
                className="text-zinc-500 hover:text-orange-400 text-xs font-semibold transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-800"
              >
                編集
              </button>
            </div>
            <WeekPlanView plan={result.plan} level={result.level} />
          </div>
        )}

        {/* Result — 編集モード */}
        {result && editMode && (
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
            {/* Edit header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-zinc-400 text-xs tracking-widest uppercase">編集モード</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={cancelEdit}
                  className="text-zinc-500 hover:text-zinc-300 text-xs font-semibold transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-800"
                >
                  キャンセル
                </button>
                <button
                  onClick={saveEdit}
                  className="px-4 py-1.5 bg-orange-500 hover:bg-orange-400 active:scale-95 text-white text-xs font-bold rounded-xl transition-all"
                >
                  保存する
                </button>
              </div>
            </div>

            {/* Days */}
            <div className="space-y-5">
              {editablePlan.map((dayPlan, dayIdx) => (
                <div key={dayPlan.day} className="border border-zinc-800 rounded-2xl p-4">
                  {/* Day header */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`font-black text-lg ${dayPlan.isRest ? 'text-zinc-600' : 'text-orange-400'}`}>
                      {dayPlan.day}曜日
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleDayRest(dayIdx)}
                      className={`text-xs font-semibold px-3 py-1 rounded-lg transition-all active:scale-95 ${
                        dayPlan.isRest
                          ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      {dayPlan.isRest ? 'トレーニングに変更' : '休養日にする'}
                    </button>
                  </div>

                  {dayPlan.isRest && (
                    <p className="text-zinc-700 text-xs">休養日</p>
                  )}

                  {!dayPlan.isRest && dayPlan.session && (
                    <>
                      {/* Focus */}
                      <input
                        type="text"
                        value={dayPlan.session.focus}
                        onChange={(e) => updateFocus(dayIdx, e.target.value)}
                        placeholder="部位名（例：胸・肩）"
                        className="w-full bg-zinc-800 border border-zinc-700 focus:border-orange-500 text-white text-sm font-semibold rounded-xl px-3 py-2.5 outline-none transition-colors placeholder:text-zinc-600 mb-3"
                      />

                      {/* Exercises */}
                      <div className="space-y-2">
                        {dayPlan.session.exercises.map((ex, exIdx) => (
                          <div key={exIdx} className="flex gap-2 items-start">
                            <div className="flex-1 space-y-1.5">
                              <input
                                type="text"
                                value={ex.name}
                                onChange={(e) => updateExercise(dayIdx, exIdx, 'name', e.target.value)}
                                placeholder="種目名（例：腕立て伏せ）"
                                className="w-full bg-zinc-800 border border-zinc-700 focus:border-orange-500 text-white text-sm rounded-xl px-3 py-2 outline-none transition-colors placeholder:text-zinc-600"
                              />
                              <input
                                type="text"
                                value={ex.setsReps}
                                onChange={(e) => updateExercise(dayIdx, exIdx, 'setsReps', e.target.value)}
                                placeholder="セット数（例：3セット×10回）"
                                className="w-full bg-zinc-800 border border-zinc-700 focus:border-orange-500 text-zinc-300 text-xs rounded-xl px-3 py-2 outline-none transition-colors placeholder:text-zinc-600"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeExercise(dayIdx, exIdx)}
                              className="w-7 h-7 rounded-full bg-zinc-800 hover:bg-red-600 text-zinc-500 hover:text-white text-sm flex items-center justify-center transition-all active:scale-95 flex-shrink-0 mt-1"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => addExercise(dayIdx)}
                        className="w-full mt-3 py-2 border border-dashed border-zinc-700 hover:border-orange-500 hover:text-orange-400 text-zinc-600 text-xs font-semibold rounded-xl transition-all active:scale-95"
                      >
                        ＋ 種目を追加
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={saveEdit}
              className="w-full mt-6 py-4 bg-orange-500 hover:bg-orange-400 active:scale-95 text-white font-bold text-base rounded-2xl transition-all shadow-lg shadow-orange-500/20"
            >
              保存する
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
