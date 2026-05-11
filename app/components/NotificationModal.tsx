'use client'

import { useState } from 'react'

interface Props {
  initialEnabled: boolean
  initialHour: number
  initialMinute: number
  onSave: (enabled: boolean, hour: number, minute: number) => void
  onClose: () => void
}

export default function NotificationModal({
  initialEnabled,
  initialHour,
  initialMinute,
  onSave,
  onClose,
}: Props) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [hour, setHour] = useState(initialHour)
  const [minute, setMinute] = useState(initialMinute)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setError('')
    if (enabled) {
      if (!('Notification' in window)) {
        setError('このブラウザは通知をサポートしていません')
        return
      }
      setLoading(true)
      let permission = Notification.permission
      if (permission === 'default') {
        permission = await Notification.requestPermission()
      }
      setLoading(false)
      if (permission === 'denied') {
        setError('設定から通知を許可してください')
        return
      }
    }
    onSave(enabled, hour, minute)
    onClose()
  }

  const timeValue = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [h, m] = e.target.value.split(':').map(Number)
    if (!isNaN(h)) setHour(h)
    if (!isNaN(m)) setMinute(m)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-sm bg-zinc-900 rounded-t-3xl p-6 pb-10 border-t border-zinc-800">
        {/* Handle bar */}
        <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-6" />

        <h2 className="text-white font-black text-lg tracking-widest uppercase mb-1">通知設定</h2>
        <p className="text-zinc-600 text-xs mb-6">
          未チェックインの日に設定時刻でリマインドします
        </p>

        {/* ON/OFF トグル */}
        <div className="flex items-center justify-between py-4 border-b border-zinc-800 mb-5">
          <div>
            <p className="text-white text-sm font-semibold">毎日リマインド</p>
            <p className="text-zinc-600 text-xs mt-0.5">
              {enabled ? 'オン' : 'オフ'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setEnabled((v) => !v); setError('') }}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
              enabled ? 'bg-orange-500' : 'bg-zinc-700'
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                enabled ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* 時刻選択 */}
        {enabled && (
          <div className="mb-6">
            <p className="text-zinc-500 text-xs tracking-widest uppercase mb-3">通知時刻</p>
            <input
              type="time"
              value={timeValue}
              onChange={handleTimeChange}
              className="w-full bg-zinc-800 border border-zinc-700 focus:border-orange-500 text-white text-2xl font-black text-center rounded-2xl px-4 py-4 outline-none transition-colors"
              style={{ colorScheme: 'dark' }}
            />
          </div>
        )}

        {/* エラー */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-red-400 text-sm font-semibold">{error}</p>
          </div>
        )}

        {/* iOS 注意書き */}
        <p className="text-zinc-700 text-xs mb-5 leading-relaxed">
          ※ iOSはホーム画面に追加済みのPWA（iOS 16.4以降）で動作します
        </p>

        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="w-full py-4 bg-orange-500 hover:bg-orange-400 active:scale-95 text-white font-bold text-base rounded-2xl transition-all shadow-lg shadow-orange-500/20 disabled:opacity-60"
        >
          {loading ? '許可を確認中...' : '保存する'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="w-full mt-3 py-3 text-zinc-600 hover:text-zinc-400 text-sm transition-colors"
        >
          キャンセル
        </button>
      </div>
    </div>
  )
}
