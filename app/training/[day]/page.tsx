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

interface EditableExercise {
  name: string
  setsReps: string
  advice: string
}

interface EditableDraft {
  focus: string
  exercises: EditableExercise[]
}

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
  const [editMode, setEditMode] = useState(false)
  const [draft, setDraft] = useState<EditableDraft | null>(null)

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

  // ---- チェックボックス ----
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
      const checkinsRaw = localStorage.getItem(CHECKIN_KEY)
      const checkins = checkinsRaw ? JSON.parse(checkinsRaw) : {}
      if (checkins[dateKey] !== 'done') {
        checkins[dateKey] = 'done'
        localStorage.setItem(CHECKIN_KEY, JSON.stringify(checkins))
      }
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

  // ---- 編集モード ----
  const enterEditMode = () => {
    if (!dayPlan?.session) return
    setDraft({
      focus: dayPlan.session.focus,
      exercises: dayPlan.session.exercises.map((ex) => ({
        name: ex.name,
        setsReps: ex.setsReps,
        advice: ex.advice,
      })),
    })
    setEditMode(true)
  }

  const cancelEdit = () => {
    setEditMode(false)
    setDraft(null)
  }

  const saveEdit = () => {
    if (!menu || !draft || !dayLabel) return
    const planIndex = DAY_PLAN_INDEX[dayLabel]
    const updatedPlan = menu.plan.map((p, i) => {
      if (i !== planIndex || p.isRest || !p.session) return p
      return {
        ...p,
        session: {
          ...p.session,
          focus: draft.focus,
          exercises: draft.exercises,
        },
      }
    })
    const updatedMenu: StoredMenu = { ...menu, plan: updatedPlan }
    setMenu(updatedMenu)
    localStorage.setItem(MENU_KEY, JSON.stringify(updatedMenu))

    // 種目数が変わったら完了状態をリセット
    if (draft.exercises.length !== exercises.length) {
      const completionRaw = localStorage.getItem(COMPLETION_KEY)
      const all: ExerciseCompletion = completionRaw ? JSON.parse(completionRaw) : {}
      delete all[dateKey]
      localStorage.setItem(COMPLETION_KEY, JSON.stringify(all))
      setCompletion([])
      setAllDone(false)
    }

    setEditMode(false)
    setDraft(null)
  }

  const updateDraftFocus = (value: string) => {
    if (!draft) return
    setDraft({ ...draft, focus: value })
  }

  const updateDraftExercise = (
    index: number,
    field: 'name' | 'setsReps',
    value: string
  ) => {
    if (!draft) return
    const exs = [...draft.exercises]
    exs[index] = { ...exs[index], [field]: value }
    setDraft({ ...draft, exercises: exs })
  }

  const addExercise = () => {
    if (!draft) return
    setDraft({
      ...draft,
      exercises: [...draft.exercises, { name: '', setsReps: '', advice: '' }],
    })
  }

  const removeExercise = (index: number) => {
    if (!draft) return
    setDraft({
      ...draft,
      exercises: draft.exercises.filter((_, i) => i !== index),
    })
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

  // ======== 編集モード UI ========
  if (editMode && draft) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white px-6 py-12">
        <div className="max-w-sm mx-auto">
          {/* 編集ヘッダー */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={cancelEdit}
              className="text-zinc-400 hover:text-zinc-200 text-sm transition-colors"
            >
              キャンセル
            </button>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-zinc-400 text-xs tracking-widest uppercase">編集モード</span>
            </div>
            <button
              onClick={saveEdit}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-400 active:scale-95 text-white text-sm font-bold rounded-xl transition-all"
            >
              保存する
            </button>
          </div>

          {/* 部位名編集 */}
          <div className="mb-6">
            <label className="text-zinc-500 text-xs tracking-widest uppercase block mb-2">
              部位名
            </label>
            <input
              type="text"
              value={draft.focus}
              onChange={(e) => updateDraftFocus(e.target.value)}
              placeholder="例：胸・肩"
              className="w-full bg-zinc-800 border border-zinc-700 focus:border-orange-500 text-white text-sm font-semibold rounded-xl px-4 py-3 outline-none transition-colors placeholder:text-zinc-600"
            />
          </div>

          {/* 種目リスト */}
          <div className="space-y-3 mb-4">
            {draft.exercises.map((ex, i) => (
              <div
                key={i}
                className="bg-zinc-800 border border-zinc-700 rounded-2xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-zinc-500 text-xs">種目 {i + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeExercise(i)}
                    className="w-6 h-6 rounded-full bg-zinc-700 hover:bg-red-600 active:scale-95 text-zinc-400 hover:text-white text-xs flex items-center justify-center transition-all"
                  >
                    ×
                  </button>
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={ex.name}
                    onChange={(e) => updateDraftExercise(i, 'name', e.target.value)}
                    placeholder="種目名（例：腕立て伏せ）"
                    className="w-full bg-zinc-900 border border-zinc-700 focus:border-orange-500 text-white text-sm rounded-xl px-3 py-3 outline-none transition-colors placeholder:text-zinc-600"
                  />
                  <input
                    type="text"
                    value={ex.setsReps}
                    onChange={(e) => updateDraftExercise(i, 'setsReps', e.target.value)}
                    placeholder="セット数・レップ数（例：3セット×10回）"
                    className="w-full bg-zinc-900 border border-zinc-700 focus:border-orange-500 text-zinc-300 text-xs rounded-xl px-3 py-3 outline-none transition-colors placeholder:text-zinc-600"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* 種目追加ボタン */}
          <button
            type="button"
            onClick={addExercise}
            className="w-full py-3 border-2 border-dashed border-zinc-700 hover:border-orange-500 hover:text-orange-400 text-zinc-500 text-sm font-semibold rounded-2xl transition-all active:scale-95"
          >
            ＋ 種目を追加
          </button>

          {/* 下部保存ボタン */}
          <button
            onClick={saveEdit}
            className="w-full mt-6 py-4 bg-orange-500 hover:bg-orange-400 active:scale-95 text-white font-bold text-base rounded-2xl transition-all shadow-lg shadow-orange-500/20"
          >
            保存する
          </button>
          <button
            onClick={cancelEdit}
            className="w-full mt-3 py-3 text-zinc-600 hover:text-zinc-400 text-sm transition-colors"
          >
            キャンセル
          </button>
        </div>
      </div>
    )
  }

  // ======== 通常表示 UI ========
  return (
    <div className="min-h-screen bg-zinc-950 text-white px-6 py-12">
      <div className="max-w-sm mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-black tracking-widest uppercase">M.WORLD</h1>
            <p className="text-zinc-600 text-xs">{dayLabel}曜日のトレーニング</p>
          </div>
          {menu && !dayPlan?.isRest && (
            <button
              onClick={enterEditMode}
              className="text-zinc-500 hover:text-orange-400 text-xs font-semibold transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-900"
            >
              編集
            </button>
          )}
        </div>

        {/* 日付 */}
        <p className="text-zinc-500 text-sm mb-6">
          {dayDate.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'short',
          })}
        </p>

        {/* メニュー未生成 */}
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

        {/* 休養日 */}
        {menu && dayPlan?.isRest && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">😴</div>
            <p className="text-zinc-400 font-bold text-lg">今日は休養日</p>
            <p className="text-zinc-600 text-sm mt-2">
              しっかり休んで次のトレーニングに備えよう
            </p>
          </div>
        )}

        {/* 種目一覧 */}
        {menu && !dayPlan?.isRest && exercises.length > 0 && (
          <>
            {dayPlan?.session?.focus && (
              <p className="text-orange-500 text-xs font-semibold tracking-widest uppercase mb-6">
                {dayPlan.session.focus}
              </p>
            )}

            {allDone && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-2xl text-center">
                <p className="text-green-400 font-bold">今日のトレーニング完了！</p>
                <p className="text-zinc-500 text-xs mt-1">ストリークが更新されました</p>
              </div>
            )}

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

            {/* 進捗バー */}
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
