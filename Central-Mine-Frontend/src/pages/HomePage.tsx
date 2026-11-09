import brand8 from '../assets/brands/brand8.png'
import brand4 from '../assets/brands/brand4.png'
import brand7 from '../assets/brands/brand7.png'
import brand1 from '../assets/brands/brand1.png'
import brand2 from '../assets/brands/brand2.png'
import brand3 from '../assets/brands/brand3.png'
import brand5 from '../assets/brands/brand5.png'
import brand6 from '../assets/brands/brand6.png'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Zap,
  ShieldCheck,
  Layers,
  Headphones,
  ChevronLeft
} from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import TopBrandNav from '../components/TopBrandNav'
import AboutModal from '../components/AboutModal'
import TermsModal from '../components/TermsModal'
import SupportModal from '../components/SupportModal'
import { findProducts, type Product } from '../api/products'
import hero1 from '../assets/hero-1.png'
import hero2 from '../assets/hero-2.png'
import appIcon from '../assets/app-icon.png'
import iranMade from '../assets/iran-made.png'

import cdRings from '../assets/brands/cd-rings.jpg'
import feny from '../assets/brands/feny.png'
import mand from '../assets/brands/mand.jpg'
import tehranOutlet from '../assets/brands/tehran-outlet.jpg'
import hofinally from '../assets/brands/hofinally.jpg'
import kkBownakmark from '../assets/brands/kk-bownakmark.png'
import drip from '../assets/brands/drip.png'

const normalizeTitle = (t: any) => String(t || '').replace(/هودی\s*(?:ب|ی)ینگ\s*یانگ/g, 'پیراهن یینگ یانگ');

const HERO_SLIDES = [
  { id: 1, image: hero1, alt: 'ماین - جشنواره پوشاک و کالای با اصالت', link: '/home#products' },
  { id: 2, image: hero2, alt: 'ماین - بستر تخصصی عرضه کالای فیزیکی', link: '/home#products' },
]

const SUGGESTED_BRANDS = [
  { name: 'DANTELOS', logo: brand8 },
  { name: 'FENY', logo: brand4 },
  { name: 'MAND', logo: brand7 },
  { name: 'OUTLET', logo: brand1 },
  { name: 'HOFINALY', logo: brand2 },
  { name: 'KK BOWNAKMARK', logo: brand3 },
  { name: 'ISSATEARS', logo: brand5 },
  { name: 'ZANGULE', logo: brand6 },
]

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [termsOpen, setTermsOpen] = useState(false)
  const [supportOpen, setSupportOpen] = useState(false)

  useEffect(() => {
    if (HERO_SLIDES.length <= 1) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    setLoading(true)
    findProducts({ size: 40 })
      .then((res: any) => setProducts(res?.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfd]" dir="rtl">
      <Header showSearch />

      <main className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-4 sm:py-6 w-full flex-1 space-y-6">
        <TopBrandNav
          onAboutClick={() => setAboutOpen(true)}
          onTermsClick={() => setTermsOpen(true)}
          onSupportClick={() => setSupportOpen(true)}
        />

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
          <div className="order-2 lg:order-1 lg:col-span-4 rounded-3xl bg-white border border-pink-100 p-5 shadow-xs flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-3 mb-3.5">
                <div className="h-11 w-11 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center p-1.5 flex-shrink-0">
                  <img src={appIcon} alt="ماین" className="h-full w-full object-contain select-none" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-800">ماین</h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-400">بازار چند منظوره</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-[11px] text-slate-600 mt-2">
                <span className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-100/60 font-medium">
                  <Zap size={13} className="text-brand-500" />
                  <span>پرداخت سریع</span>
                </span>
                <span className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-100/60 font-medium">
                  <ShieldCheck size={13} className="text-brand-500" />
                  <span>امنیت بالا</span>
                </span>
                <span className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-100/60 font-medium">
                  <Layers size={13} className="text-brand-500" />
                  <span>تنوع برندها</span>
                </span>
                <button
                  type="button"
                  onClick={() => setSupportOpen(true)}
                  className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 hover:bg-brand-50 text-slate-700 hover:text-brand-600 border border-slate-100/60 transition cursor-pointer w-full text-right font-medium"
                >
                  <Headphones size={13} className="text-brand-500" />
                  <span>پشتیبانی ۲۴/۷</span>
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 mt-3 text-center">
              <span className="text-xs font-bold text-brand-600 bg-brand-50 px-4 py-2.5 rounded-xl inline-block w-full">
                دانلود خیلی زود
              </span>
            </div>
          </div>

          <div className="order-1 lg:order-2 lg:col-span-8 rounded-3xl overflow-hidden shadow-xs border border-slate-100 relative bg-transparent group w-full aspect-[1200/500] sm:aspect-auto h-auto sm:h-[270px] lg:h-[300px]">
            {HERO_SLIDES.map((slide, idx) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                <Link to={slide.link} className="block w-full h-full">
                  <img
                    src={slide.image}
                    alt={slide.alt}
                    className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-[1.01]"
                  />
                </Link>
              </div>
            ))}

            {HERO_SLIDES.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full">
                {HERO_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === currentSlide ? 'w-5 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <section id="products" className="pt-2">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-start">
            
            <div className="order-2 md:order-1 md:col-span-4 lg:col-span-3 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
                  <span className="h-4 w-1 bg-brand-500 rounded-full inline-block" />
                  برندهای پیشنهادی
                </h2>
                <Link to="/home#products" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-0.5">
                  <span>مشاهده همه</span>
                  <ChevronLeft size={14} />
                </Link>
              </div>

              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 p-2 sm:p-3 shadow-xs grid grid-cols-1 gap-1.5">
                {SUGGESTED_BRANDS.map((brand) => (
                  <Link
                    key={brand.name}
                    to="/home#products"
                    className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl sm:rounded-2xl hover:bg-brand-50/40 border border-transparent hover:border-brand-100 transition group"
                  >
                    <span className="text-[11px] sm:text-xs font-extrabold text-slate-700 group-hover:text-brand-600 transition truncate tracking-wide">
                      {brand.name}
                    </span>
                    <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-slate-50 border border-slate-100 p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
                      <img src={brand.logo} alt={brand.name} className="h-full w-full object-contain" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="order-1 md:order-2 md:col-span-8 lg:col-span-9 space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm sm:text-base md:text-lg font-black text-slate-900 flex items-center gap-2">
                  <span className="h-4 sm:h-5 w-1.5 bg-brand-500 rounded-full inline-block" />
                  محصولات ماین
                </h2>
                
              </div>

              {loading ? (
                <div className="h-48 bg-white border border-slate-200 flex items-center justify-center text-slate-400 text-xs font-bold animate-pulse">
                  در حال دریافت فهرست کالاها...
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-3">
                  {products.map((p) => {
                    const sku = p.skus?.[0]
                    const price = sku?.price ? Number(sku.price) : 30000000
                    const img = sku?.images?.[0]?.url || '/placeholder.png'

                    return (
                      <Link
                        key={p.id}
                        to={`/product/${p.id}`}
                        className="group flex flex-col bg-white border border-slate-200 rounded-none overflow-hidden hover:border-brand-500 transition-colors duration-150"
                      >
                        <div className="aspect-[4/5] w-full bg-slate-100 overflow-hidden relative rounded-none">
                          <img
                            src={img}
                            alt={normalizeTitle(p.name)}
                            className="w-full h-full object-cover object-top rounded-none group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        <div className="p-1.5 sm:p-2 flex-1 flex flex-col justify-between text-right">
                          <div className="flex flex-col gap-1 mb-1">
                            <span className="self-start px-1 py-0.5 text-[7px] sm:text-[8px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200/80 leading-none">
                              تضمین کیفیت
                            </span>
                            <h3 className="text-[10px] sm:text-[11px] font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-brand-600 transition">
                              {normalizeTitle(p.name)}
                            </h3>
                          </div>

                          <div className="mt-auto flex flex-col">
                            <div className="text-left font-mono inline-flex items-baseline gap-0.5" dir="ltr">
                              <span className="text-[8px] sm:text-[9px] text-brand-600 font-sans font-extrabold">IRR</span>
                              <span className="text-[11px] sm:text-xs font-black text-brand-600">
                                {price.toLocaleString('en-US')}
                              </span>
                            </div>

                            <hr className="border-t border-slate-200/80 my-1" />

                            <div className="flex flex-col items-start gap-0.5" dir="ltr">
                              <img
                                src={iranMade}
                                alt="تولید ملی"
                                className="h-3 max-h-3 w-auto object-contain block"
                              />
                              <span className="text-sky-600 font-bold text-[7.5px] sm:text-[8px] leading-none">
                                ✔ Verified
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

          </div>
        </section>
      </main>

      <Footer />

      <AboutModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />
      <TermsModal isOpen={termsOpen} onClose={() => setTermsOpen(false)} />
      <SupportModal isOpen={supportOpen} onClose={() => setSupportOpen(false)} />
    </div>
  )
}
