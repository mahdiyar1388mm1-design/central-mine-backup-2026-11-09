/* ---------- انواع داده پنل مدیریت ---------- */

export type Unit = "RBZ" | "IRR";

export type JournalCategory =
  | "خزانه"
  | "بازخرید"
  | "فروش محصولات"
  | "کارمزد"
  | "بازگشت استیک"
  | "بازگشت پایه"
  | "هزینه"
  | "درآمد"
  | "سایر";

export interface JournalEntry {
  id: string;
  at: string; // ISO
  title: string;
  category: JournalCategory;
  dir: "in" | "out";
  amount: number;
  unit: Unit;
  note?: string;
  ref?: string; // شناسه آیتم مرتبط
}

export interface StakeReturn {
  id: string;
  user: string;
  staked: number; // RBZ
  daysLeft: number; // روزهای مانده دوره (بیش از ۳۰۰۰)
  at: string;
  note?: string;
}

export interface BaseReturn {
  id: string;
  user: string;
  amount: number; // RBZ
  at: string;
  note?: string;
}

export interface Fee {
  id: string;
  user: string;
  kind: "واریز" | "برداشت" | "استیک";
  amount: number; // RBZ
  at: string;
}

export interface Buyback {
  id: string;
  at: string;
  rbz: number;
  irr: number;
  shaba: string;
  note?: string;
}

export type ProductTone = "rose" | "mint" | "ink" | "sand";

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number; // تومان
  stock: number;
  sold: number;
  active: boolean;
  description: string;
  tone: ProductTone;
}

export type ProductDraft = Pick<
  Product,
  "name" | "sku" | "category" | "price" | "stock" | "description" | "tone"
>;

export type SaleStatus = "pending" | "paid" | "shipped" | "cancelled";
export type PaymentMethod = "online" | "card" | "shaba";

export interface SaleOrder {
  id: string;
  code: string;
  at: string;
  buyer: string;
  phone?: string;
  productId: string;
  productName: string;
  qty: number;
  unitPrice: number;
  total: number;
  status: SaleStatus;
  payment: PaymentMethod;
  tracking?: string;
  note?: string;
}

export interface SaleDraft {
  productId: string;
  qty: number;
  buyer: string;
  phone: string;
  payment: PaymentMethod;
  tracking: string;
  note: string;
  at: string;
  status: Extract<SaleStatus, "pending" | "paid" | "shipped">;
}

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  online: "درگاه آنلاین",
  card: "کارت به کارت",
  shaba: "واریز به شبا",
};

export const SALE_STATUS_META: Record<SaleStatus, { label: string; short: string }> = {
  pending: { label: "در انتظار پرداخت", short: "در انتظار" },
  paid: { label: "پرداخت شده", short: "پرداخت‌شده" },
  shipped: { label: "ارسال شده", short: "ارسال‌شده" },
  cancelled: { label: "لغو شده", short: "لغو‌شده" },
};

export interface ChatMsg {
  id: string;
  from: "user" | "agent";
  text: string;
  at: string;
}

export interface Chat {
  id: string;
  name: string;
  handle: string;
  status: "open" | "waiting" | "resolved";
  unread: number;
  msgs: ChatMsg[];
}

export interface Treasury {
  asset: number; // دارایی: توکن پایه خزانه (فروشیده/فعال‌نشده)
  marketPrice: number; // تومان / RBZ (دستی)
  buybackInfo: { bank: string; holder: string; shaba: string };
  stakeReturns: StakeReturn[];
  baseReturns: BaseReturn[];
  fees: Fee[];
  buybacks: Buyback[];
}

export interface DB {
  version: number;
  treasury: Treasury;
  products: Product[];
  sales: SaleOrder[];
  journal: JournalEntry[];
  chats: Chat[];
  meta?: {
    users?: number;
    wallets?: number;
    generatedAt?: string;
  };
}

/* ---------- کمک‌کننده‌ها ---------- */

export const uid = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

export const dAgo = (days: number, hour = 10): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, (days * 17) % 60, 0, 0);
  return d.toISOString();
};

const nf = new Intl.NumberFormat("en-US");
export const fmt = (n: number): string => nf.format(Math.round(n));
export const fmtIRR = (n: number): string => nf.format(Math.round(n));

const faDateFmt = new Intl.DateTimeFormat("fa-IR-u-nu-latn", {
  day: "numeric",
  month: "long",
  year: "numeric",
});
export const faDate = (iso: string): string => {
  try {
    return faDateFmt.format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
};

const faTimeFmt = new Intl.DateTimeFormat("fa-IR-u-nu-latn", {
  hour: "2-digit",
  minute: "2-digit",
});
export const faTime = (iso: string): string => {
  try {
    return faTimeFmt.format(new Date(iso));
  } catch {
    return "";
  }
};

export const todayISO = (): string => new Date().toISOString().slice(0, 10);

export const sum = <T,>(arr: T[], f: (t: T) => number): number =>
  arr.reduce((a, b) => a + f(b), 0);

export const saleIsRevenue = (sale: SaleOrder): boolean =>
  sale.status === "paid" || sale.status === "shipped";

/** درآمد فروش محصولات در N روز اخیر (قدیمی → جدید) */
export const salesSeries = (sales: SaleOrder[], days = 7): number[] => {
  const out: number[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date();
    day.setDate(day.getDate() - i);
    const key = day.toISOString().slice(0, 10);
    out.push(
      sum(
        sales.filter((sale) => sale.at.slice(0, 10) === key && saleIsRevenue(sale)),
        (sale) => sale.total
      )
    );
  }
  return out;
};

/** مجموع کارمزد هر روز در N روز اخیر (قدیمی → جدید) */
export const feeSeries = (fees: Fee[], days = 7): number[] => {
  const out: number[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date();
    day.setDate(day.getDate() - i);
    const key = day.toISOString().slice(0, 10);
    out.push(sum(fees.filter((f) => f.at.slice(0, 10) === key), (f) => f.amount));
  }
  return out;
};

/* ---------- داده اولیه (Seed) ---------- */

export function seedDB(): DB {
  return {
    version: 2,
    treasury: {
      asset: 15_000_000,
      marketPrice: 12_500,
      buybackInfo: {
        bank: "بانک ملی ایران — شعبه مرکزی",
        holder: "شرکت راب‌ساز فناوری (حساب شرکتی)",
        shaba: "IR65 0540 1029 9213 4005 1320 479",
      },
      stakeReturns: [
        {
          id: "sr1",
          user: "0x8f3A…c41d",
          staked: 120_000,
          daysLeft: 3120,
          at: dAgo(2, 14),
          note: "فروش قبل از اتمام دوره — بازمحورده به شبکه",
        },
        {
          id: "sr2",
          user: "کاربر #2041",
          staked: 84_300,
          daysLeft: 3055,
          at: dAgo(5, 11),
          note: "خاتمه زودهنگام استیک",
        },
        {
          id: "sr3",
          user: "0x77b2…9e02",
          staked: 63_900,
          daysLeft: 3410,
          at: dAgo(9, 16),
          note: "بازگشت خودکار طبق قرارداد",
        },
      ],
      baseReturns: [
        {
          id: "br1",
          user: "بسته فروش #F-118",
          amount: 420_000,
          at: dAgo(1, 9),
          note: "توکن پایه خریداری‌شده در فروش مرحله‌ای",
        },
        {
          id: "br2",
          user: "بسته فروش #F-117",
          amount: 310_000,
          at: dAgo(4, 12),
        },
        {
          id: "br3",
          user: "بسته فروش #F-115",
          amount: 510_000,
          at: dAgo(8, 15),
          note: "شامل حق‌السهم فعال‌سازی",
        },
      ],
      fees: [
        { id: "f1", user: "کاربر #1102", kind: "برداشت", amount: 18_400, at: dAgo(0, 9) },
        { id: "f2", user: "0x31aa…77fd", kind: "واریز", amount: 30_200, at: dAgo(1, 13) },
        { id: "f3", user: "کاربر #0977", kind: "استیک", amount: 12_900, at: dAgo(1, 18) },
        { id: "f4", user: "0x9cd1…2b40", kind: "واریز", amount: 22_100, at: dAgo(2, 10) },
        { id: "f5", user: "کاربر #2210", kind: "برداشت", amount: 15_750, at: dAgo(3, 11) },
        { id: "f6", user: "0x55e0…a9c2", kind: "واریز", amount: 41_800, at: dAgo(4, 17) },
        { id: "f7", user: "کاربر #1633", kind: "استیک", amount: 12_500, at: dAgo(5, 14) },
        { id: "f8", user: "0x128b…40de", kind: "برداشت", amount: 9_600, at: dAgo(6, 12) },
      ],
      buybacks: [
        {
          id: "bb1",
          at: dAgo(3, 15),
          rbz: 250_000,
          irr: 3_125_000_000,
          shaba: "IR88 0102 6325 4410 8872 6511 336",
          note: "بازخرید مرحله ۲ — خرید از بازار ثانویه",
        },
        {
          id: "bb2",
          at: dAgo(12, 12),
          rbz: 150_000,
          irr: 1_875_000_000,
          shaba: "IR41 1910 0025 8834 6671 2095 881",
          note: "بازخرید مرحله ۱ — پس از اعلام عمومی",
        },
      ],
    },
    products: [
      {
        id: "p1",
        name: "کیف پول سخت‌افزاری رابسیف",
        sku: "RBZ-HW-01",
        category: "سخت‌افزار",
        price: 4_850_000,
        stock: 24,
        sold: 41,
        active: true,
        description: "کیف پول سخت‌افزاری با پشتیبانی کامل از توکن پایه RBZ و امضای چندامضایی.",
        tone: "rose",
      },
      {
        id: "p2",
        name: "بسته استارتر ماینینگ",
        sku: "RBZ-MN-02",
        category: "سخت‌افزار",
        price: 128_000_000,
        stock: 7,
        sold: 12,
        active: true,
        description: "سه دستگاه ماینر رومیزی، منبع تغذیه و راه‌اندازی اولیه توسط تیم راب‌ساز.",
        tone: "ink",
      },
      {
        id: "p3",
        name: "اشتراک سالانه پنل سرمایه",
        sku: "RBZ-PRO-03",
        category: "اشتراک دیجیتال",
        price: 24_000_000,
        stock: 87,
        sold: 33,
        active: true,
        description: "دسترسی یک‌ساله به تحلیل بازار، مدیریت استیک و گزارش‌های حرفه‌ای سرمایه‌گذاری.",
        tone: "mint",
      },
      {
        id: "p4",
        name: "کارت هدیه توکن پایه RBZ",
        sku: "RBZ-GIFT-04",
        category: "کارت هدیه",
        price: 6_250_000,
        stock: 40,
        sold: 58,
        active: true,
        description: "کارت هدیه دیجیتال معادل ۵۰۰ واحد توکن پایه؛ مناسب هدیه و شروع سرمایه‌گذاری.",
        tone: "sand",
      },
    ],
    sales: [
      {
        id: "o1",
        code: "S-1407",
        at: dAgo(0, 11),
        buyer: "سارا محمدی",
        phone: "0912 345 6789",
        productId: "p1",
        productName: "کیف پول سخت‌افزاری رابسیف",
        qty: 1,
        unitPrice: 4_850_000,
        total: 4_850_000,
        status: "paid",
        payment: "online",
        tracking: "ZP-928114",
        note: "ارسال با پست پیشتاز",
      },
      {
        id: "o2",
        code: "S-1406",
        at: dAgo(1, 16),
        buyer: "امیر رضایی",
        phone: "0913 208 4410",
        productId: "p3",
        productName: "اشتراک سالانه پنل سرمایه",
        qty: 1,
        unitPrice: 24_000_000,
        total: 24_000_000,
        status: "pending",
        payment: "shaba",
        tracking: "IR-55201",
        note: "در انتظار تأیید واریز شبا",
      },
      {
        id: "o3",
        code: "S-1405",
        at: dAgo(2, 12),
        buyer: "شرکت آبان پردازش",
        phone: "021 8812 9041",
        productId: "p2",
        productName: "بسته استارتر ماینینگ",
        qty: 1,
        unitPrice: 128_000_000,
        total: 128_000_000,
        status: "shipped",
        payment: "card",
        tracking: "TRK-77120",
        note: "تحویل حضوری در دفتر مرکزی",
      },
      {
        id: "o4",
        code: "S-1404",
        at: dAgo(4, 9),
        buyer: "مهسا قاسمی",
        phone: "0936 774 1290",
        productId: "p4",
        productName: "کارت هدیه توکن پایه RBZ",
        qty: 2,
        unitPrice: 6_250_000,
        total: 12_500_000,
        status: "paid",
        payment: "online",
        tracking: "ZP-881907",
      },
      {
        id: "o5",
        code: "S-1403",
        at: dAgo(6, 13),
        buyer: "نرگس احمدی",
        phone: "0912 660 2201",
        productId: "p1",
        productName: "کیف پول سخت‌افزاری رابسیف",
        qty: 1,
        unitPrice: 4_850_000,
        total: 4_850_000,
        status: "cancelled",
        payment: "online",
        note: "لغو به درخواست خریدار پیش از ارسال",
      },
      {
        id: "o6",
        code: "S-1402",
        at: dAgo(8, 15),
        buyer: "علی کریمی",
        phone: "0902 118 7734",
        productId: "p3",
        productName: "اشتراک سالانه پنل سرمایه",
        qty: 2,
        unitPrice: 24_000_000,
        total: 48_000_000,
        status: "shipped",
        payment: "shaba",
        tracking: "IR-48721",
        note: "صدور دو لایسنس برای حساب‌های شرکتی",
      },
      {
        id: "o7",
        code: "S-1401",
        at: dAgo(10, 10),
        buyer: "رضا شریفی",
        phone: "0919 402 8611",
        productId: "p1",
        productName: "کیف پول سخت‌افزاری رابسیف",
        qty: 3,
        unitPrice: 4_850_000,
        total: 14_550_000,
        status: "paid",
        payment: "card",
        tracking: "TRK-74201",
      },
    ],
    journal: [
      {
        id: "j1",
        at: dAgo(14, 10),
        title: "انتقال اولیه به خزانه",
        category: "خزانه",
        dir: "in",
        amount: 15_000_000,
        unit: "RBZ",
        note: "سهام‌نامه تأسیس — توکن پایه فعال‌نشده",
      },
      {
        id: "j2",
        at: dAgo(12, 12),
        title: "پرداخت ریالی بازخرید مرحله ۱",
        category: "بازخرید",
        dir: "out",
        amount: 1_875_000_000,
        unit: "IRR",
        note: "واریز از حساب شرکتی",
      },
      {
        id: "j3",
        at: dAgo(12, 13),
        title: "بازگشت توکن بازخریدی به خزانه",
        category: "بازخرید",
        dir: "in",
        amount: 150_000,
        unit: "RBZ",
        note: "مرحله ۱",
      },
      {
        id: "j4",
        at: dAgo(9, 9),
        title: "هزینه سرور و زیرساخت",
        category: "هزینه",
        dir: "out",
        amount: 48_500_000,
        unit: "IRR",
        note: "فاکتور #S-220",
      },
      {
        id: "j5",
        at: dAgo(8, 11),
        title: "درآمد مشارکت با صرافی",
        category: "درآمد",
        dir: "in",
        amount: 120_000_000,
        unit: "IRR",
        note: "سهم از کارمزد معاملات",
      },
      {
        id: "j6",
        at: dAgo(5, 11),
        title: "بازگشت استیک به شبکه — کاربر #2041",
        category: "بازگشت استیک",
        dir: "out",
        amount: 84_300,
        unit: "RBZ",
        ref: "sr2",
      },
      {
        id: "j7",
        at: dAgo(3, 15),
        title: "پرداخت ریالی بازخرید مرحله ۲",
        category: "بازخرید",
        dir: "out",
        amount: 3_125_000_000,
        unit: "IRR",
        note: "واریز از حساب شرکتی",
      },
      {
        id: "j8",
        at: dAgo(2, 14),
        title: "بازگشت استیک به شبکه — 0x8f3A…c41d",
        category: "بازگشت استیک",
        dir: "out",
        amount: 120_000,
        unit: "RBZ",
        ref: "sr1",
      },
      {
        id: "j9",
        at: dAgo(1, 16),
        title: "هزینه تبلیغات شبکه",
        category: "هزینه",
        dir: "out",
        amount: 75_000_000,
        unit: "IRR",
        note: "کمپین تیزری — فاز ۱",
      },
      {
        id: "j10",
        at: dAgo(0, 11),
        title: "فروش محصول — کیف پول سخت‌افزاری رابسیف × ۱",
        category: "فروش محصولات",
        dir: "in",
        amount: 4_850_000,
        unit: "IRR",
        note: "خریدار: سارا محمدی — درگاه آنلاین",
        ref: "o1",
      },
      {
        id: "j11",
        at: dAgo(2, 12),
        title: "فروش محصول — بسته استارتر ماینینگ × ۱",
        category: "فروش محصولات",
        dir: "in",
        amount: 128_000_000,
        unit: "IRR",
        note: "خریدار: شرکت آبان پردازش — کارت به کارت",
        ref: "o3",
      },
      {
        id: "j12",
        at: dAgo(4, 9),
        title: "فروش محصول — کارت هدیه توکن پایه RBZ × ۲",
        category: "فروش محصولات",
        dir: "in",
        amount: 12_500_000,
        unit: "IRR",
        note: "خریدار: مهسا قاسمی — درگاه آنلاین",
        ref: "o4",
      },
      {
        id: "j13",
        at: dAgo(8, 15),
        title: "فروش محصول — اشتراک سالانه پنل سرمایه × ۲",
        category: "فروش محصولات",
        dir: "in",
        amount: 48_000_000,
        unit: "IRR",
        note: "خریدار: علی کریمی — واریز به شبا",
        ref: "o6",
      },
      {
        id: "j14",
        at: dAgo(10, 10),
        title: "فروش محصول — کیف پول سخت‌افزاری رابسیف × ۳",
        category: "فروش محصولات",
        dir: "in",
        amount: 14_550_000,
        unit: "IRR",
        note: "خریدار: رضا شریفی — کارت به کارت",
        ref: "o7",
      },
    ],
    chats: [
      {
        id: "c1",
        name: "سارا محمدی",
        handle: "@sara.m",
        status: "open",
        unread: 2,
        msgs: [
          {
            id: "m1",
            from: "user",
            text: "سلام، توکن‌های استیک‌م زودتر آزاد شد؛ الان کجاشون رو ببینم؟",
            at: dAgo(1, 18),
          },
          {
            id: "m2",
            from: "agent",
            text: "سلام سارا جان، وقت بخیر. بله، طبق شرایط دوره استیک، در صورت خاتمه قبل از اتمام، معادل توکن پایه به شبکه بازمی‌گردد.",
            at: dAgo(1, 18),
          },
          {
            id: "m3",
            from: "user",
            text: "می‌گم اگه دوره‌ام تموم نشده و توکن پایه‌هام فروخته شده، مابقی به حسابم نمیاد؟",
            at: dAgo(0, 9),
          },
          {
            id: "m4",
            from: "user",
            text: "ممنونم که جواب بدید، چند ساعته منتظرم 🙂",
            at: dAgo(0, 10),
          },
        ],
      },
      {
        id: "c2",
        name: "امیر رضایی",
        handle: "@amir.r",
        status: "waiting",
        unread: 1,
        msgs: [
          {
            id: "m1",
            from: "user",
            text: "سلام، شبا شرکت برای بازخرید رو می‌فرستید؟",
            at: dAgo(1, 11),
          },
          {
            id: "m2",
            from: "agent",
            text: "سلام امیر عزیز. شبا شرکتی: IR65 0540 1029 9213 4005 1320 479 — با ذکر کد کاربری لطفاً واریز کنید.",
            at: dAgo(1, 11),
          },
          {
            id: "m3",
            from: "user",
            text: "ارسال کردم، لطفاً صحت واریز رو چک کنید 🙏",
            at: dAgo(0, 8),
          },
        ],
      },
      {
        id: "c3",
        name: "نرگس احمدی",
        handle: "@narges.a",
        status: "resolved",
        unread: 0,
        msgs: [
          {
            id: "m1",
            from: "user",
            text: "فاکتور کارمزد برداشت رو می‌تونم ببینم؟",
            at: dAgo(3, 12),
          },
          {
            id: "m2",
            from: "agent",
            text: "بله، جزئیات کارمزد همراه با مشخصات پرداخت ثبت شده است. در صورت نیاز، رسید شبا را برایتان ارسال می‌کنیم.",
            at: dAgo(3, 12),
          },
          { id: "m3", from: "user", text: "ممنون 🌷", at: dAgo(3, 13) },
          {
            id: "m4",
            from: "agent",
            text: "خواهش می‌کنم. اگر سؤال دیگری بود در خدمتم.",
            at: dAgo(3, 13),
          },
        ],
      },
      {
        id: "c4",
        name: "علی کریمی",
        handle: "@ali.k",
        status: "open",
        unread: 3,
        msgs: [
          {
            id: "m1",
            from: "user",
            text: "برداشت من ۳ روز است درگیریه، چرا هنوز تسویه نشد؟",
            at: dAgo(2, 15),
          },
          { id: "m2", from: "user", text: "تیکت #4120", at: dAgo(2, 15) },
          { id: "m3", from: "user", text: "لطفاً پیگیری کنید، منتظر پاسخم", at: dAgo(1, 9) },
        ],
      },
      {
        id: "c5",
        name: "مهسا قاسمی",
        handle: "@mehsa.q",
        status: "waiting",
        unread: 0,
        msgs: [
          {
            id: "m1",
            from: "user",
            text: "درصد کارمزد واریز چقدره؟",
            at: dAgo(4, 10),
          },
          {
            id: "m2",
            from: "agent",
            text: "سلام مهسا جان. کارمزد واریز ۱٫۵٪ است و در بخش پرداخت‌ها شما به صورت لحظه‌ای نمایش داده می‌شود.",
            at: dAgo(4, 10),
          },
          { id: "m3", from: "user", text: "باشه ممنون، فعلاً منتظرم", at: dAgo(4, 11) },
        ],
      },
    ],
  };
}

/**
 * داده‌های نسخه‌های قبلی (بدون بخش محصولات) را بدون پاک‌کردن ثبت‌های کاربر
 * به ساختار جدید منتقل می‌کند.
 */
export function normalizeDB(input: unknown): DB {
  const seed = seedDB();
  if (!input || typeof input !== "object") return seed;

  const raw = input as Partial<DB>;
  const hasProducts = Object.prototype.hasOwnProperty.call(raw, "products") && Array.isArray(raw.products);
  const hasSales = Object.prototype.hasOwnProperty.call(raw, "sales") && Array.isArray(raw.sales);
  const hasJournal = Object.prototype.hasOwnProperty.call(raw, "journal") && Array.isArray(raw.journal);
  const hasChats = Object.prototype.hasOwnProperty.call(raw, "chats") && Array.isArray(raw.chats);

  const journal = hasJournal ? raw.journal : seed.journal;
  const products = hasProducts ? raw.products : seed.products;
  const sales = hasSales ? (raw.sales as SaleOrder[]) : seed.sales;
  const chats = hasChats ? raw.chats : seed.chats;

  const seededProductEntries = seed.journal.filter((entry) => entry.category === "فروش محصولات");
  const mergedJournal = hasSales
    ? journal
    : [...journal, ...seededProductEntries.filter((entry) => !journal.some((item) => item.id === entry.id))];

  return {
    ...seed,
    ...raw,
    version: 2,
    treasury: raw.treasury ?? seed.treasury,
    products,
    sales,
    journal: mergedJournal,
    chats,
    meta: {
      ...(seed as DB).meta,
      ...(raw.meta ?? {}),
      users: raw.meta?.users ?? (seed as DB).meta?.users ?? 0,
      wallets: raw.meta?.wallets ?? (seed as DB).meta?.wallets ?? 0,
      generatedAt: raw.meta?.generatedAt ?? (seed as DB).meta?.generatedAt ?? new Date().toISOString(),
    },
  };
}
