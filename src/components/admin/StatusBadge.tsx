const LABELS: Record<string, { text: string; className: string }> = {
  PENDING_VERIFICATION: { text: "На проверке", className: "bg-amber-100 text-amber-700" },
  AVAILABLE: { text: "В продаже", className: "bg-green-100 text-green-700" },
  SOLD: { text: "Продано", className: "bg-slate-100 text-slate-500" },
  DELISTED: { text: "Снято с продажи", className: "bg-red-100 text-red-600" },
  REJECTED: { text: "Отклонено", className: "bg-red-100 text-red-600" },
  ARCHIVED: { text: "В архиве", className: "bg-slate-100 text-slate-500" },
};

export default function StatusBadge({ status }: { status: string }) {
  const config = LABELS[status] ?? { text: status, className: "bg-slate-100 text-slate-600" };
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}>
      {config.text}
    </span>
  );
}
