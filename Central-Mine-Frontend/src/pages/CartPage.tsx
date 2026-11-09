import appIcon from '../assets/app-icone.png'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Zap,
  ShieldCheck,
  Layers,
  Headphones,
  ChevronLeft
} from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import logoMark from '../assets/logo-mark.png'

const normalizeTitle = (t: any) => String(t || '').replace(/هودی\s*(?:ب|ی)ینگ\s*یانگ/g, 'پیراهن یینگ یانگ');

interface CartItem {
  id: string
  skuId?: string
  name: string
  price: number
  image: string
  quantity: number
  size?: string
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([])

  const loadCart = () => {
    try {
      const saved = localStorage.getItem('centralmine_cart_item')
      if (saved) {
        const parsed = JSON.parse(saved)
        setCart(Array.isArray(parsed) ? parsed : [parsed])
      } else {
        setCart([])
      }
    } catch {
      setCart([])
    }
  }

  useEffect(() => {
    loadCart()
    const handleUpdate = () => loadCart()
    window.addEventListener('cart_updated', handleUpdate)
    return () => window.removeEventListener('cart_updated', handleUpdate)
  }, [])

  const updateQuantity = (id: string, delta: number) => {
    const updated = cart
      .map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta
          return newQty > 0 ? { ...item, quantity: newQty } : null
        }
        return item
      })
      .filter(Boolean) as CartItem[]

    setCart(updated)
    localStorage.setItem('centralmine_cart_item', JSON.stringify(updated))
    window.dispatchEvent(new Event('cart_updated'))
  }

  const removeItem = (id: string) => {
    const updated = cart.filter((item) => item.id !== id)
    setCart(updated)
    localStorage.setItem('centralmine_cart_item', JSON.stringify(updated))
    window.dispatchEvent(new Event('cart_updated'))
  }

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfd]" dir="rtl">
      <Header showSearch />

      <main className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-4 sm:py-6 w-full flex-1 space-y-5">
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <Link to="/home" className="hover:text-brand-600 transition">صفحه اصلی</Link>
          <ChevronLeft size={14} />
          <span className="text-slate-700 font-bold">سبد خرید</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-8 rounded-3xl bg-white border border-slate-100 p-4 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h1 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                <span className="h-4 sm:h-5 w-1.5 bg-brand-500 rounded-full inline-block" />
                <span>سبد خرید شما ({totalCount.toLocaleString('fa-IR')} کالا)</span>
              </h1>
              <span className="text-[11px] text-slate-400 font-medium">انبار مرکزی ماین</span>
            </div>

            {cart.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
                <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                  <ShoppingBag size={32} />
                </div>
                <p className="text-slate-600 font-bold text-sm">سبد خرید شما در حال حاضر خالی است.</p>
                <Link
                  to="/home#products"
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 px-4 py-2 rounded-xl transition"
                >
                  مشاهده کاتالوگ و خرید کالا
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {cart.map((item) => (
                  <div key={item.id} className="py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="h-20 w-20 rounded-2xl bg-slate-50 border border-slate-100 p-2 flex items-center justify-center overflow-hidden shrink-0">
                        <img src={item.image} alt={normalizeTitle(item.name)} className="h-full w-full object-contain" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-800">{normalizeTitle(item.name)}</h3>
                        <p className="text-[10px] text-slate-400">ضمانت اصالت و سلامت فیزیکی</p>
                        {item.size && (
                          <span className="inline-block text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                            سایز: {item.size}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0">
                      <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 transition"
                        >
                          <Plus size={14} />
                        </button>
                        <span className="px-3 text-xs font-black font-mono">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 transition"
                        >
                          <Minus size={14} />
                        </button>
                      </div>

                      <div className="text-left font-mono" dir="ltr">
                        <span className="text-xs sm:text-sm font-black text-brand-600">
                          {(item.price * item.quantity).toLocaleString('en-US')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-sans font-bold ml-1">IRR</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-slate-300 hover:text-red-500 transition p-1"
                        title="حذف"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-left font-mono w-full sm:w-auto" dir="ltr">
                    <span className="text-xs text-slate-400 block font-sans text-right">جمع کل قابل پرداخت:</span>
                    <span className="text-xl sm:text-2xl font-black text-brand-600">
                      {totalPrice.toLocaleString('en-US')}
                    </span>
                    <span className="text-xs text-slate-500 font-sans font-bold ml-1">IRR</span>
                  </div>

                  <Link
                    to="/login"
                    className="w-full sm:w-64 py-3.5 px-6 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-md shadow-brand-500/25 text-center transition"
                  >
                    تکمیل اطلاعات و پرداخت
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 rounded-3xl bg-white border border-pink-100 p-6 shadow-xs flex flex-col justify-between w-full">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 flex items-center justify-center flex-shrink-0">
                  <img src={logoMark} alt="ماین" className="h-full w-full object-contain select-none" />
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
  <img src={appIcon} alt="ماین" className="h-7 w-7 sm:h-8 sm:w-8 object-contain select-none shrink-0" />
  <div className="text-right">
    <div className="font-bold text-xs sm:text-sm text-slate-800">ماین</div>
    <div className="text-[10px] text-slate-400">بازار چند منظوره</div>
  </div>
</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 mt-4">
                <span className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50">
                  <Zap size={13} className="text-brand-500" />
                  <span>پرداخت سریع</span>
                </span>
                <span className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50">
                  <ShieldCheck size={13} className="text-brand-500" />
                  <span>امنیت بالا</span>
                </span>
                <span className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50">
                  <Layers size={13} className="text-brand-500" />
                  <span>تنوع برندها</span>
                </span>
                <span className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50">
                  <Headphones size={13} className="text-brand-500" />
                  <span>پشتیبانی ۲۴/۷</span>
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4 text-center">
              <span className="text-xs font-bold text-brand-600 bg-brand-50 px-4 py-2.5 rounded-xl inline-block w-full">
                دانلود خیلی زود
              </span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
