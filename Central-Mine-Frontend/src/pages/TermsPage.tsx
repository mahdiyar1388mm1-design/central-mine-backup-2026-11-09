import { Link } from 'react-router-dom'
import AppShell from '../components/AppShell'
import Header from '../components/Header'

type Section = {
  title: string
  paragraph?: string
  items?: string[]
}

// متن رسمی سیاست حریم خصوصی، ارائه‌شده توسط کارفرما — از لینک "قوانین و
// شرایط" در فلوی ثبت‌نام باز می‌شود.
const SECTIONS: Section[] = [
  {
    title: 'اطلاعاتی که جمع‌آوری می‌کنیم',
    items: [
      'نام و نام خانوادگی',
      'شماره تلفن همراه',
      'آدرس ایمیل (در صورت ثبت)',
      'اطلاعات تراکنش‌ها و سفارش‌ها',
      'اطلاعات فنی دستگاه مانند نوع سیستم‌عامل و نسخه برنامه',
    ],
  },
  {
    title: 'نحوه استفاده از اطلاعات',
    paragraph: 'اطلاعات کاربران برای اهداف زیر استفاده می‌شود:',
    items: [
      'ارائه خدمات و پردازش سفارش‌ها',
      'پشتیبانی کاربران',
      'افزایش امنیت حساب‌های کاربری',
      'بهبود عملکرد و کیفیت خدمات',
    ],
  },
  {
    title: 'حفاظت از اطلاعات',
    paragraph:
      'ما تلاش می‌کنیم با استفاده از روش‌های متعارف امنیتی از اطلاعات کاربران در برابر دسترسی غیرمجاز، افشا یا سوءاستفاده محافظت کنیم.',
  },
  {
    title: 'اشتراک‌گذاری اطلاعات',
    paragraph:
      'اطلاعات کاربران بدون رضایت آن‌ها به اشخاص ثالث فروخته یا واگذار نمی‌شود، مگر در مواردی که قانون یا مراجع ذی‌صلاح الزام کرده باشند.',
  },
  {
    title: 'کوکی‌ها و داده‌های فنی',
    paragraph: 'ممکن است برای بهبود تجربه کاربری از کوکی‌ها یا فناوری‌های مشابه استفاده شود.',
  },
  {
    title: 'حقوق کاربران',
    paragraph: 'کاربران می‌توانند درخواست اصلاح یا حذف اطلاعات حساب خود را از طریق پشتیبانی ثبت کنند.',
  },
  {
    title: 'تماس با ما',
    paragraph: 'در صورت وجود هرگونه سؤال درباره حریم خصوصی، از طریق بخش پشتیبانی برنامه با ما در ارتباط باشید.',
  },
]

export default function TermsPage() {
  return (
    <AppShell>
      <Header />

      <main className="flex-1 px-6 py-6">
        <h1 className="text-2xl font-extrabold text-gray-900">حریم خصوصی</h1>
        <p className="mt-1 text-xs text-gray-400">آخرین به‌روزرسانی: ۴ سپتامبر ۲۰۲۶</p>
        <p className="mt-4 text-sm leading-7 text-gray-600">
          ما به حفظ حریم خصوصی کاربران متعهد هستیم. این سند توضیح می‌دهد که چه اطلاعاتی جمع‌آوری می‌شود و
          چگونه از آن استفاده می‌کنیم.
        </p>

        <div className="mt-6 space-y-6">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="text-base font-bold text-gray-900">{section.title}</h2>
              {section.paragraph && <p className="mt-2 text-sm leading-7 text-gray-600">{section.paragraph}</p>}
              {section.items && (
                <ul className="mt-2 list-inside list-disc space-y-1.5 text-sm leading-7 text-gray-600">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <Link to="/register" className="mt-8 inline-block font-semibold text-blue-600">
          بازگشت به ثبت نام
        </Link>
      </main>
    </AppShell>
  )
}
