(() => {
  'use strict';
  let promptEvent=null, registration=null, waitingWorker=null, updating=false, offlineReady=false;
  const standalone=()=>window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  const ios=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  document.documentElement.classList.toggle('pwa-ios-standalone',ios&&standalone());
  const install=document.getElementById('installBtn')||Object.assign(document.createElement('button'),{id:'installBtn',type:'button',textContent:'安裝到手機'});
  install.classList.add('pwa-install');install.hidden=standalone();install.textContent='安裝到手機';
  const host=document.querySelector('header')||document.querySelector('[role="toolbar"]')||document.body;
  let actions=document.querySelector('[data-pwa-actions]');if(!actions){actions=document.createElement('div');actions.className='pwa-actions';host.append(actions)}actions.append(install);
  const checkUpdates=document.createElement('button');checkUpdates.type='button';checkUpdates.id='pwa-check-updates';checkUpdates.className='pwa-install pwa-check-updates';checkUpdates.textContent='更新 App';actions.append(checkUpdates);
  const status=document.createElement('span');status.className='pwa-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');(document.querySelector('[data-pwa-status]')||host).append(status);
  const dialog=document.createElement('dialog');dialog.className='pwa-dialog';dialog.setAttribute('aria-labelledby','pwa-install-title');
  dialog.innerHTML='<h2 id="pwa-install-title">安裝專案管理題庫</h2><p id="pwa-install-copy"></p><ol id="pwa-install-steps"></ol><p class="pwa-install-note">安裝後從主畫面開啟，即可以獨立視窗練習。看到「可離線使用」後，答題、架構圖填空與翻牌都能離線開啟。作答紀錄保存在目前裝置與瀏覽環境。</p><button type="button" class="pwa-action" id="pwa-close">知道了</button>';
  document.body.append(dialog);dialog.querySelector('#pwa-close').onclick=()=>dialog.close();
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
  function instructions(){
    const copy=dialog.querySelector('#pwa-install-copy'),list=dialog.querySelector('#pwa-install-steps');
    copy.textContent=ios?'iPhone／iPad 請使用 Safari 加入主畫面。':'如果瀏覽器沒有顯示安裝提示，可以從選單安裝。';
    const steps=ios?['用 Safari 開啟這個網站。','點選「分享」，再選「加入主畫面」。','如有「以網頁 App 開啟」選項，保持開啟，再點「加入」。']:['用 Chrome 或 Edge 開啟這個網站。','開啟瀏覽器選單，選「安裝應用程式」或「加入主畫面」。','依畫面提示確認，之後從手機主畫面的圖示開啟。'];
    list.replaceChildren(...steps.map(t=>{const li=document.createElement('li');li.textContent=t;return li}));dialog.showModal();
  }
  install.onclick=async()=>{if(!promptEvent){instructions();return}const p=promptEvent;promptEvent=null;try{await p.prompt();const choice=await p.userChoice;if(choice.outcome!=='accepted')install.hidden=standalone()}catch{instructions()}};
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();promptEvent=e;install.hidden=standalone()});
  window.addEventListener('appinstalled',()=>{promptEvent=null;install.hidden=true;if(dialog.open)dialog.close()});
  function paintStatus(){status.textContent=!navigator.onLine?(offlineReady?'離線模式 · 可繼續練習':'目前離線 · 連線後準備離線內容'):offlineReady?'可離線使用':'正在準備離線內容…';status.dataset.ready=String(offlineReady)}
  window.addEventListener('online',()=>{paintStatus();registration?.update().catch(()=>{})});window.addEventListener('offline',paintStatus);paintStatus();
  const update=document.createElement('aside');update.className='pwa-update';update.hidden=true;update.setAttribute('role','status');update.innerHTML='<span>新版已準備好</span><small>目前的作答進度會保留</small><div><button type="button" class="pwa-action" id="pwa-refresh">更新並繼續</button><button type="button" class="pwa-later" id="pwa-later">稍後</button></div>';document.body.append(update);
  update.querySelector('#pwa-later').onclick=()=>{update.hidden=true};
  update.querySelector('#pwa-refresh').onclick=()=>{if(!waitingWorker)return;updating=true;update.querySelector('#pwa-refresh').disabled=true;update.querySelector('#pwa-refresh').textContent='更新中…';waitingWorker.postMessage({type:'SKIP_WAITING'})};
  function offerUpdate(worker){if(worker&&navigator.serviceWorker.controller){waitingWorker=worker;update.hidden=false}}
  function askStatus(worker){if(!worker)return;const channel=new MessageChannel();channel.port1.onmessage=e=>{if(e.data?.type==='OFFLINE_READY'){offlineReady=true;paintStatus()}channel.port1.close()};worker.postMessage({type:'GET_STATUS'},[channel.port2]);setTimeout(()=>channel.port1.close(),5000)}

  function waitForInstall(worker){if(!worker||worker.state==='installed'||worker.state==='activated')return Promise.resolve();return new Promise((resolve,reject)=>{const finish=err=>{clearTimeout(timer);worker.removeEventListener('statechange',changed);err?reject(err):resolve()};const changed=()=>{if(worker.state==='installed'||worker.state==='activated')finish();else if(worker.state==='redundant')finish(new Error('安裝未完成'))};const timer=setTimeout(()=>finish(new Error('下載逾時，請稍後重試')),20000);worker.addEventListener('statechange',changed);changed()})}
  function refreshShell(worker){return new Promise((resolve,reject)=>{const channel=new MessageChannel();const timer=setTimeout(()=>{channel.port1.close();reject(new Error('更新逾時，請重新開啟 App 後重試'))},20000);channel.port1.onmessage=e=>{clearTimeout(timer);channel.port1.close();e.data?.type==='SHELL_REFRESHED'?resolve():reject(new Error('下載未完成，請檢查網路後重試'))};worker.postMessage({type:'REFRESH_SHELL'},[channel.port2])})}
  checkUpdates.onclick=async()=>{
    if(!navigator.onLine){status.textContent='目前離線，請連線後再更新。';return}
    checkUpdates.disabled=true;checkUpdates.textContent='檢查更新中…';checkUpdates.setAttribute('aria-busy','true');
    try{
      if(!('serviceWorker'in navigator)){location.reload();return}
      registration=registration||await navigator.serviceWorker.getRegistration()||await navigator.serviceWorker.register('sw.js',{updateViaCache:'none'});
      await registration.update();await waitForInstall(registration.installing);
      const pending=registration.waiting||(waitingWorker?.state==='installed'?waitingWorker:null);
      if(pending){updating=true;waitingWorker=pending;checkUpdates.textContent='更新中…';pending.postMessage({type:'SKIP_WAITING'});return}
      checkUpdates.textContent='下載最新版…';const active=registration.active||navigator.serviceWorker.controller;
      if(!active)throw new Error('離線功能尚未準備完成，請稍後重試');
      await refreshShell(active);location.reload();
    }catch(err){status.textContent=err.message||'更新失敗，請稍後再試。';checkUpdates.disabled=false;checkUpdates.textContent='重試更新';checkUpdates.removeAttribute('aria-busy')}
  };
  let lastUpdateCheck=0;
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&navigator.onLine&&registration&&Date.now()-lastUpdateCheck>60000){lastUpdateCheck=Date.now();registration.update().catch(()=>{})}});
  if(!('serviceWorker'in navigator)){status.textContent='此瀏覽器不支援離線使用';return}
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(updating){location.reload();return}askStatus(navigator.serviceWorker.controller)});
  navigator.serviceWorker.addEventListener('message',e=>{if(e.data?.type==='OFFLINE_READY'){offlineReady=true;paintStatus()}});
  async function register(){try{registration=await navigator.serviceWorker.register('sw.js',{updateViaCache:'none'});offerUpdate(registration.waiting);askStatus(registration.active);const watch=worker=>{if(!worker)return;const changed=()=>{if(worker.state==='installed'){if(navigator.serviceWorker.controller)offerUpdate(worker);else askStatus(registration.active)}};worker.addEventListener('statechange',changed);changed()};watch(registration.installing);registration.addEventListener('updatefound',()=>watch(registration.installing));navigator.serviceWorker.ready.then(r=>askStatus(r.active));registration.update().catch(()=>{})}catch{status.textContent='離線內容尚未就緒，請連線後重試'}}
  if(document.readyState==='complete')register();else window.addEventListener('load',register,{once:true});
})();


