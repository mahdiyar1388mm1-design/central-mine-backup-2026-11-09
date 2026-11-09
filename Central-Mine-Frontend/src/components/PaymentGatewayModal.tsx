import { useState } from "react"
import { ShieldCheck, Lock, CheckCircle2, Loader2 } from "lucide-react"

type PaymentGatewayModalProps = {
  isOpen: boolean
  amount: number
  onClose: () => void
  onSuccess: () => void
}

export default function PaymentGatewayModal({ isOpen, amount, onClose, onSuccess }: PaymentGatewayModalProps) {
  const [step, setStep] = useState<"gateway" | "processing" | "receipt">("gateway")
  const [cardNumber, setCardNumber] = useState("6037-9978-****-1234")
  const [cvv2, setCvv2] = useState("345")
  const [expMonth, setExpMonth] = useState("08")
  const [expYear, setExpYear] = useState("06")
  const [dynamicPin, setDynamicPin] = useState("")
  const [pinSent, setPinSent] = useState(false)
  const [trackingCode, setTrackingCode] = useState("")

  if (!isOpen) return null

  const handleSendPin = () => {
    setPinSent(true)
    setDynamicPin("849201")
  }

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault()
    setStep("processing")
    setTimeout(() => {
      setTrackingCode("CM-" + Math.floor(10000000 + Math.random() * 90000000))
      setStep("receipt")
      onSuccess()
    }, 1200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6" dir="rtl">
      <div className="fixed inset-0 bg-slate-900/70 animate-modal-backdrop" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col z-10 animate-modal-content max-h-[95vh]">
        
        {/* هدر درگاه شاپرک */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <ShieldCheck size={20} />
            </div>
            <div>
              <span className="text-xs font-bold block">سامانه پرداخت الکترونیک شاپرک</span>
              <span className="text-[10px] text-slate-400">اتصال امن به‌پرداخت مرکزی ماین</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/40">
            <Lock size={12} />
            <span className="font-mono text-[11px]">SSL 256-Bit</span>
          </div>
        </div>

        {step === "gateway" && (
          <div className="p-6 space-y-5 overflow-y-auto">
            {/* کارت مشخصات پذیرنده و مبلغ */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">پذیرنده:</span>
                <span className="font-bold text-slate-800">شرکت پرهؤن جهان گستر (ماین)</span>
              </div>
              <div className="text-left">
                <span className="text-slate-400 block text-[11px]">مبلغ قابل پرداخت:</span>
                <span className="font-extrabold text-brand-600 text-sm">{amount.toLocaleString("fa-IR")} ریال</span>
              </div>
            </div>

            {/* فرم کارت بانکی */}
            <form onSubmit={handlePay} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">شماره کارت بانکی عضو شتاب</label>
                <input
                  type="text"
                  dir="ltr"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-center font-mono tracking-widest text-sm text-slate-800 outline-none focus:border-brand-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">کد اعتبارسنجی (CVV2)</label>
                  <input
                    type="password"
                    dir="ltr"
                    maxLength={4}
                    required
                    value={cvv2}
                    onChange={(e) => setCvv2(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-center font-mono tracking-widest text-sm text-slate-800 outline-none focus:border-brand-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">تاریخ انقضا (ماه / سال)</label>
                  <div className="flex items-center gap-1.5" dir="ltr">
                    <input
                      type="text"
                      maxLength={2}
                      value={expMonth}
                      onChange={(e) => setExpMonth(e.target.value)}
                      className="w-1/2 rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-center font-mono text-xs text-slate-800 outline-none focus:border-brand-500 focus:bg-white"
                    />
                    <span className="text-slate-400">/</span>
                    <input
                      type="text"
                      maxLength={2}
                      value={expYear}
                      onChange={(e) => setExpYear(e.target.value)}
                      className="w-1/2 rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-center font-mono text-xs text-slate-800 outline-none focus:border-brand-500 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">رمز پویا (یک‌بار مصرف)</label>
                  <button
                    type="button"
                    onClick={handleSendPin}
                    className="text-[11px] font-bold text-brand-600 hover:text-brand-700 cursor-pointer"
                  >
                    {pinSent ? "ارسال مجدد رمز" : "درخواست رمز پویا"}
                  </button>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="password"
                    dir="ltr"
                    required
                    value={dynamicPin}
                    onChange={(e) => setDynamicPin(e.target.value)}
                    placeholder="رمز دریافتی پیامک‌شده"
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-center font-mono tracking-widest text-sm text-slate-800 outline-none focus:border-brand-500 focus:bg-white"
                  />
                </div>
                {pinSent && (
                  <span className="text-[10px] text-emerald-600 block mt-1">
                    ✔ رمز پویای آزمایشی برای شما درج شد.
                  </span>
                )}
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition cursor-pointer"
                >
                  پرداخت نهایی سفارش
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition cursor-pointer"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        )}

        {step === "processing" && (
          <div className="p-12 text-center space-y-4">
            <Loader2 size={44} className="animate-spin text-brand-500 mx-auto" />
            <h4 className="text-base font-bold text-slate-800">در حال تایید تراکنش بانکی...</h4>
            <p className="text-xs text-slate-400">لطفاً از بستن صفحه خودداری فرمایید.</p>
          </div>
        )}

        {step === "receipt" && (
          <div className="p-6 space-y-6 text-center overflow-y-auto">
            <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900">پرداخت با موفقیت انجام شد</h3>
              <p className="text-xs text-slate-400 mt-1">سفارش شما در مرحله بسته‌بندی و ارسال قرار گرفت.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-2 text-right">
              <div className="flex justify-between">
                <span className="text-slate-400">شماره پیگیری شاپرک:</span>
                <span className="font-mono font-bold text-slate-800">{trackingCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">شماره مرجع سفارش:</span>
                <span className="font-mono font-bold text-slate-800">ORD-2026-9841</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">مبلغ پرداخت‌شده:</span>
                <span className="font-bold text-emerald-600">{amount.toLocaleString("fa-IR")} ریال</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">وضعیت گارانتی:</span>
                <span className="font-medium text-slate-700">۷ روز ضمانت بازگشت وجه (ماده ۳۷)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition cursor-pointer"
            >
              تکمیل فرایند و بازگشت به فروشگاه
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
