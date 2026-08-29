"use client";

import { FormEvent, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, LockKeyhole, Phone, User, UserRound, Wrench } from "lucide-react";

const SERVICES = [
  "تفعيل خدمة",
  "تجديد اشتراك",
  "ترقية خدمة",
  "استشارة",
  "أخرى",
];

export default function HomePage() {
  const [service, setService] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isOther = useMemo(() => service === "أخرى", [service]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="page-shell">
      <section className="brand-panel" aria-label="تعريف بمنصة طلب">
        <div className="brand-top">
          <div className="logo-mark" aria-hidden="true">ط</div>
          <span className="brand-name">Talab</span>
        </div>

        <div className="brand-copy">
          <span className="eyebrow">بوابة الخدمات</span>
          <h1>اطلب خدمتك.<br />وتابعها ببساطة.</h1>
          <p>مكان واحد لإرسال بيانات طلبك واستقبال التحديثات والإشعارات المهمة.</p>
        </div>

        <div className="trust-card">
          <CheckCircle2 size={20} aria-hidden="true" />
          <div>
            <strong>طلب واضح من البداية</strong>
            <span>بياناتك وخدمتك تصل مباشرة للمراجعة.</span>
          </div>
        </div>
      </section>

      <section className="form-panel">
        <div className="mobile-brand">
          <div className="logo-mark" aria-hidden="true">ط</div>
          <span className="brand-name">Talab</span>
        </div>

        <div className="form-wrap">
          <div className="form-heading">
            <span className="status-pill">إنشاء حساب</span>
            <h2>أهلًا بك في طلب</h2>
            <p>أدخل بياناتك وحدد الخدمة التي تريدها.</p>
          </div>

          {submitted ? (
            <div className="success-state" role="status">
              <div className="success-icon"><CheckCircle2 size={34} /></div>
              <h3>تم استلام طلبك</h3>
              <p>تم تسجيل بياناتك بنجاح، وسيظهر لك تحديث حالة الطلب بعد المراجعة.</p>
              <button className="secondary-button" type="button" onClick={() => setSubmitted(false)}>العودة للنموذج</button>
            </div>
          ) : (
            <form className="signup-form" onSubmit={handleSubmit}>
              <Field label="الاسم الكامل" icon={<UserRound size={19} />}>
                <input name="fullName" type="text" autoComplete="name" placeholder="مثال: أحمد محمد" required />
              </Field>

              <Field label="اسم المستخدم" icon={<User size={19} />}>
                <input name="username" type="text" autoComplete="username" placeholder="اختر اسم مستخدم" required />
              </Field>

              <Field label="كلمة المرور" icon={<LockKeyhole size={19} />}>
                <div className="password-wrap">
                  <input name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="أدخل كلمة المرور" required />
                  <button className="icon-button" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}>
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </Field>

              <Field label="رقم الجوال" icon={<Phone size={19} />}>
                <input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="مثال: 77xxxxxxx" required />
              </Field>

              <Field label="نوع الخدمة" icon={<Wrench size={19} />}>
                <select name="service" value={service} onChange={(event) => setService(event.target.value)} required>
                  <option value="" disabled>اختر الخدمة</option>
                  {SERVICES.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </Field>

              {isOther && (
                <div className="other-service">
                  <label htmlFor="otherService">صف لنا الخدمة التي تريدها</label>
                  <textarea id="otherService" name="otherService" rows={4} placeholder="اكتب وصفًا مختصرًا وواضحًا للخدمة المطلوبة..." required />
                </div>
              )}

              <label className="terms-row">
                <input type="checkbox" name="terms" required />
                <span>أوافق على <a href="#terms">شروط الخدمة</a> وسياسة الاستخدام.</span>
              </label>

              <button className="primary-button" type="submit">
                <span>متابعة</span>
                <ArrowLeft size={19} aria-hidden="true" />
              </button>
            </form>
          )}

          <p className="login-link">لديك حساب بالفعل؟ <a href="#login">تسجيل دخول</a></p>
        </div>
      </section>
    </main>
  );
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <div className="input-shell">
        <span className="field-icon" aria-hidden="true">{icon}</span>
        {children}
      </div>
    </label>
  );
}
