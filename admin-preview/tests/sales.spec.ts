import { expect, test, type Page } from "@playwright/test";

async function navigate(page: Page, label: string) {
  const menu = page.getByRole("button", { name: "باز کردن منو", exact: true });
  if (await menu.isVisible()) await menu.click();
  await page
    .getByRole("navigation", { name: "بخش‌های پنل" })
    .getByRole("button", { name: new RegExp(`^${label}`) })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(label);
}

async function expectNoOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      )
    )
    .toBeLessThanOrEqual(1);
  const overflowing = await page.locator(".field").evaluateAll((fields) =>
    fields
      .filter((field) => {
        const bounds = field.getBoundingClientRect();
        return bounds.width > 0 && (bounds.left < -1 || bounds.right > window.innerWidth + 1);
      })
      .map((field) => field.outerHTML.slice(0, 80))
  );
  expect(overflowing).toEqual([]);
}

const readDB = (page: Page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem("rabaz-admin-v1")!));

test.describe("product sales", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("adds and edits a product that appears in the storefront", async ({ page }) => {
    await page.goto("/");
    await navigate(page, "فروش محصولات");
    await expect(page.getByRole("table", { name: "سفارش‌های فروش محصولات" }).locator("tbody tr")).toHaveCount(7);
    await expect(page.getByRole("heading", { name: "محصولات 4 محصول" })).toBeVisible();

    await page.getByRole("button", { name: "افزودن محصول", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "افزودن محصول جدید" });
    await expect(dialog).toBeVisible();
    await expectNoOverflow(page);

    await dialog.getByLabel("نام محصول").fill("کارت طلایی راب‌ساز");
    await dialog.getByLabel("شناسه محصول (SKU)").fill("RBZ-GOLD-01");
    await dialog.getByLabel("قیمت فروش (تومان)").fill("9500000");
    await dialog.getByLabel("موجودی در انبار").fill("5");
    await dialog.getByRole("button", { name: "رنگ سبز" }).click();
    await dialog.getByLabel("توضیح کوتاه").fill("کارت هدیه ویژه مشتریان وفادار");
    await dialog.getByRole("button", { name: "افزودن به ویترین" }).click();
    await expect(dialog).toHaveCount(0);
    const card = page.getByRole("heading", { name: "کارت طلایی راب‌ساز" });
    await expect(card).toBeVisible();
    await expect(card.locator("xpath=ancestor::article")).toContainText("9,500,000");
    await expect(card.locator("xpath=ancestor::article")).toContainText("5");
    await expectNoOverflow(page);

    await page.getByRole("button", { name: "ویرایش کارت طلایی راب‌ساز" }).click();
    const edit = page.getByRole("dialog", { name: "ویرایش محصول" });
    await edit.getByLabel("موجودی در انبار").fill("8");
    await edit.getByLabel("قیمت فروش (تومان)").fill("10000000");
    await edit.getByRole("button", { name: "ذخیره تغییرات" }).click();
    await expect(edit).toHaveCount(0);
    await expect(card.locator("xpath=ancestor::article")).toContainText("8");
    await expect(card.locator("xpath=ancestor::article")).toContainText("10,000,000");

    await page.getByRole("button", { name: "غیرفعال کردن کارت طلایی راب‌ساز" }).click();
    await expect(card.locator("xpath=ancestor::article")).toContainText("غیرفعال");
    await page.getByRole("button", { name: "فعال کردن کارت طلایی راب‌ساز" }).click();
    await expect(card.locator("xpath=ancestor::article")).toContainText("فعال");

    const db = await readDB(page);
    const saved = db.products.find((product: { sku: string }) => product.sku === "RBZ-GOLD-01");
    expect(saved).toMatchObject({ price: 10_000_000, stock: 8, active: true, tone: "mint" });
    await page.reload();
    await navigate(page, "فروش محصولات");
    await expect(page.getByRole("heading", { name: "کارت طلایی راب‌ساز" })).toBeVisible();
  });

  test("records a sale, links stock and accounting, and keeps state transitions consistent", async ({
    page,
  }) => {
    await page.goto("/");
    await navigate(page, "فروش محصولات");
    const table = page.getByRole("table", { name: "سفارش‌های فروش محصولات" });

    await page.getByRole("button", { name: "ثبت فروش", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "ثبت سفارش فروش" });
    await expect(dialog).toBeVisible();
    await expectNoOverflow(page);

    await expect(dialog.getByLabel("محصول")).toHaveValue("p1");
    await dialog.getByLabel("تعداد").fill("2");
    await dialog.getByLabel("نام خریدار").fill("خریدار آزمایشی");
    await dialog.getByLabel("شماره تماس (اختیاری)").fill("0912 000 0000");
    await dialog.getByLabel("روش پرداخت").selectOption("shaba");
    await expect(dialog.getByText("IR65 0540 1029 9213 4005 1320 479")).toBeVisible();
    await dialog.getByLabel("کد پیگیری / شناسه واریز").fill("SHP-1");
    await expect(dialog.getByText("9,700,000").first()).toBeVisible();
    await dialog.getByRole("button", { name: "ثبت سفارش", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(dialog).toHaveCount(0);
    await expect(table.locator("tbody tr")).toHaveCount(8);
    const first = table.locator("tbody tr").first();
    await expect(first).toContainText("خریدار آزمایشی");
    await expect(first).toContainText("9,700,000");
    await expect(first).toContainText("واریز به شبا");
    await expect(first).toContainText("SHP-1");
    await expect(first).toContainText("پرداخت‌شده");

    const stockOf = async (sku: string) => {
      const db = await readDB(page);
      const product = db.products.find((item: { sku: string }) => item.sku === sku);
      return { stock: product.stock, sold: product.sold };
    };
    const journalForLatest = async () => {
      const db = await readDB(page);
      const sale = db.sales.find((item: { buyer: string }) => item.buyer === "خریدار آزمایشی");
      return {
        sale,
        journal: db.journal.filter((entry: { ref?: string }) => entry.ref === sale.id),
        stock: db.products.find((item: { id: string }) => item.id === sale.productId),
      };
    };

    expect(await stockOf("RBZ-HW-01")).toEqual({ stock: 22, sold: 43 });
    let current = await journalForLatest();
    expect(current.sale).toMatchObject({ qty: 2, total: 9_700_000, payment: "shaba", tracking: "SHP-1" });
    expect(current.journal).toHaveLength(1);
    expect(current.journal[0]).toMatchObject({ amount: 9_700_000, unit: "IRR", category: "فروش محصولات" });

    await first.getByRole("combobox").selectOption("pending");
    await expect(first).toContainText("در انتظار");
    current = await journalForLatest();
    expect(current.journal).toHaveLength(0);
    expect(current.stock.stock).toBe(22);

    await first.getByRole("combobox").selectOption("shipped");
    await expect(first).toContainText("ارسال‌شده");
    current = await journalForLatest();
    expect(current.journal).toHaveLength(1);

    await first.getByRole("combobox").selectOption("cancelled");
    await expect(first).toContainText("لغو‌شده");
    expect(await stockOf("RBZ-HW-01")).toEqual({ stock: 24, sold: 41 });
    current = await journalForLatest();
    expect(current.journal).toHaveLength(0);

    await first.getByRole("combobox").selectOption("paid");
    expect(await stockOf("RBZ-HW-01")).toEqual({ stock: 22, sold: 43 });
    current = await journalForLatest();
    expect(current.journal).toHaveLength(1);

    await first.getByRole("button", { name: "حذف سفارش" }).click();
    const remove = page.getByRole("dialog", { name: "حذف سفارش فروش" });
    await expect(remove).toContainText("به موجودی «کیف پول سخت‌افزاری رابسیف» برمی‌گردد");
    await remove.getByRole("button", { name: "حذف سفارش" }).click();
    await expect(remove).toHaveCount(0);
    await expect(table.locator("tbody tr")).toHaveCount(7);
    expect(await stockOf("RBZ-HW-01")).toEqual({ stock: 24, sold: 41 });
    const db = await readDB(page);
    expect(db.journal.filter((entry: { category: string }) => entry.category === "فروش محصولات").length).toBeGreaterThan(0);
    await expectNoOverflow(page);
  });

  test("rejects overselling and keeps the page healthy on a 320px phone", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/");
    await navigate(page, "فروش محصولات");
    await page.getByRole("button", { name: "ثبت فروش", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "ثبت سفارش فروش" });
    await dialog.getByLabel("محصول").selectOption({ label: "بسته استارتر ماینینگ — 128,000,000 تومان" });
    await dialog.getByLabel("تعداد").fill("8");
    await dialog.getByLabel("نام خریدار").fill("خریدار آزمون موجودی");
    await dialog.getByRole("button", { name: "ثبت سفارش", exact: true }).click();
    await expect(dialog).toBeVisible();
    await expect(page.getByText(/موجودی بسته استارتر ماینینگ کافی نیست/)).toBeVisible();
    await dialog.getByLabel("تعداد").fill("7");
    await dialog.getByRole("button", { name: "ثبت سفارش", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByText("خریدار آزمون موجودی")).toBeVisible();
    await expectNoOverflow(page);
    await page.reload();
    await navigate(page, "فروش محصولات");
    await expect(page.getByText("خریدار آزمون موجودی")).toBeVisible();
  });
});

test("legacy data is migrated without losing existing records", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "rabaz-admin-v1",
      JSON.stringify({
        version: 1,
        treasury: {
          asset: 1234,
          marketPrice: 500,
          buybackInfo: { bank: "بانک", holder: "شرکت", shaba: "IR00" },
          stakeReturns: [],
          baseReturns: [],
          fees: [],
          buybacks: [],
        },
        journal: [
          {
            id: "keep",
            at: new Date().toISOString(),
            title: "رکورد قدیمی",
            category: "درآمد",
            dir: "in",
            amount: 10,
            unit: "IRR",
          },
        ],
        chats: [],
      })
    );
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("داشبورد");
  await expect(page.getByText("1,234").first()).toBeVisible();
  const migrated = await readDB(page);
  expect(migrated.version).toBe(2);
  expect(migrated.treasury.asset).toBe(1234);
  expect(migrated.journal.some((entry: { id: string }) => entry.id === "keep")).toBe(true);
  await expect(page.getByRole("table", { name: "دفتر روزنامه" })).toHaveCount(0);
  await navigate(page, "فروش محصولات");
  await expect(
    page.getByRole("table", { name: "سفارش‌های فروش محصولات" }).locator("tbody tr")
  ).toHaveCount(7);
  await expect(page.getByRole("heading", { name: "کیف پول سخت‌افزاری رابسیف" })).toBeVisible();
  await expectNoOverflow(page);
});
