## الهدف
إصلاح الأخطاء والمشاكل المؤكَّدة في التطبيق (تهيئة العمل بدون إنترنت، ملفات مكرّرة/مفقودة، وتحذير المسار) دون أي تغيير في الحسابات أو البيانات أو تصميم الشاشات.

## المشاكل المؤكَّدة من الكود
1. تسجيل مزدوج ومتعارض لخدمة العمل بدون إنترنت:
   - `src/sw-register.ts` (يُستورَد من `src/main.tsx`) يسجّل `/service-worker.js` وهذا الملف غير موجود في `public/` (موجود فقط كـ `src/service-worker.js` وهو لا يُنشر) → التسجيل يفشل دائماً.
   - وفي نفس الوقت `src/lib/pwa.ts` (يُستدعى من `__root.tsx`) يسجّل `/sw.js` بشكل صحيح ومع حماية للمعاينة/الإطار.
   - `sw-register.ts` بلا أي حماية، فيحاول التسجيل داخل معاينة Lovable أيضاً — مصدر معروف لصفحات قديمة/بيضاء.
2. ملفّا manifest متعارضان: `index.html` يربط `/manifest.webmanifest` (اسم «مجلس طبي»، أيقونات SVG، `start_url: "."`)، بينما صفحة `/` تربط `/manifest.json` (الاسم الصحيح وأيقونات PNG). النتيجة: اسم/أيقونة غير متوقعين عند التثبيت.
3. `src/routes/index.tsx` يربط `/icon.svg` وهو غير موجود في `public/` (الموجود `icon-192.svg` و`icon-512.svg`) → طلب 404 لكل زيارة.
4. `src/routes/index.tsx` فيه `export default Index` إلى جانب `Route`، ما يسبب تحذير TanStack Router بعدم إمكانية تقسيم الحزمة وزيادة حجمها.
5. ملفات فائضة في المستودع تُربك البناء والصيانة: `untitled.chat`, `untitled1.chat`, `untitled2.chat`, `Untitled.ipynb`, `src/Untitled.ipynb`, ومجلدات `.ipynb_checkpoints` (بما فيها `src/routes/.ipynb_checkpoints/index-checkpoint.tsx`).

## الإصلاح
1. توحيد تسجيل الخدمة على `src/lib/pwa.ts` فقط:
   - حذف `src/sw-register.ts` واستيراده من `src/main.tsx`، وحذف `src/service-worker.js` غير المستخدم.
   - تشديد شرط الحماية في `initPwa` ليمنع التسجيل أيضاً عند `!import.meta.env.PROD` وعلى نطاقات `*.lovableproject.com` / `*.lovableproject-dev.com` / `*.beta.lovable.dev` ومع `?sw=off`، مع إلغاء أي تسجيل قديم لـ `/sw.js` في تلك الحالات.
2. الاعتماد على ملف manifest واحد: حذف `public/manifest.webmanifest` وتحديث `index.html` ليربط `/manifest.json`، مع إضافة `theme-color` مطابق.
3. تصحيح مرجع الأيقونة في `src/routes/index.tsx` إلى `/icon-192.svg` (أو `/icon-192.png`) بدل `/icon.svg`.
4. إزالة `export default Index` من `src/routes/index.tsx` (لا يستورده أحد) لإنهاء تحذير تقسيم الحزمة.
5. حذف الملفات الفائضة المذكورة أعلاه.
6. التحقق النهائي: بناء إنتاجي ناجح، ولا طلبات 404 للأيقونة/الـmanifest، ولا محاولة تسجيل خدمة داخل المعاينة.

## ملاحظات
- لا تغيير في منطق الأقساط أو الحوافظ أو الحساب أو الطباعة.
- بعد النشر، من كان قد ثبّت التطبيق سابقاً سيحصل على الاسم والأيقونة الصحيحين بعد إعادة التثبيت (النظام يخزّن هذه الحقول عند التثبيت).
