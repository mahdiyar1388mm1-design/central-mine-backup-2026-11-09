import { useState } from "react"
import { Link } from "react-router-dom"
import { 
  Truck, 
  RotateCcw, 
  Headphones, 
  CreditCard, 
  ShieldCheck, 
  MapPin, 
  Phone 
} from "lucide-react"
import Logo from "./Logo"
import AboutModal from "./AboutModal"
import TermsModal from "./TermsModal"
import SupportModal from "./SupportModal"

export default function Footer() {
  const [aboutOpen, setAboutOpen] = useState(false)
  const [termsOpen, setTermsOpen] = useState(false)
  const [supportOpen, setSupportOpen] = useState(false)

  return (
    <footer className="w-full bg-white border-t border-slate-100 mt-10 sm:mt-12" dir="rtl">
      {/* ۴ مزیت خرید - ۲ ستونه در موبایل و ۴ ستونه در تبلت/دسکتاپ */}
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-6 sm:py-8 border-b border-slate-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-right">
          
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
              <Truck size={18} />
            </div>
            <div>
              <h5 className="text-[11px] sm:text-xs font-bold text-slate-800">تحویل اکسپرس</h5>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">ارسال سریع سراسر کشور</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
              <RotateCcw size={18} />
            </div>
            <div>
              <h5 className="text-[11px] sm:text-xs font-bold text-slate-800">ضمانت ۷ روزه مرجوعی</h5>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">طبق قانون تجارت الکترونیک</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSupportOpen(true)}
            className="flex items-center gap-2.5 sm:gap-3 text-right hover:opacity-80 transition cursor-pointer group"
          >
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-2xl bg-brand-50 group-hover:bg-brand-100 text-brand-600 flex items-center justify-center shrink-0 transition">
              <Headphones size={18} />
            </div>
            <div>
              <h5 className="text-[11px] sm:text-xs font-bold text-slate-800 group-hover:text-brand-600 transition">پشتیبانی ۲۴/۷</h5>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">پاسخگویی سریع مشتریان</p>
            </div>
          </button>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
              <CreditCard size={18} />
            </div>
            <div>
              <h5 className="text-[11px] sm:text-xs font-bold text-slate-800">پرداخت امن شاپرک</h5>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">درگاه رسمی بانکی</p>
            </div>
          </div>

        </div>
      </div>

      {/* اطلاعات شرکت و آدرس و نماد */}
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 sm:gap-8">
          
          <div className="space-y-3 max-w-3xl">
            <h4 className="text-xs sm:text-sm font-black text-slate-800 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-brand-500"></span>
              مرکز تجارت و توزیع کالای ماین
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed text-justify">
              فروشگاه ماین متعلق به شرکت پرهؤن جهان گستر (شماره ثبت ۱۵۶۳۹، شناسه ملی ۱۴۰۰۹۰۶۰۷۴۹)، بستر رسمی عرضه مستقیم انواع پوشاک، کیف و منسوجات با تضمین ۱۰۰٪ اصالت فیزیکی کالا، سلامت تحویل و پایبندی کامل به کلیه الزامات قانون تجارت الکترونیک کشور می‌باشد.
            </p>
            <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-[11px] sm:text-xs text-slate-500 pt-1">
              <div className="flex items-center gap-1.5 font-medium">
                <MapPin size={14} className="text-brand-600 shrink-0" />
                <span>تهران، محدوده جردن</span>
              </div>
              <button
                type="button"
                onClick={() => setSupportOpen(true)}
                className="flex items-center gap-1.5 font-medium hover:text-brand-600 transition cursor-pointer"
              >
                <Phone size={14} className="text-brand-600 shrink-0" />
                <span>پشتیبانی: <span className="font-mono font-bold text-slate-700" dir="ltr">0918 860 7572</span></span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 shadow-2xs shrink-0 w-full sm:w-auto justify-center sm:justify-start">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-brand-600 shadow-2xs">
              <ShieldCheck size={22} />
            </div>
            <div>
              <span className="text-xs font-extrabold text-slate-800 block">نماد اعتماد الکترونیکی</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">مرکز توسعه تجارت الکترونیکی</span>
            </div>
          </div>

        </div>
      </div>

      {/* نوار پایانی صورتی‌رنگ - سازگار با موبایل */}
      <div className="w-full bg-brand-600 py-3 text-white text-xs">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right">
          
          <Link to="/" className="inline-flex items-center hover:opacity-90 transition">
            <Logo className="h-6 sm:h-7 w-auto" />
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-white/90 text-[11px] font-medium">
            <Link to="/login" className="hover:text-white transition">حساب</Link>
            <span className="text-white/30 hidden sm:inline">•</span>
            <Link to="/catalog" className="hover:text-white transition">خدمات</Link>
            <span className="text-white/30 hidden sm:inline">•</span>
            <button 
              type="button" 
              onClick={() => setSupportOpen(true)} 
              className="hover:text-white transition cursor-pointer"
            >
              پشتیبانی
            </button>
            <span className="text-white/30 hidden sm:inline">•</span>
            <button 
              type="button" 
              onClick={() => setTermsOpen(true)} 
              className="hover:text-white transition cursor-pointer"
            >
              قوانین و مقررات
            </button>
            <span className="text-white/30 hidden sm:inline">•</span>
            <button 
              type="button" 
              onClick={() => setAboutOpen(true)} 
              className="hover:text-white transition cursor-pointer"
            >
              درباره ما
            </button>
          </div>

        </div>
      </div>

      <AboutModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />
      <TermsModal isOpen={termsOpen} onClose={() => setTermsOpen(false)} />
      <SupportModal isOpen={supportOpen} onClose={() => setSupportOpen(false)} />
    </footer>
  )
}
