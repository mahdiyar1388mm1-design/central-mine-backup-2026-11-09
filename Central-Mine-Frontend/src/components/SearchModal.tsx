import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Search, X, Loader2, ChevronLeft, ArrowUpLeft, Sparkles } from "lucide-react"
import { findProducts, type Product } from "../api/products"

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

const POPULAR_SEARCHES = [
  "هودی",
  "پیراهن",
  "ژاکت",
  "کت",
  "کیف",
  "دانتلوس",
  "ایساتیرس"
]

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 80)
      return () => clearTimeout(timer)
    } else {
      setQuery("")
      setResults([])
    }
  }, [isOpen])

  // سرچ زنده ایجکس همگام با تایپ کاربر
  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    const timer = setTimeout(() => {
      findProducts({ name: trimmed, size: 8 })
        .then((res) => setResults(res?.products || []))
        .catch(() => setResults([]) )
        .finally(() => setLoading(false))
    }, 250)

    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSearchSubmit = (searchTerm: string) => {
    if (searchTerm.trim()) {
      navigate(`/catalog?name=${encodeURIComponent(searchTerm.trim())}`)
    } else {
      navigate("/catalog")
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-2 sm:pt-10 px-2 sm:px-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
      {/* لایه پس‌زمینه محو شونده جهت بستن */}
      <div className="fixed inset-0 cursor-pointer" onClick={onClose} />

      {/* باکس سفید پاپ‌آپ دقیقاً مشابه ساختار دیجی‌کالا */}
      <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-xl sm:max-w-2xl shadow-2xl border border-slate-100 relative z-10 flex flex-col max-h-[88dvh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* نوار اینپوت جستجو */}
        <div className="flex items-center gap-2.5 px-3.5 sm:px-5 py-3 border-b border-slate-100 bg-white">
          <div className="text-slate-400 shrink-0">
            {loading ? (
              <Loader2 size={20} className="animate-spin text-brand-600" />
            ) : (
              <Search size={20} />
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearchSubmit(query)
            }}
            placeholder="جستجو در میان کالاهای ماین..."
            className="flex-1 bg-transparent text-xs sm:text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none"
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              <X size={16} />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="h-8 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition cursor-pointer shrink-0"
          >
            انصراف
          </button>
        </div>

        {/* محتوای پاپ‌آپ و لیست ردیفی کالاها */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {!query.trim() ? (
            /* پیشنهادات پرطرفدار قبل از تایپ */
            <div className="p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                <Sparkles size={14} className="text-brand-500" />
                <span>بیشترین جستجوهای اخیر:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setQuery(term)
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-brand-50 border border-slate-100 hover:border-brand-200 text-xs font-bold text-slate-700 hover:text-brand-600 transition cursor-pointer"
                  >
                    <span>{term}</span>
                    <ArrowUpLeft size={13} className="text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          ) : results.length > 0 ? (
            /* لیست ردیفی و تمیز دیجی‌کالایی همراه با تصویر لباس و کالا */
            <div>
              {results.map((p) => {
                const sku = p.skus?.[0]
                const image = sku?.images?.[0]?.url || "/placeholder.png"
                const price = sku?.price ? Number(sku.price) : 30000000

                return (
                  <Link
                    key={p.id}
                    to={`/product/${p.id}`}
                    onClick={onClose}
                    className="flex items-center justify-between px-3 sm:px-5 py-2.5 hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  >
                    {/* سمت راست: آیکون سرچ + عکس کالا + نام و برند */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-slate-50 border border-slate-100 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                        <img
                          src={image}
                          alt={p.name}
                          className="h-full w-full object-contain group-hover:scale-105 transition"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-brand-600 transition truncate">
                          {p.name}
                        </h4>
                        <span className="text-[10px] sm:text-[11px] text-slate-400 block mt-0.5">
                          در دسته‌بندی پوشاک ماین
                        </span>
                      </div>
                    </div>

                    {/* سمت چپ: قیمت و آیکون فلش */}
                    <div className="flex items-center gap-2 shrink-0 pr-2">
                      <div className="text-left font-mono">
                        <span className="text-xs sm:text-sm font-black text-brand-600">
                          {price.toLocaleString("en-US")}
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-slate-400 font-sans mr-1 font-bold dir-ltr font-sans">
                          IRR
                        </span>
                      </div>
                      <ChevronLeft size={16} className="text-slate-300 group-hover:text-brand-600 transition" />
                    </div>
                  </Link>
                )
              })}

              {/* دکمه انتهای لیست برای مشاهده تمام نتایج در کاتالوگ */}
              <div className="p-3 bg-slate-50/60 text-center">
                <button
                  type="button"
                  onClick={() => handleSearchSubmit(query)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 py-1 transition cursor-pointer"
                >
                  <span>مشاهده تمام کالاهای مرتبط با «{query}»</span>
                  <ChevronLeft size={15} />
                </button>
              </div>
            </div>
          ) : !loading ? (
            /* حالت عدم یافت نتیجه */
            <div className="py-12 text-center space-y-2">
              <p className="text-xs sm:text-sm font-bold text-slate-700">نتیجه‌ای برای «{query}» یافت نشد.</p>
              <p className="text-[11px] text-slate-400">کلمات دیگری مانند هودی، پیراهن یا برند را جستجو کنید.</p>
            </div>
          ) : null}
        </div>

      </div>
    </div>
  )
}
