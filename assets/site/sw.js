// خدمة العمل: تسريع الفتح بتخزين الملفات الثابتة (لا تخزّن بيانات Supabase)
// ملاحظة: غيّر رقم النسخة عند كل تحديث للموقع
const CACHE = "nokhba-v23";
const SHELL = ["./", "./app.js", "./supabase-config.js", "./manifest.webmanifest", "./images/school-logo.jpg", "./images/splash.jpg"];
const CDN = ["cdn.jsdelivr.net", "fonts.googleapis.com", "fonts.gstatic.com"];

// المتصفح يرفض تسليم استجابة "محوَّلة" لطلب تنقّل (يظهر: This site can't be reached)
// لذلك نعيد بناء الاستجابة بدون علامة التحويل قبل تخزينها أو إرجاعها
async function clean(r) {
  if (!r || !r.redirected) return r;
  const body = await r.blob();
  return new Response(body, { status: r.status, statusText: r.statusText, headers: r.headers });
}

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.all(SHELL.map(async u => {
      try { const r = await fetch(u, { cache: "reload" }); if (r.ok) await c.put(u, await clean(r)); } catch (x) { /* تجاهل */ }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  if (u.origin !== location.origin && !CDN.includes(u.hostname)) return;
  // اعرض المخزّن فوراً وحدّثه بالخلفية
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    let hit = await c.match(e.request);
    if (hit) hit = await clean(hit);
    const net = fetch(e.request).then(async r => {
      if (r && (r.type === "opaque" || (r.ok && !r.redirected))) c.put(e.request, r.clone());
      return r;
    }).catch(async () => hit || (e.request.mode === "navigate" ? clean(await c.match("./")) : undefined));
    return hit || net;
  })());
});
