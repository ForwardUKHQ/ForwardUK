const CACHE='forwarduk-v3-static-v1';
const FILES=['index.html','styles.css','data.js','supabase-adapter.js','app.js','forward-uk-logo.png','forward-uk-emblem.png','forward-uk-stop-the-boats.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)))})
