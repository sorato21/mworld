import {
  MENU_KEY,
  COMPLETION_KEY,
  WEIGHT_LOG_KEY,
  WEIGHT_KEY,
  type StoredMenu,
  type ExerciseCompletion,
  getExerciseType,
  getDefaultWeight,
  parseSetsReps,
} from './training'

export const BOSS_STATE_KEY = 'mworld_boss_state'

export type BossId = 'goblin' | 'orc' | 'troll' | 'dragon'

export interface BossDefinition {
  id: BossId
  name: string
  maxHP: number
}

export interface BossState {
  bossIndex: number
  damageAccumulated: number
  lastDamageDateKey: string | null
}

const FIXED_BOSSES: BossDefinition[] = [
  { id: 'goblin', name: 'ゴブリン', maxHP: 1000 },
  { id: 'orc', name: 'オーク', maxHP: 3000 },
  { id: 'troll', name: 'トロル', maxHP: 5000 },
  { id: 'dragon', name: 'ドラゴン', maxHP: 10000 },
]

export function getBossDefinition(index: number): BossDefinition {
  if (index < FIXED_BOSSES.length) return FIXED_BOSSES[index]
  const extra = index - FIXED_BOSSES.length + 1
  return { id: 'dragon', name: `ドラゴン Lv${extra + 1}`, maxHP: 10000 + extra * 5000 }
}

export function loadBossState(): BossState {
  if (typeof window === 'undefined') return { bossIndex: 0, damageAccumulated: 0, lastDamageDateKey: null }
  try {
    const raw = localStorage.getItem(BOSS_STATE_KEY)
    if (raw) return { lastDamageDateKey: null, ...JSON.parse(raw) }
  } catch { /* ignore */ }
  return { bossIndex: 0, damageAccumulated: 0, lastDamageDateKey: null }
}

export function saveBossState(state: BossState): void {
  localStorage.setItem(BOSS_STATE_KEY, JSON.stringify(state))
}

export function calcDayDamage(dateKey: string): number {
  try {
    const menuRaw = localStorage.getItem(MENU_KEY)
    const menu: StoredMenu | null = menuRaw ? JSON.parse(menuRaw) : null
    if (!menu) return 0

    const completionRaw = localStorage.getItem(COMPLETION_KEY)
    const allCompletion: ExerciseCompletion = completionRaw ? JSON.parse(completionRaw) : {}
    const completion = allCompletion[dateKey] ?? []

    const wlRaw = localStorage.getItem(WEIGHT_LOG_KEY)
    const weightInputs: Record<string, number> = wlRaw ? JSON.parse(wlRaw) : {}

    const bwRaw = localStorage.getItem(WEIGHT_KEY)
    const bodyWeight = bwRaw ? parseFloat(bwRaw) : null

    const date = new Date(dateKey + 'T00:00:00')
    const dayLabel = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()]
    const exercises = menu.plan.find((p) => p.day === dayLabel)?.session?.exercises ?? []

    let damage = 0
    exercises.forEach((ex, i) => {
      if (!completion[i]) return
      const parsed = parseSetsReps(ex.setsReps)
      if (!parsed) return
      const type = getExerciseType(ex.name)
      if (type !== 'bodyweight') {
        const w = weightInputs[ex.name] ?? getDefaultWeight(ex.name, bodyWeight)
        damage += w * parsed.sets * parsed.reps
      } else {
        damage += parsed.sets * parsed.reps * 10
      }
    })

    return Math.round(damage)
  } catch {
    return 0
  }
}

export interface DamageResult {
  newState: BossState
  defeated: boolean
  xpBonus: number
  damage: number
}

export function applyCheckinDamage(state: BossState, dateKey: string): DamageResult {
  if (state.lastDamageDateKey === dateKey) {
    return { newState: state, defeated: false, xpBonus: 0, damage: 0 }
  }

  const damage = calcDayDamage(dateKey)
  const boss = getBossDefinition(state.bossIndex)
  const newTotal = state.damageAccumulated + damage

  if (newTotal >= boss.maxHP) {
    return {
      newState: { bossIndex: state.bossIndex + 1, damageAccumulated: 0, lastDamageDateKey: dateKey },
      defeated: true,
      xpBonus: 50,
      damage,
    }
  }

  return {
    newState: { ...state, damageAccumulated: newTotal, lastDamageDateKey: dateKey },
    defeated: false,
    xpBonus: 0,
    damage,
  }
}
