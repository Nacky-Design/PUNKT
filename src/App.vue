<script setup lang="ts">
import { ref, computed, nextTick, watchEffect, onMounted, onBeforeUnmount } from "vue";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CarFront,
  MapPin,
  Gauge,
  UserRound,
  Phone,
  Menu,
  X,
  Check,
  CircleHelp,
  Clock3,
  CheckCircle2,
  Info,
  Mail,
  ShieldCheck,
} from "lucide-vue-next";
import SelectField from "./components/SelectField.vue";
import DateRange from "./components/DateRange.vue";
import BaseModal from "./components/BaseModal.vue";
import CarArt from "./components/CarArt.vue";
import ServicesMenu from "./components/ServicesMenu.vue";
import DeliveryAddress from "./components/DeliveryAddress.vue";
import CatalogPage from "./components/CatalogPage.vue";
import PricesPage from "./components/PricesPage.vue";
import ServicesPage from "./components/ServicesPage.vue";
import InformationPage from "./components/InformationPage.vue";
import NewsPage from "./components/NewsPage.vue";
import PromotionsPage from "./components/PromotionsPage.vue";
import SiteFooter from "./components/SiteFooter.vue";
import DemoAuth from "./components/DemoAuth.vue";
import DemoDashboard from "./components/DemoDashboard.vue";
import HeaderMessengerIcon from "./components/HeaderMessengerIcon.vue";
import { messengerLinks } from "./contact";
import type { CatalogFilterState } from "./components/CatalogFilters.vue";
import VehiclePage from "./components/VehiclePage.vue";
import {
  cars,
  categories,
  money,
  todayISO,
  addDays,
  localDate,
  checkRentalPeriod,
  type Car,
  type RentalPeriod,
} from "./data";
const office = "Офис на Авиационной";
const currentTime = ref(new Date());
let clockTimer: ReturnType<typeof setInterval> | undefined;
onMounted(() => { clockTimer = setInterval(() => { currentTime.value = new Date(); }, 60_000); });
onBeforeUnmount(() => { if (clockTimer) clearInterval(clockTimer); });
const officeOpen = computed(() => {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Moscow", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(currentTime.value);
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";
  const minutes = Number(part("hour")) * 60 + Number(part("minute"));
  return !["Sat", "Sun"].includes(part("weekday")) && minutes >= 8 * 60 && minutes < 17 * 60;
});
const addressDelivery = "Доставка по адресу";
const pickupPresets = [office, "Шереметьево (SVO)", "Домодедово (DME)", "Внуково (VKO)"];
const baseMileage = "100 км / сутки";
const category = ref("Все классы"),
  location = ref(office),
  mileage = ref(baseMileage);
const pricesMileage = ref(baseMileage);
const priceTab = ref<"rental" | "services" | "damage">("rental");
const address = ref("");
const searchAddressErrors = ref(false);
const addressSelected = computed(() => location.value === addressDelivery);
const cleanAddress = computed(() => address.value.trim().replace(/^Москва\s*,\s*/iu, "").replace(/\s+/g, " "));
const incompleteAddress = computed(() =>
  addressSelected.value &&
  !/\p{L}.*[ ,](?:д(?:ом|\.)?\s*)?\d+[а-яa-z]?(?:\s*(?:[ксkc/]|корп(?:ус)?\.?|стр(?:оение)?\.?)\s*\d+[а-яa-z]?)*(?:\s*,.+)?$/iu.test(cleanAddress.value),
);
const pickupLabel = computed(() => {
  if (!addressSelected.value) return location.value;
  if (incompleteAddress.value) return "Доставка по Москве, адрес уточняется";
  return `Москва, ${cleanAddress.value}`;
});
const delivery = computed({
  get: () => location.value !== office,
  set: (enabled: boolean) => {
    if (!enabled) location.value = office;
    else if (location.value === office) location.value = addressDelivery;
  },
});
const start = ref(addDays(todayISO(), 2)),
  end = ref(addDays(start.value, 1));
const confirmedPeriod = ref<RentalPeriod>();
const protection = ref(false),
  business = ref(false),
  foreign = ref(false);
const quickOpen = ref(false),
  quickCategory = ref("Все классы"),
  mobileMenu = ref(false),
  rail = ref<HTMLElement>();
const canScrollBack = ref(false);
const canScrollForward = ref(false);
const searchPanel = ref<HTMLElement>();
const navItems = [
  { label: "Цены", route: "prices" },
  { label: "Услуги", route: "services" },
  { label: "Условия", route: "conditions" },
  { label: "Акции", route: "promotions" },
  { label: "Новости", route: "news" },
  { label: "Контакты", route: "contacts" },
];
const guidePhotos = {
  delivery: "Передача ключей от автомобиля клиенту",
  mileage: "Автомобиль на загородной дороге",
  protection: "Осмотр кузова автомобиля перед получением",
};
const guideAsset = (photo: keyof typeof guidePhotos) => `${import.meta.env.BASE_URL}assets/${({ delivery: "guide-delivery.webp", mileage: "guide-road.webp", protection: "guide-inspection.webp" })[photo]}`;
const modal = ref<
    | "car"
    | "request"
    | "account"
    | "info"
    | "catalog"
    | "contacts"
    | null
  >(null),
  selected = ref<Car>(cars[0]!);
const infoTitle = ref(""),
  infoBody = ref(""),
  infoPhoto = ref<keyof typeof guidePhotos>();
const name = ref(""),
  phone = ref(""),
  consent = ref(false),
  submitted = ref(false),
  errors = ref<Record<string, string>>({}),
  requestSnapshot = ref("");
const requestDetails = ref<{
  car: string;
  period: string;
  pickup: string;
  mileage: string;
  protection: string;
  notes: string[];
  days: number;
  total: number;
}>();
type DemoUser = { name: string; role: "client" | "rental"; kind: "person" | "company"; email: string; phone: string };
const demoUser = ref<DemoUser | null>(null);
const pages = ["catalog", "car", "search", "account", "prices", "services", "conditions", "contacts", "news", "promotions", "about"] as const;
type Page = (typeof pages)[number];
const page = ref<Page>("catalog");
const detailId = ref("");
let currentHash: string | undefined;
let carOrigin: { page: Page; id: number; scroll: number; action?: string } | undefined;

function readRoute() {
  const hash = window.location.hash;
  if (hash === currentHash) return;
  const previousHash = currentHash;
  currentHash = hash;
  const [section, slug = ""] = hash.slice(1).split("/");
  const car = section === "car" ? cars.find(item => String(item.id) === slug) : undefined;

  if (car) selected.value = car;
  if (section === "prices" && page.value !== "prices") {
    pricesMileage.value = baseMileage;
    priceTab.value = "rental";
  }
  page.value = pages.find(item => item === section && (item !== "car" || car)) ?? "catalog";
  detailId.value = slug;

  nextTick(() => {
    const heading = document.querySelector<HTMLElement>("main h1");
    document.title = heading && page.value !== "catalog"
      ? `${heading.textContent?.trim().replace(/\.$/, "")} — Пункт`
      : "Пункт — автомобиль под ваши планы";
    if (previousHash === undefined) return;

    const returnLink = !slug && previousHash.startsWith(`#${section}/`)
      ? Array.from(document.querySelectorAll<HTMLAnchorElement>("main a[href]")).find(link => link.hash === previousHash)
      : undefined;
    if (carOrigin && page.value === carOrigin.page && previousHash === `#car/${carOrigin.id}`) {
      const origin = carOrigin;
      carOrigin = undefined;
      const opener = Array.from(document.querySelectorAll<HTMLButtonElement>("main [data-car-action]"))
        .find(button => button.dataset.carAction === origin.action);
      if (opener) opener.focus({ preventScroll: true });
      window.scrollTo({ top: origin.scroll, behavior: "instant" });
    } else if (returnLink) {
      returnLink.focus();
    } else {
      heading?.setAttribute("tabindex", "-1");
      heading?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  });
}

function goPage(target: Page, car?: Car, slug?: string) {
  const hash = target === "car" ? `#car/${(car ?? selected.value).id}` : `#${target}${slug ? `/${slug}` : ""}`;
  if (window.location.hash !== hash) history.pushState(null, "", hash);
  readRoute();
}

window.addEventListener("popstate", readRoute);
window.addEventListener("hashchange", readRoute);
readRoute();
const sort = ref("Сначала дешевле");
const catalogFilters = ref<CatalogFilterState>({ brand: "", fuel: "", drive: "", transmission: "", seats: null, extras: [] });
const rentalPeriod = computed<RentalPeriod>(() => ({
  start: start.value,
  end: end.value,
  startTime: confirmedPeriod.value?.startTime ?? "10:00",
  endTime: confirmedPeriod.value?.endTime ?? "10:00",
}));
const periodConfirmed = computed(() => confirmedPeriod.value?.start === start.value && confirmedPeriod.value?.end === end.value);
const periodError = computed(() => periodConfirmed.value ? checkRentalPeriod(rentalPeriod.value, currentTime.value).error : "");
function applyRentalPeriod(period: RentalPeriod) {
  start.value = period.start;
  end.value = period.end;
  confirmedPeriod.value = period;
}
const mileagePrices: Record<string, number> = {
  [baseMileage]: 0,
  "250 км / сутки": 700,
  "500 км / сутки": 1500,
};
const mileageOptions = Object.keys(mileagePrices);
const mileageOptionDetails = Object.fromEntries(
  Object.entries(mileagePrices).map(([option, price]) =>
    [option, price ? `+${money(price)} ₽ / сутки` : "Включено в базовый тариф"]),
);
const mileageExtra = computed(() => mileagePrices[mileage.value] ?? 0);
const mileageLabel = computed(() => `${mileage.value} включено`);
const rate = (car: Car) =>
  car.price + mileageExtra.value + (protection.value ? (car.protectionPrice ?? 0) : 0);
const filteredQuick = computed(() =>
  cars.filter(
    (c) =>
      quickCategory.value === "Все классы" ||
      c.category === quickCategory.value,
  ),
);
const filteredCars = computed(() => {
  const list = cars.filter(
    (c) => (category.value === "Все классы" || c.category === category.value)
      && (!catalogFilters.value.brand || c.name.split(" ")[0] === catalogFilters.value.brand)
      && (!catalogFilters.value.fuel || c.fuel === catalogFilters.value.fuel)
      && (!catalogFilters.value.drive || c.drive === catalogFilters.value.drive)
      && (!catalogFilters.value.transmission || catalogFilters.value.transmission === "Автомат")
      && (!catalogFilters.value.seats || c.seats === catalogFilters.value.seats),
  );
  if (sort.value === "По названию") {
    return list.sort((a, b) => a.name.localeCompare(b.name, "ru"));
  }
  const direction = sort.value === "Сначала дороже" ? -1 : 1;
  return list.sort((a, b) => direction * (rate(a) - rate(b)));
});
const numberForms = new Intl.PluralRules("ru");
const carCount = computed(() => {
  const count = filteredCars.value.length;
  const form = numberForms.select(count);
  return `${count} ${form === "one" ? "автомобиль" : form === "few" ? "автомобиля" : "автомобилей"}`;
});
const renterContext = computed(() =>
  [
    business.value ? "Для юридического лица" : "",
    foreign.value ? "Иностранный гражданин" : "",
  ].filter(Boolean),
);
function rentalMoment(date: string, time: string) {
  const day = localDate(date).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
  return `${day}, ${time}`;
}
function rentalDayLabel(count: number) {
  const form = numberForms.select(count);
  return form === "one" ? "день" : form === "few" ? "дня" : "дней";
}
function openInfo(title: string, body: string, photo?: keyof typeof guidePhotos) {
  infoTitle.value = title;
  infoBody.value = body;
  infoPhoto.value = photo;
  modal.value = "info";
  mobileMenu.value = false;
}
function openService(id: string) {
  mobileMenu.value = false;
  goPage("services", undefined, id);
}
function explainMileage() {
  const limit = Number.parseInt(mileage.value, 10);
  openInfo(
    "Что означает лимит пробега",
    `Лимит — расстояние, включённое в тариф, а не пробег самого автомобиля.\n\nС пакетом ${limit} км за сутки можно проехать ${limit} км по тарифу. При поездке на ${limit + 20} км доплата будет за 20 км. Цену за километр и правила для аренды на несколько суток уточним до оформления.`,
    "mileage",
  );
}
function explainDelivery() {
  openInfo(
    "Как работает доставка",
    "Выберите адрес в Москве или аэропорт в поле «Место получения». После проверки документов согласуем точку и время встречи. Водитель привезёт автомобиль и печатный договор.\n\nНапример, при выборе Шереметьево мы согласуем терминал и стоимость подачи до оформления.",
    "delivery",
  );
}
function explainProtection() {
  openInfo(
    "Защита+",
    "Защита+ — платная опция, которая снижает вашу ответственность при повреждении автомобиля. Стоимость указана за сутки и зависит от модели.\n\nПокрытие, исключения и ответственность согласуем до оформления. При получении осмотрите автомобиль вместе с сотрудником и зафиксируйте его состояние.",
    "protection",
  );
}
function nav(item: string) {
  mobileMenu.value = false;
  if (item === "Цены") goPage("prices");
  else if (item === "Услуги") goPage("services");
  else if (item === "Автопарк") goPage("catalog");
  else if (item === "Акции") goPage("promotions");
  else if (item === "Контакты") goPage("contacts");
  else if (item === "Условия") goPage("conditions");
  else if (item === "Новости") goPage("news");
  else if (item === "О компании") goPage("about");
}
const carReturnPage = ref<"catalog" | "prices">("catalog");
function showCar(car: Car) {
  carReturnPage.value = page.value === "prices" ? "prices" : "catalog";
  const opener = document.activeElement;
  if (page.value === carReturnPage.value) {
    carOrigin = { page: page.value, id: car.id, scroll: window.scrollY, action: opener instanceof HTMLElement ? opener.dataset.carAction : undefined };
  } else {
    carOrigin = undefined;
  }
  modal.value = null;
  goPage("car", car);
}
function closeCar() { goPage(carReturnPage.value); }
function showPriceCar(car: Car, withProtection = false) {
  mileage.value = pricesMileage.value;
  protection.value = withProtection;
  showCar(car);
}
function editSearch() {
  modal.value = null;
  goPage("search");
  nextTick(() => searchPanel.value?.focus({ preventScroll: true }));
}
function request(withMileageDiscussion = false) {
  currentTime.value = new Date();
  if (!periodConfirmed.value || periodError.value || incompleteAddress.value) return;

  const period = rentalPeriod.value;
  const { days } = checkRentalPeriod(period, currentTime.value);
  requestDetails.value = {
    car: selected.value.name,
    period: `${rentalMoment(period.start, period.startTime)} — ${rentalMoment(period.end, period.endTime)} (МСК)`,
    pickup: pickupLabel.value,
    mileage: mileageLabel.value,
    protection: protection.value
      ? (selected.value.protectionPrice == null ? "Защита+ · стоимость уточняется" : "Защита+ подключена")
      : "Без «Защиты+»",
    notes: [
      ...renterContext.value,
      withMileageDiscussion ? "Пробег — обсудить перед оформлением" : "",
      catalogFilters.value.extras.length ? `Пожелания: ${catalogFilters.value.extras.join(", ")}` : "",
    ].filter(Boolean),
    days,
    total: rate(selected.value) * days,
  };
  modal.value = "request";
  submitted.value = false;
  errors.value = {};
}
function formatPhone(e: Event) {
  const input = e.target as HTMLInputElement;
  let digits = input.value.replace(/\D/g, "");
  if (digits.startsWith("7") || digits.startsWith("8"))
    digits = digits.slice(1);
  digits = digits.slice(0, 10);
  let val = digits ? "+7 (" + digits.slice(0, 3) : "";
  if (digits.length >= 3) val += ") ";
  if (digits.length > 3) val += digits.slice(3, 6);
  if (digits.length > 6) val += "-" + digits.slice(6, 8);
  if (digits.length > 8) val += "-" + digits.slice(8, 10);
  phone.value = val;
  input.value = val;
}
function submitRequest() {
  const details = requestDetails.value;
  if (!details) return;
  errors.value = {};
  if (name.value.trim().length < 2)
    errors.value.name = "Укажите имя — не менее двух букв";
  if (phone.value.replace(/\D/g, "").length !== 11)
    errors.value.phone = "Введите телефон полностью";
  if (!consent.value)
    errors.value.consent = "Нужно согласие на обработку данных";
  if (Object.keys(errors.value).length) return;
  requestSnapshot.value = [
    details.car, details.period, details.pickup, details.mileage, details.protection,
    ...details.notes, `Предварительно ${money(details.total)} ₽`,
  ].join(" · ");
  submitted.value = true;
  name.value = "";
  phone.value = "";
  consent.value = false;
}
function searchWithAddress() {
  searchAddressErrors.value = incompleteAddress.value;
  if (incompleteAddress.value) {
    nextTick(() => searchPanel.value?.querySelector<HTMLElement>('input[aria-invalid="true"]')?.focus());
    return;
  }
  search();
}
function search() {
  modal.value = null;
  if (page.value !== "catalog") goPage("catalog");
}
function searchWithDates(startDate: string, endDate: string) {
  start.value = startDate;
  end.value = endDate;
  search();
}

function selectQuick(value: string) {
  quickCategory.value = value;
  nextTick(() => {
    rail.value?.scrollTo({ left: 0, behavior: "instant" });
    updateRailArrows();
  });
}
function updateRailArrows() {
  const element = rail.value;
  if (!element) return;
  canScrollBack.value = element.scrollLeft > 1;
  canScrollForward.value =
    element.scrollLeft + element.clientWidth < element.scrollWidth - 1;
}
watchEffect((onCleanup) => {
  if (!rail.value || !quickOpen.value) return;
  const observer = new ResizeObserver(updateRailArrows);
  observer.observe(rail.value);
  onCleanup(() => observer.disconnect());
}, { flush: "post" });
function scrollRail(direction: number) {
  rail.value?.scrollBy({
    left: direction * (rail.value.clientWidth * 0.65),
    behavior: "smooth",
  });
}
function account() {
  modal.value = null;
  mobileMenu.value = false;
  goPage("account");
}
function enterDemo(user: DemoUser) {
  demoUser.value = user;
  window.scrollTo({ top: 0, behavior: "instant" });
}
function logoutDemo() {
  demoUser.value = null;
  window.scrollTo({ top: 0, behavior: "instant" });
}
</script>

<template>
  <svg
    class="logo-filter-definitions"
    width="0"
    height="0"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <filter
        id="logo-white"
        x="0"
        y="0"
        width="100%"
        height="100%"
        color-interpolation-filters="sRGB"
      >
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 1  -1 1 0 0 1  -1 0 1 0 1  -2 -3 -1 0 6"
        />
        <feComponentTransfer>
          <feFuncA type="linear" slope="1.12" intercept="-0.12" />
        </feComponentTransfer>
      </filter>
    </defs>
  </svg>
  <a href="#search" class="skip-link">Перейти к подбору автомобиля</a>
  <header class="site-header site-header-solid">
    <a class="brand" href="#catalog" @click.prevent="goPage('catalog')" aria-label="Пункт — на главную"
      ><span class="brand-image"></span
    ></a>
    <nav class="desktop-nav" aria-label="Главное меню">
      <template v-for="item in navItems" :key="item.route">
        <ServicesMenu v-if="item.route === 'services'" @select="openService" :current="page === 'services'" @all="nav('Услуги')" />
        <button v-else class="nav-label" type="button" @click="nav(item.label)" :aria-current="page === item.route ? 'page' : undefined">
          {{ item.label }}
        </button>
      </template>
    </nav>
    <div class="header-actions">
      <div class="header-contact">
      <div class="header-contact-row">
      <a
        class="header-phone phone-label"
        href="tel:+74951041010"
        aria-label="Позвонить: 8 495 104-10-10"
      >
        <Phone :size="16" /><span>8 495 104-10-10</span>
      </a>
      <div v-if="messengerLinks.telegram || messengerLinks.whatsapp" class="header-messengers" aria-label="Мессенджеры">
        <a v-if="messengerLinks.telegram" class="header-messenger" :href="messengerLinks.telegram" target="_blank" rel="noopener noreferrer" aria-label="Telegram"><HeaderMessengerIcon kind="telegram" /></a>
        <a v-if="messengerLinks.whatsapp" class="header-messenger" :href="messengerLinks.whatsapp" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><HeaderMessengerIcon kind="whatsapp" /></a>
      </div>
      </div>
      <div class="header-hours" :aria-label="`${officeOpen ? 'Сейчас открыто' : 'Сейчас закрыто'}. Понедельник–пятница, с 8 до 17 часов по Москве`">
        <span class="hours-dot" :class="{ 'hours-dot-open': officeOpen }" aria-hidden="true"></span>
        <span>Пн–пт 8:00–17:00<span class="hours-zone"> (МСК)</span></span>
      </div>
      </div>
      <button
        class="account-button"
        :class="{ 'account-button-signed-in': demoUser }"
        :aria-label="demoUser ? 'Открыть личный кабинет' : 'Войти в личный кабинет'"
        @click="account"
      >
        <span v-if="demoUser" class="account-avatar" aria-hidden="true">{{ demoUser.kind === "company" ? "К" : "МИ" }}</span>
        <UserRound v-else :size="19" aria-hidden="true" /><span class="account-label">{{ demoUser ? "Кабинет" : "Войти" }}</span>
      </button>
      <button
        class="mobile-menu-button icon-button"
        :aria-expanded="mobileMenu"
        :aria-controls="mobileMenu ? 'mobile-nav' : undefined"
        :aria-label="mobileMenu ? 'Закрыть меню' : 'Открыть меню'"
        @click="mobileMenu = !mobileMenu"
      >
        <X v-if="mobileMenu" /><Menu v-else />
      </button>
    </div>
    <Transition name="popover">
      <nav v-if="mobileMenu" id="mobile-nav" class="mobile-nav" aria-label="Мобильное меню">
        <template v-for="item in navItems" :key="item.route">
          <ServicesMenu v-if="item.route === 'services'" mobile @select="openService" :current="page === 'services'" @all="nav('Услуги')" />
          <button v-else type="button" @click="nav(item.label)" :aria-current="page === item.route ? 'page' : undefined">
            {{ item.label }}<ArrowUpRight :size="17" />
          </button>
        </template>
        <button @click="account">
          Личный кабинет<UserRound :size="17" />
        </button>
      </nav>
    </Transition>
  </header>
  <main v-if="page === 'search'" class="interior-page advanced-search">
    <div class="interior-container">
      <a href="#catalog" class="interior-back"><ArrowLeft :size="16" aria-hidden="true" /> К автопарку</a>
      <header class="interior-heading">
        <h1>Параметры аренды<span>.</span></h1>
      </header>
      <section
        id="search"
        ref="searchPanel"
        tabindex="-1"
        class="search-panel"
        aria-label="Подбор автомобиля"
      >
        <form @submit.prevent="searchWithAddress">
          <div class="search-primary">
            <SelectField
              v-model="category"
              label="Класс автомобиля"
              :options="categories"
              ><CarFront :size="22"
            /></SelectField>
            <DateRange v-model:start="start" v-model:end="end" />
            <DeliveryAddress
              v-model="location"
              v-model:address="address"
              :presets="pickupPresets"
              :address-mode="addressDelivery"
              :invalid="searchAddressErrors && incompleteAddress"
            />
            <button type="submit" class="button button-primary search-submit">
              Найти автомобиль<ArrowRight :size="21" />
            </button>
          </div>
          <div class="search-secondary">
            <div class="mileage-control">
              <SelectField
                v-model="mileage"
                label="Лимит пробега"
                :options="mileageOptions"
                :option-details="mileageOptionDetails"
                ><Gauge :size="20"
              /></SelectField>
              <button
                type="button"
                class="help-button"
                aria-label="Как работает лимит пробега"
                @click="explainMileage"
              >
                <CircleHelp :size="16" />
              </button>
            </div>
            <div class="option-with-help">
              <label class="check-label"
                ><input
                  type="checkbox"
                  v-model="protection"
                  aria-label="Защита+"
                /><span class="check-visual"><Check :size="13" /></span
                >Защита+</label
              >
              <button
                type="button"
                class="help-button"
                aria-label="Что такое Защита+"
                @click="explainProtection"
              >
                <CircleHelp :size="14" />
              </button>
            </div>
            <div class="option-with-help">
              <label class="check-label"
                ><input
                  type="checkbox"
                  v-model="delivery"
                  aria-label="Доставка"
                /><span class="check-visual"><Check :size="13" /></span
                >Доставка</label
              >
              <button
                type="button"
                class="help-button"
                aria-label="Как работает доставка"
                @click="explainDelivery"
              >
                <CircleHelp :size="14" />
              </button>
            </div>
            <label class="check-label"
              ><input type="checkbox" v-model="business" /><span
                class="check-visual"
                ><Check :size="13" /></span
              >Для юридических лиц</label
            >
            <label class="check-label"
              ><input type="checkbox" v-model="foreign" /><span
                class="check-visual"
                ><Check :size="13" /></span
              >Иностранный гражданин</label
            >
          </div>
        </form>
        <div class="quick-divider">
          <span></span
          ><button
            class="quick-toggle"
            :aria-expanded="quickOpen"
            aria-controls="quick-selection"
            @click="quickOpen = !quickOpen"
          >
            <CarFront :size="17" />Быстрый выбор автомобиля<ChevronDown
              :size="17"
              :class="{ rotated: quickOpen }"
            /></button
          ><span></span>
        </div>
        <div
          id="quick-selection"
          class="quick-expand"
          :class="{ 'quick-hidden': !quickOpen }"
          :inert="!quickOpen"
        >
          <div class="quick-inner">
            <div class="quick-toolbar">
              <div
                class="category-tabs"
                role="group"
                aria-label="Класс быстрого выбора"
              >
                <button
                  v-for="item in [
                    'Все классы',
                    'Эконом',
                    'Бизнес',
                    'Кроссовер',
                  ]"
                  :key="item"
                  :aria-pressed="quickCategory === item"
                  :class="{ active: quickCategory === item }"
                  @click="selectQuick(item)"
                >
                  {{ item }}
                </button>
              </div>
            </div>
            <div class="car-rail-wrapper">
              <button
                v-show="canScrollBack"
                class="rail-arrow rail-prev"
                aria-label="Предыдущие автомобили"
                @click="scrollRail(-1)"
              >
                <ChevronLeft :size="20" />
              </button>
              <div ref="rail" class="car-rail" @scroll.passive="updateRailArrows">
                <button
                  v-for="car in filteredQuick"
                  :key="car.id"
                  class="car-card"
                  @click="showCar(car)"
                >
                  <span class="card-class">{{ car.category }}</span
                  ><CarArt :index="car.image" :name="car.name" /><span
                    class="car-card-bottom"
                    ><strong>{{ car.name }}</strong
                    ><span
                      >от <b>{{ money(car.price) }} ₽</b
                      ><small> / сутки</small></span
                    ></span
                  ><span class="card-arrow"><ArrowUpRight :size="16" /></span>
                </button>
              </div>
              <button
                v-show="canScrollForward"
                class="rail-arrow rail-next"
                aria-label="Следующие автомобили"
                @click="scrollRail(1)"
              >
                <ChevronRight :size="20" />
              </button>
            </div>
            <button
              class="all-cars"
              @click="
                category = 'Все классы';
                search();
              "
            >
              Весь автопарк<ArrowRight :size="16" />
            </button>
          </div>
        </div>
      </section>
    </div>
  </main>
  <CatalogPage v-if="page === 'catalog'"
    :cars="filteredCars" :all-cars="cars" v-model:filters="catalogFilters" :categories="categories" v-model:category="category" v-model:sort="sort"
    v-model:start="start" v-model:end="end" v-model:location="location" :location-options="pickupPresets"
    v-model:mileage="mileage" :mileage-prices="mileagePrices" :mileage-label="mileageLabel" :rate="rate" :protection="protection"
    @apply-search="search" @edit-search="editSearch" @show-car="showCar" />
  <VehiclePage v-if="page === 'car'"
    :car="selected" :back-label="carReturnPage === 'prices' ? 'К ценам' : 'Все автомобили'" :pickup-label="pickupLabel"
    :period="rentalPeriod" :period-confirmed="periodConfirmed" :period-error="periodError" :pickup-incomplete="incompleteAddress"
    v-model:mileage="mileage" :mileage-prices="mileagePrices" v-model:protection="protection"
    :renter-context="renterContext" :extras="catalogFilters.extras" :delivery="delivery" :rate="rate(selected)"
    @back="closeCar" @edit-search="editSearch" @apply-period="applyRentalPeriod" @request="request" @explain-protection="explainProtection" />
  <PricesPage v-if="page === 'prices'" v-model:tab="priceTab" :cars="cars" v-model:mileage="pricesMileage" :mileage-prices="mileagePrices"
    @show-car="showPriceCar" @explain-protection="explainProtection" @open-terms="nav('Условия')" />
  <ServicesPage v-if="page === 'services'" :detail-id="detailId" :start="start" :end="end" @find-cars="searchWithDates" />
  <InformationPage v-if="page === 'conditions' || page === 'contacts' || page === 'about'" :page="page" />
  <NewsPage v-if="page === 'news'" :detail-id="detailId" />
  <PromotionsPage v-if="page === 'promotions'" :detail-id="detailId" />
  <SiteFooter v-if="page !== 'account'" @navigate="nav" />
  <DemoAuth v-if="page === 'account' && !demoUser" @back="goPage('catalog')" @enter="enterDemo" />
  <DemoDashboard v-if="page === 'account' && demoUser" :user="demoUser" @catalog="goPage('catalog')" @logout="logoutDemo" />
  <BaseModal
    v-if="modal === 'contacts'"
    title="На связи с вашими планами"
    @close="modal = null"
  >
    <div class="contact-details">
      <a href="tel:+74951041010" class="contact-phone"
        ><Phone :size="21" />8 495 104-10-10</a
      >
      <p>Пн–пт, 8:00–17:00 (МСК)</p>
      <p><MapPin :size="19" />Москва, ул. Авиационная, 24с1</p>
      <a href="mailto:info@punktprokat.ru"
        ><Mail :size="18" />info@punktprokat.ru</a
      >
    </div>
  </BaseModal>
  <BaseModal
    v-if="modal === 'request' && requestDetails"
    :title="
      submitted
        ? 'Параметры аренды'
        : 'Запрос на аренду'
    "
    @close="modal = null"
    ><template v-if="!submitted"
      ><p class="modal-lead request-vehicle">{{ requestDetails.car }}</p>
      <form class="request-form" novalidate @submit.prevent="submitRequest">
        <div class="request-trip" role="group" aria-label="Условия аренды">
          <p><CalendarRange :size="16" aria-hidden="true" />{{ requestDetails.period }}</p>
          <p><MapPin :size="16" aria-hidden="true" />{{ requestDetails.pickup }}</p>
          <p><Gauge :size="16" aria-hidden="true" />Пробег · {{ requestDetails.mileage }}</p>
          <p><ShieldCheck :size="16" aria-hidden="true" />{{ requestDetails.protection }}</p>
          <ul v-if="requestDetails.notes.length" class="request-notes">
            <li v-for="note in requestDetails.notes" :key="note">{{ note }}</li>
          </ul>
          <p class="request-estimate">
            <span>Предварительно за {{ requestDetails.days }} {{ rentalDayLabel(requestDetails.days) }}</span>
            <strong>{{ money(requestDetails.total) }} ₽</strong>
          </p>
        </div>
        <label class="text-field"
          >Ваше имя<input
            aria-label="Ваше имя"
            v-model="name"
            autocomplete="given-name"
            placeholder="Как к вам обращаться"
            :aria-invalid="!!errors.name"
            :class="{ 'input-error': errors.name }"
            :aria-describedby="errors.name ? 'name-error' : undefined"
          /><small v-if="errors.name" id="name-error" class="error-text">{{
            errors.name
          }}</small></label
        ><label class="text-field"
          >Телефон<input
            aria-label="Телефон"
            :value="phone"
            @input="formatPhone"
            type="tel"
            inputmode="tel"
            autocomplete="tel"
            placeholder="+7 (___) ___-__-__"
            :aria-invalid="!!errors.phone"
            :class="{ 'input-error': errors.phone }"
            :aria-describedby="errors.phone ? 'phone-error' : undefined"
          /><small v-if="errors.phone" id="phone-error" class="error-text">{{
            errors.phone
          }}</small></label
        ><label class="check-label consent"
          ><input v-model="consent" type="checkbox" /><span class="check-visual"
            ><Check :size="13" /></span
          ><span
            >Согласен на обработку персональных данных для обратной связи</span
          ></label
        ><small v-if="errors.consent" class="error-text">{{
          errors.consent
        }}</small
        ><button type="submit" class="button button-primary full-width">
          Проверить заявку<ArrowRight :size="18" />
        </button>
        <p class="prototype-note">
          <Info :size="16" />Для согласования аренды позвоните нам. Введённые данные остаются на этой странице.
        </p>
      </form></template
    >
    <div v-else class="demo-success">
      <CheckCircle2 :size="44" />
      <h3>Что сообщить при звонке</h3>
      <p>{{ requestSnapshot }}</p>
      <p class="muted">
        Позвоните, чтобы уточнить наличие, итоговую цену и место получения.
      </p>
      <a href="tel:+74951041010" class="button button-primary"
        ><Phone :size="18" />Позвонить в «Пункт»</a
      >
    </div></BaseModal
  >
  <BaseModal v-if="modal === 'info'" :title="infoTitle" @close="modal = null">
    <img
      v-if="infoPhoto"
      class="guide-photo"
      :src="guideAsset(infoPhoto)"
      :alt="guidePhotos[infoPhoto]"
      width="900"
      height="490"
      decoding="async"
    />
    <p class="info-body">{{ infoBody }}</p>
    <button class="button button-soft" @click="modal = null">
      Понятно<Check :size="17" /></button
  ></BaseModal>
</template>
