import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // در بیلد، مسیرهای نسبی تا پنل زیر هر subpath (مثل /admin روی دامنهٔ اصلی)
  // کار کند، نه فقط روت. بدون این، دیپلوی زیر /admin باعث 404 شدن assetها
  // می‌شود. در حالت dev همان '/' می‌ماند چون base نسبی در dev پشتیبانی
  // نمی‌شود و ماژول‌ها را خراب می‌کند.
  base: command === "build" ? process.env.VITE_BASE || "./" : "/",
  plugins: [react(), tailwindcss(), viteSingleFile()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    // روی همهٔ اینترفیس‌ها bind شود تا از بیرون کانتینر/پیش‌نمایش قابل دسترسی باشد.
    host: true,
    port: Number(process.env.PORT) || 5173,
    // پیش‌نمایش Arena زیر یک هاست پروکسی‌شده سرو می‌شود؛ بدون این گزینه Vite
    // درخواست‌های هاست ناشناخته را رد می‌کند و صفحه باز نمی‌شود.
    allowedHosts: true,
    // HMR عمداً خاموش است. کلاینت Vite آدرس سوکت را از location مرورگر
    // می‌سازد (wss://<هاست-پروکسی>:<پورت>) و اگر پروکسی ارتقای WebSocket را
    // فوروارد نکند، اورلی تمام‌صفحهٔ «server connection lost» روی پنل کشیده
    // می‌شود — یعنی برنامه سالم است ولی دیده نمی‌شود. با hmr:false هیچ سوکتی
    // زده نمی‌شود؛ ماژول‌ها همچنان on-demand ترنسفورم می‌شوند، پس تغییرات
    // سورس با یک رفرش سادهٔ مرورگر اعمال می‌شوند.
    // برای توسعهٔ محلی با hot-reload: HMR=1 npm run dev
    hmr: process.env.HMR ? undefined : false,
  },
  preview: {
    host: true,
    port: Number(process.env.PORT) || 5173,
    allowedHosts: true,
  },
}));
