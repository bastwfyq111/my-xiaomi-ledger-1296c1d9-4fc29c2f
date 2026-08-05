// تسجيل service worker للعمل بدون إنترنت + التقاط حدث التثبيت
let deferredPrompt: any = null;
const listeners = new Set<(canInstall: boolean) => void>();

export function initPwa() {
  if (typeof window === "undefined") return;

  const inIframe = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();
  const host = window.location.hostname;
  const isPreviewHost =
    host.startsWith("id-preview--") ||
    host.startsWith("preview--") ||
    host === "lovableproject.com" ||
    host.endsWith(".lovableproject.com") ||
    host === "lovableproject-dev.com" ||
    host.endsWith(".lovableproject-dev.com") ||
    host === "beta.lovable.dev" ||
    host.endsWith(".beta.lovable.dev");
  const swOff = new URLSearchParams(window.location.search).get("sw") === "off";

  if (inIframe || isPreviewHost || swOff || !import.meta.env.PROD) {
    // إلغاء أي تسجيل سابق للخدمة في وضع التطوير/المعاينة
    navigator.serviceWorker
      ?.getRegistrations()
      .then((rs) =>
        rs.forEach((r) => {
          if (r.active?.scriptURL.includes("/sw.js") || r.installing || r.waiting) r.unregister();
        }),
      )
      .catch(() => {});
    return;
  }

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((e) => console.warn("SW register failed", e));
    });
  }

  window.addEventListener("beforeinstallprompt", (e: any) => {
    e.preventDefault();
    deferredPrompt = e;
    listeners.forEach((l) => l(true));
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    listeners.forEach((l) => l(false));
  });
}

export function canInstall() {
  return !!deferredPrompt;
}

export async function promptInstall() {
  if (!deferredPrompt) return false;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  listeners.forEach((l) => l(false));
  return outcome === "accepted";
}

export function onInstallAvailability(cb: (canInstall: boolean) => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
