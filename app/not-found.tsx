import { ArrowRight } from "lucide-react";import { BrandLogo } from "@/components/brand-logo";
export default function NotFound(){return <main className="not-found"><BrandLogo/><div><span className="error-code">404</span><h1>الصفحة غير موجودة</h1><p>الرابط الذي فتحته غير متاح أو تم نقله.</p><a className="primary-cta link-button" href="/"><ArrowRight size={18}/>العودة للرئيسية</a></div></main>}
