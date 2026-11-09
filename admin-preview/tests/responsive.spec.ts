import { expect, test, type Page } from "@playwright/test";

const screens = [
  { width: 320, height: 568 },
  { width: 360, height: 780 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 640, height: 800 },
  { width: 768, height: 1024 },
  { width: 844, height: 390 },
  { width: 1024, height: 768 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
];

async function navigate(page: Page, label: string) {
  const menu = page.getByRole("button", { name: "باز کردن منو", exact: true });
  if (await menu.isVisible()) await menu.click();
  await page
    .getByRole("navigation", { name: "بخش‌های پنل" })
    .getByRole("button", { name: new RegExp(`^${label}`) })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(label);
  await expect(page.locator("body")).not.toHaveCSS("position", "fixed");
}

async function expectNoOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      )
    )
    .toBeLessThanOrEqual(1);

  const overflowingFields = await page.locator(".field").evaluateAll((fields) =>
    fields
      .filter((field) => {
        const bounds = field.getBoundingClientRect();
        return bounds.width > 0 && (bounds.left < -1 || bounds.right > window.innerWidth + 1);
      })
      .map((field) => field.getAttribute("aria-label") ?? field.outerHTML.slice(0, 80))
  );
  expect(overflowingFields).toEqual([]);
}

for (const viewport of screens) {
  test.describe(`${viewport.width}x${viewport.height}`, () => {
    test.use({
      viewport,
      isMobile: viewport.width < 1024,
      hasTouch: viewport.width < 1024,
    });

    test("all sections, forms and chat fit the viewport", async ({ page }, testInfo) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto("/");

      for (const [id, label] of [
        ["dashboard", "داشبورد"],
        ["treasury", "خزانه"],
        ["sales", "فروش محصولات"],
        ["accounting", "حسابداری"],
        ["support", "پشتیبانی"],
      ]) {
        await navigate(page, label);
        await expectNoOverflow(page);

        if (viewport.width === 390 || viewport.width === 1440) {
          await page.screenshot({ path: testInfo.outputPath(`${id}.png`) });
        }

        if (id === "treasury" || id === "accounting" || id === "sales") {
          const tables = page.locator(".responsive-table");
          if (viewport.width < 640) {
            for (const table of await tables.all()) {
              await expect(table).toHaveCSS("display", "block");
              await expect(table.locator("tbody tr").first()).toHaveCSS("display", "grid");
            }
          }

          const trigger =
            id === "treasury" ? "ثبت بازخرید" : id === "accounting" ? "ثبت سرفصل" : "ثبت فروش";
          await page.getByRole("button", { name: trigger, exact: true }).first().click();
          const dialog = page.getByRole("dialog");
          await expect(dialog).toBeVisible();
          await expect(page.locator("body")).toHaveCSS("position", "fixed");
          await expectNoOverflow(page);
          const bounds = await dialog.boundingBox();
          expect(bounds!.x).toBeGreaterThanOrEqual(0);
          expect(bounds!.y).toBeGreaterThanOrEqual(0);
          expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(viewport.height + 1);
          await expect(dialog.getByRole("button", { name: "بستن پنجره" })).toBeInViewport();
          if (viewport.width < 768) {
            await expect(dialog.locator(".field").first()).toHaveCSS("font-size", "16px");
          }
          if (viewport.width === 390) {
            await page.screenshot({ path: testInfo.outputPath(`${id}-form.png`) });
          }
          await dialog.getByRole("button", { name: "بستن پنجره" }).click();
          await expect(dialog).toHaveCount(0);
          await expect(page.locator("body")).not.toHaveCSS("position", "fixed");
        }
      }

      await page.getByRole("button", { name: "گفت‌وگو با سارا محمدی", exact: true }).click();
      await expectNoOverflow(page);
      const fullscreen = viewport.width < 768 || (viewport.width < 1024 && viewport.height <= 500);
      if (fullscreen) {
        await expect(page.getByRole("dialog", { name: "گفت‌وگو با سارا محمدی" })).toBeVisible();
        await expect(
          page.getByRole("button", { name: "بازگشت به فهرست گفت‌وگوها" })
        ).toBeInViewport();
        await expect(page.getByRole("textbox", { name: "پاسخ به کاربر" })).toBeInViewport();
        await expect(page.getByRole("button", { name: "ارسال", exact: true })).toBeInViewport();
      }
      if (viewport.width === 390 || viewport.width === 1440) {
        await page.screenshot({ path: testInfo.outputPath("conversation.png") });
      }
      expect(errors).toEqual([]);
    });
  });
}

test.describe("mobile interactions", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("drawer traps focus, restores scroll and closes on backdrop or Escape", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, 400));
    const menu = page.getByRole("button", { name: "باز کردن منو", exact: true });
    await menu.click();
    const drawer = page.getByRole("dialog", { name: "منوی مدیریت" });
    await expect(drawer).toBeVisible();
    await expect(page.locator("body")).toHaveCSS("position", "fixed");
    await expect(drawer).toBeFocused();
    await page.keyboard.press("Tab");
    expect(await drawer.evaluate((element) => element.contains(document.activeElement))).toBe(
      true
    );
    await page.keyboard.press("Escape");
    await expect(drawer).toHaveCount(0);
    await expect(menu).toBeFocused();
    expect(await page.evaluate(() => window.scrollY)).toBe(400);
    await menu.click();
    await page
      .getByRole("button", { name: "بستن منو با لمس بیرون آن" })
      .click({ position: { x: 15, y: 150 } });
    await expect(page.locator("body")).not.toHaveCSS("position", "fixed");
    await navigate(page, "فروش محصولات");
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });

  test("buyback and fee forms remain usable and persist on a 320px phone", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto("/");
    await navigate(page, "خزانه");
    await page.getByRole("button", { name: "ثبت بازخرید", exact: true }).first().click();
    const dialog = page.getByRole("dialog", { name: "ثبت تراکنش بازخرید" });
    await dialog.getByLabel("مقدار RBZ بازخریدشده").fill("250");
    await dialog.getByLabel("مقابل ریالی (تومان)", { exact: false }).fill("3125000");
    await dialog.getByLabel("توضیح (اختیاری)").fill("ثبت آزمایشی موبایل");
    await dialog.getByRole("button", { name: "ثبت بازخرید", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect
      .poll(() =>
        page.evaluate(
          () => JSON.parse(localStorage.getItem("rabaz-admin-v1")!).treasury.asset
        )
      )
      .toBe(15000250);
    await expectNoOverflow(page);

    const fees = page.locator("#fees");
    await fees.getByLabel("کاربر", { exact: true }).fill("کاربر موبایل");
    await fees.getByLabel("مبلغ کارمزد (RBZ)").fill("500");
    await fees.getByRole("button", { name: "ثبت و ورود به دفتر" }).click();
    await page.reload();
    await navigate(page, "خزانه");
    await expect(page.getByRole("table", { name: "کارمزدهای دریافتی" })).toContainText(
      "کاربر موبایل"
    );
    await expect(page.getByRole("table", { name: "تراکنش‌های بازخرید" })).toContainText(
      "ثبت آزمایشی موبایل"
    );
    await expectNoOverflow(page);
  });

  test("accounting supports create, search, export and confirmed deletion", async ({ page }) => {
    await page.goto("/");
    await navigate(page, "حسابداری");
    await page.getByRole("button", { name: "ثبت سرفصل", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "ثبت سرفصل جدید در دفتر" });
    await dialog.getByLabel("عنوان سرفصل").fill("تست موبایل");
    await dialog.getByLabel("مبلغ", { exact: true }).fill("1250");
    await dialog.getByRole("button", { name: "ثبت در دفتر" }).click();
    await expect(dialog).toHaveCount(0);
    await page.getByRole("textbox", { name: "جستجوی دفتر روزنامه" }).fill("تست موبایل");
    const table = page.getByRole("table", { name: "دفتر روزنامه" });
    await expect(table.locator("tbody tr")).toHaveCount(1);
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "خروجی CSV" }).click();
    expect((await downloadPromise).suggestedFilename()).toBe("rabaz-journal.csv");
    const remove = page.getByRole("button", { name: "حذف سرفصل تست موبایل" });
    await remove.click();
    await table.getByRole("button", { name: "انصراف" }).click();
    await expect(table.locator("tbody tr")).toHaveCount(1);
    await remove.click();
    await table.getByRole("button", { name: "تأیید حذف" }).click();
    await expect(table.locator("tbody tr")).toHaveCount(0);
    await expectNoOverflow(page);
  });

  test("chat handles multiline drafts, narrow keyboard viewport and long messages", async ({
    page,
  }) => {
    await page.goto("/");
    await navigate(page, "پشتیبانی");
    await page.getByRole("button", { name: "گفت‌وگو با سارا محمدی", exact: true }).click();
    const editor = page.getByRole("textbox", { name: "پاسخ به کاربر" });
    const send = page.getByRole("button", { name: "ارسال", exact: true });
    await expect(send).toBeDisabled();
    await editor.fill("پاسخ موبایل");
    await editor.press("Enter");
    await expect(editor).toHaveValue("پاسخ موبایل\n");
    await page.getByRole("button", { name: "بازگشت به فهرست گفت‌وگوها" }).click();
    await page.getByRole("button", { name: "گفت‌وگو با امیر رضایی", exact: true }).click();
    await expect(editor).toHaveValue("");
    await page.getByRole("button", { name: "بازگشت به فهرست گفت‌وگوها" }).click();
    await page.getByRole("button", { name: "گفت‌وگو با سارا محمدی", exact: true }).click();
    await expect(editor).toHaveValue("پاسخ موبایل\n");
    const message = `پاسخ موبایل ${"1234567890".repeat(25)}`;
    await editor.fill(message);
    await page.setViewportSize({ width: 390, height: 400 });
    await expect(editor).toBeInViewport();
    await expect(send).toBeInViewport();
    await send.click();
    await expect(page.getByRole("log")).toContainText(message);
    await expect(send).toBeDisabled();
    await expectNoOverflow(page);
    await page.getByRole("combobox", { name: "وضعیت گفت‌وگو" }).selectOption("resolved");
    await page.setViewportSize({ width: 844, height: 390 });
    await expect(editor).toBeInViewport();
    await expect(
      page.getByRole("button", { name: "بازگشت به فهرست گفت‌وگوها" })
    ).toBeInViewport();
    await page.getByRole("button", { name: "بازگشت به فهرست گفت‌وگوها" }).click();
    await expect(page.locator("body")).not.toHaveCSS("position", "fixed");
    await page.reload();
    await navigate(page, "پشتیبانی");
    await page.getByRole("button", { name: "گفت‌وگو با سارا محمدی", exact: true }).click();
    await expect(page.getByRole("log")).toContainText(message);
    await expect(page.getByRole("combobox", { name: "وضعیت گفت‌وگو" })).toHaveValue("resolved");
  });
});
