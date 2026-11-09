import { useState } from "react";
import {
  type Buyback,
  type Fee,
  type StakeReturn,
  type BaseReturn,
  type Treasury,
  faDate,
  feeSeries,
  fmt,
  sum,
  todayISO,
} from "../data";
import {
  Badge,
  Btn,
  CopyBtn,
  CountUp,
  Empty,
  Field,
  Icon,
  Modal,
  Num,
  SectionTitle,
  Sparkline,
  numInput,
} from "../components/ui";
import { cn } from "../utils/cn";

export interface TreasuryProps {
  t: Treasury;
  setAsset: (v: number, note: string) => void;
  setMarketPrice: (v: number) => void;
  setBuybackInfo: (info: Treasury["buybackInfo"]) => void;
  addStakeReturn: (d: Omit<StakeReturn, "id">) => void;
  removeStakeReturn: (id: string) => void;
  addBaseReturn: (d: Omit<BaseReturn, "id">) => void;
  removeBaseReturn: (id: string) => void;
  addFee: (d: Omit<Fee, "id">) => void;
  removeFee: (id: string) => void;
  addBuyback: (d: Omit<Buyback, "id">) => void;
  removeBuyback: (id: string) => void;
  notify: (msg: string) => void;
}

const th = "px-3 py-2.5 text-right text-[11.5px] font-bold text-ink-400 whitespace-nowrap";
const td = "px-3 py-3 text-[13px] text-ink-800 border-t border-linefaint";

export default function Treasury({
  t,
  setAsset,
  setMarketPrice,
  setBuybackInfo,
  addStakeReturn,
  removeStakeReturn,
  addBaseReturn,
  removeBaseReturn,
  addFee,
  removeFee,
  addBuyback,
  removeBuyback,
  notify,
}: TreasuryProps) {
  const totalStake = sum(t.stakeReturns, (x) => x.staked);
  const totalBase = sum(t.baseReturns, (x) => x.amount);
  const totalFee = sum(t.fees, (x) => x.amount);
  const totalBB = sum(t.buybacks, (x) => x.rbz);
  const market = t.asset * t.marketPrice;
  const series = feeSeries(t.fees, 7);

  const [assetInput, setAssetInput] = useState(String(t.asset));
  const [priceInput, setPriceInput] = useState(String(t.marketPrice || ""));
  const [info, setInfo] = useState(t.buybackInfo);

  const [st, setSt] = useState({ user: "", staked: "", days: "", note: "" });
  const [br, setBr] = useState({ user: "", amount: "", note: "" });
  const [fe, setFe] = useState({ user: "", kind: "واریز" as Fee["kind"], amount: "" });
  const [bbOpen, setBbOpen] = useState(false);
  const [bb, setBb] = useState({ at: todayISO(), rbz: "", irr: "", shaba: t.buybackInfo.shaba, note: "" });

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const defs = [
    {
      id: "st-returns",
      icon: "clock",
      title: "جمع بازگشت استیک",
      value: totalStake,
      desc: "مجموع مقدار استیک‌هایی که توکن پایه‌شان فروخته شده و با مانده بیش از ۳٬۰۰ روز از دوره، به‌جای واریز به کاربر به شبکه بازمی‌گردد.",
    },
    {
      id: "base-returns",
      icon: "coin",
      title: "جمع بازگشت پایه",
      value: totalBase,
      desc: "مجموع توکن پایه‌های خریداری‌شده در قالب‌های فروش و فعال‌سازی.",
    },
    {
      id: "fees",
      icon: "spark",
      title: "جمع کارمزد",
      value: totalFee,
      desc: "کل کارمزد دریافتی از کاربران (واریز، برداشت و استیک) به‌صورت لحظه‌ای جمع می‌شود.",
    },
    {
      id: "buyback",
      icon: "bank",
      title: "بازخرید (Buy Back)",
      value: totalBB,
      desc: "تراکنش‌های بازخرید همراه با شبا و مقدار، فعلاً به‌صورت دستی ثبت می‌شود تا استقرار بانک‌داری شرکتی.",
      manual: true,
    },
  ];

  return (
    <div className="min-w-0 space-y-6 sm:space-y-8">
      <SectionTitle
        title="خزانه"
        desc="دارایی توکن پایه، بازگشت‌ها و بازخرید — تمام مقادیر فعلاً به‌صورت دستی مدیریت می‌شود."
        action={
          <Btn icon="plus" className="w-full sm:w-auto" onClick={() => setBbOpen(true)}>
            ثبت بازخرید
          </Btn>
        }
      />

      {/* ---------- کارت اصلی خزانه ---------- */}
      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="noise rv relative min-w-0 overflow-hidden rounded-2xl bg-[linear-gradient(155deg,#d80a6e_0%,#ad0558_55%,#77023a_100%)] p-4 text-white shadow-lg shadow-brand/30 sm:p-6 xl:col-span-2">
          <div className="relative z-[2]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xl font-black">خزانه</h3>
              <Badge kind="ink" className="border-white/20 bg-white/10 text-white">
                توکن پایه: <bdi dir="ltr" className="font-num font-bold">RBZ</bdi>
              </Badge>
            </div>
            <div className="dotline my-4 opacity-80" />
            <ul className="divide-y divide-white/12">
              {[
                { l: "دارایی", v: t.asset, sub: "توکن پایه فروشیده/فعال‌نشده" },
                {
                  l: "مقدار بازار",
                  v: t.marketPrice > 0 ? market : 0,
                  sub: t.marketPrice > 0 ? "تومان (تخمینی)" : "قیمت تنظیم نشده است",
                  toman: true,
                },
                { l: "جمع بازگشت استیک", v: totalStake, sub: `${t.stakeReturns.length} مورد بازگشت به شبکه` },
                { l: "جمع بازگشت پایه", v: totalBase, sub: `${t.baseReturns.length} بسته خریداری‌شده` },
                { l: "بازخرید (Buy Back)", v: totalBB, sub: `${t.buybacks.length} تراکنش دستی` },
                { l: "جمع کارمزد", v: totalFee, sub: "کل کارمزد دریافتی کاربران" },
              ].map((r, i) => (
                <li key={r.l} className="rv flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-3" style={{ animationDelay: `${120 + i * 70}ms` }}>
                  <div className="min-w-0 flex-1 basis-[120px]">
                    <p className="text-[14px] font-bold text-white/95">{r.l}</p>
                    <p className="mt-0.5 text-[11px] text-white/55">{r.sub}</p>
                  </div>
                  <div className="ms-auto flex max-w-full flex-wrap items-baseline gap-x-1.5 sm:gap-x-2">
                    <CountUp
                      value={r.v}
                      className={cn("font-bold", r.toman ? "text-[16px] text-white/90 sm:text-[17px]" : "text-[20px] sm:text-[22px]")}
                    />
                    <span className="text-[12px] font-semibold text-white/60">{r.toman ? "تومان" : "RBZ"}</span>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-4 flex items-center gap-1.5 text-[11px] text-white/55">
              <Icon name="info" className="h-3.5 w-3.5" />
              وضعیت خزانه از داده‌های زنده سرور و با امنیت پنل مدیریت نمایش داده می‌شود.
            </p>
          </div>
          <Icon name="vault" className="float-slow absolute -left-8 -bottom-8 z-[1] h-44 w-44 text-white/10" sw={1} />
        </div>

        {/* ---------- تنظیم دستی ---------- */}
        <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:flex xl:flex-col">
          <div className="rv min-w-0 rounded-xl border border-line bg-card p-4 sm:p-5" style={{ animationDelay: "120ms" }}>
            <div className="flex items-center gap-2">
              <Icon name="vault" className="text-brand" />
              <h4 className="text-[14px] font-extrabold">موجودی دارایی خزانه</h4>
            </div>
            <p className="mt-1.5 text-[12px] leading-6 text-ink-500">
              میزان توکن پایه‌ای که در خزانه است و هنوز فروخته یا فعال نشده. هر تغییر به‌صورت خودکار در دفتر حسابداری ثبت می‌شود.
            </p>
            <div className="mt-3 flex gap-2">
              <input aria-label="موجودی دارایی خزانه" className="field" dir="ltr" style={{ textAlign: "right" }} inputMode="numeric" value={assetInput}
                onChange={(e) => setAssetInput(e.target.value.replace(/[^0-9]/g, ""))} />
              <Btn
                icon="check"
                onClick={() => {
                  const v = parseInt(assetInput || "0", 10);
                  setAsset(v, "تنظیم دستی موجودی خزانه");
                  notify("موجودی خزانه به‌روزرسانی شد و در حسابداری ثبت گردید");
                }}
              >
                ثبت
              </Btn>
            </div>
          </div>

          <div className="rv min-w-0 flex-1 rounded-xl border border-line bg-card p-4 sm:p-5" style={{ animationDelay: "200ms" }}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Icon name="chart" className="text-brand" />
                <h4 className="text-[14px] font-extrabold">مقدار بازار</h4>
              </div>
              <Badge kind="amber">روش محاسبه در حال توافق</Badge>
            </div>
            <p className="mt-1.5 text-[12px] leading-6 text-ink-500">
              معیار نهایی هنوز با تیم بررسی می‌شود؛ فعلاً نمایش بر اساس قیمت دستی «تومان در هر RBZ» تخمینی است.
            </p>
            <div className="mt-3 flex gap-2">
              <input aria-label="قیمت مرجع (تومان)" className="field" dir="ltr" style={{ textAlign: "right" }} inputMode="numeric" placeholder="قیمت (تومان)"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value.replace(/[^0-9]/g, ""))} />
              <Btn
                kind="soft"
                icon="check"
                onClick={() => {
                  setMarketPrice(parseInt(priceInput || "0", 10));
                  notify("قیمت مرجع ذخیره شد — مقدار بازار به‌روزرسانی می‌شود");
                }}
              >
                ذخیره
              </Btn>
            </div>
            <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 rounded-lg bg-linefaint px-3 py-2">
              <span className="text-[12px] font-bold text-ink-500">مقدار بازار تخمینی</span>
              <span className="flex max-w-full flex-wrap items-baseline gap-x-1.5">
                <Num value={market} className="text-[15px] font-bold text-ink-900" />
                <span className="text-[11px] text-ink-400">تومان</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- تعریف شاخص‌ها ---------- */}
      <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 xl:grid-cols-4">
        {defs.map((d, i) => (
          <button
            key={d.id}
            onClick={() => scrollTo(d.id)}
            className="rv group min-w-0 rounded-xl border border-line bg-card p-3 text-right transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md hover:shadow-brand/10 sm:p-4"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand transition group-hover:bg-brand group-hover:text-white">
                <Icon name={d.icon} className="h-[18px] w-[18px]" />
              </span>
              {d.manual && <Badge kind="amber">مدیریت دستی</Badge>}
            </div>
            <p className="mt-3 text-[13px] font-extrabold text-ink-900">{d.title}</p>
            <p className="mt-0.5 flex flex-wrap items-baseline gap-x-1">
              <Num value={d.value} className="text-lg font-bold text-brand-700" />
              <span className="text-[11px] text-ink-400">RBZ</span>
            </p>
            <p className="mt-2 line-clamp-3 text-[11.5px] leading-5 text-ink-500">{d.desc}</p>
            <span className="mt-2 inline-flex items-center gap-1 text-[11.5px] font-bold text-brand transition group-hover:text-brand-700">
              مشاهده و ثبت
              <Icon name="back" className="h-3.5 w-3.5 rotate-180" />
            </span>
          </button>
        ))}
      </div>

      {/* ---------- بازگشت استیک ---------- */}
      <section id="st-returns" className="rv min-w-0 scroll-mt-28 overflow-hidden rounded-2xl border border-line bg-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-linefaint px-4 py-4 sm:px-5">
          <div>
            <h3 className="flex items-center gap-2 text-[15px] font-extrabold">
              <Icon name="clock" className="text-brand" /> جمع بازگشت استیک
            </h3>
            <p className="mt-1 text-[12px] text-ink-500">
              استیک‌هایی که توکن پایه‌شان فروخته شده و با مانده بیش از ۳٬۰۰ روز، به‌جای کاربر به شبکه بازمحورده است.
            </p>
          </div>
          <Badge kind="brand">
            جمع کل: <Num value={totalStake} className="text-[12px]" /> RBZ
          </Badge>
        </div>
        <div className="grid min-w-0 grid-cols-1 gap-0 xl:grid-cols-3">
          <div className="thin-scroll min-w-0 overflow-x-auto overscroll-x-contain xl:col-span-2">
            <table aria-label="بازگشت‌های استیک" className="responsive-table w-full min-w-[520px]">
              <thead className="bg-linefaint/60">
                <tr>
                  <th className={th}>کاربر / ولت</th>
                  <th className={th}>RBZ استیک‌شده</th>
                  <th className={th}>روزهای مانده دوره</th>
                  <th className={th}>تاریخ</th>
                  <th className={th}></th>
                </tr>
              </thead>
              <tbody>
                {t.stakeReturns.map((s) => (
                  <tr key={s.id} className="transition hover:bg-brand-soft/40">
                    <td data-label="کاربر / ولت" className={cn(td, "mobile-wide font-bold")}>{s.user}</td>
                    <td data-label="RBZ استیک‌شده" className={td}>
                      <Num value={s.staked} className="font-bold text-ink-900" />
                    </td>
                    <td data-label="روزهای مانده دوره" className={td}>
                      <Badge kind={s.daysLeft >= 3000 ? "mint" : "amber"}>
                        +<Num value={s.daysLeft} className="text-[11px]" /> روز
                      </Badge>
                    </td>
                    <td data-label="تاریخ" className={cn(td, "mobile-wide text-[12px] text-ink-500")}>{faDate(s.at)}</td>
                    <td className={cn(td, "mobile-actions text-left")}>
                      <button
                        aria-label={`حذف بازگشت استیک ${s.user}`}
                        onClick={() => {
                          removeStakeReturn(s.id);
                          notify("بازگشت استیک حذف شد و ثبت حسابداری آن لغو گردید");
                        }}
                        className="record-delete touch-target gap-1.5 rounded-lg px-2 text-ink-400 transition hover:bg-rust-soft hover:text-rust"
                      >
                        <Icon name="trash" className="h-4 w-4" />
                        <span className="text-[12px] sm:hidden">حذف</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {t.stakeReturns.length === 0 && <Empty text="هنوز بازگشت استیکی ثبت نشده است" />}
          </div>
          <form
            className="min-w-0 space-y-3 border-t border-linefaint bg-linefaint/30 p-4 sm:p-5 xl:border-t-0 xl:border-r"
            onSubmit={(e) => {
              e.preventDefault();
              if (!st.user || !parseInt(st.staked)) return;
              addStakeReturn({
                user: st.user,
                staked: parseInt(st.staked, 10),
                daysLeft: parseInt(st.days || "0", 10),
                at: new Date().toISOString(),
                note: st.note || undefined,
              });
              setSt({ user: "", staked: "", days: "", note: "" });
              notify("بازگشت استیک ثبت شد — رویداد در حسابداری نیز ثبت گردید");
            }}
          >
            <p className="text-[13px] font-extrabold text-ink-900">ثبت بازگشت به شبکه</p>
            <Field label="کاربر / ولت">
              <input className="field" value={st.user} placeholder="مثلاً 0x8f3A…c41d" onChange={(e) => setSt({ ...st, user: e.target.value })} />
            </Field>
            <Field label="مقدار RBZ استیک‌شده">
              {numInput(st.staked, (v) => setSt({ ...st, staked: v }))}
            </Field>
            <Field label="روزهای مانده دوره" hint="برای بازگشت به شبکه باید بیش از ۳٬۰۰ روز مانده باشد">
              {numInput(st.days, (v) => setSt({ ...st, days: v }))}
            </Field>
            <Field label="یادداشت (اختیاری)">
              <input className="field" value={st.note} placeholder="مثلاً فروش قبل از اتمام دوره" onChange={(e) => setSt({ ...st, note: e.target.value })} />
            </Field>
            <Btn type="submit" icon="plus" className="w-full">ثبت و ورود به دفتر</Btn>
          </form>
        </div>
      </section>

      {/* ---------- بازگشت پایه ---------- */}
      <section id="base-returns" className="rv min-w-0 scroll-mt-28 overflow-hidden rounded-2xl border border-line bg-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-linefaint px-4 py-4 sm:px-5">
          <div>
            <h3 className="flex items-center gap-2 text-[15px] font-extrabold">
              <Icon name="coin" className="text-brand" /> جمع بازگشت پایه
            </h3>
            <p className="mt-1 text-[12px] text-ink-500">مجموع توکن پایه‌های خریداری‌شده (به خزانه بازگشت).</p>
          </div>
          <Badge kind="brand">
            جمع کل: <Num value={totalBase} className="text-[12px]" /> RBZ
          </Badge>
        </div>
        <div className="grid min-w-0 grid-cols-1 gap-0 xl:grid-cols-3">
          <div className="thin-scroll min-w-0 overflow-x-auto overscroll-x-contain xl:col-span-2">
            <table aria-label="بازگشت‌های پایه" className="responsive-table w-full min-w-[520px]">
              <thead className="bg-linefaint/60">
                <tr>
                  <th className={th}>بسته / خریدار</th>
                  <th className={th}>مقدار RBZ</th>
                  <th className={th}>توضیح</th>
                  <th className={th}>تاریخ</th>
                  <th className={th}></th>
                </tr>
              </thead>
              <tbody>
                {t.baseReturns.map((s) => (
                  <tr key={s.id} className="transition hover:bg-brand-soft/40">
                    <td data-label="بسته / خریدار" className={cn(td, "mobile-wide font-bold")}>{s.user}</td>
                    <td data-label="مقدار RBZ" className={td}>
                      <Num value={s.amount} className="font-bold text-ink-900" />
                    </td>
                    <td data-label="توضیح" className={cn(td, "mobile-wide text-[12px] text-ink-500")}>{s.note ?? "-"}</td>
                    <td data-label="تاریخ" className={cn(td, "text-[12px] text-ink-500")}>{faDate(s.at)}</td>
                    <td className={cn(td, "mobile-actions text-left")}>
                      <button
                        aria-label={`حذف بازگشت پایه ${s.user}`}
                        onClick={() => {
                          removeBaseReturn(s.id);
                          notify("بازگشت پایه حذف شد");
                        }}
                        className="record-delete touch-target gap-1.5 rounded-lg px-2 text-ink-400 transition hover:bg-rust-soft hover:text-rust"
                      >
                        <Icon name="trash" className="h-4 w-4" />
                        <span className="text-[12px] sm:hidden">حذف</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {t.baseReturns.length === 0 && <Empty text="هنوز بازگشت پایه‌ای ثبت نشده است" />}
          </div>
          <form
            className="min-w-0 space-y-3 border-t border-linefaint bg-linefaint/30 p-4 sm:p-5 xl:border-t-0 xl:border-r"
            onSubmit={(e) => {
              e.preventDefault();
              if (!br.user || !parseInt(br.amount)) return;
              addBaseReturn({
                user: br.user,
                amount: parseInt(br.amount, 10),
                at: new Date().toISOString(),
                note: br.note || undefined,
              });
              setBr({ user: "", amount: "", note: "" });
              notify("بازگشت پایه ثبت شد — ورود RBZ در حسابداری ثبت گردید");
            }}
          >
            <p className="text-[13px] font-extrabold text-ink-900">ثبت بازگشت پایه</p>
            <Field label="بسته / خریدار">
              <input className="field" value={br.user} placeholder="مثلاً بسته فروش #F-119" onChange={(e) => setBr({ ...br, user: e.target.value })} />
            </Field>
            <Field label="مقدار RBZ">
              {numInput(br.amount, (v) => setBr({ ...br, amount: v }))}
            </Field>
            <Field label="یادداشت (اختیاری)">
              <input className="field" value={br.note} onChange={(e) => setBr({ ...br, note: e.target.value })} />
            </Field>
            <Btn type="submit" icon="plus" className="w-full">ثبت و ورود به دفتر</Btn>
          </form>
        </div>
      </section>

      {/* ---------- کارمزد ---------- */}
      <section id="fees" className="rv min-w-0 scroll-mt-28 overflow-hidden rounded-2xl border border-line bg-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-linefaint px-4 py-4 sm:px-5">
          <div>
            <h3 className="flex items-center gap-2 text-[15px] font-extrabold">
              <Icon name="spark" className="text-brand" /> جمع کارمزد
            </h3>
            <p className="mt-1 text-[12px] text-ink-500">کل کارمزد دریافتی از کاربران + نمودار ۷ روز اخیر.</p>
          </div>
          <div className="flex max-w-full flex-wrap items-center gap-3">
            <div className="hidden w-40 sm:block">
              <Sparkline values={series} />
            </div>
            <Badge kind="brand">
              جمع کل: <Num value={totalFee} className="text-[12px]" /> RBZ
            </Badge>
          </div>
        </div>
        <div className="grid min-w-0 grid-cols-1 gap-0 xl:grid-cols-3">
          <div className="thin-scroll min-w-0 overflow-x-auto overscroll-x-contain xl:col-span-2">
            <table aria-label="کارمزدهای دریافتی" className="responsive-table w-full min-w-[480px]">
              <thead className="bg-linefaint/60">
                <tr>
                  <th className={th}>کاربر</th>
                  <th className={th}>نوع تراکنش</th>
                  <th className={th}>کارمزد (RBZ)</th>
                  <th className={th}>تاریخ</th>
                  <th className={th}></th>
                </tr>
              </thead>
              <tbody>
                {t.fees.map((s) => (
                  <tr key={s.id} className="transition hover:bg-brand-soft/40">
                    <td data-label="کاربر" className={cn(td, "mobile-wide font-bold")}>{s.user}</td>
                    <td data-label="نوع تراکنش" className={td}>
                      <Badge kind={s.kind === "واریز" ? "mint" : s.kind === "برداشت" ? "amber" : "neutral"}>{s.kind}</Badge>
                    </td>
                    <td data-label="کارمزد (RBZ)" className={td}>
                      <Num value={s.amount} className="font-bold text-ink-900" />
                    </td>
                    <td data-label="تاریخ" className={cn(td, "mobile-wide text-[12px] text-ink-500")}>{faDate(s.at)}</td>
                    <td className={cn(td, "mobile-actions text-left")}>
                      <button
                        aria-label={`حذف کارمزد ${s.user}`}
                        onClick={() => {
                          removeFee(s.id);
                          notify("کارمزد حذف شد");
                        }}
                        className="record-delete touch-target gap-1.5 rounded-lg px-2 text-ink-400 transition hover:bg-rust-soft hover:text-rust"
                      >
                        <Icon name="trash" className="h-4 w-4" />
                        <span className="text-[12px] sm:hidden">حذف</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {t.fees.length === 0 && <Empty text="هنوز کارمزدی ثبت نشده است" />}
          </div>
          <form
            className="min-w-0 space-y-3 border-t border-linefaint bg-linefaint/30 p-4 sm:p-5 xl:border-t-0 xl:border-r"
            onSubmit={(e) => {
              e.preventDefault();
              if (!fe.user || !parseInt(fe.amount)) return;
              addFee({ user: fe.user, kind: fe.kind, amount: parseInt(fe.amount, 10), at: new Date().toISOString() });
              setFe({ user: "", kind: "واریز", amount: "" });
              notify("کارمزد ثبت شد — ورود در حسابداری ثبت گردید");
            }}
          >
            <p className="text-[13px] font-extrabold text-ink-900">ثبت کارمزد دریافتی</p>
            <Field label="کاربر">
              <input className="field" value={fe.user} placeholder="مثلاً کاربر #1204" onChange={(e) => setFe({ ...fe, user: e.target.value })} />
            </Field>
            <Field label="نوع تراکنش">
              <select className="field" value={fe.kind} onChange={(e) => setFe({ ...fe, kind: e.target.value as Fee["kind"] })}>
                <option>واریز</option>
                <option>برداشت</option>
                <option>استیک</option>
              </select>
            </Field>
            <Field label="مبلغ کارمزد (RBZ)">
              {numInput(fe.amount, (v) => setFe({ ...fe, amount: v }))}
            </Field>
            <Btn type="submit" icon="plus" className="w-full">ثبت و ورود به دفتر</Btn>
          </form>
        </div>
      </section>

      {/* ---------- بازخرید ---------- */}
      <section id="buyback" className="rv min-w-0 scroll-mt-28 overflow-hidden rounded-2xl border border-line bg-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-linefaint px-4 py-4 sm:px-5">
          <div>
            <h3 className="flex items-center gap-2 text-[15px] font-extrabold">
              <Icon name="bank" className="text-brand" /> بازخرید توکن (Buy Back)
            </h3>
            <p className="mt-1 text-[12px] text-ink-500">
              مشخصات پرداخت (شبا و مقادیر) — فعلاً دستی مدیریت می‌شود تا بانک‌داری شرکتی اتوماتیکش کند.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge kind="amber">
              <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-amber" />
              مدیریت دستی
            </Badge>
            <Btn icon="plus" onClick={() => setBbOpen(true)}>
              ثبت بازخرید
            </Btn>
          </div>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-4 p-4 sm:p-5 md:grid-cols-2 xl:grid-cols-3">
          <div className="noise relative min-w-0 overflow-hidden rounded-xl bg-ink-900 p-4 text-paper sm:p-5">
            <div className="relative z-[2]">
              <p className="flex items-center gap-2 text-[13px] font-extrabold">
                <Icon name="bank" className="text-brand" /> شبا شرکتی (دریافت ریال)
              </p>
              <bdi dir="ltr" className="mt-3 block font-num text-[16px] font-bold tracking-wider text-white [overflow-wrap:anywhere]">
                {info.shaba}
              </bdi>
              <p className="mt-2 text-[12px] text-paper/60 [overflow-wrap:anywhere]">{info.holder}</p>
              <p className="text-[12px] text-paper/60 [overflow-wrap:anywhere]">{info.bank}</p>
              <div className="mt-4">
                <CopyBtn text={info.shaba.replace(/\s/g, "")} onCopied={() => notify("شبا در کلیپ‌بورد کپی شد")} className="border-white/20 bg-white/10 text-white hover:border-brand hover:text-white" />
              </div>
            </div>
          </div>

          <form
            className="min-w-0 rounded-xl border border-line bg-linefaint/40 p-4"
            onSubmit={(e) => {
              e.preventDefault();
              setBuybackInfo(info);
              notify("مشخصات پرداخت ذخیره شد");
            }}
          >
            <p className="mb-3 text-[13px] font-extrabold text-ink-900">ویرایش مشخصات پرداخت</p>
            <div className="space-y-2.5">
              <Field label="شبا">
                <input className="field font-num" dir="ltr" style={{ textAlign: "right" }} value={info.shaba} onChange={(e) => setInfo({ ...info, shaba: e.target.value })} />
              </Field>
              <Field label="به‌نام">
                <input className="field" value={info.holder} onChange={(e) => setInfo({ ...info, holder: e.target.value })} />
              </Field>
              <Field label="بانک / شعبه">
                <input className="field" value={info.bank} onChange={(e) => setInfo({ ...info, bank: e.target.value })} />
              </Field>
            </div>
            <Btn type="submit" icon="check" className="mt-3 w-full">ذخیره مشخصات</Btn>
          </form>

          <div className="flex min-w-0 flex-col justify-between rounded-xl border border-dashed border-brand/30 bg-brand-soft/40 p-4 md:col-span-2 xl:col-span-1">
            <div>
              <p className="flex items-center gap-2 text-[13px] font-extrabold text-brand-700">
                <Icon name="info" className="h-4 w-4" /> چرا فعلاً دستی؟
              </p>
              <p className="mt-2 text-[12px] leading-6 text-ink-700">
                پس از استقرار بانک‌داری شرکتی، واریزهای شبا به‌صورت خودکار شناسایی و تراکنش بازخرید بدون ثبت دستی ساخته می‌شود. تا آن زمان، هر واریز را با ذکر مقدار RBZ و ریال ثبت کنید.
              </p>
            </div>
            <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2 rounded-lg bg-card px-3 py-2">
              <span className="text-[12px] font-bold text-ink-500">جمع بازخریدشده</span>
              <span className="flex max-w-full flex-wrap items-baseline gap-x-1.5">
                <Num value={totalBB} className="text-[15px] font-bold text-brand-700" />
                <span className="text-[11px] text-ink-400">RBZ</span>
              </span>
            </div>
          </div>
        </div>

        <div className="thin-scroll min-w-0 overflow-x-auto overscroll-x-contain pb-4 sm:px-5 sm:pb-5">
          <table aria-label="تراکنش‌های بازخرید" className="responsive-table w-full min-w-[620px]">
            <thead className="bg-linefaint/60">
              <tr>
                <th className={th}>تاریخ</th>
                <th className={th}>مقدار RBZ</th>
                <th className={th}>مقابل ریالی</th>
                <th className={th}>شبا پرداخت‌کننده</th>
                <th className={th}>توضیح</th>
                <th className={th}></th>
              </tr>
            </thead>
            <tbody>
              {t.buybacks.map((b) => (
                <tr key={b.id} className="transition hover:bg-brand-soft/40">
                  <td data-label="تاریخ" className={cn(td, "mobile-wide whitespace-nowrap text-[12px] text-ink-500")}>{faDate(b.at)}</td>
                  <td data-label="مقدار RBZ" className={td}>
                    <Num value={b.rbz} className="font-bold text-ink-900" />
                  </td>
                  <td data-label="مقابل ریالی" className={td}>
                    <Num value={b.irr} className="font-semibold text-ink-700" />
                    <span className="mr-1 text-[11px] text-ink-400">تومان</span>
                  </td>
                  <td data-label="شبا پرداخت‌کننده" className={cn(td, "mobile-wide")}>
                    <bdi dir="ltr" className="font-num text-[12px] text-ink-500">{b.shaba}</bdi>
                  </td>
                  <td data-label="توضیح" className={cn(td, "mobile-wide text-[12px] text-ink-500")}>{b.note ?? "-"}</td>
                  <td className={cn(td, "mobile-actions text-left")}>
                    <button
                      aria-label={`حذف بازخرید ${faDate(b.at)}`}
                      onClick={() => {
                        removeBuyback(b.id);
                        notify("تراکنش بازخرید حذف و موجودی خزانه تعدیل شد");
                      }}
                      className="record-delete touch-target gap-1.5 rounded-lg px-2 text-ink-400 transition hover:bg-rust-soft hover:text-rust"
                    >
                      <Icon name="trash" className="h-4 w-4" />
                      <span className="text-[12px] sm:hidden">حذف</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {t.buybacks.length === 0 && <Empty text="هنوز بازخریدی ثبت نشده است" />}
        </div>
      </section>

      {/* ---------- مودال بازخرید ---------- */}
      <Modal open={bbOpen} onClose={() => setBbOpen(false)} title="ثبت تراکنش بازخرید" icon="bank">
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!parseInt(bb.rbz || "0", 10) || !parseInt(bb.irr || "0", 10) || !bb.shaba) {
              notify("مقادیر RBZ، ریال و شبا الزامی است");
              return;
            }
            addBuyback({
              at: new Date((bb.at || todayISO()) + "T12:00:00").toISOString(),
              rbz: parseInt(bb.rbz, 10),
              irr: parseInt(bb.irr, 10),
              shaba: bb.shaba,
              note: bb.note || undefined,
            });
            setBbOpen(false);
            setBb({ at: todayISO(), rbz: "", irr: "", shaba: t.buybackInfo.shaba, note: "" });
            notify(`بازخرید ثبت شد — ${fmt(parseInt(bb.rbz, 10))} RBZ به خزانه اضافه و دو رویداد در حسابداری ثبت گردید`);
          }}
        >
          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="تاریخ واریز">
              <input type="date" className="field" value={bb.at} onChange={(e) => setBb({ ...bb, at: e.target.value })} />
            </Field>
            <Field label="مقدار RBZ بازخریدشده">
              {numInput(bb.rbz, (v) => setBb({ ...bb, rbz: v }))}
            </Field>
            <Field label="مقابل ریالی (تومان)" hint={`تخمینی بر اساس قیمت فعلی: ${t.marketPrice ? fmt(parseInt(bb.rbz || "0", 10) * t.marketPrice) : "—"} تومان`}>
              {numInput(bb.irr, (v) => setBb({ ...bb, irr: v }))}
            </Field>
            <Field label="شبا پرداخت‌کننده">
              <input className="field font-num" dir="ltr" style={{ textAlign: "right" }} value={bb.shaba} onChange={(e) => setBb({ ...bb, shaba: e.target.value })} />
            </Field>
          </div>
          <Field label="توضیح (اختیاری)">
            <input className="field" value={bb.note} placeholder="مثلاً بازخرید مرحله ۳" onChange={(e) => setBb({ ...bb, note: e.target.value })} />
          </Field>
          <div className="mt-4 flex gap-2">
            <Btn type="submit" icon="check" className="flex-1">ثبت بازخرید</Btn>
            <Btn kind="ghost" onClick={() => setBbOpen(false)}>انصراف</Btn>
          </div>
          <p className="mt-3 rounded-lg bg-amber-soft px-3 py-2 text-[11.5px] leading-5 text-amber">
            با ثبت، مقدار RBZ به دارایی خزانه افزوده می‌شود و «پرداخت ریالی» + «بازگشت توکن به خزانه» به‌صورت خودکار در دفتر حسابداری ثبت می‌گردد.
          </p>
        </form>
      </Modal>
    </div>
  );
}
