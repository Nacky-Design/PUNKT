<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onBeforeUnmount, watchEffect } from "vue";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CarFront,
  CalendarRange,
  ClipboardCheck,
  KeyRound,
  MapPin,
  ShieldCheck,
  Gauge,
  UserRound,
  UsersRound,
  Settings2,
  Phone,
  Menu,
  X,
  Check,
  Fuel,
  Zap,
  CircleHelp,
  Clock3,
  MessageCircle,
  CheckCircle2,
  Info,
  Mail,
} from "lucide-vue-next";
import SelectField from "./components/SelectField.vue";
import DateRange from "./components/DateRange.vue";
import BaseModal from "./components/BaseModal.vue";
import CarArt from "./components/CarArt.vue";
import VehicleGallery from "./components/VehicleGallery.vue";
import ServicesMenu from "./components/ServicesMenu.vue";
import HeroVideo from "./components/HeroVideo.vue";
import DeliveryAddress from "./components/DeliveryAddress.vue";
import {
  cars,
  categories,
  money,
  todayISO,
  addDays,
  localDate,
  type Car,
} from "./data";
const office = "Офис на Авиационной";
const addressDelivery = "Доставка по адресу";
const pickupPresets = [office, "Шереметьево (SVO)", "Домодедово (DME)", "Внуково (VKO)"];
const category = ref("Все классы"),
  location = ref(office),
  mileage = ref("100 км / сутки");
const address = ref("");
const searchAddressErrors = ref(false);
const discussMileage = ref(false);
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
  end = ref(addDays(todayISO(), 7));
const protection = ref(false),
  business = ref(false),
  foreign = ref(false);
const mobileQuery = window.matchMedia("(max-width: 760px)");
const mobile = ref(mobileQuery.matches);
function updateViewport(event: MediaQueryListEvent) {
  mobile.value = event.matches;
}
onMounted(() => mobileQuery.addEventListener("change", updateViewport));
onBeforeUnmount(() => mobileQuery.removeEventListener("change", updateViewport));
const quickOpen = ref(false),
  quickCategory = ref("Все классы"),
  mobileMenu = ref(false),
  mobileMenuButton = ref<HTMLButtonElement>(),
  rail = ref<HTMLElement>();
const canScrollBack = ref(false);
const canScrollForward = ref(false);
const searchPanel = ref<HTMLElement>();
const navItems = ["Цены", "Услуги", "Условия", "Акции", "Новости", "Контакты"];
const guidePhotos = {
  delivery: "Передача ключей от автомобиля клиенту",
  mileage: "Автомобиль на загородной дороге",
  protection: "Осмотр кузова автомобиля перед получением",
};
const offerDate = "10 января";
const offerSteps = [
  {
    photo: "delivery",
    title: "Получите ключи в удобном месте",
    description: "Выберите автомобиль и место получения. После проверки документов команда согласует время и привезёт автомобиль с договором.",
  },
  {
    photo: "protection",
    title: "Осмотрите автомобиль вместе",
    description: "Сотрудник покажет автомобиль. Перед подписанием договора осмотрите кузов и зафиксируйте состояние машины.",
  },
  {
    photo: "mileage",
    title: "Отправляйтесь по своим делам",
    description: "После передачи ключей можно выезжать. Время и место возврата согласуем при оформлении.",
  },
] as const;
const offerIndex = ref(0);
const offerStep = computed(() => offerSteps[offerIndex.value]!);
const modal = ref<
    | "car"
    | "request"
    | "account"
    | "offer"
    | "info"
    | "catalog"
    | "contacts"
    | null
  >(null),
  selected = ref<Car>(cars[0]!);
const infoTitle = ref(""),
  infoBody = ref(""),
  infoPhoto = ref<keyof typeof guidePhotos>(),
  showKit = ref(new URLSearchParams(window.location.search).has("ui-kit"));
const name = ref(""),
  phone = ref(""),
  consent = ref(false),
  submitted = ref(false),
  errors = ref<Record<string, string>>({}),
  requestSnapshot = ref("");
const sort = ref("По цене");
const carFromCatalog = ref(false);
let catalogScroll = 0;
const days = computed(() =>
  Math.max(
    1,
    Math.round(
      (localDate(end.value).getTime() - localDate(start.value).getTime()) /
        86400000,
    ),
  ),
);
const mileagePrices: Record<string, number> = {
  "100 км / сутки": 0,
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
  car.price + mileageExtra.value + (protection.value ? 490 : 0);
const filteredQuick = computed(() =>
  cars.filter(
    (c) =>
      quickCategory.value === "Все классы" ||
      c.category === quickCategory.value,
  ),
);
const filteredCars = computed(() => {
  const list = cars.filter(
    (c) => category.value === "Все классы" || c.category === category.value,
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
const dateText = computed(
  () =>
    `${localDate(start.value).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })} — ${localDate(end.value).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}`,
);
const dayLabel = computed(() =>
  days.value % 10 === 1 && days.value % 100 !== 11
    ? "день"
    : days.value % 10 >= 2 &&
        days.value % 10 <= 4 &&
        !(days.value % 100 >= 12 && days.value % 100 <= 14)
      ? "дня"
      : "дней",
);
function openInfo(title: string, body: string, photo?: keyof typeof guidePhotos) {
  infoTitle.value = title;
  infoBody.value = body;
  infoPhoto.value = photo;
  modal.value = "info";
  mobileMenu.value = false;
}
function openService(title: string, description: string) {
  if (mobileMenu.value) mobileMenuButton.value?.focus();
  openInfo(title, description);
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
    `«Защита+» добавляет к предварительному расчёту 490 ₽ за сутки. Например, за трое суток доплата составит ${money(490 * 3)} ₽.\n\nПокрытие, исключения и ответственность согласуем до оформления. При получении осмотрите автомобиль вместе с сотрудником и зафиксируйте его состояние.`,
    "protection",
  );
}
function nav(item: string) {
  mobileMenu.value = false;
  if (item === "Цены") search();
  else if (item === "Акции") openOffer();
  else if (item === "Контакты") modal.value = "contacts";
  else if (item === "Условия")
    openInfo(
      "Условия аренды",
      "Возраст — от 21 года, водительский стаж — от 1 года. Для оформления потребуются паспорт и водительское удостоверение. Договор подписывается при получении автомобиля. Условия залога, «Защиты+» и допустимых поездок уточняются до подтверждения. Действующий юридический PDF будет подключён перед запуском сайта.",
    );
  else
    openInfo(
      "Новости «Пункта»",
      "Готовимся к запуску нового сайта. Здесь появятся новости компании, полезные материалы и истории поездок. Сейчас вы смотрите интерактивный прототип главного экрана.",
    );
}
function openOffer() {
  offerIndex.value = 0;
  modal.value = "offer";
}
function changeOfferStep(direction: number) {
  const count = offerSteps.length;
  offerIndex.value = (offerIndex.value + direction + count) % count;
}
function chooseDelivery() {
  modal.value = null;
  location.value = addressDelivery;
  nextTick(() => searchPanel.value?.focus());
}
function showCar(car: Car) {
  carFromCatalog.value = modal.value === "catalog";
  if (carFromCatalog.value) {
    catalogScroll = document.getElementById("catalog")?.closest(".modal")?.scrollTop ?? 0;
  }
  selected.value = car;
  modal.value = "car";
}
function closeCar() {
  if (!carFromCatalog.value) {
    modal.value = null;
    return;
  }
  modal.value = "catalog";
  nextTick(() => {
    const button = document.getElementById(`catalog-car-${selected.value.id}`);
    const dialog = button?.closest(".modal");
    if (dialog) dialog.scrollTop = catalogScroll;
    button?.focus({ preventScroll: true });
  });
}
function editSearch() {
  modal.value = null;
  nextTick(() => searchPanel.value?.focus());
}
function request(withMileageDiscussion = false) {
  discussMileage.value = withMileageDiscussion;
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
  errors.value = {};
  if (name.value.trim().length < 2)
    errors.value.name = "Укажите имя — не менее двух букв";
  if (phone.value.replace(/\D/g, "").length !== 11)
    errors.value.phone = "Введите телефон полностью";
  if (!consent.value)
    errors.value.consent = "Нужно согласие на обработку данных";
  if (incompleteAddress.value) errors.value.address = "Уточните адрес доставки";
  if (Object.keys(errors.value).length) return;
  requestSnapshot.value = [
    selected.value.name, dateText.value, pickupLabel.value, mileageLabel.value,
    discussMileage.value ? "Пробег — обсудить перед оформлением" : "",
  ].filter(Boolean).join(" · ");
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
  modal.value = "catalog";
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
  if (!rail.value || mobile.value || !quickOpen.value) return;
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
  modal.value = "account";
  mobileMenu.value = false;
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
  <header class="site-header">
    <a class="brand" href="#" aria-label="Пункт — на главную"
      ><span class="brand-image"></span
    ></a>
    <nav class="desktop-nav" aria-label="Главное меню">
      <template v-for="item in navItems" :key="item">
        <ServicesMenu v-if="item === 'Услуги'" @select="openService" />
        <button v-else class="nav-label" type="button" @click="nav(item)">
          {{ item }}
        </button>
      </template>
    </nav>
    <div class="header-actions">
      <a
        class="header-phone phone-label"
        href="tel:+74951041010"
        aria-label="Позвонить: 8 495 104-10-10"
      >
        <Phone :size="16" /><span>8 495 104-10-10</span>
      </a>
      <button
        class="account-button"
        aria-label="Личный кабинет"
        @click="account"
      >
        <UserRound :size="19" /><span>Войти</span>
      </button>
      <button
        ref="mobileMenuButton"
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
        <template v-for="item in navItems" :key="item">
          <ServicesMenu v-if="item === 'Услуги'" mobile @select="openService" />
          <button v-else type="button" @click="nav(item)">
            {{ item }}<ArrowUpRight :size="17" />
          </button>
        </template>
        <button @click="account">
          Личный кабинет<UserRound :size="17" />
        </button>
      </nav>
    </Transition>
  </header>
  <main>
    <section class="hero" aria-labelledby="hero-title">
      <HeroVideo />
      <div class="hero-shade" aria-hidden="true"></div>
      <div class="hero-content">
        <button class="delivery-offer" @click="openOffer">
          <span class="offer-copy">
            <strong>Доставим<br class="offer-break" /> бесплатно</strong>
            <span>Акция до {{ offerDate }}</span>
          </span>
          <img
            class="offer-car"
            src="/assets/delivery-car.webp"
            alt=""
            width="660"
            height="312"
          />
          <ArrowUpRight class="offer-arrow" :size="20" aria-hidden="true" />
        </button>
        <div class="hero-copy">
          <h1 id="hero-title" class="headline">
            Автомобиль<br />под ваши
            <em>планы<span class="headline-dot">.</span></em>
          </h1>
          <p class="hero-description">
            Аренда автомобилей в Москве. <br />
            Выберите машину — заберите в офисе или закажите доставку.
          </p>
          <div class="hero-benefits">
            <span>
              <span class="benefit-icon" aria-hidden="true"><KeyRound /></span>
              <span>В офисе или<br />с доставкой</span>
            </span>
            <span>
              <span class="benefit-icon" aria-hidden="true"><CalendarRange /></span>
              <span>На сутки<br />или надолго</span>
            </span>
            <span>
              <span class="benefit-icon" aria-hidden="true"><ClipboardCheck /></span>
              <span>Условия до<br />оформления</span>
            </span>
          </div>
        </div>
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
                  :display-value="(mileageExtra ? 'Пакет ' : 'Включено ') + mileage"
                  action-label="Изменить"
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
            :class="{ 'quick-hidden': !mobile && !quickOpen }"
            :inert="!mobile && !quickOpen"
            role="region"
            :aria-label="mobile ? 'Автопарк' : 'Быстрый выбор'"
          >
            <div class="quick-inner">
              <h2 class="mobile-fleet-title">Автопарк</h2>
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
                    ><CarArt :image="car.image" :name="car.name" /><span
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
    </section>
    <section v-if="showKit" id="ui-kit" class="ui-kit section-container">
      <h2>Одна система. Все состояния.</h2>
      <div class="swatches">
        <div
          v-for="color in ['#FFC107', '#171717', '#FFFFFF', '#F5F5F5']"
          :key="color"
        >
          <span :style="{ background: color }"></span><code>{{ color }}</code>
        </div>
      </div>
      <div class="type-specimens">
        <article
          v-for="font in ['Onest', 'Manrope']"
          :key="font"
          :style="{ fontFamily: font + ' Variable, sans-serif' }"
        >
          <h3>{{ font }}{{ font === 'Onest' ? ' · основной' : '' }}</h3>
          <dl>
            <div>
              <dt>Главный заголовок</dt>
              <dd class="headline">Автомобиль под ваши планы<span class="headline-dot">.</span></dd>
            </div>
            <div>
              <dt>Подстрочник</dt>
              <dd class="hero-description">Аренда автомобилей в Москве.</dd>
            </div>
            <div>
              <dt>Навигация</dt>
              <dd class="nav-label">Цены · Услуги · Условия</dd>
            </div>
            <div>
              <dt>Телефон</dt>
              <dd class="phone-label">8 495 104-10-10</dd>
            </div>
            <div>
              <dt>Поля</dt>
              <dd>
                <span class="field-caption">Место получения</span>
                <span class="field-value">Офис на Авиационной</span>
              </dd>
            </div>
            <div>
              <dt>Справка</dt>
              <dd class="info-body">Выберите место и время получения.</dd>
            </div>
            <div>
              <dt>Служебное сообщение</dt>
              <dd class="prototype-note"><Info :size="16" />Данные не отправляются</dd>
            </div>
          </dl>
        </article>
      </div>
      <div class="kit-grid">
        <article>
          <h3>Кнопки</h3>
          <div class="kit-stack">
            <button class="button button-primary">
              Найти автомобиль<ArrowRight :size="18" /></button
            ><button class="button button-dark">
              Основное действие<ArrowRight :size="18" /></button
            ><button class="button button-soft">Вторичное действие</button
            ><button class="button button-primary" disabled>Недоступно</button>
          </div>
        </article>
        <article>
          <h3>Поля и состояния</h3>
          <div class="kit-stack">
            <label class="text-field"
              >Имя<input placeholder="Как к вам обращаться" /></label
            ><label class="text-field"
              >Фокус<input class="force-focus" value="Александр" /></label
            ><label class="text-field"
              >Ошибка<input class="input-error" value="+7 (999)" /><small
                class="error-text"
                >Введите телефон полностью</small
              ></label
            >
          </div>
        </article>
        <article>
          <h3>Выбор и обратная связь</h3>
          <label class="check-label"
            ><input type="checkbox" checked /><span class="check-visual"
              ><Check :size="13" /></span
            >Выбрано</label
          ><label class="check-label"
            ><input type="checkbox" /><span class="check-visual"
              ><Check :size="13" /></span
            >Не выбрано</label
          ><label class="check-label"
            ><input type="checkbox" disabled /><span class="check-visual"
              ><Check :size="13" /></span
            >Недоступно</label
          >
          <p class="status-chip">
            <CheckCircle2 :size="15" />Параметры выбраны
          </p>
          <p class="data-disclaimer">
            Hover — мягкая тень и смена тона. Focus — видимое кольцо. Reduced
            motion — без анимации.
          </p>
        </article>
      </div>
    </section>
  </main>
  <BaseModal
    v-if="modal === 'catalog'"
    title="Подбор автомобилей"
    wide
    @close="modal = null"
  >
    <section id="catalog" class="catalog-content" aria-label="Результаты подбора">
      <div class="catalog-trip">
        <dl>
          <div>
            <dt><CalendarRange :size="17" aria-hidden="true" />Срок аренды</dt>
            <dd>{{ dateText }} <span>· {{ days }} {{ dayLabel }}</span></dd>
          </div>
          <div>
            <dt><MapPin :size="17" aria-hidden="true" />Место получения</dt>
            <dd>{{ pickupLabel }}</dd>
          </div>
          <div>
            <dt><Gauge :size="17" aria-hidden="true" />Пробег</dt>
            <dd>{{ mileageLabel }}</dd>
          </div>
        </dl>
        <div class="catalog-trip-actions">
          <ul v-if="protection || renterContext.length" class="catalog-tags" aria-label="Дополнительные условия">
            <li v-if="protection">Защита+ включена</li>
            <li v-for="tag in renterContext" :key="tag">{{ tag }}</li>
          </ul>
          <button class="text-button catalog-edit" type="button" @click="editSearch">
            Изменить параметры<ArrowUpRight :size="16" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div class="catalog-toolbar">
        <div class="catalog-filters" role="group" aria-label="Фильтр по классу">
          <button
            v-for="item in categories"
            :key="item"
            type="button"
            :aria-pressed="category === item"
            @click="category = item"
          >{{ item }}</button>
        </div>
        <div class="catalog-controls">
          <div>
            <p class="catalog-count" aria-live="polite">{{ carCount }}</p>
            <p v-if="filteredCars.length" class="catalog-demo">Демонстрационные цены</p>
          </div>
          <select v-if="filteredCars.length" v-model="sort" aria-label="Сортировка автомобилей">
            <option value="По цене">Сначала дешевле</option>
            <option>Сначала дороже</option>
            <option>По названию</option>
          </select>
        </div>
      </div>

      <div v-if="!filteredCars.length" class="catalog-empty">
        <CarFront :size="32" aria-hidden="true" />
        <h3>В этом классе пока нет примеров</h3>
        <p>Выберите другой класс или посмотрите все автомобили.</p>
        <button type="button" class="button button-primary" @click="category = 'Все классы'">
          Все классы<ArrowRight :size="17" aria-hidden="true" />
        </button>
      </div>
      <template v-else>
        <div class="catalog-grid">
          <article v-for="car in filteredCars" :key="car.id" class="result-card" :aria-labelledby="'catalog-name-' + car.id">
            <div class="result-photo">
              <CarArt :image="car.image" :name="car.name" />
              <span class="result-class">{{ car.category }}</span>
            </div>
            <div class="result-body">
              <div class="result-title">
                <h3 :id="'catalog-name-' + car.id">{{ car.name }}</h3>
                <span>{{ car.year }} г.</span>
              </div>
              <ul class="result-specs" aria-label="Характеристики и условия">
                <li><UsersRound :size="16" aria-hidden="true" />{{ car.seats }} мест</li>
                <li><Settings2 :size="16" aria-hidden="true" />Автомат</li>
                <li class="result-limit"><Gauge :size="17" aria-hidden="true" />{{ mileageLabel }}</li>
              </ul>
              <div class="result-price">
                <div>
                  <span class="result-duration">За {{ days }} {{ dayLabel }}</span>
                  <strong>{{ money(rate(car) * days) }} ₽</strong>
                </div>
                <span class="result-daily">{{ money(rate(car)) }} ₽ / сутки</span>
              </div>
              <button
                :id="'catalog-car-' + car.id"
                type="button"
                class="button result-details"
                :aria-label="'Подробнее: ' + car.name"
                @click="showCar(car)"
              >
                Подробнее<ArrowUpRight :size="17" aria-hidden="true" />
              </button>
            </div>
          </article>
        </div>
        <p class="catalog-note">
          <Info :size="16" aria-hidden="true" />
          <span>Наличие, залог и стоимость доставки уточняются отдельно.</span>
        </p>
      </template>
    </section>
  </BaseModal>
  <BaseModal
    v-if="modal === 'contacts'"
    title="На связи с вашими планами"
    @close="modal = null"
  >
    <div class="contact-details">
      <a href="tel:+74951041010" class="contact-phone"
        ><Phone :size="21" />8 495 104-10-10</a
      >
      <p>Ежедневно, 09:00–21:00</p>
      <p><MapPin :size="19" />Москва, ул. Авиационная, 24с1</p>
      <a href="mailto:info@punktprokat.ru"
        ><Mail :size="18" />info@punktprokat.ru</a
      >
    </div>
  </BaseModal>
  <BaseModal
    v-if="modal === 'car'"
    :title="selected.name"
    wide
    @close="closeCar"
  >
    <div class="detail-meta detail-navigation">
      <p>{{ selected.category }} · {{ selected.year }} г. · {{ selected.body }}</p>
      <button v-if="carFromCatalog" class="text-button" type="button" @click="closeCar">
        <ChevronLeft :size="16" aria-hidden="true" />К результатам
      </button>
    </div>
    <div class="car-detail-grid">
      <VehicleGallery :key="selected.id" :car="selected" />

      <aside class="estimate" aria-label="Расчёт аренды">
        <div class="estimate-total">
          <span>Итого за {{ days }} {{ dayLabel }}</span>
          <strong>{{ money(rate(selected) * days) }} ₽</strong>
        </div>
        <p class="detail-daily">{{ money(rate(selected)) }} ₽ <span>/ сутки</span></p>
        <div class="vehicle-mileage" role="group" aria-label="Выбор тарифа по пробегу">
          <p>Лимит в сутки</p>
          <div class="vehicle-mileage-options">
            <button
              v-for="(price, option) in mileagePrices"
              :key="option"
              type="button"
              :aria-pressed="mileage === option"
              @click="mileage = option"
            >
              <strong>{{ option }}</strong>
              <small>{{ price ? '+' + money(price) + ' ₽ / сутки' : 'Включено' }}</small>
            </button>
          </div>
        </div>
        <div class="estimate-trip">
          <p><CalendarRange :size="17" aria-hidden="true" />{{ dateText }}</p>
          <p><MapPin :size="17" aria-hidden="true" />{{ pickupLabel }}</p>
          <div class="estimate-mileage">
            <p><Gauge :size="17" aria-hidden="true" /><span>Пробег · <strong>{{ mileageLabel }}</strong></span></p>
            <small>Сверх лимита — доплата. Ставку уточним до оформления.</small>
          </div>
        </div>
        <div v-if="renterContext.length" class="context-tags">
          <span v-for="tag in renterContext" :key="tag">{{ tag }}</span>
        </div>
        <dl v-if="mileageExtra || protection">
          <div>
            <dt>Аренда</dt>
            <dd>{{ money(selected.price * days) }} ₽</dd>
          </div>
          <div v-if="mileageExtra">
            <dt>Пакет {{ mileage }}</dt>
            <dd>{{ money(mileageExtra * days) }} ₽</dd>
          </div>
          <div v-if="protection">
            <dt>Защита+</dt>
            <dd>{{ money(490 * days) }} ₽</dd>
          </div>
        </dl>
        <button class="mileage-discuss text-button" type="button" @click="request(true)">
          Обсудить пробег<ArrowUpRight :size="15" aria-hidden="true" />
        </button>
        <button class="button button-primary full-width" @click="request()">
          Оставить заявку<ArrowRight :size="18" />
        </button>
      </aside>

      <div class="vehicle-sections">
        <section class="vehicle-section" aria-labelledby="vehicle-specs-title">
          <h3 id="vehicle-specs-title">Характеристики</h3>
          <dl class="spec-grid">
            <div>
              <dt><span class="spec-icon"><UsersRound :size="18" aria-hidden="true" /></span>Посадочные места</dt>
              <dd>{{ selected.seats }}</dd>
            </div>
            <div>
              <dt><span class="spec-icon"><Settings2 :size="18" aria-hidden="true" /></span>Коробка передач</dt>
              <dd>Автомат</dd>
            </div>
            <div>
              <dt><span class="spec-icon"><Fuel :size="18" aria-hidden="true" /></span>Топливо</dt>
              <dd>{{ selected.fuel }}</dd>
            </div>
            <div>
              <dt><span class="spec-icon"><CarFront :size="18" aria-hidden="true" /></span>Привод</dt>
              <dd>{{ selected.drive }}</dd>
            </div>
            <div>
              <dt><span class="spec-icon"><Zap :size="18" aria-hidden="true" /></span>Мощность</dt>
              <dd>{{ selected.power }} л.с.</dd>
            </div>
            <div>
              <dt><span class="spec-icon"><CarFront :size="18" aria-hidden="true" /></span>Тип кузова</dt>
              <dd>{{ selected.body }}</dd>
            </div>
          </dl>
          <dl v-if="selected.extraSpecs?.length" class="vehicle-tech">
            <div v-for="spec in selected.extraSpecs" :key="spec.label">
              <dt>{{ spec.label }}</dt>
              <dd>{{ spec.value }}</dd>
            </div>
          </dl>
        </section>
        <section v-if="selected.trim" class="vehicle-section" aria-labelledby="vehicle-trim-title">
          <h3 id="vehicle-trim-title">Комплектация {{ selected.trim.name }}</h3>
          <ul class="vehicle-features">
            <li v-for="feature in selected.trim.features" :key="feature"><Check :size="16" aria-hidden="true" />{{ feature }}</li>
          </ul>
        </section>
        <section class="vehicle-section" aria-labelledby="vehicle-terms-title">
          <h3 id="vehicle-terms-title">Что учесть в стоимости</h3>
          <dl class="vehicle-terms">
            <div><dt>Пробег сверх лимита</dt><dd>Оплачивается отдельно. Ставку за километр и правила расчёта за несколько суток согласуем до оформления.</dd></div>
            <div><dt>Залог</dt><dd>Размер и применимость зависят от условий аренды и маршрута. Уточним до подтверждения.</dd></div>
            <div v-if="delivery"><dt>Доставка</dt><dd>Стоимость подачи согласуем по выбранному месту получения.</dd></div>
            <div><dt>Мойка и топливо</dt><dd>Машину возвращают чистой и с тем же уровнем топлива. При необходимости мойка и дозаправка оплачиваются отдельно.</dd></div>
            <div><dt>Защита+</dt><dd>Дополнительная опция. Покрытие и исключения уточняются перед заключением договора.</dd></div>
          </dl>
        </section>
        <section class="vehicle-section" aria-labelledby="vehicle-pickup-title">
          <h3 id="vehicle-pickup-title">Что будет после заявки</h3>
          <p>Подтвердим наличие автомобиля, итоговую цену и время выдачи. Для оформления понадобятся паспорт и водительское удостоверение.</p>
          <p v-if="delivery">Согласуем место встречи. При передаче автомобиля водитель привезёт печатный договор.</p>
          <p v-else>В офисе на Авиационной вы подпишете договор и получите автомобиль.</p>
        </section>
      </div>
    </div>
  </BaseModal>
  <BaseModal
    v-if="modal === 'request'"
    :title="
      submitted
        ? 'Всё готово к следующему шагу'
        : 'Давайте обсудим вашу поездку'
    "
    @close="modal = null"
    ><template v-if="!submitted"
      ><p class="modal-lead">{{ selected.name }} · {{ dateText }}</p>
      <form class="request-form" novalidate @submit.prevent="submitRequest">
        <div class="request-trip">
          <p v-if="!addressSelected"><MapPin :size="16" aria-hidden="true" />{{ pickupLabel }}</p>
          <p><Gauge :size="16" aria-hidden="true" />Пробег · {{ mileageLabel }}</p>
          <label class="check-label">
            <input v-model="discussMileage" type="checkbox" />
            <span class="check-visual"><Check :size="13" /></span>
            Хочу обсудить пробег
          </label>
          <small v-if="discussMileage">В расчёте пока используется выбранный лимит.</small>
        </div>
        <DeliveryAddress
          v-if="addressSelected"
          v-model="location"
          v-model:address="address"
          :presets="pickupPresets"
          :address-mode="addressDelivery"
          :invalid="!!errors.address && incompleteAddress"
          address-only
        />
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
          <Info :size="16" />Демонстрация: данные не отправляются и не
          сохраняются. Для реальной заявки позвоните нам.
        </p>
      </form></template
    >
    <div v-else class="demo-success">
      <CheckCircle2 :size="44" />
      <h3>Форма заполнена корректно</h3>
      <p>{{ requestSnapshot }}</p>
      <p class="muted">
        В рабочей версии заявка поступит команде. Сейчас данные не отправлены.
        Автомобиль не забронирован.
      </p>
      <a href="tel:+74951041010" class="button button-primary"
        ><Phone :size="18" />Позвонить в «Пункт»</a
      >
    </div></BaseModal
  >
  <BaseModal
    v-if="modal === 'account'"
    title="Ваш личный «Пункт»"
    @close="modal = null"
    ><div class="account-intro">
      <span class="large-icon"><UserRound :size="30" /></span>
      <p>Поездки, документы и детали аренды —<br />в одном месте.</p>
    </div>
    <div class="account-preview">
      <span><Clock3 :size="19" />История ваших поездок</span
      ><span><ShieldCheck :size="19" />Документы по аренде</span
      ><span><MessageCircle :size="19" />Связь с командой</span>
    </div>
    <div class="prototype-note">
      <Info :size="18" />Предварительная структура кабинета. Авторизация и
      состав разделов будут подключены после согласования. Сейчас вход
      недоступен.
    </div>
    <a href="tel:+74951041010" class="button button-dark full-width"
      ><Phone :size="17" />Связаться с нами</a
    ></BaseModal
  >
  <BaseModal
    v-if="modal === 'offer'"
    title="Доставим бесплатно"
    @close="modal = null"
  >
    <section class="offer-gallery" aria-label="Как проходит доставка">
      <div class="offer-slide" aria-live="polite" aria-atomic="true">
        <img
          class="guide-photo"
          :class="'guide-photo-' + offerStep.photo"
          src="/assets/rental-guides.webp"
          :alt="guidePhotos[offerStep.photo]"
          width="900"
          height="1350"
        />
        <h3>{{ offerStep.title }}</h3>
        <p>{{ offerStep.description }}</p>
      </div>
      <div class="offer-gallery-controls">
        <span>{{ offerIndex + 1 }} / {{ offerSteps.length }}</span>
        <button
          class="icon-button"
          type="button"
          aria-label="Предыдущий шаг доставки"
          @click="changeOfferStep(-1)"
        >
          <ChevronLeft :size="18" aria-hidden="true" />
        </button>
        <button
          class="icon-button"
          type="button"
          aria-label="Следующий шаг доставки"
          @click="changeOfferStep(1)"
        >
          <ChevronRight :size="18" aria-hidden="true" />
        </button>
      </div>
    </section>
    <p class="prototype-note">
      <Info :size="17" />
      <span>Рабочая дата акции — {{ offerDate }}. Даты, территория и ограничения ещё
      уточняются. Бесплатная доставка не применяется в расчёте автоматически.</span>
    </p>
    <button
      class="button button-primary full-width offer-action"
      @click="chooseDelivery"
    >
      Подобрать автомобиль<ArrowRight :size="19" aria-hidden="true" />
    </button>
  </BaseModal>
  <BaseModal v-if="modal === 'info'" :title="infoTitle" @close="modal = null">
    <img
      v-if="infoPhoto"
      class="guide-photo"
      :class="'guide-photo-' + infoPhoto"
      src="/assets/rental-guides.webp"
      :alt="guidePhotos[infoPhoto]"
      width="900"
      height="1350"
    />
    <p class="info-body">{{ infoBody }}</p>
    <button class="button button-soft" @click="modal = null">
      Понятно<Check :size="17" /></button
  ></BaseModal>
</template>
