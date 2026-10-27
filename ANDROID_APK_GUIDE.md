# 📱 Football Draft Battle — دليل تحويل وبناء تطبيق Android (APK)

هذا الدليل يشرح بنية المشروع وطرق استخراج ملف التثبيت المباشر **Android APK** وتثبيته على هواتف أندرويد أو رفعه إلى متجر Google Play.

---

## 1. 🏗️ بنية المشروع وإطار العمل (Framework Identification)

المشروع مبني بهيكلية تقنية حديثة عالية الأداء (Hybrid Native Architecture):

* **واجهة الويب والألعاب (Frontend / Core):**
  * **React 19 + TypeScript**
  * **Vite 6** (مُجمّع وبناء سريع جداً)
  * **Tailwind CSS** (تصميم عصري متجاوب 100% مع شاشات الهواتف)
  * **Lucide Icons & Canvas Confetti**

* **طبقة تحويل الأندرويد الأصلية (Native Android Bridge):**
  * **Capacitor 8 (من فريق Ionic الرسمي)**: يحوّل كود React إلى تطبيق أندرويد حقيقي بأداء أصلي (Hardware Accelerated Native WebView).
  * **Android Gradle Project (`/android`)**: مشروع أندرويد متكامل جاهز للفتح في Android Studio وتوليد APK أو AAB.
  * **PWA & Offline Service Worker (`/public/sw.js`, `manifest.json`)**: يدعم التخزين المؤقت والتشغيل بدون إنترنت.

---

## 2. 📁 تنظيم الملفات والمجلدات (Project Organization)

```
├── android/                   # 📱 مشروع Android الأصلي المتكامل (Gradle / Java)
│   ├── app/
│   │   ├── src/main/AndroidManifest.xml   # أذونات وإعدادات الأندرويد
│   │   ├── src/main/java/.../MainActivity.java
│   │   └── build.gradle       # إعدادات حزمة الأندرويد (applicationId, SDK versions)
│   ├── build.gradle
│   ├── gradlew & gradlew.bat  # أوامر بناء الأندرويد في سطر الأوامر
│   └── settings.gradle
│
├── src/                       # 🎮 كود اللعبة ومحرك التشكيلات
│   ├── components/            # مكونات اللعبة (DraftBattleView, MysteryDraftCard, Pitch...)
│   ├── context/               # إدارة الحالة، الحفظ، إحصائيات اللاعبين واللغات
│   ├── data/                  # 161 لاعب حقيقي (112 نجم حالي + 49 أسطورة)
│   ├── types/                 # تعريفات TypeScript
│   ├── utils/                 # محرك الدرفت، حساب الكيمستري، محاكاة المباريات
│   ├── App.tsx                # نقطة الدخول ودعم زر الرجوع لهواتف أندرويد
│   └── index.css              # توافق النوتش وشاشات اللمس (Safe-Area Insets)
│
├── public/                    # 🌐 أيقونات وملفات PWA
│   ├── manifest.json          # مواصفات تثبيت التطبيق والشاشة الكاملة
│   ├── icon.svg               # أيقونة التطبيق الرسمية
│   └── sw.js                  # Service Worker للتشغيل أوفلاين
│
├── capacitor.config.ts        # ⚙️ إعدادات الربط مع الأندرويد
├── package.json               # الحزم وأوامر البناء
└── .github/workflows/         # 🚀 البناء التلقائي في السحابة
    └── build-apk.yml          # سكريبت GitHub Actions لبناء APK تلقائياً بدون برامج
```

---

## 3. 🛠️ طرق بناء ملف الـ APK (4 طرق مختلفة)

### الطريقة 1: البناء المباشر عبر سطر الأوامر (الأسرع للمطورين)

إذا كان لديك Java JDK و Android SDK مثبتين على جهازك:

```bash
# 1. تثبيت الحزم
npm install

# 2. بناء ملفات الويب وتحديث مجلد الأندرويد
npm run build:android

# 3. بناء ملف APK مباشرة
cd android
./gradlew assembleDebug
```

📍 ستجد ملف الـ APK جاهزاً في المسار التالي:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

### الطريقة 2: عبر Android Studio (الموصى بها مع واجهة رسومية)

1. افتح برنامج **Android Studio**.
2. اختر **Open an Existing Project** واختر مجلد `android` الموجود داخل المشروع.
3. انتظر ثوانٍ حتى ينتهي **Gradle Sync**.
4. من القائمة العلوية اضغط على:
   `Build > Build Bundle(s) / APK(s) > Build APK(s)`
5. فور اكتمال البناء، ستظهر لك نافذة في الزاوية تضغط منها على **locate** لفتح ملف `app-debug.apk` ونقله لهاتفك مباشرة.

---

### الطريقة 3: البناء التلقائي مجاناً عبر GitHub Actions (بدون تثبيت أي برامج!)

تم تجهيز ملف `.github/workflows/build-apk.yml` تلقائياً داخل المشروع. كل ما عليك فعله:

1. ارفع المشروع إلى حسابك في **GitHub**.
2. توجّه إلى تبويب **Actions** في صفحة المشروع على GitHub.
3. ستجد مهمة **Build Android APK** تعمل تلقائياً.
4. بمجرد انتهائها، اضغط على النتيجة وستجد ملف `FootballDraftBattle-debug-apk` جاهزاً للتحميل بنقرة زر واحدة!

---

### الطريقة 4: التصدير لمتجر Google Play (Signed Release APK / AAB)

لإنتاج ملف رسمي للمتجر:

1. أنشئ مفتاح التوقيع الرقمي (Keystore):
   ```bash
   keytool -genkey -v -keystore release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-alias
   ```
2. ابنِ حزمة النشر المعتمدة من Google Play (AAB):
   ```bash
   cd android
   ./gradlew bundleRelease
   ```
3. ستجد الملف الناتج في:
   `android/app/build/outputs/bundle/release/app-release.aab`

---

## 4. 📲 مزايا التوافق مع هواتف أندرويد في هذا التحديث

1. **الاستجابة لشاشات الهواتف بالكامل (Fully Responsive):**
   - تم تصميم الملعب التكتيكي والبطاقات الأربع السفلية لتناسب شاشات الهواتف الصغيرة والمتوسطة بنظام `Single-row layout`.
2. **منع السحب العشوائي (Pull-to-refresh & Rubber banding disabled):**
   - تفعيل `overscroll-behavior-y: none` و `touch-action: manipulation` لمنع التحديث غير المقصود أثناء لمس الملعب.
3. **دعم زر الرجوع في هواتف أندرويد (Hardware Back-Button):**
   - عند الضغط على زر الرجوع في الهاتف، يعود التطبيق للشاشة السابقة أو القائمة الرئيسية بدلاً من الخروج المفاجئ.
4. **دعم حواف الشاشة والكاميرا الأمامية (Safe-Area Insets):**
   - شريط العنوان والقائمة تتكيف تلقائياً مع فتحات الكاميرا (Notch / Punch hole) وأشرطة التنقل السفلية.
5. **العمل بدون إنترنت (Offline Ready):**
   - التطبيق يحفظ أصوله عبر Service Worker لضمان استقرار وسرعة التحميل على الهواتف.
