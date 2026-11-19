<script setup lang="ts">
import { computed, ref } from "vue";
import { ArrowRight, CarFront, Check, CircleHelp, Gauge } from "lucide-vue-next";
import BaseModal from "./BaseModal.vue";
import DateRange from "./DateRange.vue";
import DeliveryAddress from "./DeliveryAddress.vue";
import FleetCard from "./FleetCard.vue";
import SelectField from "./SelectField.vue";
import { addDays, cars, categories, fleetCategories, todayISO, type Car } from "../data";

const props = defineProps<{
  pickupPresets: string[];
  addressMode: string;
  mileageOptions: string[];
  mileageDetails: Record<string, string>;
}>();
defineEmits<{ "select-car": [car: Car] }>();

const colors = [
  { name: "Акцент", token: "--yellow", hex: "#FFC107" },
  { name: "Текст", token: "--ink", hex: "#171717" },
  { name: "Фон", token: "--surface", hex: "#F5F5F3" },
  { name: "Карточка", token: "--paper", hex: "#FFFFFF" },
  { name: "Граница", token: "--line", hex: "#E6E6E2" },
];

const category = ref(categories[0]!);
const start = ref(addDays(todayISO(), 2));
const end = ref(addDays(todayISO(), 7));
const location = ref(props.pickupPresets[0]!);
const address = ref("");
const mileage = ref(props.mileageOptions[0]!);
const mileageValue = computed(() =>
  (mileage.value === props.mileageOptions[0] ? "Включено " : "Пакет ") + mileage.value,
);
const mileageHelp = ref(false);
const fleetCategory = ref(fleetCategories[0]!);
const fleetPreview = computed(() =>
  fleetCategory.value === fleetCategories[0]
    ? [cars[0]!, cars[4]!]
    : cars.filter((car) => car.category === fleetCategory.value).slice(0, 2),
);

</script>

<template>
  <section id="ui-kit" class="ui-kit" aria-labelledby="kit-title">
    <header class="kit-header">
      <h2 id="kit-title">UI-кит Пункт</h2>
      <nav class="kit-nav" aria-label="Разделы UI-кита">
        <a href="#kit-foundations">Цвет и шрифт</a>
        <a href="#kit-calculator">Калькулятор</a>
        <a href="#kit-fleet">Карточки авто</a>
        <a href="#kit-states">Кнопки и состояния</a>
      </nav>
    </header>

    <section id="kit-foundations" class="kit-section" aria-labelledby="kit-foundations-title">
      <h3 id="kit-foundations-title">Цвет и шрифт</h3>
      <dl class="kit-swatches">
        <div v-for="{ name, token, hex } in colors" :key="token" class="kit-swatch">
          <dt>{{ name }}</dt>
          <dd>
            <span class="kit-swatch-color" :style="{ backgroundColor: 'var(' + token + ')' }"></span>
            <code>{{ hex }}</code>
          </dd>
        </div>
      </dl>
      <dl class="kit-type">
        <div>
          <dt>HERO · Roboto Condensed</dt>
          <dd class="headline">Автомобиль под ваши <em>планы<span class="headline-dot">.</span></em></dd>
        </div>
        <div>
          <dt>Заголовок раздела · Onest</dt>
          <dd class="kit-type-section">Автопарк</dd>
        </div>
        <div>
          <dt>Основной текст · Onest</dt>
          <dd>Аренда автомобилей в Москве.</dd>
        </div>
        <div>
          <dt>Поле калькулятора · Onest</dt>
          <dd>
            <span class="kit-field-caption">Место получения</span>
            <strong class="kit-field-value">Офис на Авиационной</strong>
          </dd>
        </div>
      </dl>
    </section>

    <section id="kit-calculator" class="kit-section" aria-labelledby="kit-calculator-title">
      <h3 id="kit-calculator-title">Калькулятор</h3>
      <div class="kit-panel kit-controls">
        <div class="kit-control-grid">
          <SelectField v-model="category" label="Класс автомобиля" :options="categories">
            <CarFront :size="18" aria-hidden="true" />
          </SelectField>
          <DateRange v-model:start="start" v-model:end="end" />
        </div>
        <DeliveryAddress
          v-model="location"
          v-model:address="address"
          :presets="pickupPresets"
          :address-mode="addressMode"
        />
        <div class="mileage-control">
          <SelectField
            v-model="mileage"
            label="Лимит пробега"
            :options="mileageOptions"
            :option-details="mileageDetails"
            :display-value="mileageValue"
            action-label="Изменить"
          >
            <Gauge :size="18" aria-hidden="true" />
          </SelectField>
          <button
            type="button"
            class="help-button"
            aria-label="Что входит в лимит пробега"
            @click="mileageHelp = true"
          >
            <CircleHelp :size="18" aria-hidden="true" />
          </button>
        </div>
        <div class="kit-checks" role="group" aria-label="Дополнительные опции">
          <label class="check-label">
            <input type="checkbox" checked /><span class="check-visual"><Check :size="13" /></span>Защита+
          </label>
          <label class="check-label">
            <input type="checkbox" /><span class="check-visual"><Check :size="13" /></span>Доставка
          </label>
          <label class="check-label">
            <input type="checkbox" /><span class="check-visual"><Check :size="13" /></span>Для юридических лиц
          </label>
          <label class="check-label">
            <input type="checkbox" /><span class="check-visual"><Check :size="13" /></span>Иностранный гражданин
          </label>
        </div>
      </div>
    </section>

    <section id="kit-fleet" class="kit-section" aria-labelledby="kit-fleet-title">
      <h3 id="kit-fleet-title">Карточки авто</h3>
      <div class="category-tabs kit-filters" role="group" aria-label="Класс автомобиля в примерах">
        <button
          v-for="item in fleetCategories"
          :key="item"
          type="button"
          :class="{ active: fleetCategory === item }"
          :aria-pressed="fleetCategory === item"
          @click="fleetCategory = item"
        >{{ item }}</button>
      </div>
      <div class="kit-fleet">
        <FleetCard
          v-for="car in fleetPreview"
          :key="car.id"
          :car="car"
          detailed
          @select="$emit('select-car', $event)"
        />
      </div>
    </section>

    <section id="kit-states" class="kit-section" aria-labelledby="kit-states-title">
      <h3 id="kit-states-title">Кнопки и состояния</h3>
      <div class="kit-state-grid">
        <div class="kit-panel kit-actions">
          <a href="#search" class="button button-primary">Открыть подбор <ArrowRight :size="18" aria-hidden="true" /></a>
          <a href="#kit-fleet" class="button button-soft">К карточкам авто</a>
          <button type="button" class="button button-primary" disabled>Недоступно</button>
        </div>
        <div class="kit-panel kit-actions">
          <label class="text-field">Имя<input placeholder="Как к вам обращаться" /></label>
          <label class="text-field">
            Телефон
            <input value="+7 (999)" type="tel" class="input-error" aria-invalid="true" aria-describedby="kit-phone-error" />
            <small id="kit-phone-error" class="error-text">Введите телефон полностью</small>
          </label>
        </div>
      </div>
    </section>

    <BaseModal v-if="mileageHelp" title="Лимит пробега" @close="mileageHelp = false">
      <p class="info-body">В базовый тариф входит {{ mileageOptions[0] }}. Пакет пробега можно изменить в калькуляторе.</p>
    </BaseModal>
  </section>
</template>
