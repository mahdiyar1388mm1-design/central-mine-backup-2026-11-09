# Central Mine — Backend

Backend API سرویس Central Mine؛ یک اپلیکیشن [NestJS](https://nestjs.com/) با معماری مونولیت، نوشته‌شده با TypeScript روی PostgreSQL (از طریق TypeORM).

## امکانات

- **احراز هویت بدون رمز عبور (OTP)** — ورود/ثبت‌نام با شماره موبایل و کد یکبار مصرف، ارسال پیامک از طریق [کاوه‌نگار](https://kavenegar.com) (سرویس Verify Lookup)، صدور `access token` / `refresh token` با JWT.
- **مدیریت کاربران** — CRUD کاربران با اعتبارسنجی ورودی و خروجی‌های تایپ‌شده (RO/DTO).
- **نقش‌ها و سطوح دسترسی** — سیستم Role-Based Access Control با گارد و دکوریتور اختصاصی برای کنترل دسترسی روی هر endpoint.
- **مستندات API خودکار** — Swagger روی مسیر `/swagger`.
- **لاگ ساخت‌یافته** — با Winston.
- **مدیریت خطای دیتابیس** — فیلتر اختصاصی برای ترجمه خطاهای PostgreSQL به پاسخ‌های HTTP معنادار.

## پیش‌نیازها

- Node.js 22+
- Docker و Docker Compose (روش پیشنهادی اجرا)
- یک حساب کاوه‌نگار برای ارسال OTP

## راه‌اندازی سریع (Docker)

```bash
# فایل‌های env را از روی نمونه بسازید
cp .env-sample .env
cp .env.db-sample .env.db

# مقادیر واقعی را در .env پر کنید (خصوصاً JWT_SECRET و KAVENEGAR_API_KEY)

# اجرای محیط توسعه (با hot-reload)
npm run docker:up:build:dev
```

سرویس روی `http://localhost:3000/v1` بالا می‌آید و مستندات Swagger روی `http://localhost:3000/swagger` در دسترس است.

## راه‌اندازی بدون Docker

```bash
npm ci

# یک PostgreSQL محلی/از راه دور آماده کنید و متغیرهای DB_* را در .env تنظیم کنید

npm run start:dev
```

## متغیرهای محیطی

| متغیر | توضیح |
| --- | --- |
| `HTTP_PORT` | پورت اجرای سرویس |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME` | اتصال به PostgreSQL |
| `DB_SYNC` | همگام‌سازی خودکار schema با entity‌ها (`true`/`false`) — فقط برای توسعه |
| `DB_LOGGING` | چاپ کوئری‌های TypeORM در لاگ |
| `JWT_SECRET` | کلید امضای توکن‌های JWT |
| `JWT_EXPIRE_IN` | مدت اعتبار access token (مثلاً `24h`) |
| `JWT_REFRESH_EXPIRE_IN` | مدت اعتبار refresh token (مثلاً `30d`) |
| `KAVENEGAR_API_KEY` | کلید API پنل کاوه‌نگار |
| `KAVENEGAR_OTP_TEMPLATE` | نام قالب Verify Lookup ساخته‌شده در پنل کاوه‌نگار برای ارسال کد OTP |
| `INTERNAL_HOST` | هاست داخلی برای دسترسی کانتینر به سرویس‌های میزبان (`host.docker.internal`) |

فایل‌های `.env-sample` و `.env.db-sample` نمونه‌ی کامل این مقادیر را دارند.

### پیکربندی کاوه‌نگار

ارسال OTP از طریق وب‌سرویس Verify Lookup کاوه‌نگار انجام می‌شود (مخصوص کدهای یکبار مصرف، بدون محدودیت اسپم). پیش از اجرا:

1. در پنل کاوه‌نگار یک **قالب (Template)** برای Verify Lookup بسازید که شامل متغیر `%token%` باشد؛ مثلاً: `کد ورود شما: %token%`.
2. نام همان قالب را در `KAVENEGAR_OTP_TEMPLATE` قرار دهید.
3. کلید API پنل را در `KAVENEGAR_API_KEY` قرار دهید.

## اسکریپت‌های مفید

| دستور | کاربرد |
| --- | --- |
| `npm run start:dev` | اجرای سرویس با حالت watch |
| `npm run build` | بیلد پروژه (خروجی در `dist/`) |
| `npm run lint` | اجرای ESLint با فیکس خودکار |
| `npm run format` | فرمت‌دهی کد با Prettier |
| `npm run test` / `test:watch` / `test:cov` | اجرای تست‌ها |
| `npm run migration:generate` | تولید migration جدید بر اساس تغییرات entity‌ها |
| `npm run migration:run` | اجرای migration‌های در انتظار |
| `npm run migration:revert` | بازگردانی آخرین migration |
| `npm run docker:up[:build][:dev]` | اجرای سرویس‌ها با Docker Compose (نسخه production/development) |

## ساختار پروژه

```
src/
├── commons/          # DTO/type/enum مشترک بین ماژول‌ها
├── decorator/         # دکوریتورهای اختصاصی (پرمیشن، لاگ فعالیت کاربر)
├── factory/           # پیکربندی‌های سطح پایین (مثل Winston)
├── filters/            # exception filter های سراسری
├── guards/             # گاردهای احراز هویت و کنترل دسترسی
├── interceptors/       # اینترسپتورهای سراسری (لاگ خطا، فعالیت کاربر)
├── modules/
│   ├── auth/           # ورود با OTP، صدور/تمدید JWT
│   ├── sms/             # اتصال به کاوه‌نگار برای ارسال OTP
│   ├── users/            # مدیریت کاربران
│   └── user_role/         # نقش‌ها و سطوح دسترسی
├── utils/              # توابع کمکی مشترک
├── app.module.ts
├── config.service.ts    # بارگذاری و اعتبارسنجی متغیرهای محیطی
└── main.ts              # نقطه ورود اپلیکیشن (bootstrap)
```

## مستندات API

بعد از بالا آمدن سرویس، مستندات کامل و تعاملی Swagger در آدرس زیر در دسترس است:

```
http://localhost:3000/swagger
```
