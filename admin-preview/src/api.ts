/* ---------- کلاینت API پنل مدیریت ----------
 *
 * نکتهٔ مهم دربارهٔ معماری: این فایل آدرس API را به‌صورت «مطلق» از
 * VITE_ADMIN_API_BASE می‌خواند (پیش‌فرض: https://centralmine.org/v1).
 *
 * چرا مطلق و نه نسبی؟ چون fetchهای نسبی (`/v1/...`) فقط وقتی کار می‌کنند که
 * پنل و API روی یک origin باشند، یعنی یک reverse proxy مسیر `/v1` را به
 * بک‌اند ببرد. در محیط پیش‌نمایش/توسعه چنین پروکسی‌ای وجود ندارد، پس
 * درخواست باید مستقیم از مرورگر کاربر به دامنهٔ API برود. بک‌اند در
 * main.ts `cors: { origin: '*' }` دارد، بنابراین این حالت مجاز است.
 *
 * در دیپلوی نهایی روی خود دامنه (همان origin) کافی است
 * VITE_ADMIN_API_BASE=/v1 تنظیم شود تا دوباره نسبی و بدون CORS کار کند.
 */

/** ریشهٔ API ادمین. مثال: https://centralmine.org/v1 */
export const API_BASE: string = (
  import.meta.env.VITE_ADMIN_API_BASE || "https://centralmine.org/v1"
).replace(/\/+$/, "");

/**
 * کلید خصوصی پنل که بک‌اند در AdminGuard/AuthGuard چک می‌کند.
 * هشدار: این مقدار در باندل مرورگر قرار می‌گیرد، پس «کلید محرمانه» نیست و
 * نباید تنها لایهٔ حفاظت پنل باشد. برای حذفش از باندل باید پروکسی سمت سرور
 * (Caddy/nginx) آن را تزریق کند — دقیقاً همان کاری که کامنت auth.guard.ts
 * در بک‌اند توصیف می‌کند.
 */
export const ADMIN_PANEL_KEY: string =
  import.meta.env.VITE_ADMIN_PANEL_KEY || "adm-panel-2026-11-08-7QmR9pX2";

export type ApiOk<T> = { ok: true; data: T };
export type ApiFail = { ok: false; status: number; error: string };
export type ApiResult<T> = ApiOk<T> | ApiFail;

type Options = {
  method?: "GET" | "PUT" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  /** ارسال کلید پنل؛ برای endpointهای عمومی مثل /products لازم نیست. */
  panelKey?: boolean;
  signal?: AbortSignal;
};

/**
 * یک درخواست JSON که هرگز throw نمی‌کند؛ در عوض علت شکست را برمی‌گرداند.
 *
 * دلیلش این است که نسخهٔ قبلی این پنل خطاها را بی‌صدا می‌بلعید
 * (`.catch(() => null)`) و بعد DB خالی را جای دادهٔ واقعی نشان می‌داد — و
 * بدتر، همان DB خالی را روی سرور ذخیره می‌کرد. اینجا هر شکست یک پیام
 * قابل‌نمایش و یک کد وضعیت دارد تا علت واقعی در رابط کاربری دیده شود.
 */
export async function request<T>(path: string, options: Options = {}): Promise<ApiResult<T>> {
  const { method = "GET", body, panelKey = true, signal } = options;
  const url = `${API_BASE}${path}`;

  const headers: Record<string, string> = {};
  if (panelKey) headers["X-Admin-Panel-Key"] = ADMIN_PANEL_KEY;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      // عمداً credentials نمی‌فرستیم: احراز هویت با هدر کلید پنل است، نه کوکی.
      // در حالت cross-origin هم از پیش‌نیازهای ساده‌تر شدن CORS است.
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (networkError) {
    if ((networkError as Error)?.name === "AbortError") {
      return { ok: false, status: 0, error: "لغو شد" };
    }
    // fetch فقط یک TypeError بی‌جزئیات می‌دهد: یا شبکه/DNS، یا بلاک‌شدن توسط
    // CORS. چون از سمت مرورگر قابل تفکیک نیست، هر دو علت محتمل را می‌گوییم.
    return {
      ok: false,
      status: 0,
      error:
        "مرورگر نتوانست به سرور وصل شود — یا شبکه/DNS مشکل دارد، یا پاسخ سرور هدرهای CORS را ندارد (کنسول مرورگر را ببینید).",
    };
  }

  const text = await response.text();
  let parsed: unknown = undefined;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      return {
        ok: false,
        status: response.status,
        error: `پاسخ سرور JSON نبود (HTTP ${response.status}). احتمالاً پروکسی صفحهٔ خطای خودش را برگردانده است.`,
      };
    }
  }

  if (!response.ok) {
    return { ok: false, status: response.status, error: describeHttpError(response.status, parsed) };
  }

  return { ok: true, data: parsed as T };
}

/** ترجمهٔ کد وضعیت به پیام فارسیِ قابل‌عمل برای مدیر. */
function describeHttpError(status: number, parsed: unknown): string {
  // بک‌اند NestJS خطا را به شکل { statusCode, message, error } برمی‌گرداند.
  const message = (parsed as { message?: string | string[] })?.message;
  const detail = Array.isArray(message) ? message.join("، ") : message;

  switch (status) {
    case 401:
      return detail
        ? `احراز هویت ناموفق (401): ${detail}`
        : "احراز هویت ناموفق (401) — کلید پنل پذیرفته نشد یا درگاه Basic Auth جلویش را گرفته است.";
    case 403:
      return detail
        ? `دسترسی غیرمجاز (403): ${detail}`
        : "دسترسی غیرمجاز (403) — کلید پنل با مقدار سمت سرور نمی‌خواند.";
    case 404:
      return "مسیر پیدا نشد (404) — احتمالاً پروکسی /v1 روی این دامنه تنظیم نشده یا ماژول admin دیپلوی نشده است.";
    case 502:
    case 503:
    case 504:
      return `سرور بالادستی پاسخ نداد (${status}) — کانتینر بک‌اند احتمالاً پایین است.`;
    default:
      return detail ? `خطای سرور (${status}): ${detail}` : `خطای سرور (${status}).`;
  }
}

export const get = <T,>(path: string, options?: Omit<Options, "method" | "body">) =>
  request<T>(path, { ...options, method: "GET" });

export const put = <T,>(path: string, body: unknown, options?: Omit<Options, "method" | "body">) =>
  request<T>(path, { ...options, method: "PUT", body });
