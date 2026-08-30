"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { ArrowLeft, BadgeCheck, Check, Eye, EyeOff, LockKeyhole, Phone, ShieldCheck, Sparkles, UserRound, Wrench } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { apiFetch } from "@/lib/api";

type Service = { id: string; name: string; service_type?: string };

type SiteContent = Record<string, string>;

const DEFAULT_CONTENT: SiteContent = {
  page_badge: "بوابة خدمات أبسط",
  hero_title: "طلبك يبدأ هنا،",
  hero_highlight: "ومتابعته أسهل.",
  hero_description: "أرسل بيانات الخدمة مرة واحدة، وتابع حالتها واستقبل كل التحديثات المهمة من حسابك.",
  point_1_title: "حالة واضحة",
  point_1_text: "تعرف أين وصل طلبك بدون رسائل متفرقة.",
  point_2_title: "بيانات محمية",
  point_2_text: "نستخدم ضوابط أمنية مخصصة لحماية بيانات الدخول.",
  story_footer: "Talab · بوابة العملاء والخدمات",
  form_kicker: "الخطوة 1 من 1",
  form_title: "إنشاء طلب جديد",
  form_description: "أدخل بياناتك كما تريد استخدامها في الخدمة، ثم اختر نوع الطلب.",
  full_name_label: "الاسم الكامل",
  full_name_placeholder: "مثال: أحمد محمد",
  phone_label: "رقم الجوال",
  phone_placeholder: "مثال: 77xxxxxxx",
  username_label: "اسم المستخدم",
  username_placeholder: "your.username",
  username_hint: "سيُستخدم أيضًا لمتابعة حسابك",
  password_label: "كلمة المرور",
  password_placeholder: "••••••••",
  password_hint: "6 أحرف على الأقل",
  service_type_label: "نوع الخدمة",
  service_type_placeholder: "اختر نوع الخدمة",
  service_label: "الخدمة المطلوبة",
  service_placeholder: "اختر الخدمة المطلوبة",
  other_option: "أخرى — اكتب طلبك",
  other_service_label: "صف الخدمة المطلوبة",
  other_service_placeholder: "اكتب وصفًا مختصرًا يساعدنا على فهم المطلوب...",
  submit_button: "إرسال الطلب",
  login_prompt: "لديك حساب بالفعل؟",
  login_link: "تسجيل الدخول",
  success_kicker: "تم بنجاح",
  success_title: "وصلنا طلبك",
  success_body: "تم إنشاء حسابك وحفظ طلبك بحالة قيد المراجعة. سجل دخولك في أي وقت لمتابعة الحالة والإشعارات.",
  success_button: "الانتقال لتسجيل الدخول",
  success_note: "لن تحتاج لإرسال بيانات طلبك مرة أخرى عبر المحادثات.",
  terms_prefix: "قرأت وأوافق على",
  terms_link: "شروط الخدمة وسياسة الاستخدام",
};

export default function RegisterPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [serviceType, setServiceType] = useState("");
  const [service, setService] = useState("");
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [error, setError] = useState("");
  const other = serviceType === "other";

  const serviceTypes = useMemo(
    () => Array.from(new Set(services.map((item) => item.service_type?.trim() || "عام"))),
    [services],
  );
  const filteredServices = services.filter((item) => (item.service_type?.trim() || "عام") === serviceType);

  useEffect(() => {
    apiFetch<Service[]>("/services")
      .then(setServices)
      .catch((err) => setError(err.message))
      .finally(() => setServicesLoading(false));
    apiFetch<SiteContent>("/content")
      .then((values) => setContent((current) => ({ ...current, ...values })))
      .catch(() => undefined);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await apiFetch("/auth/register", { method: "POST", body: JSON.stringify({
        full_name: form.get("fullName"), username: form.get("username"), password: form.get("password"), phone: form.get("phone"),
        service_id: other ? null : service, custom_service_text: other ? form.get("otherService") : null, accepted_terms: form.get("terms") === "on",
      }) });
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }

  return <main className="auth-layout">
    <aside className="auth-story" aria-label="تعريف بمنصة طلب">
      <div className="story-glow story-glow-one"/><div className="story-glow story-glow-two"/>
      <BrandLogo />
      <div className="story-copy">
        <span className="overline"><Sparkles size={16}/> {content.page_badge}</span>
        <h1>{content.hero_title}<br/><em>{content.hero_highlight}</em></h1>
        <p>{content.hero_description}</p>
        <div className="story-points">
          <StoryPoint icon={<BadgeCheck/>} title={content.point_1_title} text={content.point_1_text}/>
          <StoryPoint icon={<ShieldCheck/>} title={content.point_2_title} text={content.point_2_text}/>
        </div>
      </div>
      <p className="story-foot">{content.story_footer}</p>
    </aside>

    <section className="auth-workspace">
      <header className="mobile-top"><BrandLogo /><a className="text-link" href="/login">{content.login_link}</a></header>
      <div className="form-card">
        {!done ? <>
          <div className="form-intro"><span className="step-kicker">{content.form_kicker}</span><h2>{content.form_title}</h2><p>{content.form_description}</p></div>
          <form className="professional-form" onSubmit={submit} noValidate>
            <div className="field-grid two">
              <Field id="fullName" label={content.full_name_label} icon={<UserRound/>}><input id="fullName" name="fullName" autoComplete="name" placeholder={content.full_name_placeholder} minLength={2} required /></Field>
              <Field id="phone" label={content.phone_label} icon={<Phone/>}><input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder={content.phone_placeholder} minLength={7} required /></Field>
            </div>
            <Field id="username" label={content.username_label} hint={content.username_hint} icon={<UserRound/>}><input id="username" name="username" dir="ltr" autoComplete="username" placeholder={content.username_placeholder} pattern="[A-Za-z0-9_.-]+" minLength={3} required /></Field>
            <Field id="password" label={content.password_label} hint={content.password_hint} icon={<LockKeyhole/>}><div className="password-control"><input id="password" name="password" dir="ltr" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={6} placeholder={content.password_placeholder} required/><button className="field-action" type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}>{showPassword ? <EyeOff/> : <Eye/>}</button></div></Field>
            <Field id="serviceType" label={content.service_type_label} icon={<Wrench/>}><select id="serviceType" name="serviceType" value={serviceType} onChange={(event) => { const value = event.target.value; setServiceType(value); setService(value === "other" ? "other" : ""); }} disabled={servicesLoading} required><option value="" disabled>{servicesLoading ? "جارٍ تحميل الخدمات..." : content.service_type_placeholder}</option>{serviceTypes.map((type) => <option key={type} value={type}>{type}</option>)}<option value="other">{content.other_option}</option></select></Field>
            {!other && serviceType && <Field id="service" label={content.service_label} icon={<Wrench/>}><select id="service" name="service" value={service} onChange={(event) => setService(event.target.value)} required><option value="" disabled>{content.service_placeholder}</option>{filteredServices.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>}
            {other && <div className="reveal-field"><label htmlFor="otherService">{content.other_service_label}</label><textarea id="otherService" name="otherService" rows={4} maxLength={1500} placeholder={content.other_service_placeholder} required/></div>}
            <div className="consent-row"><input id="terms" type="checkbox" name="terms" required/><label className="consent-check" htmlFor="terms"><span className="check-ui"><Check size={15}/></span><span>{content.terms_prefix}</span></label><a href="/terms" target="_blank" rel="noreferrer">{content.terms_link}</a><span>.</span></div>
            {error && <div className="form-alert" role="alert">{error}</div>}
            <button className="primary-cta" type="submit" disabled={loading || servicesLoading}><span>{loading ? "جارٍ إرسال طلبك..." : content.submit_button}</span><ArrowLeft size={19}/></button>
            <p className="form-switch">{content.login_prompt} <a href="/login">{content.login_link}</a></p>
          </form>
        </> : <div className="success-screen" role="status"><div className="success-mark"><Check size={34}/></div><span className="step-kicker">{content.success_kicker}</span><h2>{content.success_title}</h2><p>{content.success_body}</p><a className="primary-cta link-button" href="/login">{content.success_button} <ArrowLeft size={19}/></a><div className="success-note"><ShieldCheck size={18}/><span>{content.success_note}</span></div></div>}
      </div>
      <footer className="auth-footer"><span>© طلب</span><a href="/terms">الشروط والخصوصية</a></footer>
    </section>
  </main>;
}

function Field({ id, label, hint, icon, children }: { id: string; label: string; hint?: string; icon: ReactNode; children: ReactNode }) {
  return <div className="field"><span className="field-head"><label htmlFor={id}>{label}</label>{hint && <small>{hint}</small>}</span><div className="input-frame"><span className="input-icon" aria-hidden="true">{icon}</span>{children}</div></div>;
}
function StoryPoint({ icon, title, text }: { icon: ReactNode; title: string; text: string }) { return <div className="story-point"><span aria-hidden="true">{icon}</span><div><b>{title}</b><small>{text}</small></div></div>; }