import { type DayPlan } from './menus'

export interface StoredMenu {
  plan: DayPlan[]
  level: string
}

export type ExerciseCompletion = Record<string, boolean[]>

export const CHECKIN_KEY = 'mworld_checkins'
export const MENU_KEY = 'mworld_generated_menu'
export const LOG_KEY = 'mworld_training_logs'
export const COMPLETION_KEY = 'mworld_exercise_completion'

export const DAY_URL_TO_LABEL: Record<string, string> = {
  monday: '月',
  tuesday: '火',
  wednesday: '水',
  thursday: '木',
  friday: '金',
  saturday: '土',
  sunday: '日',
}

export const DAY_LABEL_TO_URL: Record<string, string> = {
  '月': 'monday',
  '火': 'tuesday',
  '水': 'wednesday',
  '木': 'thursday',
  '金': 'friday',
  '土': 'saturday',
  '日': 'sunday',
}

// Index in menus.ts DAYS array (0=Mon through 6=Sun)
export const DAY_PLAN_INDEX: Record<string, number> = {
  '月': 0, '火': 1, '水': 2, '木': 3, '金': 4, '土': 5, '日': 6,
}

export function getDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// dayIndex: 0=Mon, 1=Tue, ..., 6=Sun
export function getWeekDayDate(today: Date, dayIndex: number): Date {
  const dow = today.getDay() // 0=Sun, 1=Mon, ..., 6=Sat
  const mondayOffset = dow === 0 ? -6 : 1 - dow
  const monday = new Date(today)
  monday.setDate(today.getDate() + mondayOffset)
  const result = new Date(monday)
  result.setDate(monday.getDate() + dayIndex)
  return result
}

export function getWeekDates(today: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => getWeekDayDate(today, i))
}
