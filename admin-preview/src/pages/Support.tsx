import { useEffect, useMemo, useRef, useState } from "react";
import { type Chat, faDate, faTime } from "../data";
import { Badge, Btn, Icon, SectionTitle } from "../components/ui";
import { useMediaQuery, useOverlay } from "../hooks";
import { cn } from "../utils/cn";

export interface SupportProps {
  chats: Chat[];
  activeId: string | null;
  setActive: (id: string | null) => void;
  sendReply: (chatId: string, text: string) => void;
  setStatus: (chatId: string, status: Chat["status"]) => void;
}

const statusMeta: Record<Chat["status"], { label: string; kind: "rust" | "amber" | "mint"; dot: string }> = {
  open: { label: "باز", kind: "rust", dot: "bg-rust" },
  waiting: { label: "در انتظار بررسی", kind: "amber", dot: "bg-amber" },
  resolved: { label: "پاسخ داده شده", kind: "mint", dot: "bg-mint" },
};

const QUICK = [
  { label: "در حال بررسی", text: "سلام! پیام شما را دریافت کردیم؛ پرونده‌تان در حال بررسی است و تا پایان روز پاسخ می‌دهیم." },
  { label: "تأیید واریز", text: "واریز شما دریافت و در حال ثبت در خزانه است. کد پیگیری: #4120" },
  { label: "شماره شبا", text: "شبا شرکتی: IR65 0540 1029 9213 4005 1320 479. لطفاً با ذکر کد کاربری واریز کنید." },
];

const AVA = ["bg-brand", "bg-mint", "bg-amber", "bg-ink-700"];

export default function Support({ chats, activeId, setActive, sendReply, setStatus }: SupportProps) {
  const [filter, setFilter] = useState<"all" | Chat["status"]>("all");
  const [q, setQ] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const mobile = useMediaQuery("(max-width: 767px), (max-width: 1023px) and (max-height: 500px)");

  const active = chats.find((c) => c.id === activeId) ?? null;
  const reply = activeId ? drafts[activeId] ?? "" : "";
  const setReply = (text: string) => {
    if (activeId) setDrafts((previous) => ({ ...previous, [activeId]: text }));
  };
  useOverlay(mobile && !!active, panelRef, () => setActive(null));

  const filtered = useMemo(() => {
    return [...chats]
      .sort((a, b) => {
        const la = a.msgs[a.msgs.length - 1]?.at ?? "";
        const lb = b.msgs[b.msgs.length - 1]?.at ?? "";
        return lb.localeCompare(la);
      })
      .filter((c) => (filter === "all" ? true : c.status === filter))
      .filter((c) => !q.trim() || c.name.includes(q.trim()) || c.handle.includes(q.trim()));
  }, [chats, filter, q]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [activeId, active?.msgs.length]);

  useEffect(() => {
    const viewport = window.visualViewport;
    const scrollToLatest = () => {
      if (document.activeElement === editorRef.current && scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    };
    viewport?.addEventListener("resize", scrollToLatest);
    return () => viewport?.removeEventListener("resize", scrollToLatest);
  }, []);

  const counts = {
    all: chats.length,
    open: chats.filter((c) => c.status === "open").length,
    waiting: chats.filter((c) => c.status === "waiting").length,
    resolved: chats.filter((c) => c.status === "resolved").length,
  };

  const submit = () => {
    if (!active || !reply.trim()) return;
    sendReply(active.id, reply.trim());
    setReply("");
  };

  return (
    <div className="min-w-0 space-y-6">
      <SectionTitle
        title="پشتیبانی"
        desc="گفت‌وگوهای کاربران — پاسخ‌ها از پنل مدیریت و داده‌های زنده سرور مدیریت می‌شوند."
        action={
          <div role="group" aria-label="فیلتر وضعیت گفت‌وگو" className="flex flex-wrap gap-1.5">
            {(
              [
                ["all", "همه"],
                ["open", "باز"],
                ["waiting", "در انتظار"],
                ["resolved", "پاسخ‌داده"],
              ] as const
            ).map(([k, l]) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                aria-pressed={filter === k}
                className={cn(
                  "min-h-11 rounded-full border px-3 py-1.5 text-[12px] font-bold transition sm:min-h-0",
                  filter === k
                    ? "border-brand bg-brand text-white shadow-sm shadow-brand/30"
                    : "border-line bg-card text-ink-500 hover:border-brand/40 hover:text-brand"
                )}
              >
                {l} <bdi dir="ltr" className="font-num text-[10.5px] opacity-70">{counts[k]}</bdi>
              </button>
            ))}
          </div>
        }
      />

      <div className="min-w-0 overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
        <div className="support-layout grid min-h-0 min-w-0 grid-cols-1 md:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
          {/* ---------- فهرست چت‌ها ---------- */}
          <div
            className={cn(
              "min-h-0 min-w-0 flex-col border-b border-linefaint md:border-b-0 md:border-l",
              active && mobile ? "hidden" : "flex"
            )}
          >
            <div className="shrink-0 border-b border-linefaint p-3">
              <div className="relative">
                <Icon name="search" className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  className="field pr-9! text-[12.5px]"
                  aria-label="جستجوی کاربر"
                  placeholder="جستجوی کاربر…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
            </div>
            <div className="chat-scroll thin-scroll min-h-0 max-h-[65dvh] flex-1 divide-y divide-linefaint overflow-y-auto overscroll-contain md:max-h-none">
              {filtered.map((c, i) => {
                const last = c.msgs[c.msgs.length - 1];
                return (
                  <button
                    key={c.id}
                    onClick={() => setActive(c.id)}
                    aria-label={`گفت‌وگو با ${c.name}`}
                    aria-current={activeId === c.id ? "true" : undefined}
                    className={cn(
                      "rv flex w-full items-center gap-3 px-4 py-3.5 text-right transition",
                      activeId === c.id ? "bg-brand-soft/70" : "hover:bg-paper/70"
                    )}
                    style={{ animationDelay: `${i * 45}ms` }}
                  >
                    <span
                      className={cn(
                        "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[14px] font-extrabold text-white",
                        AVA[c.name.length % AVA.length]
                      )}
                    >
                      {c.name.slice(0, 1)}
                      <span className={cn("absolute -bottom-0.5 -left-0.5 h-3 w-3 rounded-full border-2 border-card", statusMeta[c.status].dot)} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <b className="truncate text-[13px] font-bold text-ink-900">{c.name}</b>
                        <span className="shrink-0 text-[10.5px] text-ink-400">{faTime(last?.at ?? "")}</span>
                      </span>
                      <span className="mt-0.5 flex items-center justify-between gap-2">
                        <span className="truncate text-[11.5px] text-ink-500">
                          {last?.from === "agent" && <b className="text-brand">شما: </b>}
                          {last?.text}
                        </span>
                        {!!c.unread && (
                          <span className="flex h-4.5 min-w-4.5 shrink-0 items-center justify-center rounded-full bg-brand px-1 font-num text-[10px] font-bold text-white">
                            {c.unread}
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <p className="px-4 py-10 text-center text-[12.5px] text-ink-400">گفت‌وگویی با این فیلتر پیدا نشد</p>
              )}
            </div>
          </div>

          {/* ---------- گفت‌وگو ---------- */}
          <div
            ref={panelRef}
            tabIndex={-1}
            role={mobile && active ? "dialog" : undefined}
            aria-modal={mobile && active ? true : undefined}
            aria-label={active ? `گفت‌وگو با ${active.name}` : "گفت‌وگو"}
            className={cn("min-h-0 min-w-0 flex-col outline-none", active ? "mobile-chat-active flex" : mobile ? "hidden" : "flex")}
          >
            {!active ? (
              <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-3 px-5 py-12 text-center text-ink-400">
                <Icon name="chat" className="h-12 w-12 opacity-40" sw={1.2} />
                <p className="text-[13.5px] font-bold">یک گفت‌وگو برای پاسخ‌گویی انتخاب کنید</p>
                <p className="text-[12px]">چت‌های با علامت صورتی دارای پیام خوانده‌نشده هستند</p>
              </div>
            ) : (
              <>
                <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-linefaint px-3 py-3 sm:px-4">
                  <button
                    type="button"
                    aria-label="بازگشت به فهرست گفت‌وگوها"
                    onClick={() => setActive(null)}
                    className={cn("touch-target rounded-lg text-ink-500 transition hover:bg-linefaint", !mobile && "hidden")}
                  >
                    <Icon name="back" className="h-5 w-5 rotate-180" />
                  </button>
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[14px] font-extrabold text-white sm:h-10 sm:w-10",
                      AVA[active.name.length % AVA.length]
                    )}
                  >
                    {active.name.slice(0, 1)}
                  </span>
                  <div className="min-w-0 flex-1 basis-[120px]">
                    <p className="flex flex-wrap items-center gap-x-2 text-[14px] font-extrabold text-ink-900 [overflow-wrap:anywhere]">
                      {active.name}
                      <span className="font-num text-[11px] font-medium text-ink-400">{active.handle}</span>
                    </p>
                    <p className="chat-meta text-[11px] text-ink-400">{active.msgs.length} پیام · آخرین: {faDate(active.msgs[active.msgs.length - 1]?.at ?? "")}</p>
                  </div>
                  <div className="flex w-full flex-wrap items-center gap-2 md:w-auto">
                  <select
                    aria-label="وضعیت گفت‌وگو"
                    className="field flex-1 py-1.5! text-[12px] font-bold md:w-auto! md:flex-none"
                    value={active.status}
                    onChange={(e) => setStatus(active.id, e.target.value as Chat["status"])}
                  >
                    <option value="open">باز</option>
                    <option value="waiting">در انتظار بررسی</option>
                    <option value="resolved">پاسخ داده شده</option>
                  </select>
                  <Badge kind={statusMeta[active.status].kind} className="hidden xl:inline-flex">{statusMeta[active.status].label}</Badge>
                  </div>
                </div>

                <div ref={scrollRef} role="log" aria-label="پیام‌های گفت‌وگو" aria-live="polite" aria-relevant="additions" className="chat-scroll thin-scroll min-h-0 min-w-0 flex-1 space-y-3 overflow-y-auto overscroll-contain bg-paper/50 p-3 sm:p-4">
                  {active.msgs.map((m, i) => (
                    <div
                      key={m.id}
                      className={cn("rv flex min-w-0", m.from === "agent" ? "justify-start" : "justify-end")}
                      style={{ animationDelay: `${Math.min(i * 60, 400)}ms` }}
                    >
                      <div
                        className={cn(
                          "min-w-0 max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[14px] leading-7 shadow-sm sm:max-w-[80%] sm:text-[13px] sm:leading-6",
                          m.from === "agent"
                            ? "rounded-tr-sm bg-ink-900 text-paper"
                            : "rounded-tl-sm border border-line bg-card text-ink-800"
                        )}
                      >
                        <p className="whitespace-pre-wrap [overflow-wrap:anywhere]">{m.text}</p>
                        <p className={cn("mt-1 text-left font-num text-[10px]", m.from === "agent" ? "text-paper/50" : "text-ink-400")}>
                          {faTime(m.at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="min-w-0 shrink-0 border-t border-linefaint bg-card p-3">
                  <div aria-label="پاسخ‌های آماده" className="quick-replies thin-scroll mb-2 flex min-w-0 gap-1.5 overflow-x-auto overscroll-x-contain pb-1">
                    {QUICK.map((t) => (
                      <button
                        key={t.label}
                        type="button"
                        onClick={() => {
                          setReply(t.text);
                          editorRef.current?.focus();
                        }}
                        className="shrink-0 whitespace-nowrap rounded-full border border-brand/25 bg-brand-soft/60 px-3 py-1 text-[11px] font-semibold text-brand-700 transition hover:bg-brand-soft"
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-end gap-2">
                    <textarea
                      ref={editorRef}
                      aria-label="پاسخ به کاربر"
                      className="field max-h-28 min-h-[46px] flex-1 resize-none py-2.5!"
                      rows={mobile ? 1 : 2}
                      enterKeyHint={mobile ? "enter" : "send"}
                      placeholder={mobile ? "پاسخ خود را بنویسید..." : "پاسخ خود را بنویسید... (Enter برای ارسال)"}
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      onKeyDown={(e) => {
                        if (!mobile && e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                          e.preventDefault();
                          submit();
                        }
                      }}
                    />
                    <Btn icon="send" onClick={submit} disabled={!reply.trim()} className="min-h-11 px-3! py-3! sm:px-4!">
                      ارسال
                    </Btn>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
