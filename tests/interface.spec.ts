import { test, expect } from "@playwright/test";

test("hero video starts muted, respects pause and supports reduced motion", async ({ page }) => {
  await page.goto("/");
  const video = page.locator(".hero-visual video");
  await expect.poll(() => video.evaluate((el: HTMLVideoElement) => el.currentTime)).toBeGreaterThan(0);
  await expect(video).toHaveJSProperty("muted", true);
  await expect(video).toHaveJSProperty("loop", true);
  await page.getByRole("button", { name: "Приостановить фоновое видео" }).click();
  await expect(video).toHaveJSProperty("paused", true);
  await page.getByRole("button", { name: "Воспроизвести фоновое видео" }).click();
  await expect(video).toHaveJSProperty("paused", false);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(video).toHaveAttribute("poster", /hero-wan-hd\.webp$/);
  await expect(video).not.toHaveAttribute("src", /.+/);
  await page.getByRole("button", { name: "Воспроизвести фоновое видео" }).click();
  await expect(video).toHaveAttribute("src", /hero-wan-hd-mobile\.mp4(?:\?.*)?$/);
  await expect.poll(() => video.evaluate((el: HTMLVideoElement) => el.currentTime)).toBeGreaterThan(0);
});

test("advanced selection expands, filters cars and scrolls the rail", async ({
  page,
}) => {
  await page.goto("/#search");
  const panel = page.getByRole("region", { name: "Подбор автомобиля" });
  const panelBefore = await panel.boundingBox();
  await expect(
    page.getByRole("button", { name: "Быстрый выбор автомобиля" }),
  ).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator(".quick-expand")).toHaveClass(/quick-hidden/);
  await page.getByRole("button", { name: "Быстрый выбор автомобиля" }).click();
  await page.waitForTimeout(450);
  await expect.poll(async () => (await panel.boundingBox())!.height).toBeGreaterThan(panelBefore!.height);
  await page.getByRole("button", { name: "Кроссовер", exact: true }).click();
  await expect(page.locator(".car-card")).toHaveCount(4);
  await expect(page.locator(".car-card").first()).toContainText(
    "Geely Coolray",
  );
  const previous = page.getByRole("button", { name: "Предыдущие автомобили" });
  const next = page.getByRole("button", { name: "Следующие автомобили" });
  await expect(previous).toBeHidden();
  await page.getByRole("button", { name: "Все классы", exact: true }).click();
  await expect(previous).toBeHidden();
  await next.click();
  await expect
    .poll(() => page.locator(".car-rail").evaluate((el) => el.scrollLeft))
    .toBeGreaterThan(20);
  await expect(previous).toBeVisible();
});

test("class selection supports keyboard and search has an honest empty state", async ({
  page,
}) => {
  await page.goto("/#search");
  const classField = page.getByRole("button", {
    name: "Класс автомобиля: Все классы",
  });
  await classField.focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: "Класс автомобиля: Стандарт" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Найти автомобиль", exact: true })
    .click();
  await expect(page).toHaveURL(/#catalog$/);
  await expect(page.getByText("По этим параметрам автомобилей нет")).toBeVisible();
  await page.getByRole("button", { name: "Сбросить фильтры" }).click();
  await expect(page.locator(".fleet-card")).toHaveCount(7);
});

test("catalogue compares costs, sorts and returns focus to the vehicle", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const category = page.getByRole("button", { name: /^Класс автомобиля:/ });
  await category.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(category).toHaveAccessibleName("Класс автомобиля: Эконом");
  await expect(category).toBeFocused();
  await page.getByRole("button", { name: "Применить", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Наш автопарк", exact: true })).toBeVisible();
  const cards = page.locator(".fleet-card");
  await expect(cards).toHaveCount(2);
  await page.getByRole("button", { name: /^Сортировка:/ }).click();
  await page.getByRole("option", { name: "Сначала дороже", exact: true }).click();
  const first = cards.first();
  await expect(first.getByRole("heading")).toHaveText("Kia Rio");
  await expect(first).toContainText("5 мест");
  await expect(first).toContainText("100 км / сутки включено");
  await expect(first.locator(".car-price")).toContainText(/2\s800 ₽ \/ сутки/);
  const trigger = first.getByRole("button", { name: "Подробнее: Kia Rio" });
  await trigger.click();
  await page.getByRole("button", { name: "Все автомобили" }).click();
  await expect(trigger).toBeFocused();
  await expect(category).toHaveAccessibleName("Класс автомобиля: Эконом");
  await trigger.click();
  await page.getByRole("button", { name: "Изменить параметры" }).click();
  await expect(page.getByRole("region", { name: "Подбор автомобиля" })).toBeFocused();
  await expect(page.getByRole("button", { name: "Класс автомобиля: Эконом" })).toBeVisible();
});

test("catalogue dates reject past days and keep the return after pickup", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-11-20T10:00:00+03:00"));
  await page.goto("/");
  const start = page.getByRole("button", { name: /^Получение/ });
  const end = page.getByRole("button", { name: /^Возврат/ });
  await start.click();
  const calendar = page.getByRole("dialog", { name: "Выбор дат аренды" });
  await expect(calendar.getByRole("button", { name: "19 ноября 2026 г.", exact: true })).toBeDisabled();
  await calendar.getByRole("button", { name: "25 ноября 2026 г.", exact: true }).click();
  await expect(calendar).toContainText("Теперь выберите дату возврата");
  await calendar.getByRole("button", { name: "24 ноября 2026 г.", exact: true }).click();
  await expect(calendar).toBeVisible();
  await calendar.getByRole("button", { name: "27 ноября 2026 г.", exact: true }).click();
  await expect(calendar).toBeHidden();
  await expect(start).toContainText("24.11.2026");
  await expect(end).toContainText("27.11.2026");
  await page.getByRole("button", { name: "Применить", exact: true }).click();
  await expect(page.locator(".fleet-card .car-price").first()).toContainText(/2\s600 ₽ \/ сутки/);
});

test("vehicle details, cover, mileage and request form use the same rental details", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-11-20T10:00:00+03:00"));
  await page.goto("/#search");
  await page.getByRole("button", { name: "Лимит пробега: 100 км / сутки" }).click();
  await expect(page.getByRole("option", { name: /250 км/ })).toContainText("Цена зависит от автомобиля");
  await page.getByRole("option", { name: /250 км/ }).click();
  await page.getByRole("checkbox", { name: "Защита+", exact: true }).check();
  await page.getByRole("button", { name: "Быстрый выбор автомобиля" }).click();
  await page.locator(".car-card").filter({ hasText: "Hyundai Solaris" }).click();
  const car = page.locator("main");
  await expect(car.locator(".vehicle-heading-price")).toContainText("3 500");
  await expect(car.locator(".estimate-trip")).toContainText("Офис на Авиационной");
  await expect(car.getByRole("group", { name: "Выбор тарифа по пробегу" })
    .getByRole("button", { name: /^250 км/ })).toHaveAttribute("aria-pressed", "true");
  await expect(car.locator(".spec-grid > div").first().locator("dd")).toHaveText("5");
  await expect(car.locator(".vehicle-tech")).toContainText("480 л");
  const gallery = car.getByRole("figure", { name: "Фотографии автомобиля" });
  const mainPhoto = gallery.getByRole("img", { name: "Hyundai Solaris — Синий, вид спереди", exact: true });
  await expect(mainPhoto).toHaveJSProperty("naturalWidth", 1200);
  await expect(mainPhoto).toHaveCSS("object-fit", "contain");
  const photoBox = await mainPhoto.boundingBox();
  const previewsBox = await gallery.getByRole("group", { name: "Выберите фотографию" }).boundingBox();
  expect(photoBox).not.toBeNull();
  expect(previewsBox).not.toBeNull();
  expect(previewsBox!.x).toBeGreaterThan(photoBox!.x + photoBox!.width);
  const rearPhoto = gallery.getByRole("button", { name: "Синий, вид сзади под углом", exact: true });
  await rearPhoto.click();
  await expect(gallery.getByRole("img", { name: "Hyundai Solaris — Синий, вид сзади под углом", exact: true })).toBeVisible();
  await expect(rearPhoto).toHaveAttribute("aria-pressed", "true");
  await rearPhoto.press("ArrowLeft");
  await expect(mainPhoto).toBeVisible();

  const packages = car.getByRole("group", { name: "Выбор тарифа по пробегу" });
  await packages.getByRole("button", { name: /500 км/ }).click();
  await expect(car.locator(".vehicle-heading-price")).toContainText("4 500");
  await packages.getByRole("button", { name: /250 км/ }).click();
  await expect(car.locator(".vehicle-heading-price")).toContainText("3 500");
  const period = car.getByRole("region", { name: "Даты аренды" });
  const prepare = car.getByRole("button", { name: "Подготовить заявку" });
  await expect(period.getByRole("button", { name: "Получение, 20 ноября 2026 г., 10:00" })).toBeVisible();
  await expect(period.getByRole("button", { name: "Возврат, 21 ноября 2026 г., 10:00" })).toBeVisible();
  await expect(period.locator("input")).toHaveCount(0);
  await expect(prepare).toBeDisabled();
  await period.getByRole("button", { name: /^Получение/ }).click();
  const calendar = page.getByRole("dialog", { name: "Даты и время аренды" });
  const confirmPeriod = calendar.getByRole("button", { name: "Подтвердить период" });
  const returnTime = calendar.getByLabel("Время возврата");
  await returnTime.fill("");
  await expect(confirmPeriod).toBeDisabled();
  await expect(calendar.getByRole("alert")).toContainText("Укажите время");
  await returnTime.fill("10:00");
  await confirmPeriod.click();

  await prepare.click();
  const request = page.getByRole("dialog", { name: "Запрос на аренду" });
  const summary = request.getByRole("group", { name: "Условия аренды" });
  await expect(summary).toContainText(/за 1 день\s*3\s500 ₽/);
  await expect(request.locator("input")).toHaveCount(3);
  await request.getByRole("button", { name: "Закрыть окно" }).click();

  await period.getByRole("button", { name: /^Получение/ }).click();
  await calendar.getByRole("button", { name: "22 ноября 2026 г.", exact: true }).click();
  await calendar.getByRole("button", { name: "25 ноября 2026 г.", exact: true }).click();
  await calendar.getByLabel("Время получения").fill("0930");
  await confirmPeriod.click();
  await expect(period.getByRole("button", { name: /^Получение/ })).toContainText("09:30");
  await prepare.click();
  await expect(summary).toContainText("09:30");
  await expect(summary).toContainText("25 ноября 2026 г., 10:00");
  await expect(car.locator(".vehicle-quote")).toContainText(/Пробег за весь срок\s*1\s000 км/);
  await expect(summary).toContainText(/1\s000 км за весь срок/);
  await expect(summary).toContainText(/за 4 дня\s*14\s000 ₽/);
  await request.getByRole("button", { name: "Собрать параметры для звонка" }).click();
  await expect(request.getByText("Введите телефон полностью")).toBeVisible();
  await request.getByRole("textbox", { name: "Ваше имя" }).fill("Александр");
  await request.getByRole("textbox", { name: "Телефон", exact: true }).fill("9991234567");
  await request.getByRole("checkbox", { name: /Согласен на обработку/ }).check();
  await request.getByRole("button", { name: "Собрать параметры для звонка" }).click();
  const details = page.getByRole("dialog", { name: "Параметры аренды" });
  await expect(details).toContainText(/Предварительно 14\s000 ₽/);
  await expect(details.getByRole("heading", { name: "Что сообщить при звонке" })).toBeVisible();
  await expect(details.getByRole("link", { name: "Позвонить в «Пункт»" })).toHaveAttribute("href", /^tel:/);
  await page.keyboard.press("Escape");
  await expect(details).toBeHidden();
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
});

test("request modal traps focus and restores the opener", async ({ page }) => {
  await page.goto("/#car/1");
  await page.getByRole("region", { name: "Даты аренды" }).getByRole("button", { name: /^Получение/ }).click();
  await page.getByRole("dialog", { name: "Даты и время аренды" }).getByRole("button", { name: "Подтвердить период" }).click();
  const trigger = page.getByRole("button", { name: "Подготовить заявку" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Запрос на аренду" });
  await expect(dialog.getByText("Введённые данные остаются на этой странице.", { exact: false })).toBeVisible();
  await expect(dialog.getByRole("link", { name: "Позвонить сейчас" })).toHaveAttribute("href", "tel:+74951041010");
  const close = dialog.getByRole("button", { name: "Закрыть окно" });
  await expect(close).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(dialog.getByRole("button", { name: "Собрать параметры для звонка" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});

test("the shared calendar focuses the requested endpoint and Back dismisses the request", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-11-22T10:00:00+03:00"));
  await page.goto("/#catalog");
  const opener = page.locator(".fleet-card").first().getByRole("button", { name: "Подробнее", exact: true });
  await opener.click();

  const period = page.getByRole("region", { name: "Даты аренды" });
  const pickup = period.getByRole("button", { name: /^Получение/ });
  const dropoff = period.getByRole("button", { name: /^Возврат/ });
  await dropoff.press("Enter");
  const calendar = page.getByRole("dialog", { name: "Даты и время аренды" });
  await expect(calendar.getByText("Предложенный период")).toBeVisible();
  await expect(calendar.getByRole("button", { name: "Изменить дату возврата" })).toHaveAttribute("aria-pressed", "true");
  await expect(pickup).toHaveAttribute("aria-expanded", "false");
  await expect(dropoff).toHaveAttribute("aria-expanded", "true");
  await expect(calendar.getByRole("button", { name: "23 ноября 2026 г.", exact: true })).toBeFocused();
  await expect(calendar.getByRole("button", { name: "22 ноября 2026 г.", exact: true })).toBeDisabled();
  await expect(calendar.locator(".date-grid button[tabindex='0']")).toHaveCount(1);
  await page.keyboard.press("ArrowRight");
  await expect(calendar.getByRole("button", { name: "24 ноября 2026 г.", exact: true })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  const nextMonth = calendar.getByRole("button", { name: "1 декабря 2026 г.", exact: true });
  await expect(nextMonth).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(calendar.getByText("Предложенный период")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(dropoff).toBeFocused();
  await expect(dropoff).toContainText("23.11, 10:00");

  await pickup.press("Enter");
  await calendar.getByRole("button", { name: "Подтвердить период" }).click();
  await page.getByRole("button", { name: "Подготовить заявку" }).click();
  const request = page.getByRole("dialog", { name: "Запрос на аренду" });
  await expect(request).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/#catalog$/);
  await expect(request).toHaveCount(0);
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await expect(opener).toBeFocused();
});

for (const width of [320, 430, 768, 1024, 1440, 1536, 2048]) {
  test(`catalogue fits its primary fields and mileage at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator(".fleet-banner")).toBeVisible();
    const form = page.getByRole("form", { name: "Параметры аренды" });
    const controls = [form.getByRole("button", { name: /^Класс автомобиля:/ }),
      form.getByRole("button", { name: /^Получение/ }), form.getByRole("button", { name: /^Возврат/ }),
      form.getByRole("button", { name: /^Место получения:/ }),
      form.getByRole("button", { name: /Пробег в сутки/ }), form.getByRole("button", { name: "Все параметры" }),
      form.getByRole("button", { name: "Применить", exact: true })];
    for (const control of controls) {
      const rect = await control.boundingBox();
      expect(rect).not.toBeNull();
      expect(rect!.x).toBeGreaterThanOrEqual(0);
      expect(rect!.x + rect!.width).toBeLessThanOrEqual(width);
    }
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    if (width >= 1180) {
      const captionPositions = await form.locator(".field-caption, .date-caption, .mileage-label")
        .evaluateAll(labels => labels.map(label => label.getBoundingClientRect().top));
      expect(Math.max(...captionPositions) - Math.min(...captionPositions)).toBeLessThan(1);
    }
    await expect(page.locator(".fleet-card")).toHaveCount(7);
  });
}

test("advanced rental options use the current site and delivery links open the offer", async ({ page }) => {
  await page.goto("/?ui-kit#search");
  await expect(page.locator("main h1")).toHaveText("Параметры аренды.");
  await expect(page.getByRole("region", { name: "Подбор автомобиля" })).toBeVisible();
  await expect(page.locator(".hero-visual, #ui-kit")).toHaveCount(0);

  await page.getByRole("link", { name: "К автопарку", exact: true }).click();
  await page.getByRole("link", { name: "Условия доставки" }).click();
  await expect(page.locator("main h1")).toHaveText("Бесплатная доставка в пределах МКАД.");
  await expect(page.locator("main")).toContainText("09:00–21:00");
});

test("desktop services support hover, keyboard navigation and direct detail links", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Главное меню" });
  const trigger = nav.getByRole("button", { name: /список услуг/ });
  const panel = page.locator("#services-panel");
  await expect(panel).toBeHidden();
  await trigger.hover();
  await expect(panel).toBeVisible();
  await page.mouse.move(0, 0);
  await expect(panel).toBeHidden();

  await trigger.focus();
  await page.keyboard.press("ArrowDown");
  await expect(panel.getByRole("link", { name: "Все услуги" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(panel).toBeHidden();

  await nav.getByRole("link", { name: "Услуги", exact: true }).click();
  await expect(page).toHaveURL(/#services$/);
  const longTerm = page.getByRole("link", { name: /Долгосрочная аренда/ });
  await longTerm.click();
  await expect(page).toHaveURL(/#services\/long-term$/);
  await expect(page.getByRole("heading", { name: "Долгосрочная аренда." })).toBeFocused();
  await page.getByRole("link", { name: "Все услуги" }).click();
  await expect(longTerm).toBeFocused();
});

test("mobile services expand by group and open a shareable detail", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/");
  await page.getByRole("button", { name: "Открыть меню" }).click();
  const nav = page.getByRole("navigation", { name: "Мобильное меню" });
  await nav.locator("summary").getByText("Услуги", { exact: true }).click();
  const trip = nav.getByRole("link", { name: "Поездки по России" });
  await expect(trip).toBeHidden();
  await nav.locator("summary").getByText("Поездки и события").click();
  await trip.click();
  await expect(page).toHaveURL(/#services\/russia$/);
  await expect(nav).toBeHidden();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Поездки по России." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Уточнить условия" })).toHaveAttribute("href", /^tel:/);

  await page.goto("/#services");
  const menu = page.getByRole("button", { name: "Открыть меню" });
  await menu.click();
  await nav.locator("summary").getByText("Услуги", { exact: true }).click();
  await nav.getByRole("link", { name: "Все услуги", exact: true }).click();
  await expect(nav).toBeHidden();
  await expect(menu).toBeFocused();
});

test("mobile support and service links keep the right contact and rental context", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/");
  const support = page.getByRole("complementary", { name: "Не нашли ответ на свой вопрос?" });
  await expect(support.getByRole("link", { name: "8 495 104-10-10" })).toHaveAttribute("href", "tel:+74951041010");
  const messengers = support.getByRole("group", { name: "Мессенджеры" });
  await expect(messengers.getByText("Telegram")).toBeVisible();
  await expect(messengers.getByText("Max")).toBeVisible();
  await expect(messengers.getByRole("link")).toHaveCount(0);
  await expect(support.getByText("Ссылки на мессенджеры уточняются.")).toHaveCount(0);

  const menu = page.getByRole("button", { name: /меню$/ });
  await menu.click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("navigation", { name: "Мобильное меню" })).toBeHidden();
  await expect(menu).toBeFocused();

  await page.goto("/#services/business");
  await page.getByRole("link", { name: "Подобрать автомобиль" }).click();
  await expect(page.getByRole("checkbox", { name: "Для юридических лиц" })).toBeChecked();
  await page.goto("/#services/international");
  await page.getByRole("link", { name: "Подобрать автомобиль" }).click();
  await expect(page.getByRole("checkbox", { name: "Иностранный гражданин" })).toBeChecked();
  await page.goto("/#prices");
  await page.getByRole("link", { name: "Без залога — условия аренды" }).first().click();
  await expect(page).toHaveURL(/#conditions\/deposit$/);
  await expect(page.getByRole("heading", { name: "Когда возможна аренда без залога" })).toBeFocused();
});

test("news and promotions keep their detail on reload and return to the list", async ({ page }) => {
  await page.goto("/#news");
  const article = page.getByRole("link", { name: /Как осмотреть автомобиль перед поездкой/ });
  await article.click();
  await expect(page).toHaveURL(/#news\/kak-osmotret-avtomobil$/);
  await expect(page.locator("main article figure img")).toHaveCount(2);
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Как осмотреть автомобиль перед поездкой");
  await page.goBack();
  await expect(article).toBeFocused();

  await page.getByRole("navigation", { name: "Главное меню" }).getByRole("link", { name: "Акции" }).click();
  const offer = page.getByRole("link", { name: /При оплате наличными/ });
  await offer.click();
  await expect(page).toHaveURL(/#promotions\/cash$/);
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("При оплате наличными.");
  await expect(page.getByRole("link", { name: "Уточнить условия" })).toHaveAttribute("href", "tel:+74951041010");
  await expect(page.getByRole("main").getByRole("link", { name: "Посмотреть автомобили" })).toBeVisible();
  await page.getByRole("link", { name: "Все акции" }).click();
  await expect(offer).toBeFocused();
});

for (const [width, height] of [[1920, 1080], [1536, 864], [1440, 900], [1366, 768]]) {
  test(`catalogue video and search share the first screen at ${width}×${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const banner = page.locator(".fleet-banner");
    const video = banner.locator(".hero-visual");
    await expect(banner.getByRole("heading")).toBeVisible();
    const bannerRect = (await banner.boundingBox())!;
    expect(await video.boundingBox()).toEqual(bannerRect);
    const formRect = (await page.getByRole("form", { name: "Параметры аренды" }).boundingBox())!;
    expect(formRect.y).toBeLessThan(bannerRect.y + bannerRect.height);
    expect(formRect.y + formRect.height).toBeLessThan(height);
    const panels = await page.locator(".search-bar > *").evaluateAll(
      elements => elements.map(element => Math.round(element.getBoundingClientRect().top)),
    );
    expect(new Set(panels).size).toBe(1);
    await expect(page.locator(".fleet-heading")).toBeInViewport();
  });
}

test("mileage explanation pools kilometres across paid days and follows selection", async ({
  page,
}) => {
  await page.goto("/#search");
  await page
    .getByRole("button", { name: "Как работает лимит пробега" })
    .click();
  const info = page.getByRole("dialog", { name: "Что означает лимит пробега" });
  await expect(info.getByRole("img", { name: "Автомобиль на загородной дороге" }))
    .toHaveJSProperty("naturalWidth", 900);
  await expect(info).toContainText("Пробег суммируется за все оплаченные сутки");
  await expect(info).toContainText("300 км");
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Как работает лимит пробега" }),
  ).toBeFocused();
  await page
    .getByRole("button", { name: "Лимит пробега: 100 км / сутки" })
    .click();
  await page.getByRole("option", { name: /250 км/ }).click();
  await page
    .getByRole("button", { name: "Как работает лимит пробега" })
    .click();
  await expect(info).toContainText("750 км");
});

test("delivery help does not toggle the checkbox; pickup and delivery stay consistent", async ({
  page,
}) => {
  await page.goto("/#search");
  const box = page.getByRole("checkbox", { name: "Доставка", exact: true });
  await page.getByRole("button", { name: "Как работает доставка" }).click();
  const guide = page.getByRole("dialog", { name: "Как работает доставка" });
  await expect(guide).toContainText("печатный договор");
  await expect(guide.getByRole("img", { name: "Передача ключей от автомобиля клиенту" }))
    .toHaveJSProperty("naturalWidth", 900);
  await expect(box).not.toBeChecked();
  await page.keyboard.press("Escape");
  await box.check();
  await expect(
    page.getByRole("combobox", { name: "Место получения", exact: true }),
  ).toHaveAttribute("placeholder", "Улица и дом в Москве");
  await page
    .getByRole("combobox", { name: "Место получения", exact: true })
    .click();
  await page
    .getByRole("option", { name: "Офис на Авиационной", exact: true })
    .click();
  await expect(box).not.toBeChecked();
  await page
    .getByRole("combobox", { name: "Место получения", exact: true })
    .click();
  await page.getByRole("option", { name: "Шереметьево (SVO)" }).click();
  await expect(box).toBeChecked();
  await box.uncheck();
  await expect(
    page.getByRole("combobox", { name: "Место получения", exact: true }),
  ).toHaveValue("Офис на Авиационной");
});

test("editable pickup suggests houses and preserves a manual address and mileage in the request", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#search");
  const pickup = page.getByRole("combobox", { name: "Место получения", exact: true });
  await pickup.fill("Академика Королева ");
  const house = page.getByRole("option", { name: "улица Академика Королёва, 12", exact: true });
  await expect(house).toBeVisible();
  await pickup.press("ArrowDown");
  await pickup.press("Enter");
  await expect(pickup).toHaveValue("улица Академика Королёва, 12");
  await pickup.fill("улица Академика Королёва");
  await page.getByRole("button", { name: "Найти автомобиль" }).click();
  await expect(pickup).toHaveAttribute("aria-invalid", "true");
  await expect(pickup).toBeFocused();
  await pickup.fill("Сиреневый бульвар, 24с1");
  await page.getByRole("button", { name: "Найти автомобиль" }).click();
  const results = page.locator("main");
  await expect(results.getByRole("button", { name: /^Место получения:/ })).toHaveAccessibleName("Место получения: Москва, Сиреневый бульвар, 24с1");
  await expect(results.locator(".fleet-card").first()).toContainText("100 км / сутки включено");
  await results.getByRole("button", { name: "Подробнее: Hyundai Solaris" }).click();
  const car = page.locator("main");
  await expect(car.getByRole("group", { name: "Выбор тарифа по пробегу" })
    .getByRole("button", { name: /^100 км/ })).toHaveAttribute("aria-pressed", "true");
  await expect(car.locator(".estimate-trip")).toContainText("Москва, Сиреневый бульвар, 24с1");
  await car.getByRole("region", { name: "Даты аренды" }).getByRole("button", { name: /^Получение/ }).click();
  await page.getByRole("dialog", { name: "Даты и время аренды" }).getByRole("button", { name: "Подтвердить период" }).click();
  await car.getByRole("button", { name: "Обсудить пробег" }).click();
  const request = page.getByRole("dialog");
  const summary = request.getByRole("group", { name: "Условия аренды" });
  await expect(summary).toContainText("Пробег — обсудить перед оформлением");
  await expect(summary).toContainText("Москва, Сиреневый бульвар, 24с1");
  await expect(request.locator("input")).toHaveCount(3);
  await request.getByRole("textbox", { name: "Ваше имя" }).fill("Александр");
  await request.getByRole("textbox", { name: "Телефон", exact: true }).fill("9991234567");
  await request.getByRole("checkbox", { name: "Согласен на обработку" }).check();
  await request.getByRole("button", { name: "Собрать параметры для звонка" }).click();
  await expect(request).toContainText("Пробег — обсудить перед оформлением");
  await expect(request).toContainText("Москва, Сиреневый бульвар, 24с1");
});

test("protection guide shows the inspection photo and coverage information", async ({ page }) => {
  await page.goto("/#search");
  await page.getByRole("button", { name: "Что такое Защита+" }).click();
  const guide = page.getByRole("dialog", { name: "Защита+" });
  await expect(guide.getByRole("img", { name: "Осмотр кузова автомобиля перед получением" }))
    .toHaveJSProperty("naturalWidth", 900);
  await expect(guide).toContainText("кузов, стёкла, оптику и зеркала");
  await expect(page.getByRole("checkbox", { name: "Защита+", exact: true })).not.toBeChecked();
});

for (const [width, height] of [[1920, 1080], [1536, 864], [1366, 768]]) {
  test(`catalogue desktop popovers fit horizontally at ${width}×${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    for (const [label, selector] of [
      [/^Класс автомобиля:/, ".class-field .select-menu"], [/^Место получения:/, ".location-field .select-menu"],
      [/^Получение/, ".range-popover"], [/Пробег в сутки/, ".mileage-picker"],
      [/^Все параметры/, ".parameters-panel"],
    ] as const) {
      const trigger = page.getByRole("button", { name: label });
      await trigger.click();
      const popup = page.locator(selector);
      await expect(popup).toBeVisible();
      const rect = (await popup.boundingBox())!;
      expect(rect.x).toBeGreaterThanOrEqual(0);
      expect(rect.x + rect.width).toBeLessThanOrEqual(width);
      await page.keyboard.press("Escape");
      await expect(popup).toBeHidden();
    }
  });
}
