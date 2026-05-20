const CACHE = 'metercalc-v3.3.0';
const ASSETS = [
    './',
    './index.html',
    './css/style.css',
    './css/desktop.css',
    './js/app.js',
    './js/calculator.js',
    './js/ui.js',
    './js/scan.js',
    './js/accuracy.js',
    './js/batch-test.js',
    './js/site-manager.js',
    './js/pdf-report.js',
    './js/keyboard.js',
    './manifest.json'
];

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.filter(key => key !== CACHE).map(key => caches.delete(key))
        )).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).then(response => {
                const clone = response.clone();
                caches.open(CACHE).then(cache => cache.put(event.request, clone));
                return response;
            }).catch(() => caches.match('./index.html'));
        })
    );
});
