# مجلس طبي

أريد تحويل هذا الملف الي تطبيق يتناسب مع هواتف شاومي اندرويد يعمل بدون الاتصال بالانترنت

لتسهيل الادخالات اريد ان مايتم اضافته في تبويب حوافظ التوريد يتم اتتقاله مباشرة الي تبويب الحساب بحسب الخانة، والبحث عن الاسماء بحسب الموجوده في الملف نفسه وكذلك تصدير البيانات الي اكسبل وبي دي اف وكذلك السماح باستيراد ملفات.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://my-xiaomi-ledger-1296c1d9.lovable.app

## Development (local)

بعد استنساخ المستودع:

```sh
npm install
npm run dev
```

## Android (APK) — offline PWA + Capacitor

الخطوات لإنتاج تطبيق أندرويد يعمل بدون إنترنت (شرح سريع):

1. جهّز تطبيق الويب كأساس PWA (تمت إضافة manifest و service worker بسيط في هذا المستودع).
2. ابنِ نسخة الإنتاج:

```sh
npm run build
```

3. ثبت Capacitor ثم أضف منصة أندرويد:

```sh
npm install @capacitor/core @capacitor/cli --save-dev
npx cap init
# اختر اسم التطبيق و appId (مثال: com.example.mymedicapp)
npx cap add android
npx cap copy
npx cap open android
```

4. افتح المشروع في Android Studio، وابنِ الـ APK أو الـ App Bundle. تأكد من أن ملف `webDir` في `capacitor.config.json` يشير إلى مجلد البناء (`dist`).

ملاحظات:

- الخدمة service-worker بسيطة؛ قد تحتاج لتحسينها (cache strategies) خصوصاً إذا كانت الموارد كبيرة.
- احفظ البيانات محلياً باستخدام IndexedDB (مثلاً مكتبة Dexie) لتعمل دون إنترنت.

## تنظيف وملحوظات

- إذا كنت تستخدم npm اترك package-lock.json واحذف bun.lock. إذا تستخدم bun فعّل bun وامسح package-lock.json.
- أزل الملفات `untitled.chat` إن لم تكن ضرورية.
