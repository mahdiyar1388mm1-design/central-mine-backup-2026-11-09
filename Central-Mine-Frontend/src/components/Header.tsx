import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { 
  Search, 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  Home, 
  ShoppingBag, 
  Headphones, 
  FileText, 
  Info, 
  Phone, 
  ChevronLeft,
  Loader2
} from "lucide-react"
import Logo from "./Logo"
import AboutModal from "./AboutModal"
import TermsModal from "./TermsModal"
import SupportModal from "./SupportModal"
import { findProducts, type Product } from "../api/products"

interface HeaderProps {
  showSearch?: boolean
  [key: string]: any
}

export default function Header(_props?: HeaderProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [termsOpen, setTermsOpen] = useState(false)
  const [supportOpen, setSupportOpen] = useState(false)

  const desktopSearchRef = useRef<HTMLDivElement>(null)
  const mobileSearchRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // شنیدن زنده رویدادهای تغییر سبد خرید و جمع زدن تمام اقلام
  useEffect(() => {
    const updateCartCount = () => {
      try {
        const saved = localStorage.getItem("centralmine_cart_item")
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) {
            const total = parsed.reduce((sum: number, it: any) => sum + (Number(it.quantity) || 1), 0)
            setCartCount(total)
          } else if (typeof parsed === "object" && parsed !== null) {
            setCartCount(Number((parsed as any).quantity) || 1)
          } else {
            setCartCount(0)
          }
        } else {
          setCartCount(0)
        }
      } catch {
        setCartCount(0)
      }
    }

    updateCartCount()
    window.addEventListener("cart_updated", updateCartCount)
    window.addEventListener("storage", updateCartCount)
    return () => {
      window.removeEventListener("cart_updated", updateCartCount)
      window.removeEventListener("storage", updateCartCount)
    }
  }, [])

  // سرچ زنده ایجکس هنگام تایپ
  useEffect(() => {
    const trimmed = searchTerm.trim()
    if (!trimmed) {
      setResults([])
      setLoading(false)
      setIsOpen(false)
      return
    }

    setLoading(true)
    setIsOpen(true)
    const timer = setTimeout(() => {
      findProducts({ name: trimmed, size: 6 })
        .then((res) => {
          setResults(res?.products || [])
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false))
    }, 250)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // بستن دراپ‌داون با کلیک خارج از کادر
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        desktopSearchRef.current && !desktopSearchRef.current.contains(target) &&
        mobileSearchRef.current && !mobileSearchRef.current.contains(target)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsOpen(false)
    if (searchTerm.trim()) {
      navigate(`/?name=${encodeURIComponent(searchTerm.trim())}`)
    } else {
      navigate("/#products")
    }
  }

  const renderDropdown = () => {
    if (!isOpen || !searchTerm.trim()) return null

    return (
      <div className="absolute top-full right-0 left-0 mt-1.5 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in duration-150">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-4 text-xs font-bold text-slate-400">
            <Loader2 size={16} className="animate-spin text-brand-600" />
            <span>در حال جستجوی کالاها...</span>
          </div>
        ) : results.length > 0 ? (
          <div className="divide-y divide-slate-50 max-h-72 sm:max-h-80 overflow-y-auto">
            {results.map((p) => {
              const sku = p.skus?.[0]
              const image = sku?.images?.[0]?.url || "/placeholder.png"
              const price = sku?.price ? Number(sku.price) : 30000000

              return (
                <Link
                  key={p.id}
                  to={`/product/${p.id}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between p-2.5 sm:p-3 hover:bg-slate-50 transition group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-slate-50 border border-slate-100 p-1 flex items-center justify-center shrink-0 overflow-hidden">
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
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        فروشگاه ماین
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 pr-2">
                    <div className="text-left font-mono">
                      <span className="text-xs sm:text-sm font-black text-brand-600">
                        {price.toLocaleString("en-US")}
                      </span>
                      <span className="text-[9px] text-slate-400 font-sans mr-1 font-bold dir-ltr font-sans">
                        IRR
                      </span>
                    </div>
                    <ChevronLeft size={15} className="text-slate-300 group-hover:text-brand-600 transition" />
                  </div>
                </Link>
              )
            })}

            <button
              type="button"
              onClick={handleSubmit}
              className="w-full text-center py-2.5 bg-slate-50/70 hover:bg-brand-50 text-[11px] font-bold text-brand-600 transition cursor-pointer flex items-center justify-center gap-1"
            >
              <span>مشاهده تمام نتایج «{searchTerm}» در فروشگاه</span>
              <ChevronLeft size={14} />
            </button>
          </div>
        ) : (
          <div className="p-4 text-center text-xs font-bold text-slate-400">
            کالایی با عنوان «{searchTerm}» پیدا نشد.
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-brand-600 shadow-md transition-all" dir="rtl">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5">
          <div className="relative flex items-center justify-between gap-2.5 sm:gap-6">
            
            {/* لوگو و منوی همبرگری */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                aria-label="باز کردن منو"
              >
                <Menu size={22} />
              </button>

              <Link to="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:static md:translate-x-0 md:translate-y-0 z-20 flex items-center hover:opacity-90 transition shrink-0">
                <Logo className="h-7 sm:h-9 w-auto text-white" />
              </Link>
            </div>

            {/* فیلد جستجوی دسکتاپ و تبلت */}
            <div ref={desktopSearchRef} className="relative hidden sm:flex flex-1 max-w-xl mx-2">
              <form onSubmit={handleSubmit} className="w-full">
                <div className="relative w-full">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => { if (searchTerm.trim()) setIsOpen(true); }}
                    placeholder="جستجوی نام کالا، برند یا کد محصول..."
                    className="w-full h-10 sm:h-11 pr-10 pl-9 rounded-2xl bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-300 shadow-inner"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    {loading ? <Loader2 size={18} className="animate-spin text-brand-600" /> : <Search size={18} />}
                  </div>
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => { setSearchTerm(""); setIsOpen(false); }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </form>
              {renderDropdown()}
            </div>

            {/* سبد خرید با شمارنده عدد زنده و حساب کاربری */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/cart"
                className="relative p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition flex items-center justify-center shrink-0"
                aria-label="سبد خرید"
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-white text-brand-600 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-xs font-mono">{cartCount > 0 ? cartCount.toLocaleString("en-US") : "۰"}</span>
                )}
              </Link>

              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition shrink-0"
              >
                <User size={16} />
                <span className="hidden sm:inline">حساب کاربری</span>
              </Link>
            </div>

          </div>

          {/* فیلد جستجوی موبایل */}
          <div ref={mobileSearchRef} className="relative sm:hidden mt-2.5">
            <form onSubmit={handleSubmit}>
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => { if (searchTerm.trim()) setIsOpen(true); }}
                  placeholder="جستجوی سریع کالا یا برند..."
                  className="w-full h-9 pr-9 pl-8 rounded-xl bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none shadow-xs"
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  {loading ? <Loader2 size={15} className="animate-spin text-brand-600" /> : <Search size={15} />}
                </div>
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => { setSearchTerm(""); setIsOpen(false); }}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </form>
            {renderDropdown()}
          </div>
        </div>
      </header>

      {/* منوی همبرگری موبایل */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" dir="rtl">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => setMobileMenuOpen(false)} 
          />

          <div className="fixed inset-y-0 right-0 w-[82%] max-w-xs bg-white shadow-2xl flex flex-col justify-between p-5 z-10 animate-in slide-in-from-right duration-300">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <Logo className="h-7 w-auto text-brand-600" />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-2xl bg-brand-50/60 border border-brand-100 hover:bg-brand-50 transition"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-2xs">
                    <User size={18} />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-800 block">ورود یا ثبت‌نام</span>
                    <span className="text-[10px] text-slate-400 block">مدیریت سفارش‌ها و آدرس</span>
                  </div>
                </div>
                <ChevronLeft size={16} className="text-slate-400" />
              </Link>

              <nav className="space-y-1 text-xs font-bold text-slate-700">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition"
                >
                  <Home size={18} className="text-brand-500" />
                  <span>صفحه اصلی</span>
                </Link>

                <Link
                  to="/#products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition"
                >
                  <ShoppingBag size={18} className="text-brand-500" />
                  <span>فروشگاه و محصولات</span>
                </Link>

                <button
                  type="button"
                  onClick={() => { setMobileMenuOpen(false); setSupportOpen(true); }}
                  className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-slate-50 text-right transition cursor-pointer"
                >
                  <Headphones size={18} className="text-brand-500" />
                  <span>پشتیبانی مشتریان</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setMobileMenuOpen(false); setTermsOpen(true); }}
                  className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-slate-50 text-right transition cursor-pointer"
                >
                  <FileText size={18} className="text-brand-500" />
                  <span>قوانین و مقررات</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setMobileMenuOpen(false); setAboutOpen(true); }}
                  className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-slate-50 text-right transition cursor-pointer"
                >
                  <Info size={18} className="text-brand-500" />
                  <span>درباره ما</span>
                </button>
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <a
                href="tel:09188607572"
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-brand-50/50 border border-slate-100 transition"
              >
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-brand-600" />
                  <span className="text-[11px] font-bold text-slate-700">تماس با پشتیبانی</span>
                </div>
                <span className="text-xs font-mono font-bold text-brand-700" dir="ltr">0918 860 7572</span>
              </a>
              <p className="text-[10px] text-slate-400 text-center">شرکت پرهؤن جهان گستر (سهامی خاص)</p>
            </div>
          </div>
        </div>
      )}

      <AboutModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />
      <TermsModal isOpen={termsOpen} onClose={() => setTermsOpen(false)} />
      <SupportModal isOpen={supportOpen} onClose={() => setSupportOpen(false)} />
    </>
  )
}
