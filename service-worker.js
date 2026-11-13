const CACHE='level-up-fitness-v154-flat-all-assets-20261113';
const PREFIX='level-up-fitness-';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png','./asset_level_up_logo_final_v78.png','./fighter_wonder_woman_portrait.jpeg','./level-up-87-heroes.js','./level-up-87-heroes.css','./level-up-86-progression-data.js','./level-up-86-progression.js','./approved-artwork-registry.js']))) });
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 if(e.request.mode==='navigate'){
   e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match('./index.html')));
   return;
 }
 e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request)));
});
