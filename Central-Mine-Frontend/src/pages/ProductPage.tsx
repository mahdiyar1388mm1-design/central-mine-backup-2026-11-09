import appIcon from '../assets/app-icone.png'
import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Star,
  Eye,
  Truck,
  RotateCcw,
  CreditCard,
  ShieldCheck,
  Zap,
  Layers,
  Headphones,
  Plus,
  Check,
  ChevronLeft
} from 'lucide-react'
import { getProductById, type Product } from '../api/products'
import Header from '../components/Header'
import Footer from '../components/Footer'
import AboutModal from '../components/AboutModal'
import TermsModal from '../components/TermsModal'
import SupportModal from '../components/SupportModal'
import logoMark from '../assets/logo-mark.png'
import iranMade from '../assets/iran-made.png'

const normalizeTitle = (t: any) => String(t || '').replace(/هودی\s*(?:ب|ی)ینگ\s*یانگ/g, 'پیراهن یینگ یانگ');

export default function ProductPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string>('')
  const [selectedSize, setSelectedSize] = useState<string>('L')
  const [addedToast, setAddedToast] = useState(false)

  const [aboutOpen, setAboutOpen] = useState(false)
  const [termsOpen, setTermsOpen] = useState(false)
  const [supportOpen, setSupportOpen] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getProductById(id)
      .then((p) => {
        setProduct(p)
        const firstImg = p?.skus?.[0]?.images?.[0]?.url || '/placeholder.png'
        setSelectedImage(firstImg)
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [id])

  const sku = product?.skus?.[0]
  const price = sku?.price ? Number(sku.price) : 30000000
  const images = (product?.skus?.flatMap((s) => s.images?.map((im) => im.url) || []) || []).filter(Boolean)
  const mainImage = selectedImage || images[0] || '/placeholder.png'
  const seenCount = product?.seen ?? 39

  const handleAddToCart = (redirect = false) => {
    if (!product) return
    const productId = String(product.id || id || '1')
    const productName = product.name || 'محصول ماین'

    let cart: any[] = []
    try {
      const saved = localStorage.getItem('centralmine_cart_item')
      if (saved) {
        const parsed = JSON.parse(saved)
        cart = Array.isArray(parsed) ? parsed : [parsed]
      }
    } catch {
      cart = []
    }

    const itemKey = `${productId}-${selectedSize}`
    const existingIdx = cart.findIndex((item: any) =>
      item.id === itemKey || (item.id === productId && item.size === selectedSize)
    )

    if (existingIdx > -1) {
      cart[existingIdx].quantity = (Number(cart[existingIdx].quantity) || 1) + 1
    } else {
      cart.push({
        id: itemKey,
        skuId: sku?.id || productId,
        name: `${productName} (سایز ${selectedSize})`,
        price: price,
        image: mainImage,
        quantity: 1,
        size: selectedSize,
      })
    }

    localStorage.setItem('centralmine_cart_item', JSON.stringify(cart))
    window.dispatchEvent(new Event('cart_updated'))

    if (redirect) {
      navigate('/cart')
    } else {
      setAddedToast(true)
      setTimeout(() => setAddedToast(false), 2500)
    }
  }

  const defaultAttributes = [
    { key: 'نوع کالا (Item Type)', value: 'کاپشن و ژاکت (Blouson)' },
    { key: 'فصل (Season)', value: 'پاییزه و زمستانه (Autumn/Winter)' },
    { key: 'جنس الیاف (Material)', value: '۱۰۰٪ پلی‌استر مقاوم (Polyester 100%)' },
    { key: 'وزن پارچه (Fabric Weight)', value: '۳۴۰ گرم استاندارد (340g)' },
    { key: 'نوع دوخت (Fabric Type)', value: 'بافت متراکم صنعتی (Knitted)' },
    { key: 'ویژگی کاربردی (Feature)', value: 'راحت و کژوال روزمره (Leisure)' }
  ]

  const attributes = product?.attributes && product.attributes.length > 0
    ? product.attributes.map(a => ({ key: a.key, value: a.value }))
    : defaultAttributes

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fcfcfd]" dir="rtl">
        <Header showSearch />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-slate-400 font-bold text-sm animate-pulse">در حال بارگذاری اطلاعات کالا...</div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fcfcfd]" dir="rtl">
        <Header showSearch />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <p className="text-slate-600 font-bold text-base mb-3">محصول مورد نظر یافت نشد.</p>
          <Link to="/home" className="text-brand-600 text-xs font-bold hover:underline">
            بازگشت به صفحه اصلی
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfd]" dir="rtl">
      <Header showSearch />

      <main className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-4 sm:py-6 w-full flex-1 space-y-5 sm:space-y-6">
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <Link to="/home" className="hover:text-brand-600 transition">صفحه اصلی</Link>
          <ChevronLeft size={14} />
          <span className="text-slate-700 font-bold truncate max-w-xs">{normalizeTitle(product.name)}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          <div className="lg:col-span-8 rounded-3xl bg-white border border-slate-100 p-4 sm:p-6 shadow-xs">
            <div className="flex flex-col md:grid md:grid-cols-12 gap-6 items-start">
              
              <div className="order-2 md:order-1 md:col-span-7 space-y-4 w-full">
                <div>
                  <h1 className="text-lg sm:text-2xl font-black text-slate-900 leading-snug">
                    {normalizeTitle(product.name)}
                  </h1>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono" dir="ltr">
                  <span className="flex items-center gap-1 text-emerald-600 font-sans font-bold">
                    <Truck size={14} />
                    <span>آماده ارسال</span>
                  </span>
                  <span className="text-slate-200">|</span>
                  <span className="flex items-center gap-1">
                    <span>({seenCount.toLocaleString('en-US')} مرتبه بازدید)</span>
                    <Eye size={13} className="text-slate-400" />
                  </span>
                  <span className="text-slate-200">|</span>
                  <span className="flex items-center gap-1 text-slate-700 font-bold">
                    <span>4.0</span>
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <span className="text-[11px] text-slate-400 block">قیمت نهایی مصرف‌کننده:</span>
                  
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-baseline gap-1.5 font-mono" dir="ltr">
                      <span className="text-xs sm:text-sm font-extrabold text-brand-600 font-sans">IRR</span>
                      <span className="text-2xl sm:text-3xl font-black text-brand-600">
                        {price.toLocaleString('en-US')}
                      </span>
                    </div>

                    <div className="flex flex-col items-center justify-center p-1.5 px-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex-shrink-0" title="تولید ملی">
                      <img src={iranMade} alt="تولید ملی" className="h-8 sm:h-9 w-auto object-contain select-none" />
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 border-t border-slate-200/60 pt-1.5">
                    معادل {(Math.round(price / 10)).toLocaleString('en-US')} تومان (با احتساب مالیات بر ارزش افزوده)
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">انتخاب سایز:</span>
                    <span className="font-bold text-brand-600">
                      سایز انتخابی: <span className="font-mono uppercase bg-brand-50 px-2 py-0.5 rounded-md">{selectedSize}</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {['S', 'M', 'L', 'XL'].map((sz) => {
                      const isSelected = selectedSize === sz
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setSelectedSize(sz)}
                          className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                            isSelected
                              ? 'bg-brand-500 text-white border-brand-500 shadow-xs scale-[1.02]'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-brand-300'
                          }`}
                        >
                          {sz}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-2">
                  <span className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-100">
                    <Truck size={14} className="text-brand-500 flex-shrink-0" />
                    <span className="truncate">ارسال اکسپرس سراسری</span>
                  </span>
                  <span className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-100">
                    <ShieldCheck size={14} className="text-brand-500 flex-shrink-0" />
                    <span className="truncate">گارانتی سلامت فیزیکی</span>
                  </span>
                  <span className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-100">
                    <RotateCcw size={14} className="text-brand-500 flex-shrink-0" />
                    <span className="truncate">۷ روز ضمانت بازگشت</span>
                  </span>
                  <span className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-100">
                    <CreditCard size={14} className="text-brand-500 flex-shrink-0" />
                    <span className="truncate">پرداخت امن شاپرک</span>
                  </span>
                </div>

              </div>

              <div className="order-1 md:order-2 md:col-span-5 flex flex-col items-center w-full">
                <div className="aspect-square w-full rounded-2xl bg-slate-50 border border-slate-100 p-3 flex items-center justify-center overflow-hidden">
                  <img src={mainImage} alt={normalizeTitle(product.name)} className="h-full w-full object-contain" />
                </div>

                {images.length > 1 && (
                  <div className="flex items-center gap-2 mt-3 overflow-x-auto max-w-full pb-1">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedImage(img)}
                        className={`h-12 w-12 rounded-xl bg-slate-50 border p-1 overflow-hidden transition cursor-pointer flex-shrink-0 ${
                          selectedImage === img ? 'border-brand-500 ring-2 ring-brand-100' : 'border-slate-200'
                        }`}
                      >
                        <img src={img} alt="" className="h-full w-full object-contain" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>
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

        <section className="bg-white border border-slate-100 rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
            <span className="h-4 w-1 bg-brand-500 rounded-full inline-block" />
            <span>مشخصات کلیدی و ویژگی‌ها (Key Attributes)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
            {attributes.map((attr, idx) => (
              <div key={idx} className="p-3 sm:p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] text-slate-400 mb-0.5">{attr.key}</span>
                <span className="text-xs font-bold text-slate-800">{attr.value}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 py-3 w-full">
          <button
            type="button"
            onClick={() => handleAddToCart(true)}
            className="w-full sm:w-64 py-3.5 px-6 rounded-2xl bg-brand-500 hover:bg-brand-600 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <CreditCard size={18} />
            <span>ادامه فرآیند خرید</span>
          </button>

          <button
            type="button"
            onClick={() => handleAddToCart(false)}
            className="w-full sm:w-64 py-3.5 px-6 rounded-2xl bg-brand-50 hover:bg-brand-100/80 active:scale-[0.99] text-brand-600 font-bold text-sm border border-brand-200 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Plus size={18} />
            <span>+ افزودن به سبد</span>
          </button>
        </div>

      </main>

      {addedToast && (
        <div className="fixed top-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
          <div className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-bold animate-bounce">
            <Check size={16} className="text-emerald-400" />
            <span>محصول با سایز {selectedSize} با موفقیت به سبد خرید اضافه شد</span>
          </div>
        </div>
      )}

      <Footer />

      <AboutModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />
      <SupportModal isOpen={supportOpen} onClose={() => setSupportOpen(false)} />
      <TermsModal isOpen={termsOpen} onClose={() => setTermsOpen(false)} />
    </div>
  )
}
