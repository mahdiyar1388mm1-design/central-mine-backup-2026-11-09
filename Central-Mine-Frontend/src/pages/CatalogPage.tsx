import { useState, useEffect } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { 
  Star, 
  ChevronLeft, 
  ShoppingBag, 
  SlidersHorizontal,
  Grid
} from "lucide-react"
import AppShell from "../components/AppShell"
import Header from "../components/Header"
import Footer from "../components/Footer"
import { findProducts, type Product } from "../api/products"
import { getProductViews } from "../lib/views"

const CATEGORIES = [
  { id: "all", name: "همه کالاها" },
  { id: "clothing", name: "پوشاک مردانه و زنانه" },
  { id: "bags", name: "کیف و کوله‌پشتی" },
  { id: "shoes", name: "کفش و صندل" },
  { id: "accessories", name: "اکسسوری و زیورآلات" },
]

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const selectedCategory = searchParams.get("category") || "all"
  const searchQuery = searchParams.get("name") || ""

  useEffect(() => {
    setLoading(true)
    const params: { name?: string; size: number } = { size: 40 }
    if (searchQuery) params.name = searchQuery

    findProducts(params)
      .then((res) => {
        setProducts(res?.products || [])
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [searchQuery, selectedCategory])

  const handleSelectCategory = (catId: string) => {
    const next = new URLSearchParams(searchParams)
    if (catId === "all") {
      next.delete("category")
    } else {
      next.set("category", catId)
    }
    setSearchParams(next)
  }

  return (
    <AppShell>
      <Header />

      <main className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-4 sm:py-6 w-full flex-1 space-y-4 sm:space-y-6" dir="rtl">
        
        {/* نوار دسته‌بندی‌ها به صورت اسکرول افقی نرم در موبایل */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-3 px-3 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-1 text-slate-400 pl-1 shrink-0">
            <SlidersHorizontal size={14} />
            <span className="text-[11px] font-bold">دسته:</span>
          </div>

          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelectCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-brand-600 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50"
                }`}
              >
                {cat.name}
              </button>
            )
          })}
        </div>

        {/* شمارنده کالاها */}
        <div className="flex items-center justify-between pt-1">
          <h1 className="text-xs sm:text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
            <Grid size={16} className="text-brand-500" />
            <span>فهرست کالاهای ماین</span>
            {searchQuery && (
              <span className="text-slate-400 font-normal">
                (نتیجه جستجو برای: «{searchQuery}»)
              </span>
            )}
          </h1>
          <span className="text-[10px] sm:text-xs text-slate-400 font-medium">
            {products.length} کالا
          </span>
        </div>

        {/* گرید محصولات - کاملاً بهینه‌شده برای موبایل‌های ۳۶۰px، تبلت و دسکتاپ */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-72 sm:h-88 rounded-2xl sm:rounded-3xl bg-white border border-slate-100 p-3 space-y-2.5 animate-pulse">
                <div className="aspect-square bg-slate-100 rounded-xl w-full" />
                <div className="h-3.5 bg-slate-100 rounded-md w-3/4" />
                <div className="h-3 bg-slate-100 rounded-md w-1/2" />
                <div className="h-5 bg-slate-100 rounded-lg w-full pt-1" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 text-slate-400 space-y-2">
            <ShoppingBag size={36} className="mx-auto text-slate-300" />
            <p className="text-xs sm:text-sm font-bold">کالایی با مشخصات مورد نظر یافت نشد.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {products.map((p) => {
              const sku = p.skus?.[0]
              const image = sku?.images?.[0]?.url || "/placeholder.png"
              const price = sku?.price ? Number(sku.price) : 30000000
              const views = getProductViews(p.id, p.name, p.seen)

              return (
                <Link
                  key={p.id}
                  to={`/product/${p.id}`}
                  className="group flex flex-col justify-between h-full bg-white rounded-2xl sm:rounded-3xl border border-slate-100 p-2.5 sm:p-4 shadow-2xs hover:shadow-lg hover:border-brand-200 transition duration-300"
                >
                  <div>
                    {/* تصویر محصول با پدینگ تطبیقی */}
                    <div className="aspect-square w-full rounded-xl sm:rounded-2xl bg-slate-50/80 border border-slate-100/60 p-2 sm:p-3 flex items-center justify-center overflow-hidden">
                      <img
                        src={image}
                        alt={p.name}
                        className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                      />
                    </div>

                    {/* عنوان و زیرعنوان */}
                    <div className="mt-2.5 sm:mt-3 space-y-0.5 sm:space-y-1">
                      <h3 className="text-[11px] sm:text-sm font-extrabold text-slate-800 line-clamp-1 group-hover:text-brand-600 transition">
                        {p.name}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-slate-400 line-clamp-1 font-medium">
                        فروشگاه ماین
                      </p>
                    </div>

                    {/* امتیاز و بازدید دیتابیسی */}
                    <div className="flex items-center gap-1 mt-1.5 text-[10px] sm:text-xs text-amber-500 font-bold">
                      <Star size={12} className="fill-amber-400 text-amber-400 shrink-0" />
                      <span>{p.rating ? p.rating.toFixed(1) : "۴.۹"}</span>
                      <span className="text-slate-400 text-[9px] sm:text-[10px] font-medium mr-0.5 truncate">
                        ({views.toLocaleString("fa-IR")} بازدید)
                      </span>
                    </div>
                  </div>

                  {/* قیمت و دکمه تک‌خطی بدون شکستگی */}
                  <div className="mt-3 pt-2 sm:pt-3 border-t border-slate-100 flex flex-col gap-1.5 sm:gap-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[10px] sm:text-xs text-slate-400">قیمت:</span>
                      <div className="text-left font-mono">
                        <span className="text-xs sm:text-base font-black text-brand-600">
                          {price.toLocaleString("fa-IR")}
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-slate-500 mr-1 font-sans font-bold">ریال</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-1 w-full py-1.5 sm:py-2 rounded-xl bg-slate-50 group-hover:bg-brand-50 text-slate-700 group-hover:text-brand-600 font-extrabold text-[10px] sm:text-xs transition whitespace-nowrap">
                      <ShoppingBag size={13} className="shrink-0" />
                      <span>مشاهده و سفارش</span>
                      <ChevronLeft size={13} className="shrink-0" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

      </main>

      <Footer />
    </AppShell>
  )
}
