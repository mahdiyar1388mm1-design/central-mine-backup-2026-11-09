import { X, Compass, Sparkles, Leaf, ShieldCheck, RefreshCw, Store } from "lucide-react"

interface AboutModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
      dir="rtl"
    >
      {/* بستن با کلیک روی لایه بیرونی */}
      <div className="fixed inset-0 cursor-pointer" onClick={onClose} />

      {/* باکس مودال با ترنزیشن بسیار نرم و ظاهر دقیق تصویر */}
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90dvh] flex flex-col shadow-2xl border border-slate-100 relative z-10 overflow-hidden transform transition-all duration-300 ease-out animate-in zoom-in-95 fade-in">
        
        {/* هدر: ضربدر در چپ، عنوان در وسط، آیکون کادر صورتی در راست */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X size={18} />
          </button>

          <div className="text-center">
            <h3 className="text-sm sm:text-base font-bold text-slate-800">درباره سنترال ماین</h3>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-0.5">شناسنامه و خط‌مشی رسمی پلتفرم</p>
          </div>

          <div className="h-8 w-8 rounded-xl bg-brand-50 border border-brand-100 text-brand-500 flex items-center justify-center shadow-2xs shrink-0">
            <Store size={16} />
          </div>
        </div>

        {/* بدنه اسکرول‌پذیر */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-right">
          
          {/* بخش اول: آیکون در راست و شروع فوری متن از کنار آیکون */}
          <div className="flex items-start gap-2.5 text-right">
            <div className="h-7 w-7 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              <Compass size={15} />
            </div>
            <p className="text-justify text-[11px] sm:text-xs leading-relaxed text-slate-600 font-normal">
              تیم سنترال ماین (شرکت پرهؤن جهان گستر) به شماره ثبت : ۱۵۶۳۹ و شناسه ملی :۱۴۰۰۹۰۶۰۷۴۹ متشکل از جمعی دانشجویان و مدیران برنامه نویسان و طراحان مد و لباس اپراتور تولید فروش و دکترای بازرگانی و آمار و حساب داری  زیر نظر اداره ی فرهنگ و هنر و ارشاد استان تهران  با ترکیب علم جهانی و کار دست ایرانی بر آن داشت تا فعالیت خود نسبت به عصر جدید رقم بزند ما با جبران کمبود ها به تامین آنها پرداختیم و برای ایرانیان برند آفرینی کردیم تا آنها بتوانند با خرید آن در سطح جهانی پیروز رقابت های مختلف شوند که باعث جمع آوری اعتبار جهانی خواهد بود که زمینه ساز دریافت منابع مختلف است  بنابر این انحصار طلبی را انتخاب نکرده و با ایجاد برند هایی که در پیمان های جهانی هستند پاسخ گوی متقاضیان خواهد بود و در این راستا به پیشرفت آنان خواهد پرداخت شاید روزی شما مالک برند های مختلف در سنترال ماین باشید یا ایجاد کنید یا صنعت و تکنولوژی  و امتیاز برند های موجود برای فروش را بخرید   .سنترال ماین بر این باور شکل گرفته است که تجارت، زمانی ارزشمند است که با تلاش، امانت، انصاف و آبادانی همراه باشد.
            </p>
          </div>

          {/* کارت‌های شبکه‌ای دو در دو مطابق استایل تصویر */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            
            {/* کارت راست بالا: فرهنگ و گستره فعالیت */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50/60 border border-slate-100/90 text-right">
              <div className="flex items-center gap-1.5 mb-1 text-slate-800 font-bold text-xs">
                <div className="h-6 w-6 rounded-lg bg-pink-50 text-pink-500 flex items-center justify-center shrink-0">
                  <Sparkles size={13} />
                </div>
                <span>فرهنگ و گستره فعالیت</span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 leading-relaxed pr-7">
                فرهنگ پرشین و  آسیایی ، سبک سوپر ماتیسم (دارای نظریه)، تمدن جهان شمول، حوضه ی فعالیت ایران در حال توسعه؛  چین در حال توسعه .
              </p>
            </div>

            {/* کارت چپ بالا: تجارت سبز و پایدار */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50/60 border border-slate-100/90 text-right">
              <div className="flex items-center gap-1.5 mb-1 text-slate-800 font-bold text-xs">
                <div className="h-6 w-6 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                  <Leaf size={13} />
                </div>
                <span>تجارت سبز و پایدار</span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 leading-relaxed pr-7">
                تجارت سبز شامل  متریال گیاهی پنبه ای و مصنوعی و  عدم استفاده از چرم حیوانات
              </p>
            </div>

            {/* کارت راست پایین: استاندارد و سابقه مدیریت */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50/60 border border-slate-100/90 text-right">
              <div className="flex items-center gap-1.5 mb-1 text-slate-800 font-bold text-xs">
                <div className="h-6 w-6 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                  <ShieldCheck size={13} />
                </div>
                <span>استاندارد و سابقه مدیریت</span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 leading-relaxed pr-7">
                لیسانس ERC1156POV و سابقه ی فعالیت مدیران و سهام داران در شینگن آلمان فرانسه هلند
              </p>
            </div>

            {/* کارت چپ پایین: ضمانت بازگشت وجه ۷ روزه */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50/60 border border-slate-100/90 text-right">
              <div className="flex items-center gap-1.5 mb-1 text-slate-800 font-bold text-xs">
                <div className="h-6 w-6 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                  <RefreshCw size={13} />
                </div>
                <span>ضمانت بازگشت وجه ۷ روزه</span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 leading-relaxed pr-7">
                ضمانت بازگشت وجه در سنترال ۷ روز، باز پس ارسال محصول به سنترال چکینگ و بازگشت وجه
              </p>
            </div>

          </div>

          {/* باکس خاکستری نکات فعال‌سازی حساب کاربری */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50/90 border border-slate-100/80 space-y-1 text-right">
            <h4 className="text-[11px] sm:text-xs font-bold text-slate-700">نکات مهم فعال‌سازی حساب کاربری:</h4>
            <p className="text-[10px] sm:text-[11px] text-slate-500 leading-relaxed">
              لطفا در سپر تیک دار یا حساب بخش آدرس و کد پستی را تکمیل  و شماره حساب و شبای  منطبق با کد ملی خود را وارد کنید . باز پس ارسال محصول به سنترال چکینگ و بازگشت وجه. همزمان با تکمیل بخش ها اکانت شما فعال خواهد شد.
            </p>
          </div>

          {/* دکمه صورتی «متوجه شدم» در گوشه پایین چپ */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              متوجه شدم
            </button>
          </div>

        </div>

      </div>
    </div>
  )
}
