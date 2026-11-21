import { expect, test } from "@playwright/test";

test("class and mileage selection carry prices through the catalogue and vehicle details", async ({ page }) => {
  await page.goto("/");
  const form = page.getByRole("form", { name: "Параметры аренды" });
  const category = form.getByRole("button", { name: /^Класс автомобиля:/ });
  await expect(form.getByRole("button").first()).toHaveAccessibleName(/^Класс автомобиля:/);
  await form.getByRole("button", { name: "Все параметры" }).click();
  await expect(page.getByRole("region", { name: "Дополнительные параметры автомобиля" })
    .getByRole("button", { name: /^Класс автомобиля:/ })).toHaveCount(0);
  await page.keyboard.press("Escape");

  await category.click();
  await page.getByRole("option", { name: "Кроссовер", exact: true }).click();
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
  const pickup = form.getByRole("button", { name: /^Место получения:/ });
  await pickup.click();
  await page.getByRole("option", { name: "Шереметьево (SVO)", exact: true }).click();
  await form.getByRole("button", { name: "Применить", exact: true }).click();
  const cards = page.locator(".fleet-card");
  await expect(cards).toHaveCount(4);
  const before = await cards.first().locator(".car-price strong").innerText();
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
  await expect(cards).toHaveCount(4);
  const price = await cards.first().locator(".car-price strong").innerText();
  expect(amount(price) - amount(before)).toBe(800);

  await page.getByRole("button", { name: "Сравнить цены" }).click();
  await expect(higherPackage).toBeFocused();
  await expect(higherPackage).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(category).toHaveAccessibleName("Класс автомобиля: Кроссовер");
  await expect(start).toHaveText(startText, { useInnerText: true });
  await expect(end).toHaveText(endText, { useInnerText: true });
  await expect(pickup).toHaveAccessibleName("Место получения: Шереметьево (SVO)");

  await cards.first().getByRole("button", { name: "Подробнее", exact: true }).click();
  await expect(page.getByRole("group", { name: "Выбор тарифа по пробегу" })
    .getByRole("button", { name: /250 км/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".vehicle-heading-price strong")).toContainText(price);
  await page.getByRole("button", { name: "Все автомобили" }).click();
  await expect(category).toHaveAccessibleName("Класс автомобиля: Кроссовер");
  await expect(trigger).toContainText("250 км");
  await expect(start).toHaveText(startText, { useInnerText: true });
  await expect(end).toHaveText(endText, { useInnerText: true });

  await page.getByRole("navigation", { name: "Главное меню" })
    .getByRole("link", { name: "Цены", exact: true }).click();
  const priceOptions = page.getByRole("group", { name: "Пробег в сутки" });
  const solaris = page.getByRole("row").filter({ hasText: "Hyundai Solaris" });
  await expect(priceOptions.getByRole("button", { name: "100 км" })).toHaveAttribute("aria-pressed", "true");
  await expect(solaris.locator(".price")).toContainText(/2\s600 ₽/);
  await expect(solaris).toContainText(/10\s000 ₽/);
  await expect(solaris).not.toContainText(/за [345] д/);
  await priceOptions.getByRole("button", { name: /^250 км/ }).click();
  await expect(solaris.locator(".price")).toContainText(/3\s000 ₽/);
  await priceOptions.getByRole("button", { name: /^500 км/ }).click();
  await expect(solaris.locator(".price")).toContainText(/4\s000 ₽/);
  await page.getByRole("button", { name: "Что покрывает «Защита+»" }).click();
  await expect(page.getByRole("dialog", { name: "Защита+" })).toBeVisible();
  await page.keyboard.press("Escape");
  await solaris.getByRole("button", { name: /К карточке Hyundai Solaris с «Защитой\+»/ }).click();
  await expect(page.getByRole("checkbox", { name: /Добавить «Защиту\+»/ })).toBeChecked();
  await expect(page.locator(".vehicle-heading-price")).toContainText(/4\s500 ₽/);
  await page.getByRole("button", { name: "К ценам" }).click();
  await expect(priceOptions.getByRole("button", { name: "500 км" })).toHaveAttribute("aria-pressed", "true");
  await expect(solaris.locator(".price")).toContainText(/4\s000 ₽/);
  const carLink = solaris.getByRole("link", { name: "Hyundai Solaris" });
  await carLink.getByRole("img").click();
  await expect(page.locator(".vehicle-heading-price")).toContainText(/4\s000 ₽/);
  await page.getByRole("button", { name: "К ценам" }).click();
  await expect(carLink).toBeFocused();
  await page.getByRole("link", { name: "Доп. услуги" }).click();
  await expect(page.getByRole("heading", { name: "Доставка автомобиля" })).toBeVisible();
  await page.getByRole("link", { name: "Компенсация ущерба" }).click();
  await expect(page.getByRole("heading", { name: "Компенсация ущерба" })).toBeVisible();
});

test("price lists are shareable and damage prices fit the selected class on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/#prices/services");
  await expect(page.getByRole("heading", { name: "Доставка автомобиля" })).toBeVisible();
  const damageLink = page.getByRole("link", { name: "Компенсация ущерба" });
  await damageLink.click();
  await expect(page).toHaveURL(/#prices\/damage$/);
  await page.reload();
  await expect(damageLink).toHaveAttribute("aria-current", "page");

  const classOptions = page.getByRole("group", { name: "Класс автомобиля" });
  const prices = page.getByRole("table").first();
  await expect(prices.getByRole("columnheader", { name: "Эконом" })).toBeVisible();
  const business = classOptions.getByRole("button", { name: "Бизнес" });
  await business.click();
  await expect(business).toHaveAttribute("aria-pressed", "true");
  await expect(prices.getByRole("columnheader")).toHaveCount(2);
  await expect(prices.getByRole("columnheader", { name: "Бизнес" })).toBeVisible();
  await expect(prices.getByRole("row").filter({ hasText: "Сколы Л.П." })).toContainText(/800 ₽/);
  for (const table of await page.locator(".table-wrap").all()) {
    expect(await table.evaluate(el => el.scrollWidth)).toBe(await table.evaluate(el => el.clientWidth));
  }

  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(classOptions).toBeHidden();
  await expect(prices.getByRole("columnheader")).toHaveCount(5);
  await page.goBack();
  await expect(page).toHaveURL(/#prices\/services$/);
  await expect(page.getByRole("link", { name: "Доп. услуги" })).toHaveAttribute("aria-current", "page");
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
  await expect(banners.getByText("2 из 2", { exact: true })).toBeVisible();
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
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Бесплатная доставка в пределах МКАД.");
  await expect(page.locator("main")).toContainText("09:00–21:00");
});


test("manual pickup address is confirmed from the catalogue and carried to the request", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.clock.setFixedTime(new Date("2026-11-20T10:00:00+03:00"));
  await page.goto("/");
  const pickup = page.getByRole("button", { name: /^Место получения:/ });
  await pickup.click();
  await expect(page.getByRole("option", { name: "Шереметьево (SVO)" })).toBeVisible();
  await page.getByRole("option", { name: "Ввести адрес" }).click();
  const dialog = page.getByRole("dialog", { name: "Введите адрес доставки" });
  const field = dialog.getByRole("combobox", { name: "Адрес доставки · Москва" });
  await expect(field).toBeFocused();
  await dialog.getByRole("button", { name: "Подтвердить адрес" }).click();
  await expect(field).toHaveAttribute("aria-invalid", "true");
  await field.fill("Москва, Новый Арбат, 15");
  await dialog.getByRole("button", { name: "Подтвердить адрес" }).click();
  await expect(pickup).toHaveAccessibleName("Место получения: Москва, Новый Арбат, 15");
  await expect(pickup).toBeFocused();

  await page.locator(".fleet-card").first().getByRole("button", { name: "Подробнее", exact: true }).click();
  await expect(page.getByRole("complementary", { name: "Параметры аренды" })).toContainText("Москва, Новый Арбат, 15");
  await page.getByRole("button", { name: /^Получение/ }).click();
  await page.getByRole("button", { name: "Подтвердить период" }).click();
  await page.getByRole("button", { name: "Подготовить заявку" }).click();
  const request = page.getByRole("dialog", { name: "Запрос на аренду" });
  await expect(request.getByRole("group", { name: "Условия аренды" })).toContainText("Москва, Новый Арбат, 15");
});

test("a map pin resolves to an editable address and is kept in the request", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-11-20T10:00:00+03:00"));
  const tile = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l+kAAAAASUVORK5CYII=", "base64");
  await page.route("https://tile.openstreetmap.org/**", route => route.fulfill({ contentType: "image/png", body: tile }));
  await page.route("https://nominatim.openstreetmap.org/reverse?**", route => route.fulfill({
    json: { address: { city: "Москва", road: "Тверская улица", house_number: "13" } },
  }));
  await page.goto("/");
  await page.getByRole("button", { name: /^Место получения:/ }).click();
  await page.getByRole("option", { name: "Выбрать на карте" }).click();
  const dialog = page.getByRole("dialog", { name: "Выберите адрес на карте" });
  await expect(dialog.getByRole("button", { name: "Выбрать центр карты" })).toBeVisible();
  await dialog.getByRole("region", { name: "Карта Москвы" }).click({ position: { x: 275, y: 145 } });
  await expect(dialog.locator(".pickup-map-marker")).toBeVisible();
  const field = dialog.getByRole("combobox", { name: "Адрес доставки · Москва" });
  await expect(field).toHaveValue("Тверская улица, 13");
  await field.fill("Тверская улица, 14");
  await dialog.getByRole("button", { name: "Подтвердить адрес" }).click();
  await expect(page.getByRole("button", { name: "Место получения: Москва, Тверская улица, 14" })).toBeVisible();

  await page.locator(".fleet-card").first().getByRole("button", { name: "Подробнее", exact: true }).click();
  await page.getByRole("button", { name: /^Получение/ }).click();
  await page.getByRole("button", { name: "Подтвердить период" }).click();
  await page.getByRole("button", { name: "Подготовить заявку" }).click();
  const terms = page.getByRole("group", { name: "Условия аренды" });
  await expect(terms).toContainText("Москва, Тверская улица, 14");
  await expect(terms.getByRole("link", { name: "Точка подачи на карте" })).toHaveAttribute("href", /^https:\/\/www\.openstreetmap\.org\/\?mlat=/);
});

test("manual entry is available when map tiles fail", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.route("https://tile.openstreetmap.org/**", route => route.abort());
  await page.goto("/");
  await page.getByRole("button", { name: /^Место получения:/ }).click();
  await page.getByRole("option", { name: "Выбрать на карте" }).click();
  const dialog = page.getByRole("dialog", { name: "Выберите адрес на карте" });
  await expect(dialog.getByRole("status")).toHaveText("Карта недоступна. Укажите адрес ниже.");
  await dialog.getByRole("button", { name: "Ввести вручную" }).click();
  const manual = page.getByRole("dialog", { name: "Введите адрес доставки" });
  await manual.getByRole("combobox").fill("Новый Арбат, 15");
  await manual.getByRole("button", { name: "Подтвердить адрес" }).click();
  await expect(page.getByRole("button", { name: "Место получения: Москва, Новый Арбат, 15" })).toBeVisible();
});
