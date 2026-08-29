"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, LockKeyhole, Phone, User, UserRound, Wrench } from "lucide-react";

type Service = { id: string; name: string };
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export default function HomePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [service, setService] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isOther = service === "other";

  useEffect(() => {
    fetch(`${API_URL}/services`)
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then(setServices)
      .catch(() => setError("تعذر تحميل الخدمات حاليًا. حاول مرة أخرى."));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      full_name: String(form.get("fullName") ?? ""),
      username: String(form.get("username") ?? ""),
      password: String(form.get("password") ?? ""),
      phone: String(form.get("phone") ?? ""),
      service_id: isOther ? null : service,
      custom_service_text: isOther ? String(form.get("otherService") ?? "") : null,
      accepted_terms: form.get("terms") === "on",
    };

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(typeof body.detail === "string" ? body.detail : "تعذر إرسال الطلب");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="brand-panel" aria-label="تعريف بمنصة طلب">
        <div className="brand-top"><div className="logo-mark" aria-hidden="true">ط</div><span className="brand-name">Talab</span></div>
        <div className="brand-copy"><span className="eyebrow">بوابة الخدمات</span><h1>اطلب خدمتك.<br />وتابعها ببساطة.</h1><p>مكان واحد لإرسال بيانات طلبك واستقبال التحديثات والإشعارات المهمة.</p></div>
        <div className="trust-card"><CheckCircle2 size={20} aria-hidden="true" /><div><strong>طلب واضح من البداية</strong><span>بياناتك وخدمتك تصل مباشرة للمراجعة.</span></div></div>
      </section>

      <section className="form-panel">
        <div className="mobile-brand"><div className="logo-mark" aria-hidden="true">ط</div><span className="brand-name">Talab</span></div>
        <div className="form-wrap">
          <div className="form-heading"><span className="status-pill">إنشاء حساب</span><h2>أهلًا بك في طلب</h2><p>أدخل بياناتك وحدد الخدمة التي تريدها.</p></div>
          {submitted ? (
            <div className="success-state" role="status"><div className="success-icon"><CheckCircle2 size={34} /></div><h3>تم استلام طلبك</h3><p>تم تسجيل بياناتك بنجاح وحالة الطلب الآن قيد المراجعة.</p></div>
          ) : (
            <form className="signup-form" onSubmit={handleSubmit}>
              <Field label="الاسم الكامل" icon={<UserRound size={19} />}><input name="fullName" type="text" autoComplete="name" placeholder="مثال: أحمد محمد" required /></Field>
              <Field label="اسم المستخدم" icon={<User size={19} />}><input name="username" type="text" autoComplete="username" placeholder="اختر اسم مستخدم" required /></Field>
              <Field label="كلمة المرور" icon={<LockKeyhole size={19} />}><div className="password-wrap"><input name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="أدخل كلمة المرور" minLength={6} required /><button className="icon-button" type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}>{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div></Field>
              <Field label="رقم الجوال" icon={<Phone size={19} />}><input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="مثال: 77xxxxxxx" required /></Field>
              <Field label="نوع الخدمة" icon={<Wrench size={19} />}><select name="service" value={service} onChange={(e) => setService(e.target.value)} required><option value="" disabled>اختر الخدمة</option>{services.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}<option value="other">أخرى</option></select></Field>
              {isOther && <div className="other-service"><label htmlFor="otherService">صف لنا الخدمة التي تريدها</label><textarea id="otherService" name="otherService" rows={4} placeholder="اكتب وصفًا مختصرًا وواضحًا للخدمة المطلوبة..." required /></div>}
              <label className="terms-row"><input type="checkbox" name="terms" required /><span>أوافق على <a href="#terms">شروط الخدمة</a> وسياسة الاستخدام.</span></label>
              {error && <p role="alert">{error}</p>}
              <button className="primary-button" type="submit" disabled={loading}><span>{loading ? "جارٍ الإرسال..." : "متابعة"}</span><ArrowLeft size={19} aria-hidden="true" /></button>
            </form>
          )}
          <p className="login-link">لديك حساب بالفعل؟ <a href="#login">تسجيل دخول</a></p>
        </div>
      </section>
    </main>
  );
}

function Field({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) {
  return <label className="field"><span className="field-label">{label}</span><div className="input-shell"><span className="field-icon" aria-hidden="true">{icon}</span>{children}</div></label>;
}
