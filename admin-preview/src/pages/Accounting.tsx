import { useMemo, useState } from "react";
import { type JournalCategory, type JournalEntry, type Unit, faDate, sum, todayISO } from "../data";
import { Badge, Btn, CountUp, Empty, Field, Icon, Modal, Num, SectionTitle, numInput } from "../components/ui";
import { cn } from "../utils/cn";

export interface AccountingProps {
  journal: JournalEntry[];
  addEntry: (e: Omit<JournalEntry, "id">) => void;
  removeEntry: (id: string) => void;
  notify: (msg: string) => void;
}

const CATS: JournalCategory[] = [
  "خزانه",
  "بازخرید",
  "فروش محصولات",
  "کارمزد",
  "بازگشت استیک",
  "بازگشت پایه",
  "هزینه",
  "درآمد",
  "سایر",
];

const catKind: Record<JournalCategory, "brand" | "mint" | "amber" | "rust" | "neutral"> = {
  خزانه: "brand",
  بازخرید: "brand",
  "فروش محصولات": "mint",
  کارمزد: "mint",
  "بازگشت استیک": "amber",
  "بازگشت پایه": "amber",
  هزینه: "rust",
  درآمد: "mint",
  سایر: "neutral",
};

const th = "px-3 py-2.5 text-right text-[11.5px] font-bold text-ink-400 whitespace-nowrap";
const td = "px-3 py-3 text-[13px] text-ink-800 border-t border-linefaint";

export default function Accounting({ journal, addEntry, removeEntry, notify }: AccountingProps) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("همه");
  const [unit, setUnit] = useState<string>("همه");
  const [open, setOpen] = useState(false);
  const [del, setDel] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    category: "سایر" as JournalCategory,
    dir: "in" as "in" | "out",
    amount: "",
    unit: "RBZ" as Unit,
    at: todayISO(),
    note: "",
  });

  const inRBZ = sum(journal.filter((j) => j.dir === "in" && j.unit === "RBZ"), (j) => j.amount);
  const outRBZ = sum(journal.filter((j) => j.dir === "out" && j.unit === "RBZ"), (j) => j.amount);
  const inIRR = sum(journal.filter((j) => j.dir === "in" && j.unit === "IRR"), (j) => j.amount);
  const outIRR = sum(journal.filter((j) => j.dir === "out" && j.unit === "IRR"), (j) => j.amount);

  const rows = useMemo(() => {
    const sorted = [...journal].sort((a, b) => a.at.localeCompare(b.at));
    return sorted
      .map((e, i) => ({ ...e, no: i + 1 }))
      .reverse()
      .filter((e) => (cat === "همه" ? true : e.category === cat))
      .filter((e) => (unit === "همه" ? true : e.unit === unit))
      .filter(
        (e) =>
          !q.trim() ||
          e.title.includes(q.trim()) ||
          (e.note ?? "").includes(q.trim()) ||
          String(e.amount).includes(q.trim())
      );
  }, [journal, q, cat, unit]);

  const exportCSV = () => {
    const head = "شماره,تاریخ,عنوان,دسته,جهت,مبلغ,واحد,توضیح";
    const lines = rows.map((e) =>
      [e.no, new Date(e.at).toLocaleDateString("fa-IR-u-nu-latn"), `"${e.title}"`, e.category, e.dir === "in" ? "ورود" : "خروج", e.amount, e.unit, `"${e.note ?? ""}"`].join(",")
    );
    const blob = new Blob(["\ufeff" + [head, ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "rabaz-journal.csv";
    a.click();
    URL.revokeObjectURL(a.href);
    notify("خروجی CSV دفتر روزنامه دانلود شد");
  };

  return (
    <div className="min-w-0 space-y-6">
      <SectionTitle
        title="حسابداری"
        desc="دفتر روزنامه — هر ثبت خزانه، بازخرید و کارمزد به‌صورت خودکار اینجا ثبت می‌شود؛ ثبت دستی هم ممکن است."
        action={
          <div className="flex flex-wrap gap-2">
            <Btn kind="ghost" icon="download" className="flex-1 sm:flex-none" onClick={exportCSV}>
              خروجی CSV
            </Btn>
            <Btn icon="plus" className="flex-1 sm:flex-none" onClick={() => setOpen(true)}>
              ثبت سرفصل
            </Btn>
          </div>
        }
      />

      {/* ---------- خلاصه ---------- */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">
        <div className="rv min-w-0 rounded-xl border border-line bg-card p-4">
          <p className="text-[12px] font-bold text-ink-500">مانده RBZ دفتر (ورود − خروج)</p>
          <p className="mt-1.5 flex flex-wrap items-baseline gap-x-1.5">
            <CountUp value={inRBZ - outRBZ} className="text-[24px] font-bold text-ink-900" duration={800} />
            <span className="text-[11px] text-ink-400">RBZ</span>
          </p>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-ink-500">
            <span className="flex items-center gap-1">
              <Icon name="arrowIn" className="h-3.5 w-3.5 text-mint" />
              <Num value={inRBZ} className="text-[11px] font-bold" />
            </span>
            <span className="flex items-center gap-1">
              <Icon name="arrowOut" className="h-3.5 w-3.5 text-rust" />
              <Num value={outRBZ} className="text-[11px] font-bold" />
            </span>
          </div>
        </div>
        <div className="rv min-w-0 rounded-xl border border-line bg-card p-4" style={{ animationDelay: "70ms" }}>
          <p className="text-[12px] font-bold text-ink-500">مانده ریالی (تومان)</p>
          <p className="mt-1.5 flex flex-wrap items-baseline gap-x-1.5">
            <CountUp value={inIRR - outIRR} className="text-[24px] font-bold text-ink-900" duration={800} />
            <span className="text-[11px] text-ink-400">تومان</span>
          </p>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-ink-500">
            <span className="flex items-center gap-1">
              <Icon name="arrowIn" className="h-3.5 w-3.5 text-mint" />
              <Num value={inIRR} className="text-[11px] font-bold" />
            </span>
            <span className="flex items-center gap-1">
              <Icon name="arrowOut" className="h-3.5 w-3.5 text-rust" />
              <Num value={outIRR} className="text-[11px] font-bold" />
            </span>
          </div>
        </div>
        <div className="rv flex min-w-0 flex-col justify-between rounded-xl bg-ink-900 p-4 text-paper md:col-span-2 2xl:col-span-1" style={{ animationDelay: "140ms" }}>
          <p className="flex items-center gap-1.5 text-[12px] font-bold text-paper/70">
            <Icon name="calc" className="h-4 w-4 text-brand" /> تعداد سرفصل‌ها
          </p>
          <p className="mt-1.5 flex items-baseline gap-2">
            <CountUp value={journal.length} className="text-[24px] font-bold" duration={600} />
            <span className="text-[11px] text-paper/50">ثبت در دفتر</span>
          </p>
          <p className="mt-2 text-[10.5px] leading-5 text-paper/45">
            داده‌های دفتر از بک‌اند سرور به‌صورت زنده و امن در دسترس هستند.
          </p>
        </div>
      </div>

      {/* ---------- فیلترها ---------- */}
      <div className="rv min-w-0 space-y-3" style={{ animationDelay: "120ms" }}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Icon name="search" className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              className="field pr-9!"
              aria-label="جستجوی دفتر روزنامه"
              placeholder="جستجو در عنوان، توضیح یا مبلغ…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div role="group" aria-label="فیلتر واحد" className="flex shrink-0 gap-1 rounded-lg border border-line bg-card p-1">
            {["همه", "RBZ", "IRR"].map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                aria-pressed={unit === u}
                className={cn(
                  "min-h-11 flex-1 rounded-md px-3 py-1.5 text-[12px] font-bold transition sm:min-h-0 sm:flex-none",
                  unit === u ? "bg-ink-900 text-paper" : "text-ink-500 hover:text-ink-900"
                )}
              >
                {u === "IRR" ? "ریالی" : u}
              </button>
            ))}
          </div>
        </div>
        <div role="group" aria-label="فیلتر دسته" className="thin-scroll flex min-w-0 max-w-full gap-1.5 overflow-x-auto overscroll-x-contain px-1 py-1">
          {["همه", ...CATS].map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              aria-pressed={cat === c}
              className={cn(
                "min-h-11 shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-[12px] font-bold transition sm:min-h-0",
                cat === c
                  ? "border-brand bg-brand text-white shadow-sm shadow-brand/30"
                  : "border-line bg-card text-ink-500 hover:border-brand/40 hover:text-brand"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* ---------- جدول ---------- */}
      <div className="rv min-w-0 overflow-hidden rounded-2xl border border-line bg-card" style={{ animationDelay: "180ms" }}>
        <div className="thin-scroll min-w-0 overflow-x-auto overscroll-x-contain">
          <table aria-label="دفتر روزنامه" className="responsive-table w-full min-w-[720px]">
            <thead className="bg-linefaint/60">
              <tr>
                <th className={cn(th, "w-14")}>#</th>
                <th className={th}>تاریخ</th>
                <th className={th}>عنوان</th>
                <th className={th}>دسته</th>
                <th className={th}>جهت</th>
                <th className={th}>مبلغ</th>
                <th className={th}>توضیح</th>
                <th className={th}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id} className="group transition hover:bg-brand-soft/40">
                  <td data-label="شماره" className={cn(td, "font-num text-[12px] text-ink-400")}>
                    <bdi dir="ltr">#{e.no}</bdi>
                  </td>
                  <td data-label="تاریخ" className={cn(td, "whitespace-nowrap text-[12px] text-ink-500")}>{faDate(e.at)}</td>
                  <td data-label="عنوان" className={cn(td, "mobile-wide max-w-56 truncate font-bold")}>{e.title}</td>
                  <td data-label="دسته" className={td}>
                    <Badge kind={catKind[e.category]}>{e.category}</Badge>
                  </td>
                  <td data-label="جهت" className={td}>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-[12px] font-bold",
                        e.dir === "in" ? "text-mint" : "text-rust"
                      )}
                    >
                      <Icon name={e.dir === "in" ? "arrowIn" : "arrowOut"} className="h-3.5 w-3.5" />
                      {e.dir === "in" ? "ورود" : "خروج"}
                    </span>
                  </td>
                  <td data-label="مبلغ" className={cn(td, "mobile-wide whitespace-nowrap")}>
                    <Num value={e.amount} className={cn("font-bold", e.dir === "in" ? "text-mint" : "text-rust")} />
                    <span className="mr-1 text-[10.5px] text-ink-400">{e.unit}</span>
                  </td>
                  <td data-label="توضیح" className={cn(td, "mobile-wide max-w-44 truncate text-[12px] text-ink-500")}>{e.note ?? "-"}</td>
                  <td className={cn(td, "mobile-actions text-left")}>
                    {del === e.id ? (
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          onClick={() => {
                            removeEntry(e.id);
                            setDel(null);
                            notify("سرفصل حذف شد");
                          }}
                          className="min-h-11 rounded-lg bg-rust px-3 py-2 text-[12px] font-bold text-white"
                        >
                          تأیید حذف
                        </button>
                        <button onClick={() => setDel(null)} className="min-h-11 rounded-lg border border-line px-3 py-2 text-[12px] font-bold text-ink-500">
                          انصراف
                        </button>
                      </div>
                    ) : (
                      <button
                        aria-label={`حذف سرفصل ${e.title}`}
                        onClick={() => setDel(e.id)}
                        className="record-delete touch-target gap-1.5 rounded-lg px-2 text-ink-400 transition hover:bg-rust-soft hover:text-rust"
                      >
                        <Icon name="trash" className="h-4 w-4" />
                        <span className="text-[12px] sm:hidden">حذف</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <Empty text="سرفصلی با این فیلترها پیدا نشد" />}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-linefaint bg-linefaint/40 px-4 py-3 text-[11.5px] leading-6 text-ink-500 sm:px-5">
          <span>
            نمایش <bdi dir="ltr" className="font-num font-bold">{rows.length}</bdi> از{" "}
            <bdi dir="ltr" className="font-num font-bold">{journal.length}</bdi> سرفصل
          </span>
          <span className="flex items-center gap-1.5">
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-mint" />
            همگام با بخش خزانه — ثبت دستی و خودکار
          </span>
        </div>
      </div>

      {/* ---------- مودال ثبت ---------- */}
      <Modal open={open} onClose={() => setOpen(false)} title="ثبت سرفصل جدید در دفتر" icon="plus" wide>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const amount = parseInt(form.amount || "0", 10);
            if (!form.title || !amount) return;
            addEntry({
              at: new Date((form.at || todayISO()) + "T12:00:00").toISOString(),
              title: form.title,
              category: form.category,
              dir: form.dir,
              amount,
              unit: form.unit,
              note: form.note || undefined,
            });
            setOpen(false);
            setForm({ title: "", category: "سایر", dir: "in", amount: "", unit: "RBZ", at: todayISO(), note: "" });
            notify("سرفصل در دفتر روزنامه ثبت شد");
          }}
        >
          <Field label="عنوان سرفصل">
            <input className="field" value={form.title} placeholder="مثلاً هزینه دامنه و هاست" onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="دسته">
              <select className="field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as JournalCategory })}>
                {CATS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="جهت">
              <select className="field" value={form.dir} onChange={(e) => setForm({ ...form, dir: e.target.value as "in" | "out" })}>
                <option value="in">ورود (بستانکار)</option>
                <option value="out">خروج (بدهکار)</option>
              </select>
            </Field>
            <Field label="مبلغ">
              {numInput(form.amount, (v) => setForm({ ...form, amount: v }))}
            </Field>
            <Field label="واحد">
              <select className="field" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value as Unit })}>
                <option value="RBZ">توکن پایه (RBZ)</option>
                <option value="IRR">ریال (تومان)</option>
              </select>
            </Field>
            <Field label="تاریخ">
              <input type="date" className="field" value={form.at} onChange={(e) => setForm({ ...form, at: e.target.value })} />
            </Field>
            <Field label="توضیح (اختیاری)">
              <input className="field" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
            </Field>
          </div>
          <div className="flex gap-2 pt-1">
            <Btn type="submit" icon="check" className="flex-1">
              ثبت در دفتر
            </Btn>
            <Btn kind="ghost" onClick={() => setOpen(false)}>
              انصراف
            </Btn>
          </div>
        </form>
      </Modal>
    </div>
  );
}
