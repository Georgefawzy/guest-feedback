# Guest Feedback

فورم تقييم عملاء بسيط (عربي/إنجليزي) يشتغل على GitHub Pages، والتقييمات بتتسجل في Google Sheet.

## الملفات
- `logo.png` — لوجو كاريبو (لازم يترفع مع باقي الملفات)
- `index.html` — الفورم (كل حاجة في ملف واحد)
- `dashboard.html` — لوحة التقييمات (كل فرع بكوده، والإدارة بكود يشوف كل الفروع)
- `Code.gs` — كود Google Apps Script اللي بيحفظ التقييمات

## 1) تجهيز الشيت
1. اعمل Google Sheet جديد.
2. من **Extensions › Apps Script** امسح الكود الموجود والصق محتوى `Code.gs`.
3. (اختياري) اكتب إيميلك في `NOTIFY_EMAIL` عشان توصلك تنبيهات التقييمات المنخفضة.
4. **Deploy › New deployment › Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. وافق على الصلاحيات وانسخ رابط الـ Web app (بينتهي بـ `/exec`).

> أي تعديل بعد كده على `Code.gs` محتاج **New deployment** (أو Manage deployments › Edit › New version).

## 2) ضبط الفورم
افتح `index.html` وعدّل `CONFIG` في أول السكريبت:
```js
brand: "اسم البراند",
endpoint: "رابط /exec",
branches: ["فرع 1", "فرع 2"]
```

## 3) الرفع على GitHub
```bash
git init
git add .
git commit -m "Guest feedback form"
git branch -M main
git remote add origin https://github.com/<username>/guest-feedback.git
git push -u origin main
```
بعدها: **Settings › Pages › Deploy from a branch › main / (root)**.
الرابط هيبقى: `https://<username>.github.io/guest-feedback/`

## ملاحظات
- لو `endpoint` فاضي، الفورم بيشتغل في وضع تجربة (بيطبع في الـ console ومش بيحفظ).
- ممكن تعمل QR Code للرابط وتحطه على الترابيزات أو تفتحه على تابلت في الفرع (بيرجع للفورم تلقائيًا بعد الإرسال).
- رابط الـ Apps Script ظاهر في الكود، فبنستخدم honeypot وتنظيف للمدخلات. لو حصل spam ممكن تضيف reCAPTCHA لاحقًا.

## الفروع والأكواد (من غير تعديل كود)
كل الفروع بتتدار من تاب **Branches** في الشيت (بيتعمل تلقائي أول ما يتنشر الكود):

| Branch | PIN | Active |
|---|---|---|
| Branch 1 | BR1-48271 | Y |
| ALL | HQ-905318 | Y |

- **إضافة فرع:** أضف صف جديد (اسم الفرع + كود + `Y`). بيظهر في الفورم والداشبورد فورًا.
- **تعديل كود فرع:** غيّر خانة PIN.
- **إيقاف فرع:** خلّي Active = `N` (بيختفي من الفورم ويتقفل كوده).
- **تغيير اسم فرع:** غيّره في Branches، والتقييمات القديمة هتفضل بالاسم القديم، فاعمل Find & Replace على عمود Branch في تاب Feedback.
- الصف اللي اسمه `ALL` هو كود الإدارة (يشوف كل الفروع ويفلتر بينهم).
- غيّر الأكواد الافتراضية قبل التشغيل، وخلي عمود PIN نص (Plain text).

## الداشبورد
1. اعمل **New deployment** واحط رابط `/exec` في `ENDPOINT` داخل `dashboard.html` (وفي `CONFIG.endpoint` في `index.html`).
2. كل مدير يفتح `.../dashboard.html` ويدخل كود فرعه مرة واحدة، والجهاز بيفتكره بعد كده.
3. الفلاتر: فترات جاهزة (اليوم / 7 / 30 / 90 / سنة)، أو من–إلى بتاريخ مخصص، وفلتر الفرع لكود الإدارة.

> الداشبورد بيحمّل آخر 365 يوم.
