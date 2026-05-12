'use client'

import { useState, useEffect } from 'react'
import {
  type StoredMenu,
  CHECKIN_KEY,
  MENU_KEY,
  LOG_KEY,
  WEIGHT_KEY,
  getDateKey,
} from '../lib/training'
import {
  type XPStore,
  loadXPStore,
  saveXPStore,
  getTotalXP,
  getLevelInfo,
  awardDayXP,
} from '../lib/xp'
import WeightModal from './WeightModal'
import NotificationModal from './NotificationModal'
import GuideModal from './GuideModal'
import DailyRecordModal from './DailyRecordModal'
import BossCard from './BossCard'
import { loadRecords, SKIP_RECORD_KEY } from '../lib/records'
import {
  type BossState,
  loadBossState,
  saveBossState,
  getBossDefinition,
  applyCheckinDamage,
} from '../lib/boss'

const NOTIF_KEY = 'mworld_notification_settings'

interface NotifSettings {
  enabled: boolean
  hour: number
  minute: number
}

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

const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土']

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

export default function HomeScreen() {
  const [checkIns, setCheckIns] = useState<CheckIns>({})
  const [trainingLogs, setTrainingLogs] = useState<TrainingRecord[]>([])
  const [storedMenu, setStoredMenu] = useState<StoredMenu | null>(null)
  const [menuError, setMenuError] = useState(false)
  const [bodyWeight, setBodyWeight] = useState<number | null>(null)
  const [showWeightModal, setShowWeightModal] = useState(false)
  const [isFirstTime, setIsFirstTime] = useState(false)
  const [xpStore, setXpStore] = useState<XPStore>({ dates: {} })
  const [mounted, setMounted] = useState(false)
  const [showNotifModal, setShowNotifModal] = useState(false)
  const [notifSettings, setNotifSettings] = useState<NotifSettings>({ enabled: false, hour: 20, minute: 0 })
  const [showGuide, setShowGuide] = useState(false)
  const [showDailyRecord, setShowDailyRecord] = useState(false)
  const [bossState, setBossState] = useState<BossState>({ bossIndex: 0, damageAccumulated: 0, lastDamageDateKey: null })
  const [bossDefeatedMsg, setBossDefeatedMsg] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem(CHECKIN_KEY)
    if (raw) { try { setCheckIns(JSON.parse(raw)) } catch { /* ignore */ } }
    const logsRaw = localStorage.getItem(LOG_KEY)
    if (logsRaw) { try { setTrainingLogs(JSON.parse(logsRaw)) } catch { /* ignore */ } }
    const menuRaw = localStorage.getItem(MENU_KEY)
    if (menuRaw) { try { setStoredMenu(JSON.parse(menuRaw)) } catch { /* ignore */ } }
    const weightRaw = localStorage.getItem(WEIGHT_KEY)
    if (weightRaw) {
      const w = parseFloat(weightRaw)
      if (!isNaN(w)) setBodyWeight(w)
    } else {
      setIsFirstTime(true)
      setShowWeightModal(true)
    }
    setXpStore(loadXPStore())
    setBossState(loadBossState())

    // 通知設定を読み込む
    const notifRaw = localStorage.getItem(NOTIF_KEY)
    if (notifRaw) { try { setNotifSettings(JSON.parse(notifRaw)) } catch { /* ignore */ } }

    // Service Worker 登録 + チェックイン状態の問い合わせ応答
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        const sendSchedule = (s: NotifSettings) => {
          const target = reg.active ?? reg.installing ?? reg.waiting
          target?.postMessage({ type: 'SCHEDULE', ...s })
        }
        const settings: NotifSettings = notifRaw
          ? JSON.parse(notifRaw)
          : { enabled: false, hour: 20, minute: 0 }
        if (settings.enabled && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          sendSchedule(settings)
        }
      }).catch(() => { /* SW 未サポート環境は無視 */ })

      // SW からのチェックイン状態問い合わせに応答
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'GET_CHECKIN_STATUS') {
          const checkins: Record<string, string> = JSON.parse(
            localStorage.getItem(CHECKIN_KEY) ?? '{}'
          )
          const todayKey = getDateKey(new Date())
          event.ports[0]?.postMessage({ checkedIn: checkins[todayKey] === 'done' })
        }
      })
    }

    // 体重記録モーダルの自動表示チェック
    const todayDateKey = getDateKey(new Date())
    const skipDate = localStorage.getItem(SKIP_RECORD_KEY)
    const todayRecords = loadRecords()
    const hasTodayRecord = todayRecords.some((r) => r.date === todayDateKey)
    if (!hasTodayRecord && skipDate !== todayDateKey) {
      setShowDailyRecord(true)
    }

    setMounted(true)
  }, [])

  const saveWeight = (weight: number) => {
    setBodyWeight(weight)
    localStorage.setItem(WEIGHT_KEY, String(weight))
    setShowWeightModal(false)
    setIsFirstTime(false)
  }

  const today = new Date()
  const todayKey = getDateKey(today)
  const todayStatus = checkIns[todayKey]
  const streak = calculateStreak(checkIns, todayKey)
  const last7 = getLast7Days(today)

  const totalXP = getTotalXP(xpStore)
  const levelInfo = getLevelInfo(totalXP)
  const todayXP = xpStore.dates[todayKey] ?? 0

  const checkIn = (status: CheckInStatus) => {
    if (status === 'done') {
      if (!storedMenu) {
        setMenuError(true)
        return
      }
      const session = getTodaySession(storedMenu, today.getDay())
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
    }
    setMenuError(false)
    const updated = { ...checkIns, [todayKey]: status }
    setCheckIns(updated)
    localStorage.setItem(CHECKIN_KEY, JSON.stringify(updated))

    if (status === 'done') {
      awardDayXP(todayKey)

      const currentBoss = loadBossState()
      const result = applyCheckinDamage(currentBoss, todayKey)
      saveBossState(result.newState)
      setBossState(result.newState)

      if (result.defeated) {
        const store = loadXPStore()
        store.dates['boss_bonus'] = (store.dates['boss_bonus'] ?? 0) + result.xpBonus
        saveXPStore(store)
        setBossDefeatedMsg(true)
        setTimeout(() => setBossDefeatedMsg(false), 4000)
      }

      setXpStore(loadXPStore())
    }
  }

  const undoToday = () => {
    const updated = { ...checkIns }
    delete updated[todayKey]
    setCheckIns(updated)
    localStorage.setItem(CHECKIN_KEY, JSON.stringify(updated))
  }

  // 通知設定を保存して SW にスケジュールを送信
  const handleNotifSave = async (enabled: boolean, hour: number, minute: number) => {
    const settings: NotifSettings = { enabled, hour, minute }
    setNotifSettings(settings)
    localStorage.setItem(NOTIF_KEY, JSON.stringify(settings))
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready
        reg.active?.postMessage({ type: 'SCHEDULE', ...settings })
      } catch { /* ignore */ }
    }
  }

  // 過去の日付のチェックイン切り替え：なし → done → rest → なし
  const togglePastCheckin = (dateKey: string, date: Date) => {
    const current = checkIns[dateKey]
    let next: CheckInStatus | undefined
    if (!current) next = 'done'
    else if (current === 'done') next = 'rest'
    else next = undefined

    const updated = { ...checkIns }
    if (next) {
      updated[dateKey] = next
    } else {
      delete updated[dateKey]
    }
    setCheckIns(updated)
    localStorage.setItem(CHECKIN_KEY, JSON.stringify(updated))

    if (next === 'done') {
      if (storedMenu) {
        const dayLabel = DAY_LABELS[date.getDay()]
        const dayPlan = storedMenu.plan.find((p) => p.day === dayLabel)
        if (dayPlan && !dayPlan.isRest && dayPlan.session) {
          const newLog = {
            date: dateKey,
            focus: dayPlan.session.focus,
            exercises: dayPlan.session.exercises.map((ex) => ({ name: ex.name, setsReps: ex.setsReps })),
          }
          const logsRaw = localStorage.getItem(LOG_KEY)
          const logs = logsRaw ? JSON.parse(logsRaw) : []
          const updatedLogs = [...logs.filter((l: { date: string }) => l.date !== dateKey), newLog]
          setTrainingLogs(updatedLogs)
          localStorage.setItem(LOG_KEY, JSON.stringify(updatedLogs))
        }
      }
      awardDayXP(dateKey)
      setXpStore(loadXPStore())
    } else if (current === 'done') {
      const store = loadXPStore()
      delete store.dates[dateKey]
      saveXPStore(store)
      setXpStore(loadXPStore())
    }
  }

  if (!mounted) return null

  return (
    <>
      {showWeightModal && (
        <WeightModal
          initialWeight={bodyWeight ?? undefined}
          isFirstTime={isFirstTime}
          onSave={saveWeight}
          onClose={isFirstTime ? undefined : () => setShowWeightModal(false)}
        />
      )}

      {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}

      {showDailyRecord && (
        <DailyRecordModal
          onSaved={() => setShowDailyRecord(false)}
          onSkip={() => setShowDailyRecord(false)}
        />
      )}

      {showNotifModal && (
        <NotificationModal
          initialEnabled={notifSettings.enabled}
          initialHour={notifSettings.hour}
          initialMinute={notifSettings.minute}
          onSave={handleNotifSave}
          onClose={() => setShowNotifModal(false)}
        />
      )}

      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center px-6 py-12 select-none">
        {/* Brand + 設定ボタン */}
        <div className="w-full max-w-sm flex items-start justify-between mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-[0.25em] text-white uppercase">M.WORLD</h1>
            <p className="text-zinc-600 text-xs tracking-[0.2em] mt-1 uppercase">Fitness Habit Tracker</p>
          </div>
          <div className="flex items-start gap-3 mt-1">
            <button
              onClick={() => setShowGuide(true)}
              className="flex flex-col items-center gap-1 text-zinc-500 hover:text-orange-400 transition-colors"
            >
              <span className="text-lg leading-none">ℹ️</span>
              <span className="text-[10px] font-semibold whitespace-nowrap">使い方</span>
            </button>
            <button
              onClick={() => setShowNotifModal(true)}
              className="flex flex-col items-center gap-1 text-zinc-500 hover:text-orange-400 transition-colors"
            >
              <span className="text-lg leading-none">{notifSettings.enabled ? '🔔' : '🔕'}</span>
              <span className="text-[10px] font-semibold whitespace-nowrap">通知</span>
            </button>
            <button
              onClick={() => setShowWeightModal(true)}
              className="flex flex-col items-center gap-1 text-zinc-500 hover:text-orange-400 transition-colors"
            >
              <span className="text-lg leading-none">⚖️</span>
              <span className="text-[10px] font-semibold whitespace-nowrap">
                {bodyWeight != null ? `${bodyWeight}kg` : '体重'}
              </span>
            </button>
          </div>
        </div>

        {/* Streak */}
        <div className="text-center mb-6">
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

        {/* XP Section */}
        <div className="w-full max-w-sm mb-10">
          <div className="flex items-end justify-between mb-2">
            <div className="flex items-baseline gap-2">
              <span className="text-orange-400 font-black text-3xl leading-none">
                Lv{levelInfo.level}
              </span>
            </div>
            <span className="text-zinc-500 text-xs tabular-nums">
              {levelInfo.totalXP.toLocaleString()} / {levelInfo.nextThreshold.toLocaleString()} XP
            </span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all duration-700"
              style={{ width: `${levelInfo.progressPct}%` }}
            />
          </div>
          {todayXP > 0 && (
            <p className="text-orange-400 text-xs font-semibold text-right mt-1.5">
              今日 +{todayXP} XP 獲得！
            </p>
          )}
        </div>

        {/* Boss Battle */}
        {bossDefeatedMsg && (
          <div className="w-full max-w-sm mb-2 bg-orange-500 rounded-2xl px-5 py-3 text-center animate-pulse">
            <p className="text-white font-black text-base">🎉 ボスを倒した！次のボスが現れた！</p>
            <p className="text-orange-100 text-xs mt-0.5">+50 XP ボーナス獲得！</p>
          </div>
        )}
        <div className="w-full max-w-sm mb-8">
          <BossCard boss={getBossDefinition(bossState.bossIndex)} damageAccumulated={bossState.damageAccumulated} />
        </div>

        {/* Last 7 days */}
        <div className="flex gap-2 mb-2">
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
                  onClick={isToday ? undefined : () => togglePastCheckin(key, date)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ring-2 transition-all ${
                    isToday
                      ? 'ring-white'
                      : 'ring-transparent cursor-pointer active:scale-95 hover:ring-zinc-600'
                  } ${
                    status === 'done'
                      ? 'bg-orange-500 text-white'
                      : status === 'rest'
                      ? 'bg-zinc-800 text-zinc-500'
                      : 'bg-zinc-900 text-zinc-600'
                  }`}
                >
                  {status === 'done' ? '✓' : date.getDate()}
                </div>
              </div>
            )
          })}
        </div>
        <p className="text-zinc-700 text-[10px] text-center mb-8">過去の日付をタップして記録を変更</p>

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
            className="text-zinc-700 text-xs hover:text-zinc-500 transition-colors"
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

        {/* Feedback */}
        <a
          href="https://forms.gle/8289i9sDHX6j4qwB9"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-12 text-orange-500 hover:text-orange-400 text-sm font-semibold transition-colors"
        >
          📝 フィードバックを送る
        </a>
      </div>
    </>
  )
}
