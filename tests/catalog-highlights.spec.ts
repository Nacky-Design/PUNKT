import { expect, test } from "@playwright/test";

test("class and mileage selection carry prices through the catalogue and vehicle details", async ({ page }) => {
  await page.goto("/");
  const form = page.getByRole("form", { name: "Параметры аренды" });
  const category = form.getByRole("combobox", { name: "Класс автомобиля" });
  await expect(form.locator("label").first()).toContainText("Класс автомобиля");
  await form.getByRole("button", { name: "Все параметры" }).click();
  await expect(page.getByRole("region", { name: "Дополнительные параметры автомобиля" })
    .getByRole("combobox", { name: "Класс автомобиля" })).toHaveCount(0);
  await page.keyboard.press("Escape");

  await category.selectOption("Кроссовер");
  const start = form.getByRole("button", { name: /^Получение/ });
  const end = form.getByRole("button", { name: /^Возврат/ });
  await start.click();
  const calendar = page.getByRole("dialog", { name: "Выбор дат аренды" });
  await calendar.getByRole("button", { name: "Следующий месяц" }).click();
  const dates = calendar.locator(".month").first().locator(".date-grid button");
  await dates.first().click();
  await dates.nth(3).click();
  const startText = await start.innerText();
  const endText = await end.innerText();
  await form.getByRole("combobox", { name: "Место получения" }).selectOption("Шереметьево (SVO)");
  await form.getByRole("button", { name: "Применить", exact: true }).click();
  const cards = page.locator(".fleet-card");
  await expect(cards).toHaveCount(2);
  const before = await cards.first().locator(".car-price strong").innerText();
  const beforeTotal = await cards.first().locator(".car-price small").innerText();
  const amount = (value: string) => Number(value.split("₽")[0]!.replace(/\D/g, ""));

  const trigger = form.getByRole("button", { name: /Пробег в сутки/ });
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.click();
  const mileage = page.getByRole("group", { name: "Пакеты пробега" });
  const higherPackage = mileage.getByRole("button", { name: /250 км/ });
  await higherPackage.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).toContainText("250 км");
  await expect(trigger).toBeFocused();
  await expect(cards).toHaveCount(2);
  const price = await cards.first().locator(".car-price strong").innerText();
  const total = await cards.first().locator(".car-price small").innerText();
  expect(amount(price) - amount(before)).toBe(700);
  expect(amount(total) - amount(beforeTotal)).toBe(2100);

  await page.getByRole("button", { name: "Сравнить цены" }).click();
  await expect(higherPackage).toBeFocused();
  await expect(higherPackage).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(category).toHaveValue("Кроссовер");
  await expect(start).toHaveText(startText, { useInnerText: true });
  await expect(end).toHaveText(endText, { useInnerText: true });
  await expect(form.getByRole("combobox", { name: "Место получения" })).toHaveValue("Шереметьево (SVO)");

  await cards.first().getByRole("button", { name: "Подробнее", exact: true }).click();
  await expect(page.getByRole("group", { name: "Выбор тарифа по пробегу" })
    .getByRole("button", { name: /250 км/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".estimate-total strong")).toHaveText(total.split(" за")[0]!);
  await page.getByRole("button", { name: "Все автомобили" }).click();
  await expect(category).toHaveValue("Кроссовер");
  await expect(trigger).toContainText("250 км");
  await expect(start).toHaveText(startText, { useInnerText: true });
  await expect(end).toHaveText(endText, { useInnerText: true });

  await page.getByRole("navigation", { name: "Главное меню" })
    .getByRole("button", { name: "Цены", exact: true }).click();
  await expect(page.getByRole("group", { name: "Лимит пробега в сутки" })
    .getByRole("button", { name: /250 км/ })).toHaveAttribute("aria-pressed", "true");
});

test("mobile banners can be browsed manually and link to their actions", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const banners = page.getByRole("region", { name: /Акции и преимущества/ });
  const track = banners.locator(".highlights-track");
  await expect(track).toHaveJSProperty("scrollLeft", 0);

  const next = banners.getByRole("button", { name: "Следующий баннер" });
  await next.click();
  await expect(next).toHaveAttribute("aria-disabled", "true");
  const image = banners.locator("img").nth(1);
  await expect.poll(() => image.evaluate((element) => element.naturalWidth)).toBeGreaterThan(0);
  await banners.getByRole("button", { name: "Сравнить цены" }).click();
  const dialog = page.getByRole("dialog", { name: "Пробег в сутки" });
  await expect(dialog.getByRole("button", { name: /100 км/ })).toBeFocused();
  await dialog.getByRole("button", { name: /500 км/ }).click();
  await expect(dialog).toHaveCount(0);
  const trigger = page.getByRole("form", { name: "Параметры аренды" })
    .getByRole("button", { name: /Пробег в сутки/ });
  await expect(trigger).toContainText("500 км");
  await expect(trigger).toBeFocused();

  await banners.getByRole("button", { name: "Предыдущий баннер" }).click();
  await expect(track).toHaveJSProperty("scrollLeft", 0);
  await banners.getByRole("link", { name: "Условия доставки" }).click();
  await expect(page).toHaveURL(/#promotions\/free-delivery$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Бесплатная доставка по Москве.");
  await expect(page.locator("main")).toContainText("09:00–21:00");
});
