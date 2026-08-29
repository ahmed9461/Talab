"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import { ArrowLeft, BadgeCheck, Check, Eye, EyeOff, LockKeyhole, Phone, ShieldCheck, Sparkles, UserRound, Wrench } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { apiFetch } from "@/lib/api";

type Service = { id: string; name: string };

export default function RegisterPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [service, setService] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [error, setError] = useState("");
  const other = service === "other";

  useEffect(() => {
    apiFetch<Service[]>("/services")
      .then(setServices)
      .catch((err) => setError(err.message))
      .finally(() => setServicesLoading(false));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    const form = new FormData(event.currentTarget);
    try {
      await apiFetch("/auth/register", { method: "POST", body: JSON.stringify({
        full_name: form.get("fullName"), username: form.get("username"), password: form.get("password"), phone: form.get("phone"),
        service_id: other ? null : service, custom_service_text: other ? form.get("otherService") : null, accepted_terms: form.get("terms") === "on",
      }) });
      setDone(true); window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) { setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع"); }
    finally { setLoading(false); }
  }

  return <main className="auth-layout">
    <aside className="auth-story" aria-label="تعريف بمنصة طلب">
      <div className="story-glow story-glow-one"/><div className="story-glow story-glow-two"/>
      <BrandLogo />
      <div className="story-copy">
        <span className="overline"><Sparkles size={16}/> بوابة خدمات أبسط</span>
        <h1>طلبك يبدأ هنا،<br/><em>ومتابعته أسهل.</em></h1>
        <p>أرسل بيانات الخدمة مرة واحدة، وتابع حالتها واستقبل كل التحديثات المهمة من حسابك.</p>
        <div className="story-points">
          <StoryPoint icon={<BadgeCheck/>} title="حالة واضحة" text="تعرف أين وصل طلبك بدون رسائل متفرقة."/>
          <StoryPoint icon={<ShieldCheck/>} title="بيانات محمية" text="نستخدم ضوابط أمنية مخصصة لحماية بيانات الدخول."/>
        </div>
      </div>
      <p className="story-foot">Talab · بوابة العملاء والخدمات</p>
    </aside>

    <section className="auth-workspace">
      <header className="mobile-top"><BrandLogo /><a className="text-link" href="/login">تسجيل الدخول</a></header>
      <div className="form-card">
        {!done ? <>
          <div className="form-intro"><span className="step-kicker">الخطوة 1 من 1</span><h2>إنشاء طلب جديد</h2><p>أدخل بياناتك كما تريد استخدامها في الخدمة، ثم اختر نوع الطلب.</p></div>
          <form className="professional-form" onSubmit={submit} noValidate>
            <div className="field-grid two"><Field label="الاسم الكامل" icon={<UserRound/>}><input name="fullName" autoComplete="name" placeholder="مثال: أحمد محمد" minLength={2} required /></Field><Field label="رقم الجوال" icon={<Phone/>}><input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="مثال: 77xxxxxxx" minLength={7} required /></Field></div>
            <Field label="اسم المستخدم" hint="سيُستخدم أيضًا لمتابعة حسابك" icon={<UserRound/>}><input name="username" dir="ltr" autoComplete="username" placeholder="your.username" pattern="[A-Za-z0-9_.-]+" minLength={3} required /></Field>
            <Field label="كلمة المرور" hint="6 أحرف على الأقل" icon={<LockKeyhole/>}><div className="password-control"><input name="password" dir="ltr" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={6} placeholder="••••••••" required/><button className="field-action" type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}>{showPassword ? <EyeOff/> : <Eye/>}</button></div></Field>
            <Field label="نوع الخدمة" icon={<Wrench/>}><select value={service} onChange={(e) => setService(e.target.value)} disabled={servicesLoading} required><option value="" disabled>{servicesLoading ? "جارٍ تحميل الخدمات..." : "اختر الخدمة المطلوبة"}</option>{services.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}<option value="other">أخرى — اكتب طلبك</option></select></Field>
            {other && <div className="reveal-field"><label htmlFor="otherService">صف الخدمة المطلوبة</label><textarea id="otherService" name="otherService" rows={4} maxLength={1500} placeholder="اكتب وصفًا مختصرًا يساعدنا على فهم المطلوب..." required/></div>}
            <label className="consent-row"><input type="checkbox" name="terms" required/><span className="check-ui"><Check size={15}/></span><span>قرأت وأوافق على <a href="/terms" target="_blank">شروط الخدمة وسياسة الاستخدام</a>.</span></label>
            {error && <div className="form-alert" role="alert">{error}</div>}
            <button className="primary-cta" type="submit" disabled={loading || servicesLoading}><span>{loading ? "جارٍ إرسال طلبك..." : "إرسال الطلب"}</span><ArrowLeft size={19}/></button>
            <p className="form-switch">لديك حساب بالفعل؟ <a href="/login">تسجيل الدخول</a></p>
          </form>
        </> : <div className="success-screen" role="status"><div className="success-mark"><Check size={34}/></div><span className="step-kicker">تم بنجاح</span><h2>وصلنا طلبك</h2><p>تم إنشاء حسابك وحفظ طلبك بحالة <strong>قيد المراجعة</strong>. سجل دخولك في أي وقت لمتابعة الحالة والإشعارات.</p><a className="primary-cta link-button" href="/login">الانتقال لتسجيل الدخول <ArrowLeft size={19}/></a><div className="success-note"><ShieldCheck size={18}/><span>لن تحتاج لإرسال بيانات طلبك مرة أخرى عبر المحادثات.</span></div></div>}
      </div>
      <footer className="auth-footer"><span>© طلب</span><a href="/terms">الشروط والخصوصية</a></footer>
    </section>
  </main>;
}

function Field({ label, hint, icon, children }: { label: string; hint?: string; icon: ReactNode; children: ReactNode }) {
  return <label className="field"><span className="field-head"><b>{label}</b>{hint && <small>{hint}</small>}</span><span className="input-frame"><span className="input-icon" aria-hidden="true">{icon}</span>{children}</span></label>;
}
function StoryPoint({ icon, title, text }: { icon: ReactNode; title: string; text: string }) { return <div className="story-point"><span>{icon}</span><div><b>{title}</b><small>{text}</small></div></div>; }
