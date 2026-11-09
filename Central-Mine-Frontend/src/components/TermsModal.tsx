import { useEffect } from "react"
import { X, ShieldCheck, FileText, UserCheck, Lock, Cpu, RotateCcw, HelpCircle } from "lucide-react"

type TermsModalProps = {
  isOpen: boolean
  onClose: () => void
}

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      document.body.style.overflow = "hidden"
      window.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      document.body.style.overflow = "unset"
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" dir="rtl">
      {/* پس‌زمینه با انیمیشن فید و بلور نرم */}
      <div 
        className="fixed inset-0 bg-slate-900/60 animate-modal-backdrop"
        onClick={onClose} 
      />

      {/* باکس اصلی مودال با انیمیشن باز شدن روان */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] z-10 animate-modal-content">
        
        {/* هدر مودال */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">قوانین و حریم خصوصی سنترال ماین</h3>
              <p className="text-[11px] text-slate-400">آخرین به‌روزرسانی: ۴ سپتامبر ۲۰۲۶</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* محتوای متن قوانین */}
        <div className="overflow-y-auto p-6 space-y-6 text-slate-600 text-xs sm:text-sm leading-relaxed">
          
          <div className="p-4 rounded-2xl bg-brand-50/40 border border-brand-100/70 space-y-1.5">
            <h4 className="font-bold text-brand-700 flex items-center gap-1.5 text-xs sm:text-sm">
              <ShieldCheck size={16} />
              تعهد به حفظ محرمانگی و حریم خصوصی
            </h4>
            <p className="text-slate-600 text-justify">
              ما به حفظ حریم خصوصی کاربران متعهد هستیم. این سند به شفافیت کامل مشخص می‌سازد که چه اطلاعاتی در سنترال ماین جمع‌آوری شده و چگونه در بستر پلتفرم مورد استفاده قرار می‌گیرد.
            </p>
          </div>

          {/* بخش اطلاعاتی که جمع‌آوری می‌کنیم */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 flex items-center gap-2 text-xs sm:text-sm">
              <UserCheck size={16} className="text-brand-500" />
              اطلاعاتی که جمع‌آوری می‌کنیم
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
              <li className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500"></span>
                نام و نام خانوادگی
              </li>
              <li className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500"></span>
                شماره تلفن همراه
              </li>
              <li className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500"></span>
                آدرس ایمیل (در صورت ثبت)
              </li>
              <li className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500"></span>
                اطلاعات تراکنش‌ها و سفارش‌ها
              </li>
              <li className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 sm:col-span-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500"></span>
                اطلاعات فنی دستگاه مانند نوع سیستم‌عامل و نسخه برنامه
              </li>
            </ul>
          </div>

          {/* نحوه استفاده از اطلاعات */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 flex items-center gap-2 text-xs sm:text-sm">
              <Cpu size={16} className="text-brand-500" />
              نحوه استفاده از اطلاعات
            </h4>
            <p className="text-slate-600">اطلاعات کاربران منحصراً برای اهداف زیر مورد استفاده قرار می‌گیرد:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-800 block">ارائه خدمات و پردازش سفارش‌ها</span>
                <span className="text-slate-500 text-[11px]">تامین و ارسال دقیق اقلام فیزیکی خریداران</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-800 block">پشتیبانی و پیگیری امور کاربران</span>
                <span className="text-slate-500 text-[11px]">پاسخگویی سریع کارشناسان در تمامی مراحل</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-800 block">افزایش امنیت حساب‌های کاربری</span>
                <span className="text-slate-500 text-[11px]">پیشگیری از فعالیت‌های غیرمجاز و احراز هویت</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-800 block">بهبود عملکرد و کیفیت خدمات</span>
                <span className="text-slate-500 text-[11px]">بهینه‌سازی تجربه کاربری و سهولت خرید</span>
              </div>
            </div>
          </div>

          {/* حفاظت، اشتراک‌گذاری و کوکی‌ها */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <h5 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <Lock size={14} className="text-brand-500" />
                حفاظت و عدم اشتراک‌گذاری
              </h5>
              <p className="text-[11px] text-slate-500 leading-relaxed text-justify">
                اطلاعات کاربران به هیچ شخص یا سازمانی فروخته یا واگذار نمی‌شود مگر به حکم مراجع قانونی ذی‌صلاح. بالاترین استانداردهای امنیتی جهت جلوگیری از دسترسی غیرمجاز اعمال می‌گردد.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <h5 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <RotateCcw size={14} className="text-brand-500" />
                ضمانت ۷ روزه مرجوعی (اینماد)
              </h5>
              <p className="text-[11px] text-slate-500 leading-relaxed text-justify">
                مطابق ماده ۳۷ قانون تجارت الکترونیک، خریدار تا ۷ روز کاری حق انصراف از خرید و بازگشت کالا را دارا بوده و پس از تایید واحد چکینگ، وجه عودت داده می‌شود.
              </p>
            </div>
          </div>

          {/* حقوق کاربران و پشتیبانی */}
          <div className="p-4 rounded-2xl bg-slate-100/70 border border-slate-200/60 flex items-start gap-3">
            <HelpCircle size={20} className="text-brand-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold text-slate-800 block">حقوق کاربران و راه‌های تماس:</span>
              <p className="text-slate-500 leading-relaxed">
                تمامی کاربران حق دارند در هر زمان درخواست اصلاح یا حذف اطلاعات حساب خود را ثبت کنند. در صورت وجود هرگونه ابهام یا سوال درباره حریم خصوصی، از طریق بخش پشتیبانی برنامه با ما در ارتباط باشید.
              </p>
            </div>
          </div>

        </div>

        {/* دکمه بستن فوتر مودال */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer"
          >
            تایید و پذیرش قوانین
          </button>
        </div>

      </div>
    </div>
  )
}
