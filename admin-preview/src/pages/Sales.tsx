import { useMemo, useState } from "react";
import {
  PAYMENT_LABELS,
  SALE_STATUS_META,
  faDate,
  fmt,
  saleIsRevenue,
  salesSeries,
  sum,
  todayISO,
  type PaymentMethod,
  type Product,
  type ProductDraft,
  type ProductTone,
  type SaleDraft,
  type SaleOrder,
  type SaleStatus,
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

export interface SalesProps {
  products: Product[];
  sales: SaleOrder[];
  shaba: string;
  saveProduct: (draft: ProductDraft, productId?: string) => void;
  toggleProduct: (id: string) => void;
  addSale: (draft: SaleDraft) => void;
  changeSaleStatus: (id: string, status: SaleStatus) => void;
  removeSale: (id: string) => void;
  notify: (msg: string) => void;
}

const CATEGORIES = ["سخت‌افزار", "اشتراک دیجیتال", "کارت هدیه", "بسته سرمایه‌گذاری", "لوازم جانبی", "سایر"];

const TONES: { value: ProductTone; label: string; swatch: string }[] = [
  { value: "rose", label: "صورتی", swatch: "bg-brand" },
  { value: "mint", label: "سبز", swatch: "bg-mint" },
  { value: "ink", label: "تیره", swatch: "bg-ink-800" },
  { value: "sand", label: "کهربایی", swatch: "bg-amber" },
];

const toneArt: Record<ProductTone, string> = {
  rose: "bg-[linear-gradient(140deg,#df1579_0%,#b5065c_55%,#73023a_100%)]",
  mint: "bg-[linear-gradient(140deg,#119b78_0%,#0a725a_55%,#064b3d_100%)]",
  ink: "bg-[linear-gradient(140deg,#3a304b_0%,#251f33_55%,#15111d_100%)]",
  sand: "bg-[linear-gradient(140deg,#c4923d_0%,#a27223_55%,#70480f_100%)]",
};

const statusKind: Record<SaleStatus, "amber" | "mint" | "brand" | "rust"> = {
  pending: "amber",
  paid: "mint",
  shipped: "brand",
  cancelled: "rust",
};

const th = "px-3 py-2.5 text-right text-[11.5px] font-bold text-ink-400 whitespace-nowrap";
const td = "px-3 py-3 text-[13px] text-ink-800 border-t border-linefaint";

interface ProductForm {
  name: string;
  sku: string;
  category: string;
  price: string;
  stock: string;
  description: string;
  tone: ProductTone;
}

interface OrderForm {
  productId: string;
  qty: string;
  buyer: string;
  phone: string;
  payment: PaymentMethod;
  tracking: string;
  note: string;
  at: string;
  status: Extract<SaleStatus, "pending" | "paid" | "shipped">;
}

const emptyProduct = (): ProductForm => ({
  name: "",
  sku: "",
  category: "سخت‌افزار",
  price: "",
  stock: "",
  description: "",
  tone: "rose",
});

const makeOrderForm = (productId = ""): OrderForm => ({
  productId,
  qty: "1",
  buyer: "",
  phone: "",
  payment: "online",
  tracking: "",
  note: "",
  at: todayISO(),
  status: "paid",
});

const productIcon = (category: string): string => {
  if (category.includes("سخت")) return "box";
  if (category.includes("اشتراک")) return "spark";
  if (category.includes("هدیه")) return "tag";
  if (category.includes("بسته")) return "coin";
  return "bag";
};

export default function Sales({
  products,
  sales,
  shaba,
  saveProduct,
  toggleProduct,
  addSale,
  changeSaleStatus,
  removeSale,
  notify,
}: SalesProps) {
  const [productOpen, setProductOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<ProductForm>(emptyProduct);
  const [orderOpen, setOrderOpen] = useState(false);
  const [orderForm, setOrderForm] = useState<OrderForm>(() => makeOrderForm());
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | SaleStatus>("all");
  const [query, setQuery] = useState("");

  const revenueSales = useMemo(() => sales.filter(saleIsRevenue), [sales]);
  const revenue = sum(revenueSales, (sale) => sale.total);
  const units = sum(revenueSales, (sale) => sale.qty);
  const pendingSales = sales.filter((sale) => sale.status === "pending");
  const activeSales = sales.filter((sale) => sale.status !== "cancelled");
  const series = salesSeries(sales, 7);
  const weekRevenue = sum(series, (value) => value);

  const bestseller = useMemo(() => {
    return products
      .map((product) => {
        const productSales = revenueSales.filter((sale) => sale.productId === product.id);
        return {
          product,
          units: sum(productSales, (sale) => sale.qty),
          amount: sum(productSales, (sale) => sale.total),
        };
      })
      .sort((a, b) => b.units - a.units)[0];
  }, [products, revenueSales]);

  const orders = useMemo(() => {
    const term = query.trim();
    return [...sales]
      .sort((a, b) => b.at.localeCompare(a.at))
      .filter((sale) => statusFilter === "all" || sale.status === statusFilter)
      .filter(
        (sale) =>
          !term ||
          sale.buyer.includes(term) ||
          sale.code.includes(term) ||
          sale.productName.includes(term) ||
          (sale.tracking ?? "").includes(term) ||
          (sale.phone ?? "").includes(term)
      );
  }, [sales, statusFilter, query]);

  const selectedProduct = products.find((product) => product.id === orderForm.productId);
  const orderQty = parseInt(orderForm.qty || "0", 10);
  const orderTotal = (selectedProduct?.price ?? 0) * (orderQty || 0);
  const sellingProducts = products.filter((product) => product.active && product.stock > 0);
  const orderToDelete = sales.find((sale) => sale.id === deleteId);
  const counts: Record<"all" | SaleStatus, number> = {
    all: sales.length,
    pending: sales.filter((sale) => sale.status === "pending").length,
    paid: sales.filter((sale) => sale.status === "paid").length,
    shipped: sales.filter((sale) => sale.status === "shipped").length,
    cancelled: sales.filter((sale) => sale.status === "cancelled").length,
  };

  const openNewOrder = () => {
    if (sellingProducts.length === 0) {
      notify("هیچ محصول فعالی با موجودی مناسب برای فروش وجود ندارد");
      return;
    }
    setOrderForm(makeOrderForm(sellingProducts[0].id));
    setOrderOpen(true);
  };

  const openNewProduct = () => {
    setEditId(null);
    setProductForm({
      ...emptyProduct(),
      sku: `RBZ-P-${String(products.length + 1).padStart(2, "0")}`,
    });
    setProductOpen(true);
  };

  const openEditProduct = (product: Product) => {
    setEditId(product.id);
    setProductForm({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
      description: product.description,
      tone: product.tone,
    });
    setProductOpen(true);
  };

  const submitProduct = () => {
    const name = productForm.name.trim();
    const sku = productForm.sku.trim();
    const price = parseInt(productForm.price || "0", 10);
    const stock = parseInt(productForm.stock || "0", 10);

    if (!name || !sku) {
      notify("نام و شناسه محصول الزامی است");
      return;
    }
    if (price <= 0) {
      notify("قیمت محصول باید بیشتر از صفر باشد");
      return;
    }
    if (Number.isNaN(stock) || stock < 0) {
      notify("موجودی محصول نمی‌تواند منفی باشد");
      return;
    }
    const duplicate = products.some(
      (product) => product.id !== editId && product.sku.trim().toLowerCase() === sku.toLowerCase()
    );
    if (duplicate) {
      notify("این شناسه محصول قبلاً استفاده شده است");
      return;
    }

    saveProduct(
      {
        name,
        sku,
        price,
        stock,
        category: productForm.category,
        description: productForm.description.trim(),
        tone: productForm.tone,
      },
      editId ?? undefined
    );
    setProductOpen(false);
    notify(editId ? "محصول با موفقیت ویرایش شد" : "محصول جدید به ویترین اضافه شد");
  };

  const submitOrder = () => {
    if (!selectedProduct) {
      notify("یک محصول برای ثبت سفارش انتخاب کنید");
      return;
    }
    if (!orderForm.buyer.trim()) {
      notify("نام خریدار را وارد کنید");
      return;
    }
    if (!orderQty || orderQty < 1) {
      notify("تعداد سفارش باید حداقل ۱ باشد");
      return;
    }
    if (orderQty > selectedProduct.stock) {
      notify(`موجودی ${selectedProduct.name} کافی نیست (حداکثر ${selectedProduct.stock} عدد)`);
      return;
    }
    addSale({
      productId: selectedProduct.id,
      qty: orderQty,
      buyer: orderForm.buyer.trim(),
      phone: orderForm.phone.trim(),
      payment: orderForm.payment,
      tracking: orderForm.tracking.trim(),
      note: orderForm.note.trim(),
      at: new Date((orderForm.at || todayISO()) + "T12:00:00").toISOString(),
      status: orderForm.status,
    });
    setOrderOpen(false);
    notify(
      `سفارش ${selectedProduct.name} ثبت شد؛ موجودی کسر و سند درآمد در حسابداری ایجاد گردید`
    );
  };

  return (
    <div className="min-w-0 space-y-6 sm:space-y-8">
      <SectionTitle
        title="فروش محصولات"
        desc="ویترین محصولات، سفارش‌ها و درآمد فروش — موجودی و اسناد حسابداری به‌صورت خودکار به‌روز می‌شوند."
        action={
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <Btn kind="ghost" icon="box" className="flex-1 sm:flex-none" onClick={openNewProduct}>
              افزودن محصول
            </Btn>
            <Btn icon="bag" className="flex-1 sm:flex-none" onClick={openNewOrder}>
              ثبت فروش
            </Btn>
          </div>
        }
      />

      {/* ---------- خلاصه فروش ---------- */}
      <div className="noise rv relative overflow-hidden rounded-2xl bg-ink-900 p-4 text-paper shadow-lg shadow-ink-950/20 sm:p-6">
        <div className="relative z-[2]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white shadow-sm shadow-brand/30">
                <Icon name="bag" className="h-[18px] w-[18px]" />
              </span>
              <div>
                <p className="text-[13px] font-extrabold">ویترین فروش</p>
                <p className="text-[10.5px] text-paper/45">نمای کلی فروش محصولات</p>
              </div>
            </div>
            <Badge className="border-white/15 bg-white/10 text-paper">
              <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-mint" />
              به‌روزرسانی آنی
            </Badge>
          </div>

          <div className="mt-5 grid min-w-0 gap-4 lg:grid-cols-[1.25fr_1fr]">
            <div className="min-w-0">
              <p className="text-[11.5px] font-semibold text-paper/50">مجموع درآمد ثبت‌شده</p>
              <p className="mt-1 flex flex-wrap items-baseline gap-2">
                <CountUp
                  value={revenue}
                  className="text-[clamp(20px,5vw,34px)] font-bold leading-none text-white"
                />
                <span className="text-[12px] font-semibold text-paper/50">تومان</span>
              </p>
              <p className="mt-2 text-[11px] text-paper/40">
                از {fmt(revenueSales.length)} سفارش پرداخت‌شده یا ارسال‌شده
              </p>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { label: "سفارش‌های جاری", value: activeSales.length, unit: "سفارش" },
                  { label: "واحد فروش‌رفته", value: units, unit: "عدد" },
                  {
                    label: "در انتظار پرداخت",
                    value: pendingSales.length,
                    unit: "سفارش",
                    alert: pendingSales.length > 0,
                  },
                ].map((item) => (
                  <div key={item.label} className="min-w-0 rounded-lg bg-white/[.07] px-2.5 py-2.5 sm:px-3">
                    <p className="text-[9px] leading-4 font-semibold text-paper/45 sm:text-[10.5px]">
                      {item.label}
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-baseline gap-1">
                      <CountUp
                        value={item.value}
                        className={cn("text-[17px] font-bold sm:text-[19px]", item.alert ? "text-amber" : "text-white")}
                        duration={700}
                      />
                      <span className="text-[9px] text-paper/35">{item.unit}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex min-w-0 flex-col rounded-xl border border-white/10 bg-white/[.05] p-3.5 sm:p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11.5px] font-bold text-paper/65">روند فروش ۷ روز اخیر</p>
                <span className="flex items-baseline gap-1">
                  <Num value={weekRevenue} className="text-[12px] font-bold text-white" />
                  <span className="text-[9px] text-paper/35">تومان</span>
                </span>
              </div>
              <Sparkline values={series} stroke="#f7c8df" className="mt-1 h-14" />
              <div className="mt-1.5 mb-3 grid grid-cols-7 text-center">
                {series.map((_, index) => (
                  <span key={index} className="font-num text-[8.5px] text-paper/30">
                    {new Date(Date.now() - (6 - index) * 864e5).toLocaleDateString("fa-IR-u-nu-latn", {
                      day: "numeric",
                    })}
                  </span>
                ))}
              </div>
              {bestseller && (
                <div className="mt-auto flex min-w-0 items-center gap-2.5 rounded-lg bg-white/[.06] px-2.5 py-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/25 text-brand">
                    <Icon name={productIcon(bestseller.product.category)} className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9.5px] font-bold text-paper/35">پرفروش‌ترین محصول</p>
                    <p className="truncate text-[11.5px] font-bold text-paper/85">{bestseller.product.name}</p>
                  </div>
                  <span className="shrink-0 text-[10px] font-bold text-brand">
                    {fmt(bestseller.units)} عدد
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        <Icon name="box" className="float-slow absolute -bottom-14 -left-10 z-[1] h-56 w-56 text-white/[.035]" sw={1} />
      </div>

      {/* ---------- محصولات ---------- */}
      <section aria-labelledby="products-heading" className="min-w-0 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 id="products-heading" className="flex items-center gap-2 text-[15px] font-extrabold text-ink-900">
              <Icon name="box" className="h-[18px] w-[18px] text-brand" />
              محصولات
              <Badge kind="neutral">
                <Num value={products.length} className="text-[11px]" /> محصول
              </Badge>
            </h3>
            <p className="mt-1 text-[12px] text-ink-500">
              قیمت و موجودی هر محصول را ویرایش کنید؛ محصول غیرفعال در فروش نمایش داده نمی‌شود.
            </p>
          </div>
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-ink-400">
            <span className="h-1.5 w-1.5 rounded-full bg-mint" />
            <Num value={products.filter((product) => product.active).length} className="text-[11px]" /> فعال در ویترین
          </span>
        </div>

        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-card">
            <Empty text="هنوز محصولی اضافه نشده است" />
            <div className="flex justify-center pb-6">
              <Btn icon="plus" onClick={openNewProduct}>
                افزودن اولین محصول
              </Btn>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 xl:grid-cols-4">
            {products.map((product, index) => {
              const ratio =
                product.stock + product.sold > 0
                  ? Math.min(100, Math.round((product.sold / (product.stock + product.sold)) * 100))
                  : 0;
              return (
                <article
                  key={product.id}
                  className={cn(
                    "rv group min-w-0 overflow-hidden rounded-2xl border border-line bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/35 hover:shadow-md hover:shadow-brand/10",
                    !product.active && "opacity-75"
                  )}
                  style={{ animationDelay: `${index * 55}ms` }}
                >
                  <div className={cn("noise relative h-[124px] overflow-hidden p-3.5 text-white", toneArt[product.tone])}>
                    <div className="relative z-[2] flex min-w-0 items-start justify-between gap-2">
                      <span className="max-w-[70%] truncate rounded-full border border-white/20 bg-white/15 px-2 py-0.5 text-[10px] font-bold">
                        {product.category}
                      </span>
                      <Badge
                        kind={product.active ? "ink" : "rust"}
                        className={cn(
                          "shrink-0 border-white/20",
                          product.active ? "bg-black/20 text-white" : "bg-black/30 text-white"
                        )}
                      >
                        {product.active ? "فعال" : "غیرفعال"}
                      </Badge>
                    </div>
                    <Icon
                      name={productIcon(product.category)}
                      className="absolute -bottom-3 -left-2 z-[1] h-24 w-24 text-white/15 transition duration-500 group-hover:scale-110 group-hover:text-white/20"
                      sw={1.1}
                    />
                    <bdi
                      dir="ltr"
                      className="absolute bottom-3 right-3.5 z-[2] font-num text-[9.5px] font-semibold tracking-wider text-white/55"
                    >
                      {product.sku}
                    </bdi>
                    <Icon
                      name="coin"
                      className="absolute left-4 top-12 z-[2] h-7 w-7 text-white/40"
                      sw={1.3}
                    />
                  </div>

                  <div className="min-w-0 p-3.5">
                    <h4 className="truncate text-[13.5px] font-extrabold text-ink-900">{product.name}</h4>
                    <p className="mt-1 line-clamp-2 min-h-8 text-[11px] leading-5 text-ink-500">
                      {product.description || "بدون توضیح"}
                    </p>

                    <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
                      <p className="flex flex-wrap items-baseline gap-1">
                        <Num value={product.price} className="text-[15px] font-bold text-ink-900" />
                        <span className="text-[9.5px] text-ink-400">تومان</span>
                      </p>
                      <p className="text-[10px] font-semibold text-ink-400">
                        موجودی: <Num value={product.stock} className="text-[10px] font-bold text-ink-700" />
                      </p>
                    </div>

                    <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-linefaint">
                      <div
                        className={cn("h-full rounded-full", product.stock === 0 ? "bg-rust" : "bg-brand")}
                        style={{ width: product.stock === 0 ? "100%" : `${Math.max(5, ratio)}%` }}
                      />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[9.5px] text-ink-400">
                      <span>{product.stock === 0 ? "اتمام موجودی" : `${fmt(product.sold)} فروش`}</span>
                      <span>{product.stock === 0 ? "نیازمند تأمین" : `${fmt(product.sold + product.stock)} کل`}</span>
                    </div>

                    <div className="mt-3 flex items-center gap-1.5 border-t border-linefaint pt-3">
                      <Btn
                        kind="ghost"
                        icon="edit"
                        aria-label={`ویرایش ${product.name}`}
                        className="min-h-10 flex-1 px-2 py-1.5 text-[11.5px]"
                        onClick={() => openEditProduct(product)}
                      >
                        ویرایش
                      </Btn>
                      <button
                        type="button"
                        aria-label={`${product.active ? "غیرفعال" : "فعال"} کردن ${product.name}`}
                        title={product.active ? "غیرفعال کردن در ویترین" : "فعال کردن در ویترین"}
                        onClick={() => {
                          toggleProduct(product.id);
                          notify(
                            product.active
                              ? `${product.name} از ویترین غیرفعال شد`
                              : `${product.name} در ویترین فعال شد`
                          );
                        }}
                        className={cn(
                          "touch-target min-h-10 rounded-lg border px-2 transition",
                          product.active
                            ? "border-line text-ink-400 hover:border-rust/40 hover:bg-rust-soft hover:text-rust"
                            : "border-mint/30 bg-mint-soft text-mint hover:bg-mint/15"
                        )}
                      >
                        <Icon name={product.active ? "x" : "check"} className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ---------- سفارش‌ها ---------- */}
      <section
        aria-labelledby="sales-orders-heading"
        className="rv min-w-0 overflow-hidden rounded-2xl border border-line bg-card"
      >
        <div className="border-b border-linefaint p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 id="sales-orders-heading" className="flex flex-wrap items-center gap-2 text-[15px] font-extrabold text-ink-900">
                <Icon name="bag" className="h-[18px] w-[18px] text-brand" />
                سفارش‌های فروش
                <Badge kind="neutral">
                  <Num value={sales.length} className="text-[11px]" /> سفارش
                </Badge>
                {pendingSales.length > 0 && (
                  <Badge kind="amber">{fmt(pendingSales.length)} در انتظار پرداخت</Badge>
                )}
              </h3>
              <p className="mt-1 text-[12px] leading-6 text-ink-500">
                با تأیید پرداخت، درآمد در حسابداری ثبت می‌شود. با لغو یا حذف سفارش، موجودی به‌صورت خودکار برمی‌گردد.
              </p>
            </div>
            <Btn icon="plus" className="w-full sm:w-auto" onClick={openNewOrder}>
              ثبت سفارش جدید
            </Btn>
          </div>

          <div className="mt-3 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <Icon name="search" className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                aria-label="جستجوی سفارش"
                className="field pr-9! text-[12.5px]"
                placeholder="جستجو در کد سفارش، خریدار، محصول یا کد پیگیری…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <p className="shrink-0 text-[11px] text-ink-400">
              نمایش <Num value={orders.length} className="text-[11px] font-bold text-ink-700" /> از{" "}
              <Num value={sales.length} className="text-[11px] font-bold text-ink-700" />
            </p>
          </div>

          <div
            role="group"
            aria-label="فیلتر وضعیت سفارش"
            className="thin-scroll mt-3 flex max-w-full gap-1.5 overflow-x-auto overscroll-x-contain px-1 py-1"
          >
            {(
              [
                ["all", "همه"],
                ["pending", SALE_STATUS_META.pending.short],
                ["paid", SALE_STATUS_META.paid.short],
                ["shipped", SALE_STATUS_META.shipped.short],
                ["cancelled", SALE_STATUS_META.cancelled.short],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatusFilter(value)}
                aria-pressed={statusFilter === value}
                className={cn(
                  "min-h-11 shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-[11.5px] font-bold transition sm:min-h-0",
                  statusFilter === value
                    ? "border-brand bg-brand text-white shadow-sm shadow-brand/30"
                    : "border-line bg-card text-ink-500 hover:border-brand/40 hover:text-brand"
                )}
              >
                {label}{" "}
                <bdi dir="ltr" className="font-num text-[10px] opacity-70">
                  {counts[value]}
                </bdi>
              </button>
            ))}
          </div>
        </div>

        <div className="thin-scroll min-w-0 overflow-x-auto overscroll-x-contain">
          <table aria-label="سفارش‌های فروش محصولات" className="responsive-table w-full min-w-[890px]">
            <thead className="bg-linefaint/60">
              <tr>
                <th className={th}>سفارش</th>
                <th className={th}>خریدار</th>
                <th className={th}>محصول / تعداد</th>
                <th className={th}>مبلغ کل</th>
                <th className={th}>پرداخت</th>
                <th className={th}>تاریخ</th>
                <th className={th}>وضعیت</th>
                <th className={th}></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((sale) => (
                <tr key={sale.id} className="group transition hover:bg-brand-soft/35">
                  <td data-label="سفارش" className={cn(td, "whitespace-nowrap")}>
                    <bdi dir="ltr" className="font-num text-[12px] font-bold text-ink-900">{sale.code}</bdi>
                    <Badge kind={statusKind[sale.status]} className="mt-1 hidden sm:inline-flex">
                      {SALE_STATUS_META[sale.status].short}
                    </Badge>
                  </td>
                  <td data-label="خریدار" className={cn(td, "min-w-32")}>
                    <p className="font-bold text-ink-900">{sale.buyer}</p>
                    {sale.phone && <p dir="ltr" className="mt-0.5 text-right font-num text-[10.5px] text-ink-400">{sale.phone}</p>}
                  </td>
                  <td data-label="محصول / تعداد" className={cn(td, "mobile-wide min-w-40")}>
                    <p className="font-bold text-ink-800">{sale.productName}</p>
                    <p className="mt-0.5 text-[11px] text-ink-400">
                      <Num value={sale.qty} className="text-[11px]" /> عدد × <Num value={sale.unitPrice} className="text-[11px]" /> تومان
                    </p>
                  </td>
                  <td data-label="مبلغ کل" className={cn(td, "whitespace-nowrap")}>
                    <Num value={sale.total} className="font-bold text-ink-900" />
                    <span className="mr-1 text-[10px] text-ink-400">تومان</span>
                    {sale.status === "cancelled" && <p className="mt-0.5 text-[10px] font-bold text-rust">لغو شده — فاقد درآمد</p>}
                  </td>
                  <td data-label="پرداخت" className={td}>
                    <Badge kind={sale.payment === "shaba" ? "brand" : sale.payment === "online" ? "mint" : "neutral"}>
                      {PAYMENT_LABELS[sale.payment]}
                    </Badge>
                    {sale.tracking && (
                      <p dir="ltr" className="mt-1 text-right font-num text-[10px] text-ink-400 [overflow-wrap:anywhere]">
                        {sale.tracking}
                      </p>
                    )}
                  </td>
                  <td data-label="تاریخ" className={cn(td, "mobile-wide whitespace-nowrap text-[12px] text-ink-500")}>
                    {faDate(sale.at)}
                  </td>
                  <td data-label="وضعیت" className={td}>
                    <select
                      aria-label={`تغییر وضعیت سفارش ${sale.code}`}
                      value={sale.status}
                      onChange={(event) => {
                        const next = event.target.value as SaleStatus;
                        changeSaleStatus(sale.id, next);
                        notify(
                          next === "cancelled"
                            ? "سفارش لغو شد؛ موجودی محصول و سند درآمد اصلاح گردید"
                            : `وضعیت سفارش ${sale.code} به «${SALE_STATUS_META[next].label}» تغییر کرد`
                        );
                      }}
                      className={cn(
                        "min-h-11 w-full rounded-lg border bg-card px-2 py-1 text-[12px] font-bold outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15 sm:min-h-0",
                        sale.status === "cancelled"
                          ? "border-rust/30 text-rust"
                          : sale.status === "pending"
                            ? "border-amber/35 text-amber"
                            : "border-line text-ink-700"
                      )}
                    >
                      {(Object.keys(SALE_STATUS_META) as SaleStatus[]).map((value) => (
                        <option key={value} value={value}>
                          {SALE_STATUS_META[value].label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className={cn(td, "mobile-actions text-left")}>
                    <button
                      type="button"
                      aria-label={`حذف سفارش ${sale.code}`}
                      onClick={() => setDeleteId(sale.id)}
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
          {orders.length === 0 && <Empty text="سفارشی با این فیلترها پیدا نشد" />}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-linefaint bg-linefaint/40 px-4 py-3 text-[11.5px] leading-6 text-ink-500 sm:px-5">
          <span>
            مبلغ در انتظار پرداخت:{" "}
            <Num value={sum(pendingSales, (sale) => sale.total)} className="font-bold text-amber" /> تومان
          </span>
          <span className="flex items-center gap-1.5">
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-mint" />
            اتصال خودکار سفارش‌های پرداخت‌شده به حسابداری
          </span>
        </div>
      </section>

      {/* ---------- فرم محصول ---------- */}
      <Modal
        open={productOpen}
        onClose={() => setProductOpen(false)}
        title={editId ? "ویرایش محصول" : "افزودن محصول جدید"}
        icon="box"
        wide
      >
        <form
          className="min-w-0 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            submitProduct();
          }}
        >
          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="نام محصول">
              <input
                className="field"
                value={productForm.name}
                placeholder="مثلاً کیف پول سخت‌افزاری رابسیف"
                onChange={(event) => setProductForm({ ...productForm, name: event.target.value })}
              />
            </Field>
            <Field label="شناسه محصول (SKU)">
              <input
                className="field font-num"
                dir="ltr"
                style={{ textAlign: "right" }}
                value={productForm.sku}
                placeholder="RBZ-HW-05"
                onChange={(event) => setProductForm({ ...productForm, sku: event.target.value })}
              />
            </Field>
            <Field label="دسته‌بندی">
              <select
                className="field"
                value={productForm.category}
                onChange={(event) => setProductForm({ ...productForm, category: event.target.value })}
              >
                {CATEGORIES.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </Field>
            <Field label="قیمت فروش (تومان)">
              {numInput(productForm.price, (value) => setProductForm({ ...productForm, price: value }))}
            </Field>
            <Field label="موجودی در انبار" hint="با هر فروش، این مقدار به‌صورت خودکار کسر می‌شود.">
              {numInput(productForm.stock, (value) => setProductForm({ ...productForm, stock: value }))}
            </Field>
            <div>
              <span className="mb-1.5 block text-[12.5px] font-bold text-ink-700">رنگ ویترین</span>
              <div role="group" aria-label="رنگ ویترین محصول" className="flex flex-wrap gap-2">
                {TONES.map((tone) => (
                  <button
                    key={tone.value}
                    type="button"
                    aria-pressed={productForm.tone === tone.value}
                    aria-label={`رنگ ${tone.label}`}
                    onClick={() => setProductForm({ ...productForm, tone: tone.value })}
                    className={cn(
                      "flex h-11 items-center gap-2 rounded-lg border px-2.5 text-[11.5px] font-bold transition",
                      productForm.tone === tone.value
                        ? "border-brand/45 bg-brand-soft text-brand-700 ring-2 ring-brand/10"
                        : "border-line bg-card text-ink-500 hover:border-brand/30"
                    )}
                  >
                    <span className={cn("h-3.5 w-3.5 rounded-full", tone.swatch)} />
                    {tone.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <Field label="توضیح کوتاه">
            <textarea
              className="field min-h-[72px] resize-y"
              rows={2}
              value={productForm.description}
              placeholder="این محصول برای چه کسی مناسب است؟"
              onChange={(event) => setProductForm({ ...productForm, description: event.target.value })}
            />
          </Field>
          <div className="flex flex-wrap gap-2 pt-1">
            <Btn type="submit" icon="check" className="flex-1">
              {editId ? "ذخیره تغییرات" : "افزودن به ویترین"}
            </Btn>
            <Btn kind="ghost" onClick={() => setProductOpen(false)}>
              انصراف
            </Btn>
          </div>
        </form>
      </Modal>

      {/* ---------- فرم فروش ---------- */}
      <Modal open={orderOpen} onClose={() => setOrderOpen(false)} title="ثبت سفارش فروش" icon="bag" wide>
        {sellingProducts.length === 0 ? (
          <div className="space-y-4">
            <p className="rounded-lg bg-amber-soft px-3 py-2 text-[12.5px] leading-6 text-amber">
              محصول فعالی با موجودی مناسب وجود ندارد. ابتدا محصولی را در ویترین فعال کنید یا موجودی آن را افزایش دهید.
            </p>
            <Btn icon="box" onClick={() => setOrderOpen(false)}>
              بازگشت به محصولات
            </Btn>
          </div>
        ) : (
          <form
            className="min-w-0 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              submitOrder();
            }}
          >
            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="محصول">
                <select
                  className="field"
                  value={orderForm.productId}
                  onChange={(event) => {
                    const product = products.find((item) => item.id === event.target.value);
                    setOrderForm({
                      ...orderForm,
                      productId: event.target.value,
                      qty: product && parseInt(orderForm.qty || "1", 10) > product.stock ? "1" : orderForm.qty,
                    });
                  }}
                >
                  {sellingProducts.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} — {fmt(product.price)} تومان
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="تعداد" hint={`حداکثر موجودی: ${fmt(selectedProduct?.stock ?? 0)} عدد`}>
                {numInput(orderForm.qty, (value) => setOrderForm({ ...orderForm, qty: value }))}
              </Field>
              <Field label="نام خریدار">
                <input
                  className="field"
                  value={orderForm.buyer}
                  placeholder="نام کامل خریدار یا شرکت"
                  onChange={(event) => setOrderForm({ ...orderForm, buyer: event.target.value })}
                />
              </Field>
              <Field label="شماره تماس (اختیاری)">
                <input
                  className="field font-num"
                  dir="ltr"
                  style={{ textAlign: "right" }}
                  inputMode="tel"
                  value={orderForm.phone}
                  placeholder="0912 000 0000"
                  onChange={(event) => setOrderForm({ ...orderForm, phone: event.target.value })}
                />
              </Field>
              <Field label="روش پرداخت">
                <select
                  className="field"
                  value={orderForm.payment}
                  onChange={(event) =>
                    setOrderForm({ ...orderForm, payment: event.target.value as PaymentMethod })
                  }
                >
                  {(Object.keys(PAYMENT_LABELS) as PaymentMethod[]).map((method) => (
                    <option key={method} value={method}>
                      {PAYMENT_LABELS[method]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                label={orderForm.payment === "shaba" ? "کد پیگیری / شناسه واریز" : "کد پیگیری (اختیاری)"}
                hint={orderForm.payment === "shaba" ? "واریز را با کد سفارش در توضیحات واریز مشخص کنید." : undefined}
              >
                <input
                  className="field font-num"
                  dir="ltr"
                  style={{ textAlign: "right" }}
                  value={orderForm.tracking}
                  placeholder="TRK-00000"
                  onChange={(event) => setOrderForm({ ...orderForm, tracking: event.target.value })}
                />
              </Field>
              <Field label="تاریخ سفارش">
                <input
                  type="date"
                  className="field"
                  value={orderForm.at}
                  onChange={(event) => setOrderForm({ ...orderForm, at: event.target.value })}
                />
              </Field>
              <Field label="وضعیت اولیه">
                <select
                  className="field"
                  value={orderForm.status}
                  onChange={(event) =>
                    setOrderForm({
                      ...orderForm,
                      status: event.target.value as OrderForm["status"],
                    })
                  }
                >
                  <option value="paid">{SALE_STATUS_META.paid.label}</option>
                  <option value="shipped">{SALE_STATUS_META.shipped.label}</option>
                  <option value="pending">{SALE_STATUS_META.pending.label}</option>
                </select>
              </Field>
            </div>

            <Field label="توضیح سفارش (اختیاری)">
              <input
                className="field"
                value={orderForm.note}
                placeholder="مثلاً ارسال با پست پیشتاز"
                onChange={(event) => setOrderForm({ ...orderForm, note: event.target.value })}
              />
            </Field>

            {orderForm.payment === "shaba" && (
              <div className="rounded-lg border border-line bg-linefaint/50 px-3 py-2.5">
                <p className="text-[11px] font-bold text-ink-500">شبا شرکت برای دریافت وجه</p>
                <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
                  <bdi dir="ltr" className="font-num text-[11.5px] font-semibold text-ink-800 [overflow-wrap:anywhere]">
                    {shaba}
                  </bdi>
                  <CopyBtn
                    text={shaba.replace(/\s/g, "")}
                    onCopied={() => notify("شبا در کلیپ‌بورد کپی شد")}
                  />
                </div>
              </div>
            )}

            <div className="rounded-xl border border-brand/20 bg-brand-soft/40 p-3.5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-[12px] font-bold text-brand-700">جمع سفارش</p>
                <p className="flex flex-wrap items-baseline gap-1.5">
                  <CountUp value={orderTotal} className="text-[20px] font-bold text-brand-700" duration={350} />
                  <span className="text-[10.5px] font-semibold text-ink-500">تومان</span>
                </p>
              </div>
              <p className="mt-1.5 text-[11px] leading-5 text-ink-500">
                {selectedProduct
                  ? `${fmt(orderQty || 0)} عدد از «${selectedProduct.name}» × ${fmt(selectedProduct.price)} تومان`
                  : "محصولی انتخاب نشده است"}
              </p>
            </div>

            <p className="rounded-lg bg-amber-soft px-3 py-2 text-[11.5px] leading-5 text-amber">
              با ثبت سفارش، موجودی محصول کسر می‌شود. وضعیت «پرداخت شده» یا «ارسال شده» درآمد را در دفتر حسابداری ثبت می‌کند؛ سفارش در انتظار پرداخت تا زمان تأیید در درآمد حساب نمی‌شود.
            </p>

            <div className="flex flex-wrap gap-2">
              <Btn type="submit" icon="check" className="flex-1">
                ثبت سفارش
              </Btn>
              <Btn kind="ghost" onClick={() => setOrderOpen(false)}>
                انصراف
              </Btn>
            </div>
          </form>
        )}
      </Modal>

      {/* ---------- تأیید حذف سفارش ---------- */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="حذف سفارش فروش" icon="trash">
        <p className="text-[13px] leading-7 text-ink-700">
          سفارش {orderToDelete?.code} برای «{orderToDelete?.buyer}» حذف شود؟
        </p>
        <p className="mt-2 rounded-lg bg-amber-soft px-3 py-2 text-[11.5px] leading-5 text-amber">
          {orderToDelete && orderToDelete.status !== "cancelled"
            ? `${fmt(orderToDelete.qty)} عدد به موجودی «${orderToDelete.productName}» برمی‌گردد و سند درآمد مربوط در حسابداری حذف می‌شود.`
            : "این سفارش لغو شده است و فقط از فهرست حذف می‌شود."}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Btn
            kind="danger"
            icon="trash"
            className="flex-1"
            onClick={() => {
              if (!deleteId) return;
              removeSale(deleteId);
              setDeleteId(null);
              notify("سفارش حذف و موجودی محصول اصلاح شد");
            }}
          >
            حذف سفارش
          </Btn>
          <Btn kind="ghost" onClick={() => setDeleteId(null)}>
            انصراف
          </Btn>
        </div>
      </Modal>
    </div>
  );
}
