import { type DB, faDate, faTime, feeSeries, saleIsRevenue, salesSeries, sum } from "../data";
import {
  Badge,
  Btn,
  CopyBtn,
  CountUp,
  Icon,
  Num,
  SectionTitle,
  Sparkline,
} from "../components/ui";
import { cn } from "../utils/cn";

export interface DashProps {
  db: DB;
  go: (tab: string) => void;
}

export default function Dashboard({ db, go }: DashProps) {
  const t = db.treasury;
  const totalStake = sum(t.stakeReturns, (x) => x.staked);
  const totalBase = sum(t.baseReturns, (x) => x.amount);
  const totalFee = sum(t.fees, (x) => x.amount);
  const totalBB = sum(t.buybacks, (x) => x.rbz);
  const userCount = db.meta?.users ?? 0;
  const walletCount = db.meta?.wallets ?? 0;
  const market = t.asset * t.marketPrice;
  const series = feeSeries(t.fees, 7);
  const journal = [...db.journal].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 6);
  const openChats = db.chats.filter((c) => c.status !== "resolved").sort((a, b) => b.unread - a.unread);
  const unread = db.chats.reduce((a, c) => a + c.unread, 0);
  const salesRevenue = sum(db.sales.filter(saleIsRevenue), (sale) => sale.total);
  const activeSales = db.sales.filter((sale) => sale.status !== "cancelled");
  const pendingSales = db.sales.filter((sale) => sale.status === "pending");
  const productChart = salesSeries(db.sales, 7);
  const bestseller = [...db.products]
    .map((product) => ({
      product,
      units: sum(
        db.sales.filter((sale) => sale.productId === product.id && saleIsRevenue(sale)),
        (sale) => sale.qty
      ),
    }))
    .sort((a, b) => b.units - a.units)[0];

  const stats = [
    {
      title: "کاربران فعال",
      value: userCount,
      sub: `${walletCount} کیف‌پول ثبت‌شده در شبکه`,
      icon: "user",
      delay: 0,
    },
    {
      title: "جمع بازگشت استیک",
      value: totalStake,
      sub: `${t.stakeReturns.length} مورد — به شبکه بازمحورده`,
      icon: "clock",
      delay: 70,
    },
    {
      title: "جمع بازگشت پایه",
      value: totalBase,
      sub: `${t.baseReturns.length} بسته توکن پایه خریداری‌شده`,
      icon: "coin",
      delay: 140,
    },
    {
      title: "جمع کارمزد",
      value: totalFee,
      sub: "کل کارمزد دریافتی از کاربران",
      icon: "spark",
      delay: 210,
    },
    {
      title: "بازخرید (Buy Back)",
      value: totalBB,
      sub: `${t.buybacks.length} تراکنش — مدیریت دستی`,
      icon: "bank",
      delay: 280,
    },
  ];

  return (
    <div className="min-w-0 space-y-6 sm:space-y-8">
      <SectionTitle
        title="داشبورد"
        desc="نمای کلی خزانه، فروش محصولات، جریان‌های مالی و پیام‌های در انتظار پاسخ."
        action={
          <Badge kind="neutral">
            <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-mint" />
            داده زنده از بک‌اند
          </Badge>
        }
      />

      {/* ---------- کارت خزانه + دسترسی سریع ---------- */}
      <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="noise rv relative min-w-0 overflow-hidden rounded-2xl bg-[linear-gradient(155deg,#d80a6e_0%,#ad0558_55%,#77023a_100%)] p-4 text-white shadow-lg shadow-brand/30 sm:p-6">
          <div className="relative z-[2]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg font-black">خزانه</h3>
              <Badge kind="ink" className="border-white/20 bg-white/10 text-white">
                توکن پایه: <bdi dir="ltr" className="font-num font-bold">RBZ</bdi>
              </Badge>
            </div>
            <div className="dotline my-3 opacity-80" />
            <div className="flex items-end justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-white/60">دارایی (فروشیده/فعال‌نشده)</p>
                <p className="mt-1 flex flex-wrap items-baseline gap-1.5">
                  <CountUp value={t.asset} className="text-[clamp(24px,6vw,30px)] font-bold leading-none" />
                  <span className="text-[12px] text-white/60">RBZ</span>
                </p>
              </div>
              <Icon name="vault" className="mb-1 h-9 w-9 text-white/50" sw={1.4} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                { l: "مقدار بازار (تخمینی)", v: market, tom: true },
                { l: "بازگشت استیک", v: totalStake },
                { l: "بازگشت پایه", v: totalBase },
                { l: "جمع کارمزد", v: totalFee },
              ].map((r) => (
                <div key={r.l} className="min-w-0 rounded-lg bg-white/10 px-2 py-2 sm:px-3">
                  <p className="text-[10.5px] font-semibold text-white/60">{r.l}</p>
                  <p className="mt-0.5 flex flex-wrap items-baseline gap-x-1">
                    <CountUp value={r.v} className={cn("font-bold", r.tom ? "text-[13px]" : "text-[15px]")} />
                    <span className="text-[10px] text-white/50">{r.tom ? "تومان" : "RBZ"}</span>
                  </p>
                </div>
              ))}
            </div>
            <button
              onClick={() => go("vault")}
              className="group mt-4 flex min-h-11 w-full items-center justify-between rounded-lg bg-white/10 px-3.5 py-2.5 text-[12.5px] font-bold transition hover:bg-white/20"
            >
              ورود به بخش خزانه
              <Icon name="back" className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-1" />
            </button>
          </div>
          <Icon name="vault" className="float-slow absolute -left-10 -bottom-10 z-[1] h-48 w-48 text-white/10" sw={1} />
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <div className="rv min-w-0 rounded-xl border border-line bg-card p-4 sm:p-5" style={{ animationDelay: "100ms" }}>
            <h4 className="flex items-center gap-2 text-[14px] font-extrabold">
              <Icon name="bank" className="text-brand" /> شبا خزانه (دریافت ریال)
            </h4>
            <bdi dir="ltr" className="mt-2.5 block font-num text-[15px] font-bold tracking-wider text-ink-900 [overflow-wrap:anywhere]">
              {t.buybackInfo.shaba}
            </bdi>
            <p className="mt-1 text-[11.5px] text-ink-500 [overflow-wrap:anywhere]">{t.buybackInfo.holder}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <CopyBtn
                text={t.buybackInfo.shaba.replace(/\s/g, "")}
                onCopied={() => {}}
                className="border-line bg-card"
              />
              <button onClick={() => go("vault")} className="text-[12px] font-bold text-brand transition hover:text-brand-700">
                مدیریت بازخرید ←
              </button>
            </div>
          </div>

          <div className="rv min-w-0 flex-1 rounded-xl border border-line bg-card p-4 sm:p-5" style={{ animationDelay: "180ms" }}>
            <h4 className="flex items-center gap-2 text-[14px] font-extrabold">
              <Icon name="spark" className="text-brand" /> دسترسی سریع
            </h4>
            <div className="mt-3 space-y-2">
              {[
                { label: "ثبت فروش محصول", icon: "bag", tab: "sales", count: pendingSales.length },
                { label: "ثبت تراکنش بازخرید", icon: "bank", tab: "vault" },
                { label: "ثبت سرفصل در حسابداری", icon: "plus", tab: "accounts" },
                { label: "پاسخ به چت‌های پشتیبانی", icon: "chat", tab: "support", count: unread },
              ].map((a) => (
                <button
                  key={a.label}
                  onClick={() => go(a.tab)}
                  className="group flex w-full items-center gap-2.5 rounded-lg border border-line bg-paper/60 px-3 py-2.5 text-right text-[12.5px] font-bold text-ink-700 transition hover:border-brand/40 hover:bg-brand-soft/60 hover:text-brand-700"
                >
                  <Icon name={a.icon} className="h-4 w-4 text-brand" />
                  <span className="min-w-0 flex-1">{a.label}</span>
                  {!!a.count && <Badge kind="brand">{a.count}</Badge>}
                  <Icon name="back" className="h-3.5 w-3.5 rotate-180 text-ink-300 transition group-hover:-translate-x-0.5 group-hover:text-brand" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rv min-w-0 rounded-xl border border-line bg-card p-4 sm:p-5 md:col-span-2 xl:col-span-1" style={{ animationDelay: "260ms" }}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="flex items-center gap-2 text-[14px] font-extrabold">
              <Icon name="chart" className="text-brand" /> کارمزد ۷ روز اخیر
            </h4>
            <Badge kind="brand">
              <Num value={totalFee} className="text-[11px]" /> RBZ
            </Badge>
          </div>
          <Sparkline values={series} className="mt-2 h-20" />
          <div className="mt-2 grid grid-cols-7 text-center">
            {series.map((_, i) => (
              <span key={i} className="text-[9.5px] font-semibold text-ink-400">
                {new Date(Date.now() - (6 - i) * 864e5).toLocaleDateString("fa-IR-u-nu-latn", { day: "numeric" })}
              </span>
            ))}
          </div>
          <p className="mt-3 rounded-lg bg-linefaint px-3 py-2 text-[11.5px] leading-5 text-ink-500">
            جمع خودکار از تراکنش‌های ثبتشده در بخش کارمزد — هر ثبت جدید همین منحنی را به‌روز می‌کند.
          </p>
        </div>
      </div>

      {/* ---------- خلاصه فروش محصولات ---------- */}
      <section
        aria-labelledby="dashboard-sales-title"
        className="rv min-w-0 overflow-hidden rounded-2xl border border-line bg-card"
        style={{ animationDelay: "40ms" }}
      >
        <div className="grid min-w-0 grid-cols-1 md:grid-cols-[1.15fr_1fr]">
          <div className="min-w-0 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 id="dashboard-sales-title" className="flex items-center gap-2 text-[14px] font-extrabold">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-soft text-brand">
                  <Icon name="bag" className="h-4 w-4" />
                </span>
                فروش محصولات
              </h4>
              <button
                type="button"
                onClick={() => go("sales")}
                className="flex min-h-11 items-center gap-1 text-[12px] font-bold text-brand transition hover:text-brand-700 sm:min-h-0"
              >
                مدیریت ویترین
                <Icon name="back" className="h-3.5 w-3.5 rotate-180" />
              </button>
            </div>
            <p className="mt-4 text-[11px] font-semibold text-ink-400">مجموع درآمد ثبت‌شده</p>
            <p className="mt-0.5 flex flex-wrap items-baseline gap-1.5">
              <CountUp value={salesRevenue} className="text-[clamp(22px,5vw,28px)] font-bold text-ink-900" duration={800} />
              <span className="text-[11px] text-ink-400">تومان</span>
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { label: "سفارش جاری", value: activeSales.length, unit: "سفارش" },
                { label: "در انتظار پرداخت", value: pendingSales.length, unit: "سفارش" },
                { label: "محصول فعال", value: db.products.filter((product) => product.active).length, unit: "محصول" },
              ].map((item, index) => (
                <div key={item.label} className="min-w-0 rounded-lg bg-linefaint/70 px-2.5 py-2">
                  <p className="truncate text-[9.5px] font-semibold text-ink-400 sm:text-[10.5px]">{item.label}</p>
                  <p className="mt-0.5 flex flex-wrap items-baseline gap-1">
                    <CountUp
                      value={item.value}
                      className={cn("text-[16px] font-bold", index === 1 && item.value > 0 ? "text-amber" : "text-ink-900")}
                      duration={650}
                    />
                    <span className="text-[9px] text-ink-400">{item.unit}</span>
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Btn icon="plus" className="flex-1 sm:flex-none" onClick={() => go("sales")}>
                ثبت سفارش فروش
              </Btn>
              <Btn kind="ghost" className="flex-1 sm:flex-none" onClick={() => go("sales")}>
                سفارش‌ها
              </Btn>
            </div>
          </div>

          <div className="min-w-0 border-t border-linefaint bg-brand-soft/25 p-4 sm:p-5 md:border-r md:border-t-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 text-[12px] font-extrabold text-ink-700">
                <Icon name="chart" className="h-4 w-4 text-brand" />
                روند ۷ روز اخیر
              </p>
              <span className="flex items-baseline gap-1">
                <Num value={sum(productChart, (value) => value)} className="text-[11.5px] font-bold text-brand-700" />
                <span className="text-[9px] text-ink-400">تومان</span>
              </span>
            </div>
            <Sparkline values={productChart} className="mt-1 h-16" />
            {bestseller && (
              <div className="mt-2 flex min-w-0 items-center gap-2.5 rounded-lg border border-line/70 bg-card/80 px-3 py-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand text-white">
                  <Icon name="box" className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[9.5px] font-semibold text-ink-400">پرفروش‌ترین محصول</p>
                  <p className="truncate text-[11.5px] font-bold text-ink-900">{bestseller.product.name}</p>
                </div>
                <bdi dir="ltr" className="shrink-0 font-num text-[10.5px] font-bold text-brand-700">
                  {bestseller.units} ×
                </bdi>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ---------- کارت‌های شاخص ---------- */}
      <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <button
            key={s.title}
            onClick={() => go("vault")}
            className="rv group min-w-0 rounded-xl border border-line bg-card p-3 text-right transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md hover:shadow-brand/10 sm:p-4"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand transition group-hover:bg-brand group-hover:text-white">
                <Icon name={s.icon} className="h-[18px] w-[18px]" />
              </span>
              <Icon name="back" className="h-3.5 w-3.5 rotate-180 text-ink-300 transition group-hover:text-brand" />
            </div>
            <p className="mt-3 text-[12.5px] font-bold text-ink-500">{s.title}</p>
            <p className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5">
              <CountUp value={s.value} className="text-[20px] font-bold text-ink-900 sm:text-[22px]" duration={800} />
              <span className="text-[11px] text-ink-400">RBZ</span>
            </p>
            <p className="mt-1 text-[11px] text-ink-400">{s.sub}</p>
          </button>
        ))}
      </div>

      {/* ---------- رویدادها + پشتیبانی ---------- */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rv min-w-0 rounded-xl border border-line bg-card xl:col-span-2" style={{ animationDelay: "80ms" }}>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-linefaint px-4 py-4 sm:px-5">
            <h4 className="flex items-center gap-2 text-[14px] font-extrabold">
              <Icon name="calc" className="text-brand" /> رویدادهای اخیر دفتر
            </h4>
            <Btn kind="ghost" className="py-1.5! text-[12px]" onClick={() => go("accounts")}>
              مشاهده همه
            </Btn>
          </div>
          <ul className="divide-y divide-linefaint">
            {journal.map((j, i) => (
              <li key={j.id} className="rv grid grid-cols-[32px_minmax(0,1fr)] items-start gap-x-3 gap-y-1 px-4 py-3 sm:flex sm:items-center sm:px-5" style={{ animationDelay: `${i * 50}ms` }}>
                <span
                  className={cn(
                    "row-span-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    j.dir === "in" ? "bg-mint-soft text-mint" : "bg-rust-soft text-rust"
                  )}
                >
                  <Icon name={j.dir === "in" ? "arrowIn" : "arrowOut"} className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-ink-900 [overflow-wrap:anywhere] sm:truncate">{j.title}</p>
                  <p className="mt-0.5 text-[11px] text-ink-400">
                    {j.category} · {faDate(j.at)}
                  </p>
                </div>
                <div className="col-start-2 flex flex-wrap items-baseline gap-1 sm:shrink-0">
                  <Num value={j.amount} className={cn("text-[13px] font-bold", j.dir === "in" ? "text-mint" : "text-rust")} />
                  <span className="text-[10.5px] text-ink-400">{j.unit}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rv min-w-0 rounded-xl border border-line bg-card" style={{ animationDelay: "160ms" }}>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-linefaint px-4 py-4 sm:px-5">
            <h4 className="flex items-center gap-2 text-[14px] font-extrabold">
              <Icon name="chat" className="text-brand" /> پشتیبانی
            </h4>
            {!!unread && <Badge kind="brand">{unread} پیام جدید</Badge>}
          </div>
          {openChats.length === 0 && (
            <p className="px-5 py-8 text-center text-[13px] text-ink-400">همه گفت‌وگوها پاسخ داده شده‌اند</p>
          )}
          <ul className="divide-y divide-linefaint">
            {openChats.slice(0, 4).map((c, i) => {
              const last = c.msgs[c.msgs.length - 1];
              return (
                <li key={c.id} className="rv" style={{ animationDelay: `${200 + i * 60}ms` }}>
                  <button onClick={() => go("support")} className="flex w-full items-center gap-3 px-4 py-3 text-right transition hover:bg-brand-soft/40 sm:px-5">
                    <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-900 text-[13px] font-extrabold text-paper">
                      {c.name.slice(0, 1)}
                      {!!c.unread && <span className="absolute -left-1 -top-1 h-3 w-3 rounded-full border-2 border-card bg-brand" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between">
                        <b className="text-[13px] font-bold">{c.name}</b>
                        <span className="text-[10.5px] text-ink-400">{faTime(last?.at ?? "")}</span>
                      </span>
                      <span className="mt-0.5 block truncate text-[11.5px] text-ink-500">{last?.text}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-linefaint p-3">
            <Btn kind="soft" icon="chat" className="w-full" onClick={() => go("support")}>
              ورود به چت‌های پشتیبانی
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
