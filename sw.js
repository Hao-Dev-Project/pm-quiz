// 版本號：更新題庫或網頁後改這個數字，手機上的舊快取就會換掉
const VERSION = 'pm-quiz-v7-no-drag';
const SHELL = ['./', 'index.html', 'chart.html', 'chart-practice.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // 網頁本身：有網路就抓最新版，沒網路用快取
  if (req.mode === 'navigate' || (url.origin === location.origin && url.pathname.endsWith('.html'))) {
    e.respondWith(fetch(req, { cache: 'no-store' }).then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); return res; })
      .catch(async () => (await caches.match(req, { ignoreSearch: true })) || caches.match(url.pathname.endsWith('chart.html') ? 'chart.html' : 'index.html')));
    return;
  }
  // 字型與圖示：先用快取，背景更新
  if (url.origin === location.origin || url.host === 'fonts.googleapis.com' || url.host === 'fonts.gstatic.com') {
    e.respondWith(caches.open(VERSION).then(async c => {
      const hit = await c.match(req);
      const net = fetch(req).then(res => { if (res && (res.ok || res.type === 'opaque')) c.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    }));
  }
});
