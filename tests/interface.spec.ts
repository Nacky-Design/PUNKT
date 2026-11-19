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
  await page.reload();
  await expect(video).toHaveAttribute("poster", /hero-delivery\.webp$/);
  await expect(video).not.toHaveAttribute("src", /.+/);
  await page.getByRole("button", { name: "Воспроизвести фоновое видео" }).click();
  await expect(video).toHaveAttribute("src", /hero-delivery\.mp4(?:\?.*)?$/);
  await expect.poll(() => video.evaluate((el: HTMLVideoElement) => el.currentTime)).toBeGreaterThan(0);
});

test("quick selection preserves hero geometry, filters cars and scrolls the rail", async ({
  page,
}) => {
  await page.goto("/");
  const hero = page.locator(".hero"),
    panel = page.locator(".search-panel");
  const before = await hero.boundingBox(),
    panelBefore = await panel.boundingBox();
  await expect(
    page.getByRole("button", { name: "Быстрый выбор автомобиля" }),
  ).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator(".quick-expand")).toHaveClass(/quick-hidden/);
  await page.getByRole("button", { name: "Быстрый выбор автомобиля" }).click();
  await page.waitForTimeout(450);
  expect((await hero.boundingBox())!.height).toBe(before!.height);
  const panelOpen = await panel.boundingBox();
  expect(panelOpen!.y).toBeLessThan(panelBefore!.y);
  expect(panelOpen!.y + panelOpen!.height).toBeCloseTo(
    panelBefore!.y + panelBefore!.height,
    1,
  );
  await page.getByRole("button", { name: "Кроссовер", exact: true }).click();
  await expect(page.locator(".car-card")).toHaveCount(2);
  await expect(page.locator(".car-card").first()).toContainText(
    "Geely Coolray",
  );
  const previous = page.getByRole("button", { name: "Предыдущие автомобили" });
  const next = page.getByRole("button", { name: "Следующие автомобили" });
  await expect(previous).toBeHidden();
  await expect(next).toBeHidden();
  await page.getByRole("button", { name: "Все классы", exact: true }).click();
  await expect(previous).toBeHidden();
  await next.click();
  await expect
    .poll(() => page.locator(".car-rail").evaluate((el) => el.scrollLeft))
    .toBeGreaterThan(20);
  await expect(previous).toBeVisible();
  await expect(next).toBeHidden();
});

for (const [width, height] of [[320, 568], [390, 844]]) {
  test(`mobile ${width}x${height}: search fits above the fold and seven full-width car cards appear in order`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);

    const panel = page.locator(".search-panel > form");
    await expect(panel).toBeInViewport({ ratio: 1 });
    const offer = (await page.locator(".delivery-offer").boundingBox())!;
    const title = (await page.locator("#hero-title").boundingBox())!;
    expect(offer.y + offer.height).toBeLessThan(title.y);

    await expect(page.getByRole("button", { name: "Быстрый выбор автомобиля" })).toBeHidden();
    await expect(page.getByRole("button", { name: "Весь автопарк" })).toBeHidden();
    await expect(page.getByRole("region", { name: "Автопарк" })).toBeVisible();
    const cards = page.locator(".car-card");
    await expect(cards).toHaveCount(7);
    const bounds = await Promise.all(
      (await cards.all()).map((card) => card.boundingBox()),
    );
    const form = (await panel.boundingBox())!;
    for (const [index, card] of bounds.entries()) {
      expect(card!.x).toBeCloseTo(form.x);
      expect(card!.width).toBeCloseTo(form.width);
      const prev = bounds[index - 1];
      if (prev) expect(card!.y).toBeGreaterThan(prev.y + prev.height);
    }
    await expect(page.getByRole("button", { name: "Следующие автомобили" })).toBeHidden();

    const photos = cards.locator("img");
    await expect(photos).toHaveCount(7);
    for (const photo of await photos.all()) {
      await expect.poll(() => photo.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
    }
    const polo = cards.filter({ hasText: "Volkswagen Polo" });
    await polo.click();
    await expect(page.getByRole("dialog", { name: /Volkswagen Polo/ })).toBeVisible();
  });
}

test("mobile hero has a loaded still and no playback control", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator(".hero video, .hero-playback")).toHaveCount(0);
  await expect(page.locator(".hero-description")).toBeVisible();
  await expect(page.locator(".hero-benefits svg")).toHaveCount(3);
  const hasPoster = await page.locator(".hero-intro").evaluate(async (intro) => {
    const backgrounds = getComputedStyle(intro, "::before").backgroundImage;
    const url = backgrounds.match(/url\("([^"]+hero-delivery-mobile\.webp)"\)/)?.[1];
    if (!url) return false;
    const image = new Image();
    image.src = url;
    await image.decode();
    return image.naturalWidth > 0;
  });
  expect(hasPoster).toBe(true);
});

test("class selection supports keyboard and search has an honest empty state", async ({
  page,
}) => {
  await page.goto("/");
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
  await expect(page.getByText("В этом классе пока нет примеров")).toBeVisible();
  await page
    .locator(".catalog-empty")
    .getByRole("button", { name: "Все классы" })
    .click();
  await expect(page.locator(".result-card")).toHaveCount(7);
});

test("results compare costs, sort and return from vehicle details", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Найти автомобиль", exact: true }).click();
  const results = page.getByRole("dialog", { name: "Подбор автомобилей" });
  const filter = results.getByRole("group", { name: "Фильтр по классу" });
  await filter.getByRole("button", { name: "Эконом", exact: true }).click();
  await expect(results.getByText("3 автомобиля", { exact: true })).toBeVisible();
  await expect(results.getByRole("article")).toHaveCount(3);
  await results.getByRole("combobox", { name: "Сортировка автомобилей" }).selectOption("Сначала дороже");
  await expect(results.getByRole("article").first().getByRole("heading")).toHaveText("Volkswagen Polo");
  const kia = results.getByRole("article").nth(1);
  await expect(kia.getByRole("heading")).toHaveText("Kia Rio");
  await expect(kia).toContainText("5 мест");
  await expect(kia).toContainText("100 км / сутки включено");
  await expect(kia).toContainText(/16\s000 ₽/);
  const trigger = kia.getByRole("button", { name: "Подробнее: Kia Rio" });
  await trigger.click();
  await page.getByRole("button", { name: "К результатам" }).click();
  await expect(trigger).toBeFocused();
  await expect(filter.getByRole("button", { name: "Эконом", exact: true })).toHaveAttribute("aria-pressed", "true");
  await results.getByRole("button", { name: "Изменить параметры" }).click();
  await expect(page.getByRole("region", { name: "Подбор автомобиля" })).toBeFocused();
  await expect(page.getByRole("button", { name: "Класс автомобиля: Эконом" })).toBeVisible();
});

test("dates reject past days and require return after collection", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Дата получения", exact: true })
    .click();
  const calendar = page.locator(".calendar");
  await expect(calendar).toBeVisible();
  const enabled = calendar.locator(
    ".calendar-grid button:not([disabled]):not(.outside)",
  );
  await enabled.last().click();
  await expect(calendar.getByText("Когда вернёте автомобиль?")).toBeVisible();
  const selectedStart = calendar.locator("button.endpoint").first();
  await expect(selectedStart).toBeDisabled();
  await calendar.getByRole("button", { name: "Следующий месяц" }).click();
  await calendar
    .locator(".calendar-grid button:not([disabled]):not(.outside)")
    .first()
    .click();
  await expect(calendar).toBeHidden();
  await page
    .getByRole("button", { name: "Найти автомобиль", exact: true })
    .click();
  await expect(page.locator("#catalog .catalog-trip")).not.toContainText("NaN");
});

test("vehicle details, rental calculation and request form", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Лимит пробега: 100 км / сутки" })
    .click();
  await expect(page.getByRole("option", { name: /250 км \/ сутки/ })).toContainText("700 ₽ / сутки");
  await page.getByRole("option", { name: "250 км / сутки" }).click();
  await page.getByRole("checkbox", { name: "Защита+", exact: true }).check();
  await page.getByRole("button", { name: "Быстрый выбор автомобиля" }).click();
  await page
    .locator(".car-card")
    .filter({ hasText: "Hyundai Solaris" })
    .click();
  const modal = page.getByRole("dialog");
  await expect(modal.locator(".detail-daily")).toContainText("4 090");
  await expect(modal.locator(".estimate-total")).toContainText("20 450");
  await expect(modal.locator(".estimate-total")).toContainText("Итого за 5 дней");
  await expect(modal.locator(".estimate-trip")).toContainText("Офис на Авиационной");
  await expect(modal.locator(".estimate-trip")).toContainText("250 км / сутки включено");
  await expect(modal.locator(".spec-grid > div").first()).toContainText("Посадочные места");
  await expect(modal.locator(".spec-grid > div").first().locator("dd")).toHaveText("5");
  await expect(modal.getByRole("img", { name: "Hyundai Solaris — Общий вид" })).toHaveJSProperty("naturalWidth", 425);
  await modal.getByRole("button", { name: "Следующее фото автомобиля" }).click();
  await expect(modal.getByRole("img", { name: "Hyundai Solaris — Место водителя" })).toBeVisible();
  await modal.getByRole("button", { name: "Багажник" }).click();
  await expect(modal.getByRole("img", { name: "Hyundai Solaris — Багажник" })).toBeVisible();
  await expect(modal.locator(".vehicle-tech")).toContainText("480 л");
  const packages = modal.getByRole("group", { name: "Выбор тарифа по пробегу" });
  await packages.getByRole("button", { name: /500 км/ }).click();
  await expect(modal.locator(".estimate-total")).toContainText("24 450");
  await packages.getByRole("button", { name: /250 км/ }).click();
  await expect(modal.locator(".estimate-total")).toContainText("20 450");
  await modal.getByRole("button", { name: "Оставить заявку" }).click();
  await page.getByRole("button", { name: "Проверить заявку" }).click();
  await expect(page.getByText("Введите телефон полностью")).toBeVisible();
  await page.getByRole("textbox", { name: "Ваше имя" }).fill("Александр");
  await page
    .getByRole("textbox", { name: "Телефон", exact: true })
    .fill("9991234567");
  await page.getByRole("checkbox", { name: "Согласен на обработку" }).check();
  await page.getByRole("button", { name: "Проверить заявку" }).click();
  await expect(page.getByText("Форма заполнена корректно")).toBeVisible();
  await expect(
    page.getByText("Сейчас данные не отправлены.", { exact: false }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
});

test("modal traps focus, restores trigger and makes no auth claim", async ({
  page,
}) => {
  await page.goto("/");
  const trigger = page.getByRole("button", {
    name: "Личный кабинет",
    exact: true,
  });
  await trigger.click();
  await expect(page.getByRole("dialog")).toContainText(
    "Сейчас вход недоступен",
  );
  await page.keyboard.press("Shift+Tab");
  await expect(
    page.getByRole("dialog").getByRole("link", { name: "Связаться с нами" }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Закрыть окно" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});

for (const width of [320, 430, 768, 1024, 1440, 1536, 2048]) {
  test(`responsive ${width}: no clipping, all options and stable hero`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    for (const name of [
      "Защита+",
      "Доставка",
      "Для юридических лиц",
      "Иностранный гражданин",
    ])
      await expect(
        page.getByRole("checkbox", { name, exact: true }),
      ).toBeVisible();
    const before = (await page.locator(".hero").boundingBox())!.height;
    const offer = await page.locator(".delivery-offer").boundingBox(),
      panel = await page.locator(".search-panel").boundingBox(),
      benefits = await page.locator(".hero-benefits").boundingBox();
    for (const selector of [".brand", "#hero-title", ".hero-description", ".hero-benefits"]) {
      const bounds = await page.locator(selector).boundingBox();
      expect(bounds!.x).toBeCloseTo(panel!.x, 1);
    }
    const headerActions = (await page.locator(".header-actions").boundingBox())!;
    expect(headerActions.x + headerActions.width).toBeLessThanOrEqual(
      panel!.x + panel!.width + 1,
    );
    expect(offer!.y + offer!.height).toBeLessThanOrEqual(panel!.y);
    expect(benefits!.y + benefits!.height).toBeLessThanOrEqual(panel!.y);
    if (width < 761) {
      await expect(page.getByRole("region", { name: "Автопарк" }).locator(".car-card")).toHaveCount(7);
      await page.getByRole("button", { name: "Открыть меню" }).click();
      await expect(
        page.getByRole("navigation", { name: "Мобильное меню" }),
      ).toBeVisible();
    } else {
      await page.getByRole("button", { name: "Быстрый выбор автомобиля" }).click();
      expect((await page.locator(".hero").boundingBox())!.height).toBe(before);
    }
  });
}

test("UI kit and delivery announcement disclose provisional state", async ({
  page,
}) => {
  await page.goto("/?ui-kit");
  await expect(
    page.getByRole("heading", { name: "Одна система. Все состояния." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Недоступно", exact: true }),
  ).toBeDisabled();
  const offer = page.getByRole("button", { name: /Доставим бесплатно.*10 января/ });
  await expect(offer.locator("img")).toHaveJSProperty("complete", true);
  await expect(offer.locator("img")).toHaveJSProperty("naturalWidth", 660);
  await offer.click();
  const dialog = page.getByRole("dialog", { name: "Доставим бесплатно" });
  await expect(dialog).toContainText(
    "Даты, территория и ограничения ещё уточняются",
  );
  await expect(dialog.getByRole("img", { name: "Передача ключей от автомобиля клиенту" }))
    .toHaveJSProperty("naturalWidth", 900);
  const nextStep = dialog.getByRole("button", { name: "Следующий шаг доставки" });
  await nextStep.click();
  await expect(dialog.getByRole("img", { name: "Осмотр кузова автомобиля перед получением" })).toBeVisible();
  await nextStep.press("Enter");
  await expect(dialog.getByRole("img", { name: "Автомобиль на загородной дороге" })).toBeVisible();
  await dialog.getByRole("button", { name: "Предыдущий шаг доставки" }).click();
  await expect(dialog.getByRole("heading", { name: "Осмотрите автомобиль вместе" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(offer).toBeFocused();
  await offer.click();
  await expect(dialog.getByRole("heading", { name: "Получите ключи в удобном месте" })).toBeVisible();
  await page.getByRole("button", { name: "Подобрать автомобиль" }).click();
  await expect(page.getByRole("region", { name: "Подбор автомобиля" })).toBeFocused();
  await expect(
    page.getByRole("checkbox", { name: "Доставка", exact: true }),
  ).toBeChecked();
  await expect(
    page.getByRole("combobox", { name: "Место получения", exact: true }),
  ).toHaveAttribute("placeholder", "Улица и дом в Москве");
});

test("desktop services open on hover, click and keyboard, then restore focus", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Услуги", exact: true });
  const panel = page.locator("#services-panel");
  await expect(panel).toBeHidden();
  await trigger.hover();
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("button")).toHaveCount(14);
  await panel.getByRole("button", { name: "Техпомощь" }).hover();
  await expect(panel).toBeVisible();
  await page.mouse.move(0, 0);
  await expect(panel).toBeHidden();
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await page.locator("#hero-title").click();
  await expect(panel).toBeHidden();
  await trigger.focus();
  await page.keyboard.press("ArrowDown");
  const daily = panel.getByRole("button", { name: "На сутки", exact: true });
  await expect(daily).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(panel).toBeHidden();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: "На сутки" })).toBeVisible();
  await expect(panel).toBeHidden();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});

test("mobile services expand by group and open an explanation", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/");
  await page.getByRole("button", { name: "Открыть меню" }).click();
  const nav = page.getByRole("navigation", { name: "Мобильное меню" });
  await nav.locator("summary").getByText("Услуги", { exact: true }).click();
  const airport = nav.getByRole("button", { name: "В аэропорт" });
  await expect(airport).toBeHidden();
  await nav.locator("summary").getByText("Поездки и события").click();
  await airport.click();
  await expect(page.getByRole("dialog", { name: "В аэропорт" })).toBeVisible();
  await expect(nav).toBeHidden();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Открыть меню" })).toBeFocused();
});

for (const [width, height] of [
  [1920, 1080],
  [1536, 864],
  [1440, 900],
  [1366, 768],
]) {
  test(`hero viewport ${width}x${height}: one frame, upward opening with fixed lower edge and no decorative copy`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await expect(
      page.locator(
        "footer,#how-it-works,.eyebrow,.section-kicker,.scene-caption",
      ),
    ).toHaveCount(0);
    expect(
      await page.evaluate(() => document.documentElement.scrollHeight),
    ).toBe(height);
    const panel = page.locator(".search-panel");
    const before = await panel.boundingBox();
    expect(before!.y + before!.height).toBeLessThanOrEqual(height - 15);
    const header = await page
      .locator(".site-header")
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(header).toBe("rgba(0, 0, 0, 0)");
    for (let i = 0; i < 2; i++) {
      await page
        .getByRole("button", { name: "Быстрый выбор автомобиля" })
        .click();
      await page.locator(".quick-expand").evaluate(async (element) => {
        await Promise.all(element.getAnimations().map((animation) => animation.finished));
      });
      const after = await panel.boundingBox();
      expect(after!.y + after!.height).toBeCloseTo(
        before!.y + before!.height,
        1,
      );
      if (i === 0) expect(after!.y).toBeLessThan(before!.y);
      else expect(after!.y).toBeCloseTo(before!.y, 1);
      expect(after!.y + after!.height).toBeLessThanOrEqual(height - 15);
      expect(
        await page.evaluate(() => document.documentElement.scrollHeight),
      ).toBe(height);
    }
    await page
      .getByRole("button", { name: "Найти автомобиль", exact: true })
      .click();
    await expect(
      page.getByRole("dialog", { name: "Подбор автомобилей" }),
    ).toBeVisible();
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });
}

test("mileage explanation distinguishes allowance from odometer and follows selection", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Как работает лимит пробега" })
    .click();
  const info = page.getByRole("dialog", { name: "Что означает лимит пробега" });
  await expect(info.getByRole("img", { name: "Автомобиль на загородной дороге" }))
    .toHaveJSProperty("naturalWidth", 900);
  await expect(info).toContainText("не пробег самого автомобиля");
  await expect(info).toContainText("120 км");
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Как работает лимит пробега" }),
  ).toBeFocused();
  await page
    .getByRole("button", { name: "Лимит пробега: 100 км / сутки" })
    .click();
  await page.getByRole("option", { name: "250 км / сутки" }).click();
  await page
    .getByRole("button", { name: "Как работает лимит пробега" })
    .click();
  await expect(info).toContainText("270 км");
});

test("delivery help does not toggle the checkbox; pickup and delivery stay consistent", async ({
  page,
}) => {
  await page.goto("/");
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
  await page.goto("/");
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
  const results = page.getByRole("dialog", { name: "Подбор автомобилей" });
  await expect(results).toContainText("Москва, Сиреневый бульвар, 24с1");
  await expect(results).toContainText("100 км / сутки включено");
  await results.getByRole("button", { name: /Hyundai Solaris/ }).click();
  const car = page.getByRole("dialog", { name: "Hyundai Solaris" });
  await expect(car.locator(".estimate-trip")).toContainText("100 км / сутки включено");
  await expect(car.locator(".estimate-trip")).toContainText("Москва, Сиреневый бульвар, 24с1");
  await car.getByRole("button", { name: "Обсудить пробег" }).click();
  const request = page.getByRole("dialog");
  await expect(request.getByRole("checkbox", { name: "Хочу обсудить пробег" })).toBeChecked();
  await expect(request.getByRole("combobox", { name: "Адрес доставки · Москва" })).toHaveValue("Сиреневый бульвар, 24с1");
  await request.getByRole("textbox", { name: "Ваше имя" }).fill("Александр");
  await request.getByRole("textbox", { name: "Телефон", exact: true }).fill("9991234567");
  await request.getByRole("checkbox", { name: "Согласен на обработку" }).check();
  await request.getByRole("button", { name: "Проверить заявку" }).click();
  await expect(request).toContainText("Пробег — обсудить перед оформлением");
  await expect(request).toContainText("Москва, Сиреневый бульвар, 24с1");
});

test("protection guide shows the inspection photo and a cost example", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Что такое Защита+" }).click();
  const guide = page.getByRole("dialog", { name: "Защита+" });
  await expect(guide.getByRole("img", { name: "Осмотр кузова автомобиля перед получением" }))
    .toHaveJSProperty("naturalWidth", 900);
  await expect(guide).toContainText(/1\s470 ₽/);
  await expect(page.getByRole("checkbox", { name: "Защита+", exact: true })).not.toBeChecked();
});

for (const [width, height] of [
  [1920, 1080],
  [1536, 864],
  [1366, 768],
]) {
  test(`bottom-anchored popovers and background cover the frame at ${width}x${height}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    const bg = await page.locator(".hero-visual").boundingBox();
    expect(bg).toEqual({ x: 0, y: 0, width, height });
    const mask = await page
      .locator(".hero-visual")
      .evaluate((el) => getComputedStyle(el).maskImage);
    expect(mask).toBe("none");
    for (const [name, selector] of [
      ["Дата получения", ".calendar"],
      [
        "Класс автомобиля: Все классы",
        '.select-menu[aria-label="Класс автомобиля"]',
      ],
      [
        "Лимит пробега: 100 км / сутки",
        '.select-menu[aria-label="Лимит пробега"]',
      ],
    ]) {
      await page.getByRole("button", { name, exact: true }).click();
      const popup = page.locator(selector);
      await expect(popup).toBeVisible();
      const rect = await popup.boundingBox();
      expect(rect!.y).toBeGreaterThanOrEqual(0);
      expect(rect!.y + rect!.height).toBeLessThanOrEqual(height);
      await page.keyboard.press("Escape");
      await expect(popup).toBeHidden();
    }
  });
}
