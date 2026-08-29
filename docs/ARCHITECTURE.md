# Talab Architecture v0.1

## المرحلة الحالية
النسخة الأولى تركز على واجهة التسجيل فقط، مع تجهيز البنية للتوسع إلى API وقاعدة بيانات وبوت إدارة.

## البنية المستهدفة

```text
Web (Next.js)
   ↓
Backend API (FastAPI)
   ↓
PostgreSQL
   ├── customers
   ├── services
   ├── service_requests
   ├── service_credentials
   ├── notifications
   ├── notification_attachments
   ├── terms
   ├── terms_acceptances
   └── admin_actions
   ↓
Telegram Admin Bot
```

## حالات الحساب/الطلب
- PENDING
- ACTIVE
- SUSPENDED
- REJECTED
- DISABLED

## ملاحظة أمنية
بيانات الاعتماد المطلوبة لتنفيذ الخدمة لا تعامل ككلمة مرور عادية للموقع مستقبلًا. عند إضافة الـBackend ستوضع في `service_credentials` وتشفّر تشفيرًا قابلاً للفك بمفتاح خارج قاعدة البيانات، مع سجل وصول إداري.
