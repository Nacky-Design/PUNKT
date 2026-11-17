import { test, expect } from "@playwright/test";

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
  await page.getByRole("button", { name: "Все классы", exact: true }).click();
  await page.getByRole("button", { name: "Следующие автомобили" }).click();
  await expect
    .poll(() => page.locator(".car-rail").evaluate((el) => el.scrollLeft))
    .toBeGreaterThan(20);
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
    .locator(".empty-state")
    .getByRole("button", { name: "Все классы" })
    .click();
  await expect(page.locator(".result-row")).toHaveCount(6);
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
  await expect(page.locator("#catalog .section-top")).not.toContainText("NaN");
});

test("calculator reacts to mileage, protection and duration; gallery and form work", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Лимит пробега: 100 км / сутки" })
    .click();
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
  await modal.getByRole("button", { name: "Следующее фото" }).click();
  await expect(modal.locator(".gallery-controls")).toContainText("2 / 3");
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
    expect(offer!.y + offer!.height).toBeLessThanOrEqual(panel!.y);
    expect(benefits!.y + benefits!.height).toBeLessThanOrEqual(panel!.y);
    await page
      .getByRole("button", { name: "Быстрый выбор автомобиля" })
      .click();
    expect((await page.locator(".hero").boundingBox())!.height).toBe(before);
    if (width < 761) {
      await page.getByRole("button", { name: "Открыть меню" }).click();
      await expect(
        page.getByRole("navigation", { name: "Мобильное меню" }),
      ).toBeVisible();
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
  await page.locator(".delivery-offer").click();
  await expect(page.getByRole("dialog")).toContainText(
    "Даты, территория и ограничения ещё уточняются",
  );
  await page.getByRole("button", { name: "Подобрать автомобиль" }).click();
  await expect(
    page.getByRole("checkbox", { name: "Доставка", exact: true }),
  ).toBeChecked();
  await expect(
    page.getByRole("button", { name: "Место получения: Доставка по Москве" }),
  ).toBeVisible();
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
      await page.waitForTimeout(450);
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
  await expect(
    page.getByRole("dialog", { name: "Как работает доставка" }),
  ).toContainText("печатный договор");
  await expect(box).not.toBeChecked();
  await page.keyboard.press("Escape");
  await box.check();
  await expect(
    page.getByRole("button", { name: "Место получения: Доставка по Москве" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Место получения: Доставка по Москве" })
    .click();
  await page
    .getByRole("option", { name: "Офис на Авиационной", exact: true })
    .click();
  await expect(box).not.toBeChecked();
  await page
    .getByRole("button", { name: "Место получения: Офис на Авиационной" })
    .click();
  await page.getByRole("option", { name: "Шереметьево (SVO)" }).click();
  await expect(box).toBeChecked();
  await box.uncheck();
  await expect(
    page.getByRole("button", { name: "Место получения: Офис на Авиационной" }),
  ).toBeVisible();
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
