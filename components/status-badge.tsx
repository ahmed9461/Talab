import { CircleCheck, CirclePause, Clock3, CircleX, Ban } from "lucide-react";

const STATUS = {
  PENDING: { label: "قيد المراجعة", className: "status-pending", icon: Clock3 },
  ACTIVE: { label: "تم التفعيل", className: "status-active", icon: CircleCheck },
  SUSPENDED: { label: "موقوف مؤقتًا", className: "status-suspended", icon: CirclePause },
  REJECTED: { label: "مرفوض", className: "status-rejected", icon: CircleX },
  DISABLED: { label: "معطّل", className: "status-disabled", icon: Ban },
} as const;

export function StatusBadge({ status }: { status: string }) {
  const item = STATUS[status as keyof typeof STATUS] ?? STATUS.PENDING;
  const Icon = item.icon;
  return <span className={`status-badge ${item.className}`}><Icon size={15} aria-hidden="true" />{item.label}</span>;
}

export function statusLabel(status: string) {
  return STATUS[status as keyof typeof STATUS]?.label ?? status;
}
