import React from 'react'
import { Link } from 'react-router-dom'
import {
  User,
  Headphones,
  FileText,
  Info
} from 'lucide-react'

// تصویر عریض برندها
import brandsme from '../assets/brand/brandme2.png'

// ۱۰ آیکون صورتی
import walletIcon from '../assets/wallet.png'
import cartIcon from '../assets/cart.png'
import payIcon from '../assets/pay.png'
import lineIcon from '../assets/line.png'
import giftIcon from '../assets/gift.png'
import carIcon from '../assets/car.png'
import phoneIcon from '../assets/phone.png'
import shieldIcon from '../assets/shield.png'
import headsetIcon from '../assets/headset.png'
import gridIcon from '../assets/grid.png'

// تصویر اختصاصی خدمات
import servicesIcon from '../assets/services-icone.png'

interface TopBrandNavProps {
  onAboutClick?: () => void
  onTermsClick?: () => void
  onSupportClick?: () => void
}

export default function TopBrandNav({
  onAboutClick,
  onTermsClick,
  onSupportClick,
}: TopBrandNavProps) {
  // تابع اسکرول نرم اختصاصی به محصولات
  const scrollToProducts = (e?: React.MouseEvent) => {
    if (e) e.preventDefault()
    const target = document.getElementById('products')
    if (target) {
      const headerOffset = 85
      const elementPosition = target.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
      window.history.pushState(null, '', '#products')
    } else {
      window.location.href = '/home#products'
    }
  }

  const ICONS = [
    // ردیف اول (چپ به راست)
    { id: 'wallet', icon: walletIcon, onClick: scrollToProducts },
    { id: 'cart', icon: cartIcon, link: '/cart' },
    { id: 'pay', icon: payIcon, onClick: scrollToProducts },
    { id: 'line', icon: lineIcon, onClick: scrollToProducts },
    { id: 'gift', icon: giftIcon, onClick: scrollToProducts },
    // ردیف دوم (چپ به راست)
    { id: 'car', icon: carIcon, onClick: scrollToProducts },
    { id: 'phone', icon: phoneIcon, onClick: scrollToProducts },
    { id: 'shield', icon: shieldIcon, onClick: scrollToProducts },
    { id: 'headset', icon: headsetIcon, onClick: onSupportClick },
    { id: 'grid', icon: gridIcon, onClick: scrollToProducts },
  ]

  return (
    <div className="space-y-3 sm:space-y-4 w-full flex flex-col items-center">
      {/* ۱. تصویر برندها با اسکرول نرم */}
      <a
        href="#products"
        onClick={scrollToProducts}
        className="flex w-full items-center justify-center py-1 cursor-pointer group focus:outline-none"
        title="مشاهده محصولات ماین"
      >
        <img
          src={brandsme}
          alt="برندهای ماین"
          className="w-full sm:max-w-2xl md:max-w-3xl lg:max-w-5xl h-auto max-h-48 sm:max-h-56 md:max-h-64 object-contain select-none transition-transform duration-200 group-hover:scale-[1.01] group-active:scale-[0.99]"
        />
      </a>

      {/* ۲. ۱۰ آیکون صورتی با اسکرول نرم */}
      <div className="flex w-full justify-center py-1" dir="ltr">
        <div className="grid grid-cols-5 w-full sm:max-w-2xl md:max-w-3xl lg:max-w-5xl justify-items-center items-center gap-y-2.5 sm:gap-y-4 px-1">
          {ICONS.map((item) => {
            const iconElement = (
              <div className="h-7 w-7 sm:h-9 sm:w-9 md:h-10 md:w-10 flex items-center justify-center transition-transform duration-200 hover:scale-115 active:scale-95 cursor-pointer">
                <img
                  src={item.icon}
                  alt={item.id}
                  className="h-full w-full object-contain select-none drop-shadow-2xs"
                />
              </div>
            )

            return item.onClick ? (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                className="focus:outline-none"
              >
                {iconElement}
              </button>
            ) : (
              <Link key={item.id} to={item.link || '/home#products'}>
                {iconElement}
              </Link>
            )
          })}
        </div>
      </div>

      {/* ۳. نوار سفید گزینه‌ها */}
      <div
        className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 p-2 sm:px-8 lg:px-10 sm:py-3 shadow-xs w-full sm:max-w-2xl md:max-w-3xl lg:max-w-5xl"
        dir="rtl"
      >
        <div className="grid grid-cols-5 gap-1 sm:gap-2 items-center text-center">
          {/* حساب */}
          <Link
            to="/login"
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-[10px] sm:text-xs md:text-sm font-bold text-slate-700 hover:text-brand-600 transition group py-1"
          >
            <User size={18} className="text-brand-500 group-hover:scale-110 transition-transform shrink-0" />
            <span>حساب</span>
          </Link>

          {/* خدمات (متصل به اسکرول محصولات به جای مودال) */}
          <button
            type="button"
            onClick={scrollToProducts}
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-[10px] sm:text-xs md:text-sm font-bold text-slate-700 hover:text-brand-600 transition group cursor-pointer py-1"
          >
            <img
              src={servicesIcon}
              alt="خدمات"
              className="h-5 w-5 sm:h-6 sm:w-6 object-contain select-none group-hover:scale-110 transition-transform shrink-0"
            />
            <span>خدمات</span>
          </button>

          {/* پشتیبانی */}
          <button
            type="button"
            onClick={onSupportClick}
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-[10px] sm:text-xs md:text-sm font-bold text-slate-700 hover:text-brand-600 transition group cursor-pointer py-1"
          >
            <Headphones size={18} className="text-brand-500 group-hover:scale-110 transition-transform shrink-0" />
            <span>پشتیبانی</span>
          </button>

          {/* قوانین */}
          <button
            type="button"
            onClick={onTermsClick}
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-[10px] sm:text-xs md:text-sm font-bold text-slate-700 hover:text-brand-600 transition group cursor-pointer py-1"
          >
            <FileText size={18} className="text-brand-500 group-hover:scale-110 transition-transform shrink-0" />
            <span>قوانین</span>
          </button>

          {/* درباره ما */}
          <button
            type="button"
            onClick={onAboutClick}
            className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-[10px] sm:text-xs md:text-sm font-bold text-slate-700 hover:text-brand-600 transition group cursor-pointer py-1"
          >
            <Info size={18} className="text-brand-500 group-hover:scale-110 transition-transform shrink-0" />
            <span>درباره ما</span>
          </button>
        </div>
      </div>
    </div>
  )
}
