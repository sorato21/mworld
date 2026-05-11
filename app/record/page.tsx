'use client'

import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import {
  loadRecords,
  loadTargetWeight,
  TARGET_WEIGHT_KEY,
  type BodyRecord,
} from '../lib/records'
import DailyRecordModal from '../components/DailyRecordModal'
import { getDateKey } from '../lib/training'

type Period = 7 | 30 | 90
type DataKey = 'weight' | 'bodyFat'

function formatDateLabel(dateStr: string, period: Period): string {
  const d = new Date(dateStr + 'T00:00:00')
  if (period === 7) {
    return `${d.getMonth() + 1}/${d.getDate()}(${['日','月','火','水','木','金','土'][d.getDay()]})`
  }
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export default function RecordPage() {
  const [records, setRecords] = useState<BodyRecord[]>([])
  const [targetWeight, setTargetWeight] = useState<number | null>(null)
  const [editingTarget, setEditingTarget] = useState(false)
  const [targetInput, setTargetInput] = useState('')
  const [period, setPeriod] = useState<Period>(30)
  const [dataKey, setDataKey] = useState<DataKey>('weight')
  const [showModal, setShowModal] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setRecords(loadRecords())
    const tw = loadTargetWeight()
    setTargetWeight(tw)
    setTargetInput(tw != null ? String(tw) : '')
    setMounted(true)
  }, [])

  const reload = () => setRecords(loadRecords())

  const handleSaveTarget = () => {
    const v = parseFloat(targetInput)
    if (!isNaN(v) && v > 0) {
      localStorage.setItem(TARGET_WEIGHT_KEY, String(v))
      setTargetWeight(v)
    }
    setEditingTarget(false)
  }

  const today = getDateKey(new Date())
  const todayRecord = records.find((r) => r.date === today)

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - period + 1)
  const cutoffKey = getDateKey(cutoff)

  const filteredRecords = records.filter((r) => r.date >= cutoffKey)

  const chartData = filteredRecords.map((r) => ({
    date: r.date,
    label: formatDateLabel(r.date, period),
    value: dataKey === 'weight' ? r.weight : (r.bodyFat ?? null),
  }))

  const values = chartData.map((d) => d.value).filter((v): v is number => v != null)
  const minVal = values.length > 0 ? Math.min(...values) : 0
  const maxVal = values.length > 0 ? Math.max(...values) : 100
  const padding = dataKey === 'weight' ? 2 : 3
  const yMin = Math.floor(minVal - padding)
  const yMax = Math.ceil(maxVal + padding)

  const sortedDesc = [...records].sort((a, b) => b.date.localeCompare(a.date))

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-28">
      <div className="max-w-sm mx-auto px-4 pt-12">
        {/* Header */}
        <h1 className="text-2xl font-black tracking-widest uppercase mb-8">記録</h1>

        {/* Target weight */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-4">
          <p className="text-zinc-500 text-xs tracking-widest uppercase mb-2">目標体重</p>
          {editingTarget ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="decimal"
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                placeholder="例：65.0"
                autoFocus
                className="flex-1 bg-zinc-800 border border-zinc-700 focus:border-orange-500 text-white text-xl font-bold text-center rounded-xl px-3 py-2 outline-none transition-colors"
              />
              <span className="text-zinc-400 text-sm">kg</span>
              <button
                onClick={handleSaveTarget}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white text-sm font-bold rounded-xl transition-colors"
              >
                保存
              </button>
              <button
                onClick={() => { setEditingTarget(false); setTargetInput(targetWeight != null ? String(targetWeight) : '') }}
                className="px-3 py-2 text-zinc-500 hover:text-zinc-400 text-sm transition-colors"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-white font-bold text-2xl">
                {targetWeight != null ? `${targetWeight} kg` : '未設定'}
              </span>
              <button
                onClick={() => setEditingTarget(true)}
                className="text-orange-500 hover:text-orange-400 text-sm font-semibold transition-colors"
              >
                編集
              </button>
            </div>
          )}
        </div>

        {/* Record today button */}
        <button
          onClick={() => setShowModal(true)}
          className="w-full py-4 bg-orange-500 hover:bg-orange-400 active:scale-95 text-white font-bold rounded-2xl transition-all shadow-lg shadow-orange-500/20 mb-6"
        >
          {todayRecord ? `＋ 今日の記録を更新（${todayRecord.weight} kg）` : '＋ 今日の体重を記録'}
        </button>

        {/* Chart area */}
        {filteredRecords.length >= 2 ? (
          <>
            {/* Data key tabs */}
            <div className="flex gap-2 mb-3">
              {(['weight', 'bodyFat'] as DataKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setDataKey(key)}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${
                    dataKey === key
                      ? 'bg-orange-500 text-white'
                      : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {key === 'weight' ? '体重' : '体脂肪率'}
                </button>
              ))}
            </div>

            {/* Period tabs */}
            <div className="flex gap-2 mb-4">
              {([7, 30, 90] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    period === p
                      ? 'bg-zinc-700 text-white'
                      : 'bg-zinc-900 text-zinc-600 hover:text-zinc-400'
                  }`}
                >
                  {p}日
                </button>
              ))}
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-6">
              <p className="text-zinc-500 text-xs tracking-widest uppercase mb-3">
                {dataKey === 'weight' ? '体重推移 (kg)' : '体脂肪率推移 (%)'}
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: '#71717a', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    domain={[yMin, yMax]}
                    tick={{ fill: '#71717a', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    tickCount={5}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#18181b',
                      border: '1px solid #3f3f46',
                      borderRadius: 12,
                      color: '#fff',
                      fontSize: 12,
                    }}
                    formatter={(val) =>
                      [`${val} ${dataKey === 'weight' ? 'kg' : '%'}`, dataKey === 'weight' ? '体重' : '体脂肪率']
                    }
                    labelStyle={{ color: '#71717a', marginBottom: 4 }}
                  />
                  {dataKey === 'weight' && targetWeight != null && (
                    <ReferenceLine
                      y={targetWeight}
                      stroke="#52525b"
                      strokeDasharray="4 4"
                      label={{ value: `目標 ${targetWeight}kg`, fill: '#71717a', fontSize: 10, position: 'insideTopRight' }}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={{ fill: '#f97316', r: 3, strokeWidth: 0 }}
                    activeDot={{ fill: '#f97316', r: 5, strokeWidth: 0 }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : filteredRecords.length === 1 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6 text-center">
            <p className="text-zinc-500 text-sm">グラフはあと1件記録すると表示されます</p>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6 text-center">
            <p className="text-zinc-500 text-sm">記録を追加するとグラフが表示されます</p>
          </div>
        )}

        {/* Record list */}
        {sortedDesc.length > 0 && (
          <div className="mb-6">
            <p className="text-zinc-500 text-xs tracking-widest uppercase mb-3">記録一覧</p>
            <div className="space-y-2">
              {sortedDesc.map((r) => {
                const d = new Date(r.date + 'T00:00:00')
                const label = d.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })
                return (
                  <div
                    key={r.date}
                    className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 flex items-center justify-between"
                  >
                    <span className="text-zinc-400 text-sm">{label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-white font-bold">{r.weight} <span className="text-zinc-500 text-xs font-normal">kg</span></span>
                      {r.bodyFat != null && (
                        <span className="text-zinc-400 text-sm">{r.bodyFat} <span className="text-zinc-600 text-xs">%</span></span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <DailyRecordModal
          onSaved={() => { setShowModal(false); reload() }}
          onSkip={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
