/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** ریشهٔ API ادمین — مثال: https://centralmine.org/v1 یا /v1 برای همان origin */
  readonly VITE_ADMIN_API_BASE?: string;
  /** کلید پنل که بک‌اند در AdminGuard/AuthGuard بررسی می‌کند */
  readonly VITE_ADMIN_PANEL_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
