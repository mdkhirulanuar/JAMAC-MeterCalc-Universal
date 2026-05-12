const CACHE = 'metercalc-v4';
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE).then(c => c.addAll([
            '/meter-calc-universal/',
            '/meter-calc-universal/index.html',
            '/meter-calc-universal/css/style.css',
            '/meter-calc-universal/js/snap.js',
            '/meter-calc-universal/js/ocr.js',
            '/meter-calc-universal/js/calculator.js',
            '/meter-calc-universal/js/ui.js',
            '/meter-calc-universal/js/app.js'
        ]))
    );
});
self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(r => r || fetch(e.request).then(res => {
            if (res.ok && res.url.includes('tesseract')) {
                const clone = res.clone();
                caches.open(CACHE).then(c => c.put(e.request, clone));
            }
            return res;
        }))
    );
});
