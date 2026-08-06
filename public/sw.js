// خدمة العمل بدون إنترنت — تخزن الصفحة والأصول الأساسية بعد أول زيارة.
// تم رفع نسخة الكاش لضمان استبدال النسخ القديمة التي قد تحتوي على أخطاء.
const CACHE = "majlis-yemen-v3";
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/Cairo-Regular.ttf",
];

const CACHEABLE_HOSTS = new Set([
  self.location.hostname,
  "fonts.googleapis.com",
  "fonts.gstatic.com",
]);

function isCacheableRequest(request) {
  if (request.method !== "GET") return false;
  if (request.headers.has("range")) return false;

  const url = new URL(request.url);
  if (!CACHEABLE_HOSTS.has(url.hostname)) return false;

  return url.protocol === "http:" || url.protocol === "https:";
}

async function cacheRequest(request, response) {
  if (!response || !response.ok) return;
  if (response.type !== "basic" && response.type !== "cors") return;

  const cache = await caches.open(CACHE);
  await cache.put(request, response.clone());
}

async function getAppShellFallback() {
  return (
    (await caches.match("/index.html")) ||
    (await caches.match("/")) ||
    new Response("التطبيق غير متاح بدون اتصال حالياً.", {
      status: 503,
      statusText: "Service Unavailable",
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        // تخزين كل ملف على حدة حتى لا يفشل التثبيت بسبب ملف واحد مفقود.
        Promise.allSettled(
          APP_SHELL.map((url) =>
            cache.add(new Request(url, { cache: "reload" })),
          ),
        ),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (!isCacheableRequest(request)) return;

  // التنقل بين الصفحات: الشبكة أولاً ثم نسخة التطبيق الاحتياطية.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          event.waitUntil(cacheRequest(request, response));
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || getAppShellFallback()),
        ),
    );
    return;
  }

  // الأصول: الكاش أولاً، ثم الشبكة، ثم رد واضح بدلاً من إرجاع undefined.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          event.waitUntil(cacheRequest(request, response));
          return response;
        })
        .catch(
          () =>
            new Response("هذا المورد غير متاح بدون اتصال.", {
              status: 503,
              statusText: "Service Unavailable",
              headers: { "Content-Type": "text/plain; charset=utf-8" },
            }),
        );
    }),
  );
});
