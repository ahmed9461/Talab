# Talab agent instructions

## UI/UX
هذا المشروع يعتمد UI/UX Pro Max كمرجع تصميم أساسي:
https://github.com/nextlevelbuilder/ui-ux-pro-max-skill

عند العمل محليًا مع Codex يمكن تثبيته بالطريقة الرسمية الحالية:

```bash
npm install -g ui-ux-pro-max-cli
uipro init --ai codex
```

قبل أي تعديل واجهة:
1. اقرأ `docs/DESIGN_SYSTEM.md`.
2. حافظ على RTL الصحيح والعربية أولًا.
3. اختبر منطقيًا 375 / 768 / 1024 / 1440.
4. استخدم Lucide/SVG للأيقونات ولا تستخدم emoji كأيقونات UI.
5. حافظ على focus states وreduced motion وإعادة تدفق النص.
6. تجنب إعادة تصميم الصفحات بشكل منفصل عن Design System.

## Architecture
اقرأ `docs/ARCHITECTURE.md` قبل إضافة Backend أو قاعدة بيانات أو بوت تيليجرام.
