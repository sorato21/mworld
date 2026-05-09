import { type Exercise } from './menus'
import {
  XP_KEY,
  MENU_KEY,
  COMPLETION_KEY,
  WEIGHT_LOG_KEY,
  WEIGHT_KEY,
  type ExerciseCompletion,
  type StoredMenu,
  getExerciseType,
  getDefaultWeight,
  parseSetsReps,
} from './training'

export interface XPStore {
  dates: Record<string, number>
}

export interface LevelInfo {
  level: number
  totalXP: number
  currentThreshold: number
  nextThreshold: number
  progressPct: number
}

export function getTotalXP(store: XPStore): number {
  return Object.values(store.dates).reduce((sum, v) => sum + v, 0)
}

export function getLevel(totalXP: number): number {
  if (totalXP < 100) return 1
  if (totalXP < 300) return 2
  if (totalXP < 600) return 3
  if (totalXP < 1000) return 4
  return Math.floor((totalXP - 1000) / 500) + 5
}

export function getLevelInfo(totalXP: number): LevelInfo {
  const level = getLevel(totalXP)
  let currentThreshold: number
  let nextThreshold: number
  if (level === 1) { currentThreshold = 0; nextThreshold = 100 }
  else if (level === 2) { currentThreshold = 100; nextThreshold = 300 }
  else if (level === 3) { currentThreshold = 300; nextThreshold = 600 }
  else if (level === 4) { currentThreshold = 600; nextThreshold = 1000 }
  else {
    currentThreshold = 1000 + (level - 5) * 500
    nextThreshold = currentThreshold + 500
  }
  const progressPct = Math.min(
    100,
    ((totalXP - currentThreshold) / (nextThreshold - currentThreshold)) * 100
  )
  return { level, totalXP, currentThreshold, nextThreshold, progressPct }
}

export function loadXPStore(): XPStore {
  if (typeof window === 'undefined') return { dates: {} }
  try {
    const raw = localStorage.getItem(XP_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return { dates: {} }
}

export function saveXPStore(store: XPStore): void {
  localStorage.setItem(XP_KEY, JSON.stringify(store))
}

// Pure calculation: returns XP earned for a given day's data.
// XP breakdown:
//   +10  checkin
//   +5   per completed exercise
//   +1   per 100kg of gym (barbell/dumbbell) volume (completed exercises only)
//   +1   per 10 bodyweight reps (completed exercises only)
export function calcDayXP(
  exercises: Exercise[],
  completion: boolean[],
  weightInputs: Record<string, number>,
  bodyWeight: number | null
): number {
  let xp = 10
  let gymVolume = 0
  let bwReps = 0

  exercises.forEach((ex, i) => {
    if (!completion[i]) return
    xp += 5

    const parsed = parseSetsReps(ex.setsReps)
    if (!parsed) return

    const type = getExerciseType(ex.name)
    if (type !== 'bodyweight') {
      const w = weightInputs[ex.name] ?? getDefaultWeight(ex.name, bodyWeight)
      gymVolume += w * parsed.sets * parsed.reps
    } else {
      bwReps += parsed.sets * parsed.reps
    }
  })

  xp += Math.floor(gymVolume / 100)
  xp += Math.floor(bwReps / 10)
  return xp
}

// Reads all needed data from localStorage, recalculates XP for the given day,
// and overwrites the stored value. Safe to call multiple times (idempotent).
export function awardDayXP(dateKey: string): number {
  try {
    const menuRaw = localStorage.getItem(MENU_KEY)
    const menu: StoredMenu | null = menuRaw ? JSON.parse(menuRaw) : null

    const completionRaw = localStorage.getItem(COMPLETION_KEY)
    const allCompletion: ExerciseCompletion = completionRaw ? JSON.parse(completionRaw) : {}
    const completion = allCompletion[dateKey] ?? []

    const wlRaw = localStorage.getItem(WEIGHT_LOG_KEY)
    const weightInputs: Record<string, number> = wlRaw ? JSON.parse(wlRaw) : {}

    const bwRaw = localStorage.getItem(WEIGHT_KEY)
    const bodyWeight = bwRaw ? parseFloat(bwRaw) : null

    const date = new Date(dateKey + 'T00:00:00')
    const dayLabel = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()]
    const exercises = menu?.plan.find((p) => p.day === dayLabel)?.session?.exercises ?? []

    const earned = calcDayXP(exercises, completion, weightInputs, bodyWeight)

    const store = loadXPStore()
    store.dates[dateKey] = earned
    saveXPStore(store)
    return earned
  } catch {
    return 0
  }
}
