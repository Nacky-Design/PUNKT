<script setup lang="ts">
import { ref, computed, nextTick, watch } from "vue";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CarFront,
  CalendarDays,
  MapPin,
  ShieldCheck,
  Gauge,
  Truck,
  UserRound,
  Phone,
  Menu,
  X,
  Check,
  Sparkles,
  Fuel,
  Zap,
  CircleHelp,
  Clock3,
  MessageCircle,
  CheckCircle2,
  Info,
  RotateCcw,
  Mail,
} from "lucide-vue-next";
import SelectField from "./components/SelectField.vue";
import DateRange from "./components/DateRange.vue";
import BaseModal from "./components/BaseModal.vue";
import CarArt from "./components/CarArt.vue";
import {
  cars,
  categories,
  money,
  todayISO,
  addDays,
  localDate,
  type Car,
} from "./data";
const category = ref("Все классы"),
  location = ref("Офис на Авиационной"),
  mileage = ref("100 км / сутки");
const start = ref(addDays(todayISO(), 2)),
  end = ref(addDays(todayISO(), 7));
const protection = ref(false),
  delivery = ref(false),
  business = ref(false),
  foreign = ref(false);
const quickOpen = ref(false),
  quickCategory = ref("Все классы"),
  mobileMenu = ref(false),
  rail = ref<HTMLElement>();
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
  selected = ref<Car>(cars[0]!),
  gallery = ref(0);
const infoTitle = ref(""),
  infoBody = ref(""),
  showKit = ref(new URLSearchParams(window.location.search).has("ui-kit"));
const name = ref(""),
  phone = ref(""),
  consent = ref(false),
  submitted = ref(false),
  errors = ref<Record<string, string>>({}),
  requestSnapshot = ref("");
const searchStatus = ref(""),
  sort = ref("По цене");
const days = computed(() =>
  Math.max(
    1,
    Math.round(
      (localDate(end.value).getTime() - localDate(start.value).getTime()) /
        86400000,
    ),
  ),
);
const mileageExtra = computed(() =>
  mileage.value.startsWith("250")
    ? 700
    : mileage.value.startsWith("500")
      ? 1500
      : 0,
);
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
  return sort.value === "По цене"
    ? list.sort((a, b) => a.price - b.price)
    : list.sort((a, b) => a.name.localeCompare(b.name));
});
const context = computed(() =>
  [
    business.value ? "Для юридического лица" : "",
    foreign.value ? "Иностранный гражданин" : "",
    delivery.value ? "Нужна доставка" : "",
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
function openInfo(title: string, body: string) {
  infoTitle.value = title;
  infoBody.value = body;
  modal.value = "info";
  mobileMenu.value = false;
}
function explainMileage() {
  const limit = Number.parseInt(mileage.value, 10);
  openInfo(
    "Что означает лимит пробега",
    `Это расстояние, включённое в тариф, а не пробег самого автомобиля.\n\nПри аренде на одни сутки с пакетом ${limit} км можно проехать ${limit} км без доплаты за километры. Если проехать ${limit + 20} км, 20 км будут сверх лимита.\n\nДля более длинных поездок выберите больший пакет — он меняет предварительную стоимость. Ставку за перепробег и правила расчёта за несколько суток подтвердим до оформления.`,
  );
}
function explainDelivery() {
  openInfo(
    "Как работает доставка",
    "Привезём автомобиль в согласованное место и время. Выберите место в поле «Место получения».\n\nСначала свяжемся с вами и проверим документы в согласованном чате. После одобрения договоримся о времени; водитель привезёт автомобиль и печатный договор.\n\nОтметка «Доставка» — пожелание к заявке, не подтверждение выдачи. Стоимость согласуется отдельно; даты и территория акции бесплатной доставки ещё уточняются.",
  );
}
// Receiving the car in the office and requesting delivery are mutually exclusive.
watch(location, (value) => {
  delivery.value = value !== "Офис на Авиационной";
});
watch(delivery, (enabled) => {
  if (enabled && location.value === "Офис на Авиационной")
    location.value = "Доставка по Москве";
  else if (!enabled && location.value !== "Офис на Авиационной")
    location.value = "Офис на Авиационной";
});
function nav(item: string) {
  mobileMenu.value = false;
  if (item === "Цены") search();
  else if (item === "Акции") modal.value = "offer";
  else if (item === "Контакты") modal.value = "contacts";
  else if (item === "Условия")
    openInfo(
      "Условия аренды",
      "Возраст — от 21 года, водительский стаж — от 1 года. Для оформления потребуются паспорт и водительское удостоверение. Договор подписывается при получении автомобиля. Условия залога, «Защиты+» и допустимых поездок уточняются до подтверждения. Действующий юридический PDF будет подключён перед запуском сайта.",
    );
  else if (item === "Услуги")
    openInfo(
      "Получите автомобиль удобным способом",
      "Доставка: свяжитесь с командой, передайте документы в согласованный чат и дождитесь одобрения. После согласования времени водитель привезёт автомобиль и печатный договор. В офисе: приезжайте с паспортом и водительским удостоверением, подпишите договор и получите автомобиль.",
    );
  else
    openInfo(
      "Новости «Пункта»",
      "Готовимся к запуску нового сайта. Здесь появятся новости компании, полезные материалы и истории поездок. Сейчас вы смотрите интерактивный прототип главного экрана.",
    );
}
function showCar(car: Car) {
  selected.value = car;
  gallery.value = 0;
  modal.value = "car";
}
function request() {
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
  if (Object.keys(errors.value).length) return;
  requestSnapshot.value = `${selected.value.name} · ${dateText.value}`;
  submitted.value = true;
  name.value = "";
  phone.value = "";
  consent.value = false;
}
function search() {
  searchStatus.value = `${dateText.value} · ${days.value} ${dayLabel.value}`;
  modal.value = "catalog";
}

function selectQuick(value: string) {
  quickCategory.value = value;
  nextTick(() => rail.value?.scrollTo({ left: 0, behavior: "smooth" }));
}
function scrollRail(direction: number) {
  rail.value?.scrollBy({
    left: direction * (rail.value.clientWidth * 0.65),
    behavior: "smooth",
  });
}
function reset() {
  category.value = "Все классы";
  mileage.value = "100 км / сутки";
  protection.value = delivery.value = business.value = foreign.value = false;
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
      <button
        v-for="item in [
          'Цены',
          'Услуги',
          'Условия',
          'Акции',
          'Новости',
          'Контакты',
        ]"
        :key="item"
        @click="nav(item)"
      >
        {{ item }}<ChevronDown v-if="item === 'Услуги'" :size="12" />
      </button>
    </nav>
    <div class="header-actions">
      <a class="header-phone" href="tel:+74951041010"
        ><Phone :size="16" /><span>8 495 104-10-10</span></a
      ><button
        class="account-button"
        aria-label="Личный кабинет"
        @click="account"
      >
        <UserRound :size="19" /><span>Войти</span></button
      ><button
        class="mobile-menu-button icon-button"
        :aria-expanded="mobileMenu"
        :aria-label="mobileMenu ? 'Закрыть меню' : 'Открыть меню'"
        @click="mobileMenu = !mobileMenu"
      >
        <X v-if="mobileMenu" /><Menu v-else />
      </button>
    </div>
    <Transition name="popover"
      ><nav v-if="mobileMenu" class="mobile-nav" aria-label="Мобильное меню">
        <button
          v-for="item in [
            'Цены',
            'Услуги',
            'Условия',
            'Акции',
            'Новости',
            'Контакты',
          ]"
          :key="item"
          @click="nav(item)"
        >
          {{ item }}<ArrowUpRight :size="17" /></button
        ><button @click="account">
          Личный кабинет<UserRound :size="17" />
        </button></nav
    ></Transition>
  </header>
  <main>
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-visual" aria-hidden="true"></div>
      <div class="hero-shade" aria-hidden="true"></div>
      <div class="hero-content">
        <div class="hero-copy">
          <h1 id="hero-title">
            Автомобиль<br />под ваши
            <span>планы<span class="headline-dot">.</span></span>
          </h1>
          <p class="hero-description">
            Ваш маршрут. Ваш ритм. Ваш автомобиль.<br />Выберите машину —
            остальное обсудим.
          </p>
          <div class="hero-benefits">
            <span><CalendarDays />Гибкие сроки<br />аренды</span
            ><span><ShieldCheck />Понятные<br />условия</span
            ><span><MapPin />В офисе<br />или с доставкой</span>
          </div>
        </div>
        <button
          class="delivery-offer"
          @click="modal = 'offer'"
          aria-label="Бесплатная доставка к открытию сайта — подробнее"
        >
          <span class="offer-icon"><Truck :size="25" /></span>
          <span class="offer-copy"
            ><strong>Доставим<br />бесплатно</strong
            ><span>В честь открытия сайта</span></span
          >
          <ArrowUpRight class="offer-arrow" :size="20" />
        </button>
        <section
          id="search"
          class="search-panel"
          aria-label="Подбор автомобиля"
        >
          <form @submit.prevent="search">
            <div class="search-primary">
              <SelectField
                v-model="category"
                label="Класс автомобиля"
                :options="categories"
                ><CarFront :size="22"
              /></SelectField>
              <DateRange v-model:start="start" v-model:end="end" />
              <SelectField
                v-model="location"
                label="Место получения"
                :options="[
                  'Офис на Авиационной',
                  'Доставка по Москве',
                  'Шереметьево (SVO)',
                  'Домодедово (DME)',
                  'Внуково (VKO)',
                ]"
                ><MapPin :size="22"
              /></SelectField>
              <button type="submit" class="button button-primary search-submit">
                Найти автомобиль<ArrowRight :size="21" />
              </button>
            </div>
            <div class="search-secondary">
              <div class="mileage-control">
                <SelectField
                  v-model="mileage"
                  label="Лимит пробега"
                  :options="[
                    '100 км / сутки',
                    '250 км / сутки',
                    '500 км / сутки',
                  ]"
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
                  @click="
                    openInfo(
                      'Защита+',
                      'Дополнительная опция защиты. В прототипе используется демонстрационная стоимость 490 ₽/сутки. Объём покрытия, исключения и условия ответственности нужно подтвердить перед оформлением. Это не обещание отсутствия ответственности за любые повреждения.',
                    )
                  "
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
                <button
                  class="text-button all-cars"
                  @click="
                    category = 'Все классы';
                    search();
                  "
                >
                  Весь автопарк<ArrowUpRight :size="17" />
                </button>
              </div>
              <div class="car-rail-wrapper">
                <button
                  class="rail-arrow rail-prev"
                  aria-label="Предыдущие автомобили"
                  @click="scrollRail(-1)"
                >
                  <ChevronLeft :size="20" />
                </button>
                <div ref="rail" class="car-rail">
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
                  class="rail-arrow rail-next"
                  aria-label="Следующие автомобили"
                  @click="scrollRail(1)"
                >
                  <ChevronRight :size="20" />
                </button>
              </div>
              <div class="panel-note">
                <span
                  >Автомобили и цены — примеры для знакомства с
                  интерфейсом</span
                ><span><ShieldCheck :size="12" /> Без онлайн-оплаты</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
    <section v-if="showKit" id="ui-kit" class="ui-kit section-container">
      <h2>Одна система. Все состояния.</h2>
      <p class="muted">
        Компоненты главного экрана. Golos Text · сетка 4 px · жёлтый акцент.
      </p>
      <div class="swatches">
        <div
          v-for="color in ['#FFC107', '#171717', '#FFFFFF', '#F5F5F5']"
          :key="color"
        >
          <span :style="{ background: color }"></span><code>{{ color }}</code>
        </div>
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
    <section
      id="catalog"
      class="catalog-content"
      aria-label="Результаты подбора"
    >
      <div class="section-top">
        <div>
          <p class="muted">
            {{ searchStatus }} · {{ mileage }} · {{ location }}
          </p>
        </div>
        <button class="text-button" @click="reset">
          <RotateCcw :size="15" />Сбросить фильтры
        </button>
      </div>
      <div v-if="context.length" class="context-tags">
        <span v-for="tag in context" :key="tag"
          ><Check :size="12" />{{ tag }}</span
        >
      </div>
      <div class="catalog-toolbar">
        <span
          >{{ filteredCars.length }}
          {{ filteredCars.length === 1 ? "автомобиль" : "автомобиля" }} ·
          демонстрационные тарифы</span
        ><label
          >Сортировать
          <select v-model="sort" aria-label="Сортировка автомобилей">
            <option>По цене</option>
            <option>По названию</option>
          </select></label
        >
      </div>
      <div v-if="!filteredCars.length" class="empty-state">
        <CarFront :size="36" />
        <h3>В этом классе пока нет примеров</h3>
        <p>Выберите другой класс или посмотрите все автомобили.</p>
        <button class="button button-primary" @click="category = 'Все классы'">
          Все классы<ArrowRight :size="18" />
        </button>
      </div>
      <article v-for="car in filteredCars" :key="car.id" class="result-row">
        <button class="result-car" @click="showCar(car)">
          <CarArt :index="car.image" :name="car.name" /><span
            ><small>{{ car.category }} · {{ car.year }}</small
            ><strong>{{ car.name }}</strong
            ><span>Автомат · {{ car.power }} л.с.</span></span
          >
        </button>
        <div class="result-mileage">
          <Gauge :size="18" /><span
            >{{ mileage
            }}<small>{{
              protection ? "С опцией «Защита+»" : "Без опции «Защита+»"
            }}</small></span
          >
        </div>
        <div class="result-price">
          <strong>{{ money(rate(car)) }} ₽<small> / сутки</small></strong
          ><span
            >{{ money(rate(car) * days) }} ₽ за {{ days }} {{ dayLabel }}</span
          >
        </div>
        <button class="button button-soft" @click="showCar(car)">
          Подробнее<ArrowUpRight :size="18" />
        </button>
      </article>
      <p class="data-disclaimer">
        <Info :size="16" /> Расчёт показывает механику интерфейса. Наличие,
        тарифы, залог и стоимость доставки подтверждаются отдельно. Заявка не
        означает бронирование.
      </p>
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
    @close="modal = null"
    ><div class="detail-meta">
      {{ selected.category }} · {{ selected.year }} · демонстрационный
      автомобиль
    </div>
    <div class="car-detail-grid">
      <div>
        <div class="detail-gallery">
          <CarArt
            :index="selected.image"
            :name="selected.name"
            :class="'gallery-view-' + gallery"
          /><span class="gallery-caption">{{
            ["Общий вид", "Детали кузова", "Передняя часть"][gallery]
          }}</span>
          <div class="gallery-controls">
            <button
              class="icon-button"
              aria-label="Предыдущее фото"
              @click="gallery = (gallery + 2) % 3"
            >
              <ChevronLeft :size="18" /></button
            ><span>{{ gallery + 1 }} / 3</span
            ><button
              class="icon-button"
              aria-label="Следующее фото"
              @click="gallery = (gallery + 1) % 3"
            >
              <ChevronRight :size="18" />
            </button>
          </div>
        </div>
        <div class="gallery-thumbnails">
          <button
            v-for="i in 3"
            :key="i"
            :aria-label="`Ракурс ${i}`"
            :aria-pressed="gallery === i - 1"
            :class="{ active: gallery === i - 1 }"
            @click="gallery = i - 1"
          >
            <CarArt
              :index="selected.image"
              :name="selected.name"
              :class="'gallery-view-' + (i - 1)"
            />
          </button>
        </div>
        <p class="tiny muted">
          Сгенерированное изображение. Детальные виды показаны увеличением;
          реальные фото будут добавлены.
        </p>
        <div class="spec-grid">
          <span
            ><Zap :size="18" />{{ selected.power }} л.с.<small
              >Мощность</small
            ></span
          ><span
            ><Fuel :size="18" />{{ selected.fuel }}<small>Топливо</small></span
          ><span><Gauge :size="18" />Автомат<small>Коробка передач</small></span
          ><span
            ><CarFront :size="18" />{{ selected.drive
            }}<small>Привод</small></span
          >
        </div>
      </div>
      <aside class="estimate">
        <span class="estimate-caption">Предварительный расчёт</span>
        <div class="detail-daily">
          {{ money(rate(selected)) }} ₽<small>/ сутки</small>
        </div>
        <p class="muted">{{ dateText }} · {{ days }} {{ dayLabel }}</p>
        <div v-if="context.length" class="context-tags">
          <span v-for="tag in context" :key="tag">{{ tag }}</span>
        </div>
        <dl>
          <div>
            <dt>Аренда · {{ days }} {{ dayLabel }}</dt>
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
          <div>
            <dt>Получение</dt>
            <dd>
              {{
                delivery || location !== "Офис на Авиационной"
                  ? "Доставка"
                  : "В офисе"
              }}
            </dd>
          </div>
        </dl>
        <div class="estimate-total">
          <span>Итого за аренду</span
          ><strong>{{ money(rate(selected) * days) }} ₽</strong>
        </div>
        <button class="button button-primary full-width" @click="request">
          Оставить заявку<ArrowRight :size="18" />
        </button>
        <p class="tiny muted">
          Пример расчёта. Залог, доставка и другие условия согласуются отдельно.
          Без списаний и онлайн-оплаты.
        </p>
      </aside>
    </div></BaseModal
  >
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
    title="Ваш автомобиль. С доставкой."
    @close="modal = null"
    ><div class="offer-modal-icon">
      <Truck :size="38" /><Sparkles :size="20" />
    </div>

    <h3 class="offer-title">Хорошие поездки<br />начинаются у вашей двери.</h3>
    <p class="modal-lead">
      Готовим бесплатную доставку автомобиля к запуску сайта.
    </p>
    <ol class="offer-steps">
      <li><span>1</span>Выберите автомобиль и свяжитесь с нами.</li>
      <li>
        <span>2</span>Передайте документы в согласованный чат и дождитесь
        одобрения.
      </li>
      <li>
        <span>3</span>Согласуйте время. Водитель привезёт автомобиль и печатный
        договор.
      </li>
    </ol>
    <p class="prototype-note">
      <Info :size="17" />Анонс акции. Даты, территория и ограничения ещё
      уточняются. Бесплатная доставка не применяется в расчёте автоматически.
    </p>
    <button
      class="button button-primary full-width"
      @click="
        modal = null;
        delivery = true;
        location = 'Доставка по Москве';
      "
    >
      Подобрать автомобиль<ArrowRight :size="19" /></button
  ></BaseModal>
  <BaseModal v-if="modal === 'info'" :title="infoTitle" @close="modal = null"
    ><p class="info-body">{{ infoBody }}</p>
    <button class="button button-soft" @click="modal = null">
      Понятно<Check :size="17" /></button
  ></BaseModal>
</template>
