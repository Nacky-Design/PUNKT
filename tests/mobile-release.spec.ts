import { expect, test, type Locator, type Page } from "@playwright/test";

test.use({ hasTouch: true, isMobile: true, deviceScaleFactor: 1, reducedMotion: "reduce" });

async function noOverflow(page: Page, width: number) {
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
}
async function fitsViewport(locator: Locator, width: number, height: number) {
  await expect.poll(async () => {
    const box = await locator.boundingBox();
    return !!box && box.x >= -1 && box.y >= -1 && box.x + box.width <= width + 1 && box.y + box.height <= height + 1;
  }).toBe(true);
}

for (const [width, height] of [[320, 568], [390, 844], [430, 932], [667, 375]]) {
  test(`touch controls stay usable at ${width}×${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    const form = page.getByRole("form", { name: "Параметры аренды" });

    async function openSheet(trigger: Locator, title: string) {
      await trigger.tap();
      const dialog = page.getByRole("dialog", { name: title });
      await expect(dialog).toBeVisible();
      await fitsViewport(dialog, width, height);
      await expect(dialog.getByRole("button", { name: "Закрыть окно" })).toBeFocused();
      return dialog;
    }

    const start = form.getByRole("button", { name: /^Получение/ });
    const calendar = await openSheet(start, "Выбор дат аренды");
    await calendar.getByRole("button", { name: "Следующий месяц" }).tap();
    const days = calendar.locator(".month").first().locator(".date-grid button");
    await days.nth(1).tap();
    await days.nth(4).tap();
    await expect(calendar).toHaveCount(0);
    await expect(start).toBeFocused();

    const filters = await openSheet(form.getByRole("button", { name: /^Все параметры/ }), "Дополнительные параметры автомобиля");
    await filters.getByRole("checkbox", { name: "Детское кресло" }).tap();
    const apply = filters.getByRole("button", { name: "Применить", exact: true });
    await apply.scrollIntoViewIfNeeded();
    await fitsViewport(apply, width, height);
    await apply.tap();
    await expect(filters).toHaveCount(0);
    await expect(page.locator(".extras-summary")).toContainText("Детское кресло");

    const mileageField = form.getByRole("button", { name: /Пробег в сутки/ });
    await mileageField.tap();
    const mileage = page.getByRole("dialog", { name: "Пробег в сутки" });
    await fitsViewport(mileage, width, height);
    await mileage.getByRole("button", { name: /250 км/ }).tap();
    await expect(mileage).toHaveCount(0);
    await expect(mileageField).toBeFocused();
    await expect(mileageField).toContainText("250 км");

    await form.getByRole("combobox", { name: "Класс автомобиля" }).selectOption("Эконом");
    await form.getByRole("button", { name: "Применить", exact: true }).tap();
    const cars = page.locator(".fleet-card");
    await expect(cars).toHaveCount(2);
    await expect(cars.first().locator(".car-price small")).toContainText(/10\s800 ₽ за 3 дня/);
    await noOverflow(page, width);

    const vehicle = cars.first().getByRole("button", { name: "Подробнее: Hyundai Solaris" });
    await vehicle.tap();
    await expect(page.locator("main h1")).toHaveText("Hyundai Solaris");
    const galleryButton = page.getByRole("button", { name: /^Все \d+ фото$/ });
    await galleryButton.tap();
    const gallery = page.getByRole("dialog", { name: "Hyundai Solaris" });
    await fitsViewport(gallery, width, height);
    await gallery.getByRole("button", { name: "Следующее фото" }).tap();
    await expect(gallery.locator(".photo-dialog-header p")).toContainText(/^2\s*\//);
    await gallery.getByRole("button", { name: "Закрыть галерею" }).tap();
    await expect(galleryButton).toBeFocused();

    await page.getByRole("button", { name: "Подготовить заявку" }).tap();
    const request = page.getByRole("dialog", { name: "Запрос на аренду" });
    await fitsViewport(request, width, height);
    await request.getByRole("button", { name: "Проверить заявку" }).tap();
    await expect(request.getByText("Введите телефон полностью")).toBeVisible();
    await request.getByRole("textbox", { name: "Ваше имя" }).fill("Александр");
    await request.getByRole("textbox", { name: "Телефон", exact: true }).fill("9991234567");
    await request.getByRole("checkbox", { name: /^Согласен на обработку/ }).tap();
    await request.getByRole("button", { name: "Проверить заявку" }).tap();
    const confirmation = page.getByRole("dialog", { name: "Параметры аренды" });
    await expect(confirmation.getByRole("link", { name: "Позвонить в «Пункт»" })).toHaveAttribute("href", /^tel:/);
    await confirmation.getByRole("button", { name: "Закрыть окно" }).tap();
    await page.getByRole("button", { name: "Все автомобили" }).tap();
    await expect(vehicle).toBeFocused();
    await expect(mileageField).toContainText("250 км");
    await noOverflow(page, width);
  });
}

test("mobile navigation opens the editorial pages and a sample account", async ({ page }) => {
  const width = 390;
  await page.setViewportSize({ width, height: 844 });
  await page.goto("/");
  for (const [label, heading] of [
    ["Цены", "Цены на аренду."],
    ["Услуги", "Услуги."],
    ["Условия", "Условия аренды."],
    ["Акции", "Акции."],
    ["Новости", "Новости."],
    ["Контакты", "Контакты."],
  ]) {
    await page.getByRole("button", { name: "Открыть меню" }).tap();
    const nav = page.getByRole("navigation", { name: "Мобильное меню" });
    if (label === "Услуги") {
      await nav.locator("summary").filter({ hasText: /^Услуги$/ }).tap();
      await nav.getByRole("button", { name: "Все услуги" }).tap();
    } else {
      await nav.getByRole("button", { name: label, exact: true }).tap();
    }
    await expect(page.locator("main h1")).toHaveText(heading);
    await expect(nav).toHaveCount(0);
    await noOverflow(page, width);
  }
  await page.getByRole("button", { name: "Войти в личный кабинет" }).tap();
  await expect(page.getByText("Используйте вымышленные данные.", { exact: false })).toBeVisible();
  await page.getByRole("textbox", { name: "Логин или e-mail" }).fill("primer@example.test");
  await page.getByLabel("Пароль", { exact: true }).fill("example-only");
  await page.getByRole("button", { name: "Открыть кабинет" }).tap();
  await expect(page.locator("main h1")).toContainText("Здравствуйте");
  await noOverflow(page, width);
});
