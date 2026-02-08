const CACHE_NAME = 'elite-hub-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/pages/subjects.html',
  '/pages/announcements.html',
  '/pages/contact.html',
  '/pages/dashboard.html',
  '/pages/forums.html',
  '/pages/login.html',
  '/pages/register.html',
  '/pages/quizzes.html',
  '/pages/resources.html',
  '/pages/student-quiz.html',
  '/pages/profile-edit.html',
  '/pages/admin-dashboard.html',
  '/pages/admin-announcements.html',
  '/pages/admin-live-classes.html',
  '/pages/admin-resources.html',
  '/pages/admin-quiz-builder.html',
  '/assets/css/style.css',
  '/assets/js/main.js',
  '/assets/js/api.js',
  '/assets/js/pwa-register.js',
  '/assets/images/icons/icon-192.svg',
  '/assets/images/icons/icon-512.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

// Basic cache-first strategy, network fallback, and cache updating
self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Only handle GET
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        // Don't cache opaque responses from cross-origin requests
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return res;
      }).catch(() => caches.match('/index.html'));
    })
  );
});
