# Talab Design System v0.1

هذا النظام هو المرجع البصري الأولي للمشروع، ومبني وفق مبادئ UI/UX Pro Max: وضوح المهمة، تقليل الحمل المعرفي، استجابة ممتازة للمقاسات الصغيرة، حالات تركيز ظاهرة، وعدم الاعتماد على اللون وحده لنقل المعنى.

## Product profile
- النوع: Customer Service Portal / Request Intake
- الاتجاه: RTL أولًا
- الأولوية: Mobile-first مع سطح مكتب ثنائي اللوحة
- الانطباع: مهني، هادئ، موثوق، مباشر
- النمط: Clean SaaS / Service Portal مع عمق خفيف وبدون مؤثرات مبالغ فيها

## Tokens
- Primary: `#175CD3`
- Deep brand: `#0D2A52`
- Background: `#F6F8FB`
- Surface: `#FFFFFF`
- Text: `#172033`
- Muted: `#667085`
- Success: `#067647`
- Border: `#E4E7EC`

## Typography
- Arabic: Tajawal
- UI body: 14–17px
- Heading: 30–68px حسب السياق والشاشة

## Interaction rules
1. كل عنصر قابل للنقر يملك hover/focus واضحًا.
2. الأزرار الأساسية لا تقل عن 50–52px ارتفاعًا في شاشة التسجيل.
3. الحقول تستخدم labels حقيقية وليست placeholders فقط.
4. خيار «أخرى» يكشف حقل الوصف بدون إعادة تحميل الصفحة.
5. التصميم يعمل على 375px و768px و1024px و1440px.
6. نحترم `prefers-reduced-motion`.
7. لا تستخدم emoji كأيقونات واجهة؛ استخدم Lucide/SVG.
8. لا تعتمد على اللون وحده في حالات الطلب أو التنبيه؛ استخدم نصًا/أيقونة أيضًا.

## Future components
- StatusBadge
- NotificationCard
- AttachmentPreview
- ServiceSelect
- AdminActionBar
- EmptyState
- ConfirmDialog

## UX principle
Talab ليس متجرًا في هذه المرحلة. الهدف الأول: إدخال الطلب بأقل احتكاك ثم إعطاء العميل مكانًا بسيطًا لمعرفة الحالة واستقبال الإشعارات.
