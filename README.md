# Talab — طلب

بوابة عربية لإدارة طلبات العملاء، متابعة حالة الخدمة، واستقبال الإشعارات والمرفقات من مكان واحد.

## الحالة الحالية — v0.6

Talab أصبح MVP متكامل البنية وليس مجرد واجهة:

- Next.js + TypeScript لواجهة العميل.
- واجهة RTL وMobile-first بنظام تصميم موحد مستند إلى UI/UX Pro Max.
- تسجيل حساب وطلب خدمة، مع خيار «أخرى» الديناميكي.
- FastAPI + PostgreSQL + Alembic.
- تسجيل دخول عبر HttpOnly/SameSite cookie.
- Argon2 لتوثيق بوابة العميل + AES-GCM منفصل لبيانات الخدمة اللازمة للتنفيذ.
- حالات PENDING / ACTIVE / SUSPENDED / REJECTED / DISABLED.
- لوحة عميل تعرض الطلبات والإشعارات والمرفقات وحالة القراءة.
- Admin API منفصل مع Audit Log.
- بوت Telegram خاص بالمالك لإدارة الطلبات والتفعيل/الرفض/التعليق وإرسال الإشعارات والمرفقات.
- رفع ملفات خاص وإتاحة المرفقات للعميل بعد التحقق من ملكية الإشعار.
- Rate limiting أولي للتسجيل وتسجيل الدخول.
- GitHub Actions لفحص الواجهة والخلفية وPostgreSQL migrations.
- ملفات systemd وNginx وتجهيزات نشر Ubuntu.

## بنية المشروع

```text
app/                    Next.js customer portal
components/             shared UI components
lib/                    frontend API utilities
backend/app/            FastAPI application
backend/migrations/     Alembic migrations
backend/tests/          backend tests
deploy/                 systemd + Nginx templates
design-system/talab/    UI source of truth
docs/                   architecture, progress, deployment
```

## التشغيل المحلي

### 1) PostgreSQL
```bash
docker compose up -d postgres
```

### 2) Backend
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload
```

استبدل الأسرار الموجودة في `backend/.env` قبل التشغيل الفعلي.

### 3) Frontend
من جذر المشروع:
```bash
cp .env.example .env.local
npm install
npm run dev
```

الواجهة: `http://localhost:3000`  
API: `http://localhost:8000`  
API docs: `http://localhost:8000/docs`

### 4) Telegram admin bot
بعد ضبط `TELEGRAM_BOT_TOKEN` و`TELEGRAM_OWNER_ID` في `backend/.env`:
```bash
cd backend
source .venv/bin/activate
python bot.py
```

## الأمان

- لا تُحفظ كلمة المرور كنص صريح.
- كلمة مرور بوابة العميل محفوظة كـArgon2 hash.
- النسخة المطلوبة لتنفيذ الخدمة مشفرة AES-GCM بمفتاح خارج قاعدة البيانات.
- عرض بيانات الخدمة للإدارة مسجل في `admin_actions`.
- جلسة العميل في HttpOnly cookie وليست localStorage.
- المرفقات ليست مجلدًا عامًا؛ يتم تنزيلها عبر endpoint يتحقق من العميل.
- لا يتم commit لملفات `.env` أو الوسائط التشغيلية.

## UI/UX

المصدر البصري الأساسي:
`design-system/talab/MASTER.md`

التصميم يتبع أولويات UI/UX Pro Max: Accessibility، Touch، Responsive Layout، Feedback، Forms، ثم polish البصري. راجع أيضًا `docs/DESIGN_SYSTEM.md` و`AGENTS.md` قبل تعديل الواجهة.

## النشر

راجع `docs/DEPLOYMENT.md`. المشروع مجهز لاستضافة نموذجية على Ubuntu عبر:

```text
Nginx
├── Next.js  127.0.0.1:3000
└── FastAPI  127.0.0.1:8000
        ├── PostgreSQL
        └── Telegram Bot
```

في الإنتاج يجب استخدام HTTPS وتعيين `COOKIE_SECURE=true` وأسرار مستقلة وقوية.
