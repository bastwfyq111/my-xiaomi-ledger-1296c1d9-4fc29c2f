// تسجيل service worker للعمل بدون إنترنت + التقاط حدث التثبيت
let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<(canInstall: boolean) => void>();

interface BeforeInstallPromptEvent extends Event {
  readonly platforms?: string[];
  prompt: () => Promise<void> | void;
  userChoice?: Promise<{ outcome: 'accepted' | 'dismissed' | string }>;
}

export function initPwa() {
  if (typeof window === "undefined") return;

  const inIframe = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();
  const host = window.location.hostname || '';
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

  if (inIframe || isPreviewHost || swOff || !(import.meta as any).env?.PROD) {
    // إلغاء أي تسجيل سابق للخدمة في وضع التطوير/المعاينة
    try {
      navigator.serviceWorker
        ?.getRegistrations()
        .then((rs) =>
          rs.forEach((r) => {
            try {
              if (r.active?.scriptURL.includes("/sw.js") || r.installing || r.waiting) r.unregister();
            } catch {
              // ignore
            }
          }),
        )
        .catch(() => {});
    } catch {
      // navigator غير متوفر أو لا يدعم serviceWorker
    }
    return;
  }

  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((e) => console.warn("SW register failed", e));
    });
  }

  // المصادقة لأنواع الحدث 'beforeinstallprompt' غير معرفة في بعض بيئات TypeScript
  window.addEventListener("beforeinstallprompt", (e: Event) => {
    try {
      e.preventDefault?.();
      // نُعامل الحدث كـ BeforeInstallPromptEvent
      deferredPrompt = e as BeforeInstallPromptEvent;
      listeners.forEach((l) => l(true));
    } catch (err) {
      console.warn('beforeinstallprompt handler error', err);
    }
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

  try {
    // إطلاق واجهة التثبيت إن كانت متاحة
    await (deferredPrompt.prompt?.() ?? Promise.resolve());

    // بعض المتصفحات توفر userChoice كـ Promise
    let outcome: string | undefined;
    try {
      if (deferredPrompt.userChoice) {
        const choice = await deferredPrompt.userChoice;
        outcome = choice?.outcome;
      }
    } catch {
      // تجاهل أخطاء قراءة userChoice
    }

    // إعادة التهيئة بعد محاولة التثبيت
    deferredPrompt = null;
    listeners.forEach((l) => l(false));

    return outcome === "accepted";
  } catch (err) {
    console.warn('promptInstall failed', err);
    deferredPrompt = null;
    listeners.forEach((l) => l(false));
    return false;
  }
}

export function onInstallAvailability(cb: (canInstall: boolean) => void) {
  listeners.add(cb);
  // إبلاغ المتصل بالحالة الحالية فورًا
  try {
    cb(!!deferredPrompt);
  } catch {}

  return () => {
    listeners.delete(cb);
  };
}
