import { Headphones, Phone, MapPin, X } from "lucide-react"

interface SupportModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SupportModal({ isOpen, onClose }: SupportModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90dvh] flex flex-col shadow-2xl border border-slate-100 relative z-10 overflow-hidden">
        
        {/* هدر مودال (ثابت) */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
              <Headphones size={18} />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-slate-800">پشتیبانی مشتریان ماین</h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">پاسخگویی سریع و پیگیری سفارش‌ها</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* محتوای مودال (اسکرول‌پذیر در نمایشگرهای کوچک) */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed text-justify">
            کارشناسان پشتیبانی فروشگاه ماین در کلیه مراحل انتخاب کالا، ثبت سفارش، پیگیری ارسال اکسپرس و خدمات پس از فروش آماده پاسخگویی به شما هستند.
          </p>

          <div className="p-3 sm:p-4 rounded-2xl bg-brand-50/70 border border-brand-100 flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <Phone size={18} />
              </div>
              <div>
                <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 block">شماره تماس پشتیبانی:</span>
                <a href="tel:09188607572" className="text-sm sm:text-base font-black font-mono text-brand-700 tracking-wider hover:underline block mt-0.5" dir="ltr">
                  0918 860 7572
                </a>
              </div>
            </div>
            <a
              href="tel:09188607572"
              className="px-3 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-[11px] sm:text-xs font-black shadow-xs transition shrink-0"
            >
              تماس با پشتیبانی
            </a>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5 text-xs text-slate-600">
            <MapPin size={16} className="text-brand-500 shrink-0" />
            <span>دفتر خدمات: تهران، محدوده جردن (شرکت پرهؤن جهان گستر)</span>
          </div>
        </div>

        {/* دکمه بستن (ثابت) */}
        <div className="p-3 sm:p-4 border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition cursor-pointer"
          >
            بستن پنجره
          </button>
        </div>

      </div>
    </div>
  )
}
