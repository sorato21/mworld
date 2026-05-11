let scheduledTimer = null

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))

// メインスレッドからのスケジュール設定を受信
self.addEventListener('message', (event) => {
  const data = event.data ?? {}
  if (data.type === 'SCHEDULE') {
    clearTimer()
    if (data.enabled) scheduleNext(data.hour, data.minute)
  }
})

function clearTimer() {
  if (scheduledTimer !== null) {
    clearTimeout(scheduledTimer)
    scheduledTimer = null
  }
}

function scheduleNext(hour, minute) {
  const now = new Date()
  const target = new Date()
  target.setHours(hour, minute, 0, 0)
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1)
  }
  const delay = target.getTime() - now.getTime()
  scheduledTimer = setTimeout(() => fire(hour, minute), delay)
}

async function fire(hour, minute) {
  let checkedIn = false

  // 開いているウィンドウにチェックイン状態を問い合わせ
  try {
    const windowClients = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    })
    if (windowClients.length > 0) {
      checkedIn = await new Promise((resolve) => {
        const channel = new MessageChannel()
        channel.port1.onmessage = (e) => resolve(!!e.data?.checkedIn)
        windowClients[0].postMessage({ type: 'GET_CHECKIN_STATUS' }, [channel.port2])
        setTimeout(() => resolve(false), 3000)
      })
    }
  } catch {
    checkedIn = false
  }

  if (!checkedIn) {
    await self.registration.showNotification('M.WORLD', {
      body: '💪 今日のトレーニング、まだだよ！ストリークを守ろう',
      icon: '/icon.png',
      badge: '/icon.png',
      vibrate: [200, 100, 200],
      tag: 'mworld-daily',
      renotify: false,
    })
  }

  scheduleNext(hour, minute)
}

// 通知タップでアプリを開く
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        if (clients.length > 0) return clients[0].focus()
        return self.clients.openWindow('/')
      })
  )
})
