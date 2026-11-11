const VERSION='pm-quiz-pwa-v25';
const PREFIX='pm-quiz-';
const SHELL=['./','index.html','chart.html','chart-practice.html','pwa.js','pwa.css','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png'];
const root=new URL('./',self.location.href);
const keyFor=url=>new URL(new URL(url).pathname,self.location.origin).href;
self.addEventListener('install',e=>e.waitUntil((async()=>{const c=await caches.open(VERSION);await c.addAll(SHELL.map(p=>new Request(new URL(p,root),{cache:'reload'})));if(!self.registration.active)await self.skipWaiting()})()));
self.addEventListener('activate',e=>e.waitUntil((async()=>{await Promise.all((await caches.keys()).filter(k=>k.startsWith(PREFIX)&&k!==VERSION).map(k=>caches.delete(k)));await self.clients.claim();const clients=await self.clients.matchAll();clients.forEach(c=>c.postMessage({type:'OFFLINE_READY'}))})()));
self.addEventListener('message',e=>{if(e.data?.type==='REFRESH_SHELL'){e.waitUntil((async()=>{try{const c=await caches.open(VERSION);await c.addAll(SHELL.map(p=>new Request(new URL(p,root),{cache:'reload'})));e.ports[0]?.postMessage({type:'SHELL_REFRESHED'})}catch{e.ports[0]?.postMessage({type:'SHELL_REFRESH_FAILED'})}})())}if(e.data?.type==='SKIP_WAITING')self.skipWaiting();if(e.data?.type==='GET_STATUS')e.ports[0]?.postMessage({type:'OFFLINE_READY',version:VERSION})});
async function page(request){const c=await caches.open(VERSION),key=keyFor(request.url);try{const r=await fetch(request,{cache:'no-store'});if(r.ok){await c.put(key,r.clone());return r}const hit=await c.match(key);return hit||r}catch{const hit=await c.match(key);if(hit)return hit;return new Response('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>目前離線</title><p>這個頁面尚未下載，請連線後再開啟。</p><a href="'+root.pathname+'">返回題庫</a>',{status:503,headers:{'Content-Type':'text/html; charset=utf-8'}})}}
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==self.location.origin||!u.pathname.startsWith(root.pathname))return;if(r.mode==='navigate'||u.pathname.endsWith('.html')){e.respondWith(page(r));return}e.respondWith((async()=>{const c=await caches.open(VERSION),key=keyFor(r.url),hit=await c.match(key);if(hit)return hit;try{const res=await fetch(r);if(res.ok)await c.put(key,res.clone());return res}catch{return new Response('',{status:503})}})())});



