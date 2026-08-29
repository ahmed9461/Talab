import Link from "next/link";

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link className="brand-logo" href="/" aria-label="طلب - الصفحة الرئيسية">
      <span className="brand-logo-mark" aria-hidden="true">ط</span>
      {!compact && <span className="brand-logo-copy"><b>طلب</b><small>Talab</small></span>}
    </Link>
  );
}
