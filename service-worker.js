// PWAの裏側で動く常駐プログラム

// 1. インストール時の処理（今回はキャッシュ処理などをスキップしてシンプルに）
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// 2. 【肝】GAS（Firebase経由）からプッシュ通知を受け取ったときの処理
self.addEventListener('push', (event) => {
  if (!event.data) return;

  // 送られてきた通知データを解析
  const data = event.data.json();
  
  const title = data.title || 'FINE';
  const options = {
    body: data.body || '新着メッセージがあります',
    icon: 'icon.png', // 通知に表示するアイコン
    badge: 'icon.png',
    // 💡 ここで通知音を指定（ブラウザやOSの仕様に準拠します）
    sound: 'fine.mp3', 
    data: { url: '/index.html' }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// 3. 通知をクリックしたときにアプリを開く処理
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});