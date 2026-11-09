import { useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "../utils/cn";
import { fmt } from "../data";
import { useCountUp, useOverlay } from "../hooks";

/* ---------- آیکون‌ها (سنگ‌نویسی داخلی) ---------- */

const paths: Record<string, ReactNode> = {
  grid: (
    <>
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
    </>
  ),
  vault: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 7.8v2M12 14.2v2M7.8 12h2M14.2 12h2" />
      <path d="M3 8.5h2M19 8.5h2" />
    </>
  ),
  calc: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2.5" />
      <path d="M8.5 7.5h7" />
      <path d="M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 15.5h.01M12 15.5h.01M15.5 15.5h.01" />
    </>
  ),
  chat: (
    <>
      <path d="M21 12a8.5 8.5 0 0 1-8.5 8.5c-1.5 0-2.9-.35-4.1-1L3 21l1.5-5.4a8.5 8.5 0 1 1 16.5-3.6Z" />
      <path d="M8.5 10.5h7M8.5 13.5h4.5" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  trash: (
    <>
      <path d="M4 7h16M10 4h4M9 7v13a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V7" />
      <path d="M10 11v6M14 11v6" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </>
  ),
  check: <path d="M4 12.5 9.5 18 20 6.5" />,
  download: <path d="M12 3v12m0 0 4.5-4.5M12 15 7.5 10.5M4 19h16" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  send: <path d="M4 11.5 20 4l-4.5 16-4-6.5L4 11.5Zm7.5 2L20 4" />,
  menu: <path d="M4 6.5h16M4 12h16M4 17.5h10" />,
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5" />
    </>
  ),
  refresh: <path d="M20 11a8 8 0 1 0-2.3 6.3M20 5v6h-6" />,
  wallet: (
    <>
      <path d="M3 7a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
      <path d="M3 9h17" />
      <path d="M15.5 14.5h.01" />
    </>
  ),
  arrowIn: <path d="M12 19V5m0 0-5 5m5-5 5 5" />,
  arrowOut: <path d="M12 5v14m0 0-5-5m5 5 5-5" />,
  coin: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v9M9.3 9.6c.6-1 1.6-1.4 2.7-1.4 1.7 0 3 .9 3 2.1 0 2.8-5.7 1.6-5.7 4.2 0 1.2 1.3 2.1 3 2.1 1.1 0 2.1-.4 2.7-1.4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5l3.2 2" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5M12 7.8h.01" />
    </>
  ),
  bank: (
    <>
      <path d="M3 9.5 12 4l9 5.5" />
      <path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8" />
      <path d="M3 20h18" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
      <path d="M12 14.5v2.5" />
    </>
  ),
  spark: <path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4L12 3Z" />,
  back: <path d="M15 5l-7 7 7 7" />,
  dots: <path d="M5 12h.01M12 12h.01M19 12h.01" />,
  chart: <path d="M4 19V5m0 14h16M8 15v-4m4 4V8m4 7v-6" />,
  bag: (
    <>
      <path d="M4.5 8h15l-1 12.5h-13L4.5 8Z" />
      <path d="M8.5 8V6a3.5 3.5 0 0 1 7 0v2" />
      <path d="M9 12.5h6" />
    </>
  ),
  box: (
    <>
      <path d="m3.5 7.5 8.5-4 8.5 4v9l-8.5 4-8.5-4v-9Z" />
      <path d="m3.8 7.7 8.2 4 8.2-4M12 11.7v9.3" />
      <path d="m8 5.4 8.4 4" />
    </>
  ),
  truck: (
    <>
      <path d="M3 6.5h11v10H3v-10ZM14 10h4l3 3v3.5h-7V10Z" />
      <circle cx="7" cy="18.5" r="2" />
      <circle cx="17.5" cy="18.5" r="2" />
    </>
  ),
  tag: (
    <>
      <path d="M3.5 12V4.5H11L20.5 14 14 20.5 3.5 12Z" />
      <circle cx="8" cy="8" r="1.4" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20c1.4-3.2 4.2-5 7.5-5s6.1 1.8 7.5 5" />
    </>
  ),
  edit: <path d="M4 20h4L20 8l-4-4L4 16v4ZM13.5 6.5l4 4" />,
};

export function Icon({
  name,
  className,
  sw = 1.7,
}: {
  name: keyof typeof paths | string;
  className?: string;
  sw?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-5 w-5 shrink-0", className)}
      aria-hidden
    >
      {paths[name] ?? <circle cx="12" cy="12" r="8" />}
    </svg>
  );
}

/* ---------- اعداد ---------- */

export function Num({ value, className }: { value: number; className?: string }) {
  return (
    <bdi dir="ltr" className={cn("font-num tabular-nums tracking-tight [overflow-wrap:anywhere]", className)}>
      {fmt(value)}
    </bdi>
  );
}

export function CountUp({
  value,
  className,
  duration,
}: {
  value: number;
  className?: string;
  duration?: number;
}) {
  const v = useCountUp(value, duration);
  return (
    <bdi dir="ltr" className={cn("font-num tabular-nums tracking-tight [overflow-wrap:anywhere]", className)}>
      {fmt(v)}
    </bdi>
  );
}

/* ---------- برچسب ---------- */

export function Badge({
  kind = "neutral",
  children,
  className,
}: {
  kind?: "brand" | "mint" | "amber" | "rust" | "neutral" | "ink";
  children: ReactNode;
  className?: string;
}) {
  const map = {
    brand: "bg-brand-soft text-brand-700 border-brand/25",
    mint: "bg-mint-soft text-mint border-mint/25",
    amber: "bg-amber-soft text-amber border-amber/25",
    rust: "bg-rust-soft text-rust border-rust/25",
    neutral: "bg-linefaint text-ink-500 border-line",
    ink: "bg-ink-900 text-paper border-ink-900",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold leading-5",
        map[kind],
        className
      )}
    >
      {children}
    </span>
  );
}

/* ---------- عنوان بخش با خط‌حسابی ---------- */

export function SectionTitle({
  title,
  desc,
  action,
  delay = 0,
}: {
  title: string;
  desc?: string;
  action?: ReactNode;
  delay?: number;
}) {
  return (
    <div className="rv flex min-w-0 flex-col items-start justify-between gap-3 sm:flex-row sm:flex-wrap sm:items-end" style={{ animationDelay: `${delay}ms` }}>
      <div className="min-w-0 sm:flex-1 sm:basis-64">
        <h2 className="maskline text-lg font-extrabold text-ink-900" style={{ animationDelay: `${delay + 60}ms` }}>
          <span>{title}</span>
        </h2>
        {desc && <p className="mt-1 text-[13px] leading-6 text-ink-500">{desc}</p>}
      </div>
      {action && <div className="w-full min-w-0 sm:w-auto sm:max-w-full">{action}</div>}
    </div>
  );
}

/* ---------- چارت اسپارک‌لاین ---------- */

export function Sparkline({
  values,
  className,
  stroke = "var(--color-brand)",
}: {
  values: number[];
  className?: string;
  stroke?: string;
}) {
  const w = 280;
  const h = 72;
  const pad = 6;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = max - min || 1;
  const pts = values.map((v, i) => [
    pad + (i * (w - pad * 2)) / Math.max(values.length - 1, 1),
    h - pad - ((v - min) / span) * (h - pad * 2),
  ]);
  const line = pts.map((p, i) => `${i ? "L" : "M"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];
  const area = `${line} L ${last[0].toFixed(1)} ${h} L ${pts[0][0].toFixed(1)} ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={cn("h-16 w-full", className)} aria-hidden>
      <path d={area} fill={stroke} opacity="0.12" className="spark-area" />
      <path d={line} fill="none" stroke={stroke} strokeWidth="2.4" strokeLinecap="round" className="spark-line" />
      <circle cx={last[0]} cy={last[1]} r="3.4" fill={stroke} className="spark-area" />
    </svg>
  );
}

/* ---------- مودال ---------- */

export function Modal({
  open,
  onClose,
  title,
  icon,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  icon?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useOverlay(open, dialogRef, onClose);

  if (!open) return null;
  return createPortal(
    <div className="modal-layer fixed inset-x-0 z-50 flex items-end justify-center sm:items-center">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-ink-950/55"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          "modal-pop relative flex max-h-full w-full min-w-0 flex-col overflow-hidden rounded-t-2xl border border-line bg-card shadow-2xl shadow-ink-950/25 outline-none sm:rounded-xl",
          wide ? "max-w-2xl" : "max-w-md"
        )}
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-linefaint px-4 py-3 sm:px-5 sm:py-4">
          <h3 id={titleId} className="flex min-w-0 items-center gap-2 text-[15px] font-extrabold text-ink-900">
            {icon && <Icon name={icon} className="h-[18px] w-[18px] text-brand" />}
            {title}
          </h3>
          <button
            type="button"
            aria-label="بستن پنجره"
            onClick={onClose}
            className="touch-target rounded-lg p-1.5 text-ink-400 transition hover:bg-linefaint hover:text-ink-900"
          >
            <Icon name="x" className="h-4.5 w-4.5" />
          </button>
        </div>
        <div className="modal-body thin-scroll min-h-0 min-w-0 overflow-y-auto overscroll-contain p-4 sm:p-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}

/* ---------- فیلد ---------- */

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-[12.5px] font-bold text-ink-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] leading-5 text-ink-400 [overflow-wrap:anywhere]">{hint}</span>}
    </label>
  );
}

export function numInput(value: string, onChange: (v: string) => void, placeholder?: string) {
  return (
    <input
      className="field"
      dir="ltr"
      style={{ textAlign: "right" }}
      inputMode="numeric"
      value={value}
      placeholder={placeholder ?? "0"}
      onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ""))}
    />
  );
}

/* ---------- دکمه‌ها ---------- */

export function Btn({
  children,
  onClick,
  kind = "primary",
  className,
  icon,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  kind?: "primary" | "ghost" | "soft" | "danger";
  icon?: string;
}) {
  const map = {
    primary:
      "bg-brand text-white hover:bg-brand-600 shadow-sm shadow-brand/30 border border-brand/40",
    ghost: "border border-line bg-transparent text-ink-700 hover:border-brand/50 hover:text-brand",
    soft: "bg-brand-soft text-brand-700 border border-brand/20 hover:bg-brand/15",
    danger: "bg-rust-soft text-rust border border-rust/25 hover:bg-rust/20",
  } as const;
  return (
    <button
      {...props}
      type={type}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-bold transition-all duration-200 active:translate-y-px disabled:pointer-events-none disabled:opacity-40 sm:min-h-0",
        map[kind],
        className
      )}
    >
      {icon && <Icon name={icon} className="h-4 w-4" />}
      {children}
    </button>
  );
}

/* ---------- کپی شبا ---------- */

export function CopyBtn({ text, onCopied, className }: { text: string; onCopied?: () => void; className?: string }) {
  const [ok, setOk] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (t.current) clearTimeout(t.current);
  }, []);
  const doCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setOk(true);
    onCopied?.();
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => setOk(false), 1800);
  };
  return (
    <button
      type="button"
      onClick={doCopy}
      className={cn(
        "inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-bold transition sm:min-h-0 sm:px-2.5",
        ok
          ? "border-mint/40 bg-mint-soft text-mint"
          : "border-line bg-card text-ink-700 hover:border-brand/40 hover:text-brand",
        className
      )}
    >
      <Icon name={ok ? "check" : "copy"} className="h-3.5 w-3.5" />
      {ok ? "کپی شد" : "کپی"}
    </button>
  );
}

/* ---------- سطر خالی ---------- */

export function Empty({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-ink-400">
      <Icon name="dots" className="h-6 w-6" />
      <p className="text-[13px]">{text}</p>
    </div>
  );
}
