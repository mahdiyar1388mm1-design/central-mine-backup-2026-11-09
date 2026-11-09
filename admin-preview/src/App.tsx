import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  PAYMENT_LABELS,
  normalizeDB,
  saleIsRevenue,
  type DB,
  type JournalEntry,
  type ProductDraft,
  type SaleDraft,
  type SaleOrder,
  type SaleStatus,
  faDate,
  fmt,
  seedDB,
  sum,
  uid,
} from "./data";
import { useMediaQuery, useOverlay, useVisualViewport } from "./hooks";
import { Badge, Btn, CopyBtn, Icon, Modal } from "./components/ui";
import { Logo } from "./components/Logo";
import { cn } from "./utils/cn";
import Dashboard, { type DashProps } from "./pages/Dashboard";
import Treasury, { type TreasuryProps } from "./pages/Treasury";
import Sales, { type SalesProps } from "./pages/Sales";
import Accounting, { type AccountingProps } from "./pages/Accounting";
import Support, { type SupportProps } from "./pages/Support";

type Tab = "dash" | "vault" | "sales" | "accounts" | "support";
const ADMIN_PANEL_KEY =
  import.meta.env.VITE_ADMIN_PANEL_KEY || "adm-panel-2026-11-08-7QmR9pX2";

const LIVE_REFRESH_MS = 15_000;

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "dash", label: "داشبورد", icon: "grid" },
  { id: "vault", label: "خزانه", icon: "vault" },
  { id: "sales", label: "فروش محصولات", icon: "bag" },
  { id: "accounts", label: "حسابداری", icon: "calc" },
  { id: "support", label: "پشتیبانی", icon: "chat" },
];

const TITLES: Record<Tab, [string, string]> = {
  dash: ["داشبورد", "نمای کلی خزانه، فروش و جریان‌های مالی"],
  vault: ["خزانه", "دارایی، بازگشت‌ها، کارمزد و بازخرید"],
  sales: ["فروش محصولات", "ویترین، سفارش‌ها و درآمد فروش"],
  accounts: ["حسابداری", "دفتر روزنامه و ثبت سرفصل‌ها"],
  support: ["پشتیبانی", "گفت‌وگوهای کاربران"],
};

const saleJournalEntry = (sale: SaleOrder): Omit<JournalEntry, "id"> => ({
  at: sale.at,
  title: `فروش محصول — ${sale.productName} × ${sale.qty}`,
  category: "فروش محصولات",
  dir: "in",
  amount: sale.total,
  unit: "IRR",
  note: `خریدار: ${sale.buyer} — ${PAYMENT_LABELS[sale.payment]}${sale.tracking ? ` — پیگیری: ${sale.tracking}` : ""}`,
  ref: sale.id,
});

const nextSaleCode = (sales: SaleOrder[]): string => {
  const highest = sales.reduce((max, sale) => {
    const value = parseInt(sale.code.replace(/\D/g, ""), 10);
    return Number.isFinite(value) ? Math.max(max, value) : max;
  }, 1400);
  return `S-${highest + 1}`;
};

interface Toast {
  id: string;
  msg: string;
}

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(String(value ?? "").replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getRecordValue = (record: Record<string, unknown>, keys: string[]): unknown => {
  for (const key of keys) {
    if (record && key in record) return record[key];
  }
  return undefined;
};

const mapManualRecordToJournalEntry = (record: any): JournalEntry | null => {
  if (!record) return null;
  const data = { ...(record.data ?? record) } as Record<string, unknown>;
  const amount = toNumber(getRecordValue(data, ["amount", "value", "rbz", "irr", "total"])) || 0;
  if (amount <= 0) return null;

  const at = String(getRecordValue(data, ["at", "createdAt"]) ?? new Date().toISOString());
  const type = String(record?.type ?? "journal");
  const unit = String(getRecordValue(data, ["unit", "currency"]) ?? (type === "buyback" ? "IRR" : "RBZ"));
  const category = String(
    getRecordValue(data, ["category", "kind"]) ??
      (type === "fee" ? "کارمزد" : type === "buyback" ? "بازخرید" : "سایر")
  );
  const direction = String(getRecordValue(data, ["dir"]) ?? (type === "buyback" ? "out" : "in"));

  const noteValue = getRecordValue(data, ["note"]);

  return {
    id: String(record?.id ?? uid()),
    at,
    title: String(getRecordValue(data, ["title"]) ?? `${type} — ${record?.id ?? "ثبت"}`),
    category: category as JournalEntry["category"],
    dir: direction === "out" ? "out" : "in",
    amount,
    unit: unit === "IRR" ? "IRR" : "RBZ",
    note: noteValue == null ? undefined : String(noteValue),
    ref: String(record?.id ?? undefined),
  };
};

const createEmptyLiveDB = (): DB =>
  normalizeDB({
    version: 2,
    treasury: {
      asset: 0,
      marketPrice: 0,
      buybackInfo: { bank: "", holder: "", shaba: "" },
      stakeReturns: [],
      baseReturns: [],
      fees: [],
      buybacks: [],
    },
    products: [],
    sales: [],
    journal: [],
    chats: [],
    meta: { users: 0, wallets: 0, generatedAt: new Date().toISOString() },
  });

const buildLiveDB = (
  serverState: any,
  overview: any,
  treasuryReport: any,
  productReport: any,
  salesList: any[] = [],
  productCatalog: any[] = []
): DB => {
  const fallback = createEmptyLiveDB();
  const base = normalizeDB(serverState && typeof serverState === "object" ? serverState : fallback);

  const manualRecords = Array.isArray(treasuryReport?.manualRecords)
    ? treasuryReport.manualRecords
    : Array.isArray(serverState?.journal)
      ? serverState.journal
      : [];

  const overviewTreasury = overview?.treasury ?? {};
  const treasuryBalances = treasuryReport?.balances ?? {};
  const treasuryState = base.treasury;

  const treasury: DB["treasury"] = {
    ...treasuryState,
    asset: toNumber(
      overviewTreasury?.baseLth ?? treasuryBalances?.treasury?.baseLth ?? base.treasury.asset,
      base.treasury.asset
    ),
    marketPrice: toNumber(
      overview?.protocol?.lthBaseRateIrr ?? treasuryReport?.marketPrice ?? base.treasury.marketPrice,
      base.treasury.marketPrice
    ),
    buybackInfo: {
      ...base.treasury.buybackInfo,
      ...(typeof treasuryReport?.buybackInfo === "object" ? treasuryReport.buybackInfo : {}),
    },
    stakeReturns: Array.isArray(base.treasury.stakeReturns) && base.treasury.stakeReturns.length > 0
      ? base.treasury.stakeReturns
      : [],
    baseReturns: Array.isArray(base.treasury.baseReturns) && base.treasury.baseReturns.length > 0
      ? base.treasury.baseReturns
      : [],
    fees: Array.isArray(base.treasury.fees) && base.treasury.fees.length > 0 ? base.treasury.fees : [],
    buybacks: Array.isArray(base.treasury.buybacks) && base.treasury.buybacks.length > 0 ? base.treasury.buybacks : [],
  };

  const mappedJournal = (manualRecords || [])
    .map(mapManualRecordToJournalEntry)
    .filter((entry): entry is JournalEntry => Boolean(entry));

  const catalogRows = Array.isArray(productCatalog) && productCatalog.length > 0
    ? productCatalog
    : Array.isArray(productReport?.products) && productReport.products.length > 0
      ? productReport.products
      : [];

  const mappedProducts = catalogRows.map((product: any, index: number) => {
    const firstSku = Array.isArray(product?.skus) && product.skus.length > 0 ? product.skus[0] : {};
    const summary = Array.isArray(productReport?.products)
      ? productReport.products.find((row: any) => row?.id === product?.id)
      : null;
    const price = toNumber(firstSku?.price ?? product?.price ?? product?.unitPrice ?? summary?.revenueIrr ?? 0, 0);
    const stock = toNumber(firstSku?.stock ?? product?.stock ?? product?.inventory ?? 0, 0);
    const sold = toNumber(summary?.units ?? product?.sold ?? 0, 0);

    return {
      id: String(product?.id ?? `prod-${index + 1}`),
      name: String(product?.name ?? firstSku?.name ?? `محصول ${index + 1}`),
      sku: String(firstSku?.code ?? product?.sku ?? `RBZ-${index + 1}`),
      category: String(product?.category ?? product?.brand ?? firstSku?.name ?? "کاتالوگ"),
      price,
      stock,
      sold,
      active: Boolean(product?.visible ?? product?.active ?? true),
      description: String(product?.sellerDescription ?? product?.description ?? ""),
      tone: (product?.tone ?? ["rose", "mint", "ink", "sand"][index % 4]) as DB["products"][number]["tone"],
    };
  });

  const mappedSales = Array.isArray(salesList)
    ? salesList.map((sale: any, index: number) => {
        const productRef = mappedProducts.find((product) => product.id === sale?.productId) ?? mappedProducts[index % Math.max(mappedProducts.length, 1)] ?? null;
        const qty = toNumber(sale?.quantity ?? sale?.qty ?? 1, 1);
        const revenue = toNumber(sale?.revenueIrr ?? sale?.total ?? 0, 0);
        const unitPrice = qty > 0 ? Math.round(revenue / qty) : toNumber(sale?.unitPrice ?? sale?.price ?? 0, 0);

        return {
          id: String(sale?.id ?? `sale-${index + 1}`),
          code: String(sale?.code ?? `S-${index + 1}`),
          at: String(sale?.soldAt ?? sale?.at ?? new Date().toISOString()),
          buyer: String(sale?.buyer ?? sale?.customer ?? "کاربر"),
          phone: sale?.phone ? String(sale.phone) : undefined,
          productId: String(sale?.productId ?? productRef?.id ?? ""),
          productName: String(sale?.productName ?? productRef?.name ?? "محصول"),
          qty,
          unitPrice,
          total: revenue,
          status: (sale?.status ?? "paid") as SaleOrder["status"],
          payment: (sale?.payment ?? "online") as SaleOrder["payment"],
          tracking: sale?.tracking ? String(sale.tracking) : undefined,
          note: sale?.note ? String(sale.note) : undefined,
        };
      })
    : [];

  return normalizeDB({
    ...base,
    version: 2,
    treasury,
    products: mappedProducts,
    sales: mappedSales,
    journal: mappedJournal.length > 0 ? mappedJournal : base.journal,
    chats: Array.isArray(base.chats) ? base.chats : fallback.chats,
    meta: {
      users: toNumber(overview?.users ?? base.meta?.users ?? 0, 0),
      wallets: toNumber(overview?.wallets ?? base.meta?.wallets ?? 0, 0),
      generatedAt: overview?.generatedAt ?? treasuryReport?.generatedAt ?? new Date().toISOString(),
    },
  });
};

export default function App() {
  const [tab, setTab] = useState<Tab>("dash");
  const [db, setDb] = useState<DB>(() =>
    normalizeDB({
      version: 2,
      treasury: {
        asset: 0,
        marketPrice: 0,
        buybackInfo: { bank: "", holder: "", shaba: "" },
        stakeReturns: [],
        baseReturns: [],
        fees: [],
        buybacks: [],
      },
      products: [],
      sales: [],
      journal: [],
      chats: [],
      meta: { users: 0, wallets: 0, generatedAt: new Date().toISOString() },
    })
  );
  const [dbReady, setDbReady] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [sideOpen, setSideOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const desktop = useMediaQuery("(min-width: 1024px)");

  useVisualViewport();
  useOverlay(sideOpen && !desktop, sidebarRef, () => setSideOpen(false), menuButtonRef);

  const refreshFromServer = useCallback(() => {
    let cancelled = false;

    Promise.all([
      fetch("/v1/admin/state", {
        credentials: "same-origin",
        headers: { "X-Admin-Panel-Key": ADMIN_PANEL_KEY },
      }).then((response) => (response.ok ? response.json() : null)).catch(() => null),
      fetch("/v1/admin/overview", {
        credentials: "same-origin",
        headers: { "X-Admin-Panel-Key": ADMIN_PANEL_KEY },
      }).then((response) => (response.ok ? response.json() : null)).catch(() => null),
      fetch("/v1/admin/treasury/report", {
        credentials: "same-origin",
        headers: { "X-Admin-Panel-Key": ADMIN_PANEL_KEY },
      }).then((response) => (response.ok ? response.json() : null)).catch(() => null),
      fetch("/v1/admin/products/report", {
        credentials: "same-origin",
        headers: { "X-Admin-Panel-Key": ADMIN_PANEL_KEY },
      }).then((response) => (response.ok ? response.json() : null)).catch(() => null),
      fetch("/v1/admin/sales", {
        credentials: "same-origin",
        headers: { "X-Admin-Panel-Key": ADMIN_PANEL_KEY },
      }).then((response) => (response.ok ? response.json() : [])).catch(() => []),
      fetch("/v1/products?page=1&size=200", {
        credentials: "same-origin",
      }).then((response) => (response.ok ? response.json() : { products: [] })).catch(() => ({ products: [] })),
    ])
      .then(([statePayload, overviewPayload, treasuryPayload, productPayload, salesPayload, productCatalogPayload]) => {
        if (cancelled) return;
        const nextDb = buildLiveDB(
          statePayload?.state ?? statePayload,
          overviewPayload,
          treasuryPayload,
          productPayload,
          Array.isArray(salesPayload) ? salesPayload : [],
          Array.isArray(productCatalogPayload?.products) ? productCatalogPayload.products : []
        );
        setDb(normalizeDB(nextDb));
        setDbReady(true);
      })
      .catch(() => {
        if (!cancelled) setDbReady(true);
      });

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const cleanup = refreshFromServer();
    const interval = window.setInterval(() => {
      refreshFromServer();
    }, LIVE_REFRESH_MS);

    return () => {
      cleanup?.();
      window.clearInterval(interval);
    };
  }, [refreshFromServer]);

  useEffect(() => {
    if (!dbReady) return;
    const timer = window.setTimeout(() => {
      fetch("/v1/admin/state", {
        method: "PUT",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Panel-Key": ADMIN_PANEL_KEY,
        },
        body: JSON.stringify({ state: db }),
      }).catch(() => notify("ذخیره‌سازی روی سرور انجام نشد؛ اتصال را بررسی کنید."));
    }, 350);
    return () => window.clearTimeout(timer);
  }, [db, dbReady]);
  useEffect(() => {
    if (desktop) setSideOpen(false);
  }, [desktop]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [tab]);

  const notify = useCallback((msg: string) => {
    const id = uid();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  const go = (t: string) => {
    setTab(t as Tab);
    setSideOpen(false);
  };

  /* ---------- اکشن‌های خزانه ---------- */

  const setAsset: TreasuryProps["setAsset"] = (v, note) =>
    setDb((d) => {
      const diff = v - d.treasury.asset;
      if (diff === 0) return d;
      const entry: JournalEntry = {
        id: uid(),
        at: new Date().toISOString(),
        title: "تنظیم موجودی خزانه",
        category: "خزانه",
        dir: diff > 0 ? "in" : "out",
        amount: Math.abs(diff),
        unit: "RBZ",
        note,
      };
      return { ...d, treasury: { ...d.treasury, asset: v }, journal: [...d.journal, entry] };
    });

  const setMarketPrice: TreasuryProps["setMarketPrice"] = (v) =>
    setDb((d) => ({ ...d, treasury: { ...d.treasury, marketPrice: v } }));

  const setBuybackInfo: TreasuryProps["setBuybackInfo"] = (info) =>
    setDb((d) => ({ ...d, treasury: { ...d.treasury, buybackInfo: info } }));

  const addStakeReturn: TreasuryProps["addStakeReturn"] = (s) => {
    const ref = uid();
    setDb((d) => ({
      ...d,
      treasury: { ...d.treasury, stakeReturns: [{ ...s, id: ref }, ...d.treasury.stakeReturns] },
      journal: [
        ...d.journal,
        {
          id: uid(),
          at: s.at,
          title: `بازگشت استیک به شبکه — ${s.user}`,
          category: "بازگشت استیک",
          dir: "out",
          amount: s.staked,
          unit: "RBZ",
          note: `روزهای مانده دوره: ${s.daysLeft} — به‌جای کاربر به شبکه بازمحورده`,
          ref,
        },
      ],
    }));
  };

  const removeStakeReturn: TreasuryProps["removeStakeReturn"] = (id) =>
    setDb((d) => ({
      ...d,
      treasury: { ...d.treasury, stakeReturns: d.treasury.stakeReturns.filter((x) => x.id !== id) },
      journal: d.journal.filter((j) => j.ref !== id),
    }));

  const addBaseReturn: TreasuryProps["addBaseReturn"] = (b) => {
    const ref = uid();
    setDb((d) => ({
      ...d,
      treasury: { ...d.treasury, baseReturns: [{ ...b, id: ref }, ...d.treasury.baseReturns] },
      journal: [
        ...d.journal,
        {
          id: uid(),
          at: b.at,
          title: `بازگشت توکن پایه — ${b.user}`,
          category: "بازگشت پایه",
          dir: "in",
          amount: b.amount,
          unit: "RBZ",
          note: b.note,
          ref,
        },
      ],
    }));
  };

  const removeBaseReturn: TreasuryProps["removeBaseReturn"] = (id) =>
    setDb((d) => ({
      ...d,
      treasury: { ...d.treasury, baseReturns: d.treasury.baseReturns.filter((x) => x.id !== id) },
      journal: d.journal.filter((j) => j.ref !== id),
    }));

  const addFee: TreasuryProps["addFee"] = (f) => {
    const ref = uid();
    setDb((d) => ({
      ...d,
      treasury: { ...d.treasury, fees: [{ ...f, id: ref }, ...d.treasury.fees] },
      journal: [
        ...d.journal,
        {
          id: uid(),
          at: f.at,
          title: `کارمزد ${f.kind} — ${f.user}`,
          category: "کارمزد",
          dir: "in",
          amount: f.amount,
          unit: "RBZ",
          ref,
        },
      ],
    }));
  };

  const removeFee: TreasuryProps["removeFee"] = (id) =>
    setDb((d) => ({
      ...d,
      treasury: { ...d.treasury, fees: d.treasury.fees.filter((x) => x.id !== id) },
      journal: d.journal.filter((j) => j.ref !== id),
    }));

  const addBuyback: TreasuryProps["addBuyback"] = (b) => {
    const ref = uid();
    setDb((d) => ({
      ...d,
      treasury: {
        ...d.treasury,
        asset: d.treasury.asset + b.rbz,
        buybacks: [{ ...b, id: ref }, ...d.treasury.buybacks],
      },
      journal: [
        ...d.journal,
        {
          id: uid(),
          at: b.at,
          title: "پرداخت ریالی بازخرید توکن",
          category: "بازخرید",
          dir: "out",
          amount: b.irr,
          unit: "IRR",
          note: b.note ?? "واریز از حساب شرکتی",
          ref,
        },
        {
          id: uid(),
          at: b.at,
          title: `بازگشت توکن بازخریدی به خزانه — ${fmt(b.rbz)} RBZ`,
          category: "بازخرید",
          dir: "in",
          amount: b.rbz,
          unit: "RBZ",
          note: `شبا: ${b.shaba}`,
          ref,
        },
      ],
    }));
  };

  const removeBuyback: TreasuryProps["removeBuyback"] = (id) =>
    setDb((d) => ({
      ...d,
      treasury: {
        ...d.treasury,
        asset: Math.max(0, d.treasury.asset - (d.treasury.buybacks.find((x) => x.id === id)?.rbz ?? 0)),
        buybacks: d.treasury.buybacks.filter((x) => x.id !== id),
      },
      journal: d.journal.filter((j) => j.ref !== id),
    }));

  /* ---------- فروش محصولات ---------- */

  const saveProduct: SalesProps["saveProduct"] = (draft: ProductDraft, productId) =>
    setDb((d) => {
      if (productId) {
        return {
          ...d,
          products: d.products.map((product) =>
            product.id === productId ? { ...product, ...draft } : product
          ),
        };
      }
      return {
        ...d,
        products: [
          ...d.products,
          {
            ...draft,
            id: uid(),
            sold: 0,
            active: true,
          },
        ],
      };
    });

  const toggleProduct: SalesProps["toggleProduct"] = (id) =>
    setDb((d) => ({
      ...d,
      products: d.products.map((product) =>
        product.id === id ? { ...product, active: !product.active } : product
      ),
    }));

  const addSale: SalesProps["addSale"] = (draft: SaleDraft) => {
    const product = db.products.find((item) => item.id === draft.productId);
    if (!product) {
      notify("محصول انتخاب‌شده پیدا نشد");
      return;
    }
    if (!draft.buyer.trim() || draft.qty < 1) {
      notify("نام خریدار و تعداد سفارش الزامی است");
      return;
    }
    if (draft.qty > product.stock) {
      notify(`موجودی ${product.name} کافی نیست`);
      return;
    }

    const saleId = uid();
    setDb((d) => {
      const currentProduct = d.products.find((item) => item.id === draft.productId);
      if (!currentProduct || draft.qty > currentProduct.stock) return d;
      const sale: SaleOrder = {
        id: saleId,
        code: nextSaleCode(d.sales),
        at: draft.at,
        buyer: draft.buyer,
        phone: draft.phone || undefined,
        productId: currentProduct.id,
        productName: currentProduct.name,
        qty: draft.qty,
        unitPrice: currentProduct.price,
        total: currentProduct.price * draft.qty,
        status: draft.status,
        payment: draft.payment,
        tracking: draft.tracking || undefined,
        note: draft.note || undefined,
      };
      const recognized = saleIsRevenue(sale);
      return {
        ...d,
        products: d.products.map((item) =>
          item.id === currentProduct.id
            ? { ...item, stock: item.stock - draft.qty, sold: item.sold + draft.qty }
            : item
        ),
        sales: [sale, ...d.sales],
        journal: recognized
          ? [...d.journal, { ...saleJournalEntry(sale), id: uid() }]
          : d.journal,
      };
    });
  };

  const changeSaleStatus: SalesProps["changeSaleStatus"] = (id, status: SaleStatus) => {
    const current = db.sales.find((sale) => sale.id === id);
    if (!current || current.status === status) return;
    const product = db.products.find((item) => item.id === current.productId);
    if (current.status === "cancelled" && status !== "cancelled") {
      if (!product || product.stock < current.qty) {
        notify("برای فعال‌کردن مجدد سفارش، موجودی محصول کافی نیست");
        return;
      }
    }

    setDb((d) => {
      const sale = d.sales.find((item) => item.id === id);
      if (!sale || sale.status === status) return d;
      const wasCancelled = sale.status === "cancelled";
      const nowCancelled = status === "cancelled";
      const stockDelta = wasCancelled === nowCancelled ? 0 : nowCancelled ? sale.qty : -sale.qty;

      const updatedSale: SaleOrder = { ...sale, status };
      const journalWithoutSale = d.journal.filter((entry) => entry.ref !== sale.id);
      return {
        ...d,
        products:
          stockDelta === 0
            ? d.products
            : d.products.map((item) =>
                item.id === sale.productId
                  ? {
                      ...item,
                      stock: Math.max(0, item.stock + stockDelta),
                      sold: Math.max(0, item.sold - stockDelta),
                    }
                  : item
              ),
        sales: d.sales.map((item) => (item.id === id ? updatedSale : item)),
        journal: saleIsRevenue(updatedSale)
          ? [...journalWithoutSale, { ...saleJournalEntry(updatedSale), id: uid() }]
          : journalWithoutSale,
      };
    });
  };

  const removeSale: SalesProps["removeSale"] = (id) =>
    setDb((d) => {
      const sale = d.sales.find((item) => item.id === id);
      if (!sale) return d;
      const restore = sale.status !== "cancelled";
      return {
        ...d,
        products: restore
          ? d.products.map((product) =>
              product.id === sale.productId
                ? {
                    ...product,
                    stock: product.stock + sale.qty,
                    sold: Math.max(0, product.sold - sale.qty),
                  }
                : product
            )
          : d.products,
        sales: d.sales.filter((item) => item.id !== id),
        journal: d.journal.filter((entry) => entry.ref !== id),
      };
    });

  /* ---------- حسابداری ---------- */

  const addEntry: AccountingProps["addEntry"] = (e) =>
    setDb((d) => ({ ...d, journal: [...d.journal, { ...e, id: uid() }] }));

  const removeEntry: AccountingProps["removeEntry"] = (id) =>
    setDb((d) => ({ ...d, journal: d.journal.filter((j) => j.id !== id) }));

  /* ---------- پشتیبانی ---------- */

  const selectChat: SupportProps["setActive"] = (id) => {
    setActiveChat(id);
    if (id)
      setDb((d) => ({
        ...d,
        chats: d.chats.map((c) => (c.id === id ? { ...c, unread: 0 } : c)),
      }));
  };

  const sendReply: SupportProps["sendReply"] = (chatId, text) =>
    setDb((d) => ({
      ...d,
      chats: d.chats.map((c) =>
        c.id === chatId
          ? {
              ...c,
              unread: 0,
              msgs: [...c.msgs, { id: uid(), from: "agent" as const, text, at: new Date().toISOString() }],
            }
          : c
      ),
    }));

  const setChatStatus: SupportProps["setStatus"] = (chatId, status) =>
    setDb((d) => ({
      ...d,
      chats: d.chats.map((c) => (c.id === chatId ? { ...c, status } : c)),
    }));

  /* ---------- محاسبات تیکر ---------- */

  const unread = db.chats.reduce((a, c) => a + c.unread, 0);
  const t = db.treasury;
  const ticker = useMemo(() => {
    const inRBZ = sum(db.journal.filter((j) => j.dir === "in" && j.unit === "RBZ"), (j) => j.amount);
    const outRBZ = sum(db.journal.filter((j) => j.dir === "out" && j.unit === "RBZ"), (j) => j.amount);
    return [
      { l: "دارایی خزانه", v: `${fmt(t.asset)} RBZ` },
      { l: "مقدار بازار (تخمینی)", v: `${fmt(t.asset * t.marketPrice)} تومان` },
      { l: "جمع بازگشت استیک", v: `${fmt(sum(t.stakeReturns, (x) => x.staked))} RBZ` },
      { l: "جمع بازگشت پایه", v: `${fmt(sum(t.baseReturns, (x) => x.amount))} RBZ` },
      { l: "جمع کارمزد", v: `${fmt(sum(t.fees, (x) => x.amount))} RBZ` },
      { l: "بازخرید (Buy Back)", v: `${fmt(sum(t.buybacks, (x) => x.rbz))} RBZ` },
      {
        l: "درآمد فروش محصولات",
        v: `${fmt(sum(db.sales.filter(saleIsRevenue), (sale) => sale.total))} تومان`,
      },
      {
        l: "سفارش در انتظار پرداخت",
        v: fmt(db.sales.filter((sale) => sale.status === "pending").length),
      },
      { l: "مانده RBZ دفتر", v: `${fmt(inRBZ - outRBZ)} RBZ` },
      { l: "پیام‌های جدید پشتیبانی", v: fmt(unread) },
    ];
  }, [db, t, unread]);

  const dashProps: DashProps = { db, go };
  const treasuryProps: TreasuryProps = {
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
  };
  const salesProps: SalesProps = {
    products: db.products,
    sales: db.sales,
    shaba: t.buybackInfo.shaba,
    saveProduct,
    toggleProduct,
    addSale,
    changeSaleStatus,
    removeSale,
    notify,
  };
  const accountingProps: AccountingProps = { journal: db.journal, addEntry, removeEntry, notify };
  const supportProps: SupportProps = {
    chats: db.chats,
    activeId: activeChat,
    setActive: selectChat,
    sendReply,
    setStatus: setChatStatus,
  };

  return (
    <div className="app-shell flex min-h-dvh bg-paper text-ink-900">
      {/* ---------- لایه موبایل ---------- */}
      {sideOpen && (
        <button
          aria-label="بستن منو با لمس بیرون آن"
          tabIndex={-1}
          className="fixed inset-0 z-30 bg-ink-950/50 lg:hidden"
          onClick={() => setSideOpen(false)}
        />
      )}

      {/* ---------- نوار کناری ---------- */}
      <aside
        id="main-navigation"
        ref={sidebarRef}
        role={!desktop && sideOpen ? "dialog" : undefined}
        aria-modal={!desktop && sideOpen ? true : undefined}
        aria-label="منوی مدیریت"
        tabIndex={-1}
        className={cn(
          "app-sidebar noise fixed inset-y-0 right-0 z-40 flex h-dvh w-[min(280px,calc(100vw-32px))] shrink-0 flex-col bg-ink-900 text-paper outline-none transition-transform duration-300 lg:sticky lg:top-0 lg:visible lg:w-[264px] lg:translate-x-0",
          sideOpen ? "visible translate-x-0" : "invisible translate-x-full"
        )}
      >
        <div className="thin-scroll relative z-[2] flex h-full min-h-0 flex-col overflow-y-auto overscroll-contain">
          <div className="flex shrink-0 items-center gap-3 border-b border-white/10 px-4 py-4 lg:px-5 lg:py-5">
            <Logo
              variant="mark"
              className="h-11 w-11 rounded-[12px] shadow-lg shadow-black/40"
            />
            <div className="min-w-0 flex-1">
              <p
                className="truncate text-[15px] font-black leading-5 tracking-wide text-white"
                dir="ltr"
              >
                CENTRAL MINE
              </p>
              <p className="mt-1 text-[10.5px] font-medium text-paper/50">پنل مدیریت راب‌ساز</p>
            </div>
            <button
              type="button"
              aria-label="بستن منو"
              onClick={() => setSideOpen(false)}
              className="touch-target rounded-lg text-paper/70 transition hover:bg-white/10 hover:text-white lg:hidden"
            >
              <Icon name="x" />
            </button>
          </div>

          <nav aria-label="بخش‌های پنل" className="flex-1 space-y-1 px-3 py-4">
            <p className="px-2 pb-2 text-[10.5px] font-bold tracking-wide text-paper/35">بخش‌های پنل</p>
            {TABS.map((it, i) => (
              <button
                key={it.id}
                onClick={() => go(it.id)}
                aria-current={tab === it.id ? "page" : undefined}
                className={cn(
                  "rv group relative flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-bold transition-all duration-200",
                  tab === it.id ? "bg-white/10 text-white" : "text-paper/55 hover:bg-white/5 hover:text-white"
                )}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span
                  className={cn(
                    "absolute right-0 h-5 w-[3px] rounded-full bg-brand transition-all duration-300",
                    tab === it.id ? "opacity-100" : "opacity-0 group-hover:opacity-40"
                  )}
                />
                <Icon name={it.icon} className={cn("h-[19px] w-[19px] transition", tab === it.id ? "text-brand" : "text-paper/45 group-hover:text-paper/80")} />
                <span className="flex-1 text-right">{it.label}</span>
                {it.id === "support" && unread > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 font-num text-[10.5px] font-bold text-white">
                    {unread}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="shrink-0 space-y-3 border-t border-white/10 p-4">
            <div className="rounded-lg bg-white/5 p-3">
              <p className="flex items-center gap-1.5 text-[10.5px] font-bold text-paper/45">
                <Icon name="bank" className="h-3.5 w-3.5 text-brand" />
                شبا خزانه
              </p>
              <bdi dir="ltr" className="mt-1.5 block truncate font-num text-[11px] font-semibold tracking-wide text-paper/85">
                {t.buybackInfo.shaba}
              </bdi>
              <div className="mt-2">
                <CopyBtn
                  text={t.buybackInfo.shaba.replace(/\s/g, "")}
                  onCopied={() => notify("شبا در کلیپ‌بورد کپی شد")}
                  className="border-white/15 bg-white/5 text-paper/80 hover:border-brand hover:text-white"
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2.5">
              <span className="flex items-center gap-2 text-[11px] font-bold text-paper/60">
                <span className="pulse-dot h-2 w-2 rounded-full bg-mint" />
                حالت زنده
              </span>
              <span className="font-num text-[9.5px] tracking-widest text-paper/35" dir="ltr">
                LIVE API
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* ---------- محتوای اصلی ---------- */}
      <div inert={sideOpen && !desktop} className="flex min-w-0 flex-1 flex-col">
        {/* هدر */}
        <header className="app-header sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur-sm">
          <div className="flex items-center gap-2 px-3 py-2 sm:gap-3 sm:px-6 sm:py-3">
            <button
              ref={menuButtonRef}
              onClick={() => setSideOpen(true)}
              aria-label="باز کردن منو"
              aria-expanded={sideOpen}
              aria-controls="main-navigation"
              className="touch-target rounded-lg border border-line bg-card p-2 text-ink-700 transition hover:border-brand/40 hover:text-brand lg:hidden"
            >
              <Icon name="menu" className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-[17px] font-black text-ink-900">{TITLES[tab][0]}</h1>
              <p className="hidden truncate text-[11.5px] text-ink-400 sm:block">{TITLES[tab][1]}</p>
            </div>
            <Badge kind="neutral" className="hidden md:inline-flex">
              <Icon name="lock" className="h-3 w-3" />
              اتصال امن به بک‌اند
            </Badge>
            <span className="hidden text-[12px] font-bold text-ink-500 sm:block">{faDate(new Date().toISOString())}</span>
            <button
              onClick={() => setResetOpen(true)}
              title="بازخوانی داده‌های سرور"
              aria-label="بازخوانی داده‌های سرور"
              className="touch-target rounded-lg border border-line bg-card p-2 text-ink-500 transition hover:border-rust/40 hover:text-rust"
            >
              <Icon name="refresh" className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* تیکر زنده */}
          <div className="ticker relative overflow-hidden border-t border-linefaint bg-ink-900 py-1.5">
            <div className="ticker-track">
              {[...ticker, ...ticker].map((it, i) => (
                <span key={i} className="me-11 flex items-center gap-2 text-[11.5px] whitespace-nowrap">
                  <svg viewBox="0 0 8 8" className="h-2 w-2 text-brand" fill="currentColor" aria-hidden>
                    <path d="M4 0 8 4 4 8 0 4Z" />
                  </svg>
                  <b className="font-bold text-paper/55">{it.l}</b>
                  <bdi dir="ltr" className="font-num text-[11.5px] font-bold text-white">
                    {it.v}
                  </bdi>
                </span>
              ))}
            </div>
          </div>
        </header>

        {/* صفحه فعال */}
        <main className="min-w-0 flex-1 px-3 py-5 sm:px-6 sm:py-6 lg:px-8">
          <div key={tab} className="mx-auto min-w-0 max-w-[1200px]">
            {tab === "dash" && <Dashboard {...dashProps} />}
            {tab === "vault" && <Treasury {...treasuryProps} />}
            {tab === "sales" && <Sales {...salesProps} />}
            {tab === "accounts" && <Accounting {...accountingProps} />}
            {tab === "support" && <Support {...supportProps} />}
          </div>
        </main>

        <footer className="app-footer border-t border-linefaint px-4 py-5 sm:px-6">
          <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-3 text-center sm:flex-row sm:items-center sm:gap-4 sm:text-start">
            <Logo variant="full" className="h-16 w-16" title="CENTRAL MINE" />
            <p className="min-w-0 text-[11px] leading-6 text-ink-400">
              پنل مدیریت <b className="font-bold text-ink-700">CENTRAL MINE</b> (راب‌ساز) — داده‌ها از بک‌اند
              سمت سرور به‌صورت امن و زنده بارگذاری می‌شوند و به‌صورت لحظه‌ای روی سرور ذخیره می‌شوند.
            </p>
          </div>
        </footer>
      </div>

      {/* ---------- توست ---------- */}
      <div aria-live="polite" aria-atomic="false" className="toast-stack pointer-events-none fixed z-[70] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="toast-in pointer-events-auto flex items-start gap-2.5 rounded-xl border border-white/10 bg-ink-900 px-4 py-3 text-paper shadow-xl shadow-ink-950/30"
          >
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mint/20 text-mint">
              <Icon name="check" className="h-3 w-3" sw={2.4} />
            </span>
            <p className="min-w-0 text-[12.5px] font-semibold leading-6 [overflow-wrap:anywhere]">{t.msg}</p>
          </div>
        ))}
      </div>

      {/* ---------- تأیید بازنشانی ---------- */}
      <Modal open={resetOpen} onClose={() => setResetOpen(false)} title="بازخوانی داده‌های سرور" icon="refresh">
        <p className="text-[13px] leading-7 text-ink-700">
          داده‌های پنل از سرور دوباره بارگذاری می‌شوند تا آخرین وضعیت واقعی سایت جایگزین داده‌های محلی شود. این عمل داده‌های نمونه را بازنمی‌گرداند.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Btn
            kind="danger"
            icon="refresh"
            className="flex-1"
            onClick={() => {
              setResetOpen(false);
              setDbReady(false);
              refreshFromServer();
              notify("داده‌های سرور دوباره بارگذاری شد");
            }}
          >
            بله، بازخوانی شود
          </Btn>
          <Btn kind="ghost" onClick={() => setResetOpen(false)}>
            انصراف
          </Btn>
        </div>
      </Modal>
    </div>
  );
}
