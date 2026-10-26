# تطبيق نخبة — Flutter starter conversion

مشروع Flutter عربي باتجاه RTL مبني كبداية على ملفات `nokhba-site-v23.zip`، مع الاحتفاظ بالصور الأساسية ومحاولة إعادة استخدام اتصال Supabase.

## الموجود في هذه النسخة
- واجهة عربية RTL بتصميم كحلي وأزرق ودعم الوضع الداكن.
- أقسام رئيسية: الرئيسية، الجدول المدرسي، منظم الدراسة، أوراق العمل، المعلمون، وماذا نعرف؟
- تسجيل دخول المعلمين/الإدارة وفق نمط التطبيق الأصلي: `username@nokhba.school` ثم قراءة `profiles`.
- قراءة الإعلانات من `announcements`، المعلمين من `teachers`، والجدول من `schedules`.
- حفظ مهام منظم الدراسة محليًا على الجهاز.
- GitHub Actions لبناء APK عند تشغيل workflow يدويًا أو دفع تغييرات مناسبة إلى الفرع الرئيسي.

## مهم قبل الاعتماد
هذه **نسخة تحويل أولية قابلة للتطوير وليست مطابقة وظيفيًا لكل تفاصيل الموقع بعد**. الملف الأصلي يحتوي على وظائف إضافية مثل محررات الجدول والمعلمين، إدارة الامتحانات، التقويم، إدارة المهام، معرض الصور، تذاكر قسم «تم»، تغيير كلمات المرور، اللغات، ومسارات إدارية أخرى. يلزم نقل هذه التدفقات واختبارها واحدةً واحدة قبل اعتبار التحويل الكامل مكتملًا. صفحة أوراق العمل حاليًا واجهة تأسيسية لأن مخطط جدولها وصلاحياته يحتاجان إلى مطابقة دقيقة مع قاعدة البيانات.

## إعداد Supabase
1. افتح مستودع GitHub بعد رفع المشروع.
2. من **Settings → Secrets and variables → Actions → New repository secret** أضف:
   - `SUPABASE_URL` = رابط مشروع Supabase.
   - `SUPABASE_ANON_KEY` = مفتاح `anon` / publishable العام.
3. لا تضع `service_role` key في التطبيق أو GitHub Actions؛ تطبيق الهاتف عميل عام، ويجب أن تكون سياسات RLS مضبوطة على الجداول.

القيم المستخدمة في ملف `supabase-config.js` الأصلي يمكن إدخالها كـ GitHub Secrets بدل تضمينها في المستودع. مفتاح anon ليس بديلًا عن سياسات RLS.

## رفع المشروع إلى GitHub من الهاتف
1. أنشئ مستودعًا جديدًا باسم `nokhba-flutter` في GitHub.
2. فك ضغط `nokhba-flutter-project.zip` على جهازك (أو ارفع محتوياته من تطبيق/موقع GitHub).
3. ارفع **محتويات المجلد** إلى جذر المستودع، بحيث يظهر `pubspec.yaml` و`lib/` و`.github/` في الجذر.
4. أضف الأسرار المذكورة أعلاه.
5. افتح تبويب **Actions**، اختر **Build Nokhba Android APK** ثم **Run workflow**.
6. بعد نجاح التشغيل، افتح نتيجة الـ workflow وانزل إلى **Artifacts**، ثم نزّل `nokhba-release-apk`. فك ضغط ملف artifact لتحصل على `app-release.apk`.

## تشغيل محليًا
ثبت Flutter وAndroid SDK، ثم نفذ:

```bash
flutter pub get
flutter run --dart-define=SUPABASE_URL=https://YOUR_PROJECT.supabase.co --dart-define=SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

## ملاحظات على مخطط قاعدة البيانات
يتوقع الكود وجود:
- `profiles(username, role, name)`
- `announcements(id, text, created_at, by_name)`
- `teachers(id, username, name, specialty, photo, bio, category, gender, classes, tasks_text, years_experience)`
- `schedules(key, data)`

قد تمنع سياسات RLS بعض عمليات القراءة/الكتابة حتى بعد إعداد المفاتيح. اختبر ذلك بحسابات تجريبية، ولا توسع الصلاحيات على بيانات الطلاب دون حاجة.
