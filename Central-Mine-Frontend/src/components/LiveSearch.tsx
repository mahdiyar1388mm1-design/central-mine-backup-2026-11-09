import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { Search, Loader2, Package, X } from "lucide-react"
import { findProducts, type Product } from "../api/products"

export default function LiveSearch() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    const timeout = setTimeout(async () => {
      try {
        const data = await findProducts({ name: trimmed, size: 6 })
        setResults(data.products || [])
        setIsOpen(true)
      } catch (err) {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 280)

    return () => clearTimeout(timeout)
  }, [query])

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xl">
      <div className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setIsOpen(true) }}
          placeholder="جستجوی نام کالا، برند یا کد محصول..."
          className="w-full rounded-2xl bg-slate-100 py-2.5 pr-11 pl-10 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 border border-transparent focus:border-brand-500 focus:bg-white focus:shadow-sm"
        />
        <div className="absolute right-3.5 flex items-center pointer-events-none text-slate-400">
          {loading ? <Loader2 size={18} className="animate-spin text-brand-500" /> : <Search size={18} />}
        </div>
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(""); setResults([]); setIsOpen(false) }}
            className="absolute left-3 text-slate-400 hover:text-slate-600 transition"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && query.trim().length > 0 && (
        <div className="absolute top-full right-0 left-0 mt-2 z-50 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl">
          {loading ? (
            <div className="flex items-center justify-center p-6 text-sm text-slate-500 gap-2">
              <Loader2 size={16} className="animate-spin text-brand-500" />
              <span>در حال جستجوی کالاها...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="divide-y divide-slate-50">
              <div className="px-4 py-2 bg-slate-50/70 text-xs font-medium text-slate-500">
                محصولات منطبق ({results.length})
              </div>
              {results.map((product) => {
                const firstSku = product.skus?.[0]
                const image = firstSku?.images?.[0]?.url || "/placeholder.png"
                const price = firstSku?.price ? Number(firstSku.price).toLocaleString("en-US") : "تماس بگیرید"

                return (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3.5 px-4 py-3 hover:bg-brand-50/40 transition group"
                  >
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-white p-1">
                      <img src={image} alt={product.name} className="h-full w-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-slate-800 truncate group-hover:text-brand-600 transition">
                        {product.name}
                      </h4>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {product.sellerDescription || "ضمانت اصالت فیزیکی کالا"}
                      </p>
                    </div>
                    <div className="text-left flex-shrink-0">
                      <span className="text-xs font-semibold text-brand-600">{price}</span>
                      <span className="text-[10px] text-slate-400 mr-1 dir-ltr font-sans">IRR</span>
                    </div>
                  </Link>
                )
              })}
              <Link
                to="/catalog"
                onClick={() => setIsOpen(false)}
                className="block text-center py-2.5 text-xs font-medium text-brand-600 hover:bg-slate-50 transition"
              >
                مشاهده همه نتایج در کاتالوگ
              </Link>
            </div>
          ) : (
            <div className="p-8 text-center">
              <Package size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm text-slate-600 font-medium">کالایی با این عنوان پیدا نشد</p>
              <p className="text-xs text-slate-400 mt-1">املا یا عنوان دیگری را امتحان کنید.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
