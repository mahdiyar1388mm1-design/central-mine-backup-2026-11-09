import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  User,
  Phone,
  Mail,
  CreditCard,
  Hash,
  MapPin,
  Lightbulb
} from 'lucide-react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

export default function LoginPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    cardNumber: '',
    sheba: '',
    postalCode: '',
    address: '',
    saveForFuture: true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      localStorage.setItem('centralmine_user_info', JSON.stringify(formData))
    } catch {
      // ignore
    }
    navigate('/register/verify')
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfd]" dir="rtl">
      <Header showSearch />

      <main className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-6 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          
          {/* ستون اصلی: فرم اطلاعات گیرنده (۸ ستون در سمت راست) */}
          <div className="lg:col-span-8 rounded-3xl bg-white border border-slate-100 p-5 sm:p-8 shadow-xs">
            {/* سربرگ فرم */}
            <div className="flex items-start justify-between gap-4 pb-5 border-b border-slate-100">
              <div className="space-y-1">
                <h1 className="text-sm sm:text-base font-black text-slate-900">
                  اطلاعات ارسال خودکار
                </h1>
                <p className="text-[11px] text-slate-400 leading-relaxed max-w-2xl">
                  با فعال‌سازی این بخش، اطلاعات ارسال شما ذخیره می‌شود و پس از ثبت سفارش، مشخصات مورد نیاز به صورت خودکار در سفارش‌های بعدی تکمیل خواهد شد. در صورت تغییر آدرس یا اطلاعات تماس، لطفاً اطلاعات خود را به‌روزرسانی نمایید.
                </p>
              </div>

              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center shrink-0 border border-brand-100">
                <ShieldCheck size={22} />
              </div>
            </div>

            {/* فیلدهای ورودی */}
            <form onSubmit={handleSubmit} className="pt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* نام و نام خانوادگی */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <User size={13} className="text-brand-500" />
                    <span>نام و نام خانوادگی *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="نام و نام خانوادگی خود را وارد کنید"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-brand-500 focus:outline-none transition bg-slate-50/40"
                  />
                </div>

                {/* شماره تماس همراه */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Phone size={13} className="text-brand-500" />
                    <span>شماره تماس همراه *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="مثال: 09121234567"
                    dir="ltr"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-right focus:border-brand-500 focus:outline-none transition bg-slate-50/40"
                  />
                </div>

                {/* آدرس ایمیل */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Mail size={13} className="text-brand-500" />
                    <span>آدرس ایمیل</span>
                  </label>
                  <input
                    type="email"
                    placeholder="example@domain.com"
                    dir="ltr"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-right focus:border-brand-500 focus:outline-none transition bg-slate-50/40"
                  />
                </div>

                {/* شماره کارت */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <CreditCard size={13} className="text-brand-500" />
                    <span>شماره کارت (جهت مرجوعی)</span>
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    placeholder="شماره ۱۶ رقم کارت"
                    dir="ltr"
                    value={formData.cardNumber}
                    onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-right focus:border-brand-500 focus:outline-none transition bg-slate-50/40"
                  />
                </div>

                {/* شماره شبا */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <CreditCard size={13} className="text-brand-500" />
                    <span>شماره شبا (اختیاری)</span>
                  </label>
                  <div className="relative flex items-center" dir="ltr">
                    <span className="absolute left-3 text-xs font-bold text-slate-400 select-none">
                      IR -
                    </span>
                    <input
                      type="text"
                      maxLength={24}
                      placeholder="۲۴ رقم بدون IR"
                      value={formData.sheba}
                      onChange={(e) => setFormData({ ...formData, sheba: e.target.value })}
                      className="w-full pl-12 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-brand-500 focus:outline-none transition bg-slate-50/40"
                    />
                  </div>
                </div>

                {/* کد پستی */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Hash size={13} className="text-brand-500" />
                    <span>کد پستی ۱۰ رقمی *</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    placeholder="کد پستی ۱۰ رقمی محل سکونت"
                    dir="ltr"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-right focus:border-brand-500 focus:outline-none transition bg-slate-50/40"
                  />
                </div>
              </div>

              {/* نشانی کامل پستی */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <MapPin size={13} className="text-brand-500" />
                  <span>نشانی کامل پستی تحویل‌گیرنده *</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="استان، شهر، خیابان، پلاک، واحد..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-brand-500 focus:outline-none transition resize-none bg-slate-50/40"
                />
              </div>

              {/* چک‌باکس ذخیره اطلاعات */}
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={formData.saveForFuture}
                  onChange={(e) => setFormData({ ...formData, saveForFuture: e.target.checked })}
                  className="rounded text-brand-500 focus:ring-brand-500 h-4 w-4 accent-brand-500 cursor-pointer"
                />
                <span className="text-[11px] font-bold text-slate-700 select-none">
                  ارسال خودکار سفارش‌ها با اطلاعات ذخیره‌شده در خریدهای بعدی
                </span>
              </label>

              {/* دکمه ثبت اطلاعات */}
              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <ShieldCheck size={16} />
                  <span>ثبت اطلاعات</span>
                </button>
              </div>
            </form>
          </div>

          {/* ستون کناری: کارت صورتی برند + باکس نکات مهم (۴ ستون در سمت چپ) */}
          <div className="lg:col-span-4 space-y-4">
            {/* ۱. کارت صورتی اختصاصی برند ماین */}
            <div className="rounded-3xl bg-brand-500 p-6 text-white text-center flex flex-col items-center justify-center shadow-xs">
              <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center mb-3">
                <ShieldCheck size={36} className="text-white" />
              </div>
              <h3 className="text-sm sm:text-base font-black tracking-wide">
                اطلاعات ارسال خودکار
              </h3>
              <p className="text-[11px] text-pink-100 mt-1 font-medium">
                تسهیل و تسریع در چرخه ارسال مرسولات
              </p>
            </div>

            {/* ۲. کارت نکات مهم */}
            <div className="rounded-3xl bg-white border border-slate-100 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="text-xs sm:text-sm font-black text-slate-800">
                  نکات مهم
                </h4>
                <Lightbulb size={16} className="text-brand-500" />
              </div>

              <ul className="space-y-3 text-[11px] text-slate-500 leading-relaxed font-medium">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                  <span>پس از ثبت اطلاعات، در سفارش‌های بعدی نیازی به وارد کردن مجدد اطلاعات نیست.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                  <span>در صورت تغییر آدرس یا شماره تماس، لطفاً اطلاعات را در همین بخش به‌روزرسانی فرمایید.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                  <span>درج کد پستی دقیق ۱۰ رقمی منطبق با نشانی جهت صدور بارنامه رسمی پست و تیپاکس الزامی است.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                  <span>شماره شبا و کارت صرفاً جهت عودت وجه در صورت اعمال حق انصراف ۷ روزه (ماده ۳۷ قانون تجارت الکترونیک) استفاده می‌شود.</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
