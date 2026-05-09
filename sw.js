const CACHE = 'metercalc-v2';
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE).then(c => c.addAll([
            '/meter-calc-universal/',
            '/meter-calc-universal/index.html',
            '/meter-calc-universal/css/style.css',
            '/meter-calc-universal/js/calculator.js',
            '/meter-calc-universal/js/ui.js',
            '/meter-calc-universal/js/app.js'
        ]))
    );
});
self.addEventListener('fetch', e => {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
