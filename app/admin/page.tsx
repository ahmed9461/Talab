"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, Check, KeyRound, LayoutTemplate, Plus, RefreshCw, Save, Settings2, Wrench } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { apiFetch } from "@/lib/api";
import "./admin.css";

type Service = { id: string; name: string; service_type: string; is_active: boolean; sort_order: number };
type SiteContent = Record<string, string>;

type ContentField = { key: string; label: string; multiline?: boolean };
type ContentSection = { title: string; description: string; fields: ContentField[] };

const CONTENT_SECTIONS: ContentSection[] = [
  {
    title: "واجهة التعريف",
    description: "النصوص الكبيرة التي تظهر بجانب نموذج التسجيل.",
    fields: [
      { key: "page_badge", label: "العبارة العلوية" },
      { key: "hero_title", label: "العنوان الرئيسي" },
      { key: "hero_highlight", label: "الجزء المميز من العنوان" },
      { key: "hero_description", label: "الوصف", multiline: true },
      { key: "point_1_title", label: "ميزة 1 — العنوان" },
      { key: "point_1_text", label: "ميزة 1 — الوصف" },
      { key: "point_2_title", label: "ميزة 2 — العنوان" },
      { key: "point_2_text", label: "ميزة 2 — الوصف" },
      { key: "story_footer", label: "تذييل الواجهة" },
    ],
  },
  {
    title: "نموذج الطلب",
    description: "العناوين والتعليمات والعبارات التي يراها العميل أثناء التسجيل.",
    fields: [
      { key: "form_kicker", label: "عبارة الخطوة" },
      { key: "form_title", label: "عنوان النموذج" },
      { key: "form_description", label: "وصف النموذج", multiline: true },
      { key: "full_name_label", label: "حقل الاسم" },
      { key: "phone_label", label: "حقل الجوال" },
      { key: "username_label", label: "حقل اسم المستخدم" },
      { key: "username_hint", label: "ملاحظة اسم المستخدم" },
      { key: "password_label", label: "حقل كلمة المرور" },
      { key: "password_hint", label: "ملاحظة كلمة المرور" },
      { key: "service_type_label", label: "عنوان نوع الخدمة" },
      { key: "service_type_placeholder", label: "اختيار نوع الخدمة" },
      { key: "service_label", label: "عنوان الخدمة" },
      { key: "service_placeholder", label: "اختيار الخدمة" },
      { key: "other_option", label: "خيار خدمة أخرى" },
      { key: "other_service_label", label: "عنوان وصف الخدمة الأخرى" },
      { key: "other_service_placeholder", label: "مساعدة وصف الخدمة الأخرى", multiline: true },
      { key: "submit_button", label: "زر إرسال الطلب" },
      { key: "login_prompt", label: "عبارة الحساب الموجود" },
      { key: "login_link", label: "نص تسجيل الدخول" },
      { key: "terms_prefix", label: "مقدمة الموافقة" },
      { key: "terms_link", label: "نص رابط الشروط" },
    ],
  },
  {
    title: "رسالة نجاح الطلب",
    description: "ما يظهر مباشرة بعد إنشاء الحساب وإرسال الطلب.",
    fields: [
      { key: "success_kicker", label: "العبارة العلوية" },
      { key: "success_title", label: "عنوان النجاح" },
      { key: "success_body", label: "رسالة النجاح", multiline: true },
      { key: "success_button", label: "زر تسجيل الدخول" },
      { key: "success_note", label: "الملاحظة السفلية", multiline: true },
    ],
  },
];

function withAdminKey(key: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("X-Admin-Key", key);
  return { ...init, headers };
}

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [content, setContent] = useState<SiteContent>({});
  const [services, setServices] = useState<Service[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savingContent, setSavingContent] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = window.sessionStorage.getItem("talab_admin_key");
    if (stored) setAdminKey(stored);
  }, []);

  async function loadAll(key = adminKey) {
    if (!key.trim()) return setError("أدخل مفتاح الإدارة أولًا.");
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const [siteContent, serviceRows] = await Promise.all([
        apiFetch<SiteContent>("/admin/content", withAdminKey(key)),
        apiFetch<Service[]>("/admin/services", withAdminKey(key)),
      ]);
      window.sessionStorage.setItem("talab_admin_key", key);
      setContent(siteContent);
      setServices(serviceRows);
      setConnected(true);
    } catch (err) {
      setConnected(false);
      setError(err instanceof Error ? err.message : "تعذر فتح لوحة الإدارة");
    } finally {
      setLoading(false);
    }
  }

  async function saveContent() {
    setSavingContent(true);
    setError("");
    setMessage("");
    try {
      const values = await apiFetch<SiteContent>("/admin/content", withAdminKey(adminKey, { method: "PATCH", body: JSON.stringify({ values: content }) }));
      setContent(values);
      setMessage("تم حفظ نصوص الصفحة وتحديثها بنجاح.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر حفظ النصوص");
    } finally {
      setSavingContent(false);
    }
  }

  async function addService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError("");
    setMessage("");
    try {
      await apiFetch<Service>("/admin/services", withAdminKey(adminKey, {
        method: "POST",
        body: JSON.stringify({
          name: form.get("name"),
          service_type: form.get("serviceType"),
          sort_order: Number(form.get("sortOrder") || 0),
        }),
      }));
      event.currentTarget.reset();
      setMessage("تمت إضافة الخدمة.");
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر إضافة الخدمة");
    }
  }

  async function saveService(service: Service) {
    setError("");
    setMessage("");
    try {
      const updated = await apiFetch<Service>(`/admin/services/${service.id}`, withAdminKey(adminKey, {
        method: "PATCH",
        body: JSON.stringify({ name: service.name, service_type: service.service_type, sort_order: Number(service.sort_order), is_active: service.is_active }),
      }));
      setServices((current) => current.map((item) => item.id === updated.id ? updated : item));
      setMessage(`تم حفظ خدمة «${updated.name}».`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر حفظ الخدمة");
    }
  }

  function updateService(id: string, patch: Partial<Service>) {
    setServices((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
  }

  if (!connected) return <main className="admin-login-shell">
    <div className="admin-login-card">
      <BrandLogo />
      <span className="admin-kicker"><Settings2 size={16}/> إعدادات الموقع</span>
      <h1>لوحة إدارة طلب</h1>
      <p>عدّل نصوص صفحة التسجيل وأنواع الخدمات بدون الرجوع إلى الكود.</p>
      <label className="admin-field"><span>مفتاح الإدارة</span><div><KeyRound size={18}/><input type="password" value={adminKey} onChange={(event) => setAdminKey(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void loadAll(); }} placeholder="ADMIN_API_KEY" autoComplete="off" /></div></label>
      {error && <div className="admin-alert error">{error}</div>}
      <button className="admin-primary" type="button" onClick={() => void loadAll()} disabled={loading}>{loading ? "جارٍ التحقق..." : "دخول لوحة الإدارة"}</button>
      <a className="admin-back" href="/"><ArrowRight size={16}/> العودة للموقع</a>
    </div>
  </main>;

  return <main className="admin-shell">
    <header className="admin-header"><div className="admin-header-inner"><BrandLogo/><div className="admin-header-actions"><a href="/" target="_blank" rel="noreferrer">معاينة الموقع</a><button type="button" onClick={() => void loadAll()} disabled={loading}><RefreshCw size={17}/> تحديث</button></div></div></header>
    <div className="admin-container">
      <section className="admin-hero"><div><span className="admin-kicker"><Settings2 size={16}/> لوحة التحكم</span><h1>إدارة واجهة طلب</h1><p>كل تعديل هنا يُحفظ في قاعدة البيانات ويظهر لعملائك بدون تعديل ملفات المشروع.</p></div><div className="admin-status"><Check size={17}/> متصل</div></section>

      {(message || error) && <div className={`admin-alert ${error ? "error" : "success"}`}>{error || message}</div>}

      <div className="admin-tabs-note"><LayoutTemplate size={18}/><div><b>نصوص صفحة التسجيل</b><span>غيّر العناوين والأوصاف ورسالة النجاح من مكان واحد.</span></div></div>
      <section className="admin-content-stack">
        {CONTENT_SECTIONS.map((section) => <article className="admin-card" key={section.title}>
          <div className="admin-card-head"><div><h2>{section.title}</h2><p>{section.description}</p></div></div>
          <div className="admin-form-grid">{section.fields.map((field) => <label className={`admin-field ${field.multiline ? "wide" : ""}`} key={field.key}><span>{field.label}</span>{field.multiline ? <textarea rows={3} value={content[field.key] ?? ""} onChange={(event) => setContent((current) => ({ ...current, [field.key]: event.target.value }))}/> : <input value={content[field.key] ?? ""} onChange={(event) => setContent((current) => ({ ...current, [field.key]: event.target.value }))}/>}</label>)}</div>
        </article>)}
      </section>
      <div className="admin-save-bar"><span>التعديلات لا تظهر للعامة حتى تضغط حفظ.</span><button className="admin-primary compact" type="button" onClick={() => void saveContent()} disabled={savingContent}><Save size={18}/>{savingContent ? "جارٍ الحفظ..." : "حفظ نصوص الصفحة"}</button></div>

      <div className="admin-tabs-note services-note"><Wrench size={18}/><div><b>الخدمات وأنواعها</b><span>يمكن أن يجمع النوع أكثر من خدمة، مثل «اشتراكات» أو «خدمات جامعية».</span></div></div>
      <section className="admin-card">
        <div className="admin-card-head"><div><h2>إضافة خدمة</h2><p>حدد نوع الخدمة واسمها وترتيب ظهورها.</p></div></div>
        <form className="admin-add-service" onSubmit={addService}>
          <label className="admin-field"><span>نوع الخدمة</span><input name="serviceType" placeholder="مثال: اشتراكات" required/></label>
          <label className="admin-field"><span>اسم الخدمة</span><input name="name" placeholder="مثال: تفعيل اشتراك" required/></label>
          <label className="admin-field order"><span>الترتيب</span><input name="sortOrder" type="number" defaultValue="0"/></label>
          <button className="admin-primary compact" type="submit"><Plus size={18}/> إضافة الخدمة</button>
        </form>
      </section>

      <section className="admin-card services-card">
        <div className="admin-card-head"><div><h2>الخدمات الحالية</h2><p>{services.length} خدمة — عدّل السطر ثم احفظه.</p></div></div>
        <div className="service-editor-list">
          {services.map((item) => <div className="service-editor-row" key={item.id}>
            <label><span>النوع</span><input value={item.service_type} onChange={(event) => updateService(item.id, { service_type: event.target.value })}/></label>
            <label><span>الخدمة</span><input value={item.name} onChange={(event) => updateService(item.id, { name: event.target.value })}/></label>
            <label className="order"><span>الترتيب</span><input type="number" value={item.sort_order} onChange={(event) => updateService(item.id, { sort_order: Number(event.target.value) })}/></label>
            <label className="service-toggle"><input type="checkbox" checked={item.is_active} onChange={(event) => updateService(item.id, { is_active: event.target.checked })}/><span>{item.is_active ? "مفعلة" : "موقوفة"}</span></label>
            <button className="admin-secondary" type="button" onClick={() => void saveService(item)}><Save size={16}/> حفظ</button>
          </div>)}
          {!services.length && <div className="admin-empty">لا توجد خدمات حتى الآن.</div>}
        </div>
      </section>
    </div>
  </main>;
}
