"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { apiFetch } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter(); const [error, setError] = useState(""); const [loading, setLoading] = useState(false); const [show, setShow] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError(""); const form = new FormData(event.currentTarget);
    try { await apiFetch("/auth/login", { method: "POST", body: JSON.stringify({ username: form.get("username"), password: form.get("password") }) }); router.replace("/dashboard"); }
    catch (err) { setError(err instanceof Error ? err.message : "تعذر تسجيل الدخول"); }
    finally { setLoading(false); }
  }
  return <main className="centered-auth"><div className="centered-auth-bg"/><section className="login-shell"><BrandLogo/><div className="login-card"><div className="form-intro"><span className="step-kicker">بوابة العميل</span><h1>مرحبًا بعودتك</h1><p>سجّل دخولك لمتابعة طلباتك وآخر الإشعارات.</p></div><form className="professional-form" onSubmit={submit}><label className="field"><span className="field-head"><b>اسم المستخدم</b></span><span className="input-frame"><span className="input-icon"><UserRound/></span><input name="username" dir="ltr" autoComplete="username" placeholder="your.username" required/></span></label><label className="field"><span className="field-head"><b>كلمة المرور</b></span><span className="input-frame"><span className="input-icon"><LockKeyhole/></span><span className="password-control"><input name="password" dir="ltr" type={show ? "text" : "password"} autoComplete="current-password" placeholder="••••••••" required/><button className="field-action" type="button" onClick={() => setShow(!show)} aria-label={show ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}>{show ? <EyeOff/> : <Eye/>}</button></span></span></label>{error && <div className="form-alert" role="alert">{error}</div>}<button className="primary-cta" disabled={loading}>{loading ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}<ArrowLeft size={19}/></button></form><div className="secure-hint"><ShieldCheck size={17}/><span>جلسة دخول آمنة ولا يتم عرض كلمة المرور داخل الموقع.</span></div><p className="form-switch">جديد في طلب؟ <a href="/">إنشاء حساب</a></p></div><footer className="login-footer"><a href="/terms">الشروط والخصوصية</a></footer></section></main>;
}
