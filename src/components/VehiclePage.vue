<script setup lang="ts">
import { ArrowRight, ArrowUpRight, CalendarRange, CarFront, Check, ChevronLeft, Fuel, MapPin, Settings2, ShieldCheck, UsersRound, Zap } from "lucide-vue-next";
import VehicleGallery from "./VehicleGallery.vue";
import FleetFaq from "./FleetFaq.vue";
import RentalTerms from "./RentalTerms.vue";
import { messengerLinks } from "../contact";
import { money, type Car } from "../data";

defineProps<{
  car: Car;
  backLabel?: string;
  dateText: string;
  pickupLabel: string;
  mileage: string;
  mileagePrices: Record<string, number>;
  protection: boolean;
  renterContext: string[];
  extras: string[];
  delivery: boolean;
  rate: number;
}>();
const emit = defineEmits<{
  back: [];
  "update:mileage": [value: string];
  "update:protection": [value: boolean];
  "explain-protection": [];
  request: [discussMileage: boolean];
  "edit-search": [];
}>();
</script>

<template>
  <main class="vehicle-page" aria-labelledby="vehicle-page-title">
    <div class="vehicle-page-inner">
      <button class="vehicle-back" type="button" @click="emit('back')">
        <ChevronLeft :size="17" aria-hidden="true" /> {{ backLabel || "Все автомобили" }}
      </button>
      <div class="vehicle-heading">
        <div>
          <h1 id="vehicle-page-title">{{ car.name }}</h1>
          <p class="vehicle-subtitle">{{ car.category }} · {{ car.year }} г. · {{ car.body }}</p>
        </div>
        <div class="vehicle-heading-price"><span>Стоимость аренды</span><strong>{{ money(rate) }} ₽ <small>/ сутки</small></strong></div>
      </div>
      <div class="car-detail-grid">
        <VehicleGallery :key="car.id" :car="car" />
        <aside class="estimate" aria-label="Параметры аренды">
          <div class="vehicle-mileage" role="group" aria-label="Выбор тарифа по пробегу">
            <p>Лимит пробега в сутки</p>
            <div class="vehicle-mileage-options">
              <button v-for="(price, option) in mileagePrices" :key="option" type="button" :aria-pressed="mileage === option"
                :aria-label="price ? `${option}, доплата ${money(price)} ₽ в сутки` : `${option}, включено в базовую цену`"
                @click="emit('update:mileage', option)">
                <strong>{{ option.replace(' км / сутки', '') }}</strong>
                <small>км в сутки</small>
                <span class="mileage-surcharge">{{ price ? '+' + money(price) + ' ₽' : 'Включено' }}</span>
              </button>
            </div>
          </div>
          <div class="estimate-trip">
            <p><CalendarRange :size="17" aria-hidden="true" />{{ dateText }}</p>
            <p><MapPin :size="17" aria-hidden="true" />{{ pickupLabel }}</p>
          </div>
          <dl class="vehicle-conditions" aria-label="Дополнительные условия расчёта">
            <div><dt>Залог</dt><dd>{{ car.deposit == null ? 'Уточняется' : money(car.deposit) + ' ₽' }}</dd></div>
            <div><dt>Пробег сверх лимита</dt><dd>{{ car.overagePrice == null ? 'Уточняется' : money(car.overagePrice) + ' ₽ / км' }}</dd></div>
            <div><dt>Мойка при необходимости</dt><dd>{{ car.washPrice == null ? 'Уточняется' : money(car.washPrice) + ' ₽' }}</dd></div>
          </dl>
          <button class="vehicle-edit text-button" type="button" @click="emit('edit-search')">Изменить параметры <ArrowUpRight :size="15" aria-hidden="true" /></button>
          <div v-if="extras.length" class="vehicle-extras"><strong>Пожелания к аренде</strong><p>{{ extras.join(", ") }}</p><small>Наличие и стоимость уточняются.</small></div>
          <div v-if="renterContext.length" class="context-tags"><span v-for="tag in renterContext" :key="tag">{{ tag }}</span></div>
          <div class="vehicle-protection">
            <label v-if="car.protectionPrice != null">
              <input type="checkbox" :checked="protection" @change="emit('update:protection', ($event.target as HTMLInputElement).checked)" />
              <span><strong>Добавить «Защиту+»</strong><small>+{{ money(car.protectionPrice) }} ₽ / сутки</small></span>
            </label>
            <p v-else><ShieldCheck :size="19" aria-hidden="true" /> «Защита+» · цена по запросу</p>
            <button class="text-button" type="button" aria-label="Что покрывает «Защита+»" @click="emit('explain-protection')">Что покрывает <ArrowUpRight :size="15" aria-hidden="true" /></button>
          </div>
          <button class="button button-primary full-width" type="button" @click="emit('request', false)">Подготовить заявку <ArrowRight :size="18" aria-hidden="true" /></button>
          <button class="mileage-discuss text-button" type="button" @click="emit('request', true)">Обсудить пробег <ArrowUpRight :size="15" aria-hidden="true" /></button>
        </aside>
        <div class="vehicle-sections">
          <section v-if="car.modelDescription || car.autoUrl" class="vehicle-section vehicle-about" aria-labelledby="vehicle-about-title">
            <h2 id="vehicle-about-title">Об автомобиле</h2>
            <p v-if="car.modelDescription">{{ car.modelDescription }}</p>
            <a v-if="car.autoUrl" class="vehicle-auto-link" :href="car.autoUrl" target="_blank" rel="noopener noreferrer">Подробнее о модели на Авто.ру <ArrowUpRight :size="16" aria-hidden="true" /></a>
          </section>
          <section class="vehicle-section" aria-labelledby="vehicle-specs-title">
            <h2 id="vehicle-specs-title">Характеристики</h2>
            <dl class="spec-grid">
              <div><dt><span class="spec-icon"><UsersRound :size="18" aria-hidden="true" /></span>Посадочные места</dt><dd>{{ car.seats }}</dd></div>
              <div><dt><span class="spec-icon"><Settings2 :size="18" aria-hidden="true" /></span>Коробка передач</dt><dd>Автомат</dd></div>
              <div><dt><span class="spec-icon"><Fuel :size="18" aria-hidden="true" /></span>Топливо</dt><dd>{{ car.fuel }}</dd></div>
              <div><dt><span class="spec-icon"><CarFront :size="18" aria-hidden="true" /></span>Привод</dt><dd>{{ car.drive }}</dd></div>
              <div><dt><span class="spec-icon"><Zap :size="18" aria-hidden="true" /></span>Мощность</dt><dd>{{ car.power }} л.с.</dd></div>
              <div><dt><span class="spec-icon"><CarFront :size="18" aria-hidden="true" /></span>Тип кузова</dt><dd>{{ car.body }}</dd></div>
            </dl>
            <dl v-if="car.extraSpecs?.length" class="vehicle-tech"><div v-for="spec in car.extraSpecs" :key="spec.label"><dt>{{ spec.label }}</dt><dd>{{ spec.value }}</dd></div></dl>
          </section>
          <section v-if="car.trim" class="vehicle-section" aria-labelledby="vehicle-trim-title">
            <h2 id="vehicle-trim-title">Комплектация {{ car.trim.name }}</h2>
            <ul class="vehicle-features"><li v-for="feature in car.trim.features" :key="feature"><Check :size="16" aria-hidden="true" />{{ feature }}</li></ul>
          </section>
          <section class="vehicle-section" aria-labelledby="vehicle-terms-title">
            <h2 id="vehicle-terms-title">Условия аренды</h2>
            <dl class="vehicle-terms">
              <div><dt>Пробег сверх лимита</dt><dd>{{ car.overagePrice == null ? 'Ставка уточняется.' : `Ориентир — ${money(car.overagePrice)} ₽ за км.` }} Правила расчёта согласуем до оформления.</dd></div>
              <div><dt>Залог</dt><dd>{{ car.deposit == null ? 'Размер уточняется.' : `Ориентир — ${money(car.deposit)} ₽.` }} Применимость и условия возврата уточним до подтверждения.</dd></div>
              <div v-if="delivery"><dt>Доставка</dt><dd>Стоимость подачи согласуем по выбранному месту получения.</dd></div>
              <div><dt>Мойка и топливо</dt><dd>Машину возвращают чистой и с тем же уровнем топлива. {{ car.washPrice == null ? 'Стоимость мойки при необходимости уточняется.' : `Ориентировочная стоимость мойки при необходимости — ${money(car.washPrice)} ₽.` }} Дозаправка оплачивается отдельно.</dd></div>
              <div><dt>Защита+</dt><dd>Дополнительная опция. Покрытие и исключения уточняются перед заключением договора.</dd></div>
            </dl>
          </section>
          <section class="vehicle-section" aria-labelledby="vehicle-pickup-title">
            <h2 id="vehicle-pickup-title">Как оформить аренду</h2>
            <p>По телефону уточним наличие автомобиля, итоговую цену и время выдачи. Для оформления понадобятся паспорт и водительское удостоверение.</p>
            <p v-if="delivery">Согласуем место встречи. При передаче автомобиля водитель привезёт печатный договор.</p>
            <p v-else>В офисе на Авиационной вы подпишете договор и получите автомобиль.</p>
          </section>
        </div>
      </div>
      <FleetFaq :messenger-links="messengerLinks" />
      <RentalTerms />
    </div>
  </main>
</template>

<style scoped>
.vehicle-page { min-height: 80vh; padding: 36px 24px 80px; background: #fff; color: #1d1d1d; }
.vehicle-page-inner { max-width: 1280px; margin: 0 auto; }
.vehicle-page .car-detail-grid { grid-template-columns: minmax(0, 1.7fr) minmax(330px, 1fr); grid-template-areas: "photo photo" "details estimate"; gap: 24px 28px; }
.vehicle-back { display: inline-flex; align-items: center; gap: 5px; border: 0; padding: 0; background: transparent; color: #555; font-size: var(--type-secondary); cursor: pointer; }
.vehicle-back:hover { color: #111; }
.vehicle-heading { display: flex; justify-content: space-between; align-items: end; gap: 24px; margin: 28px 0 24px; }
.vehicle-heading h1 { margin: 0; font-size: clamp(32px, 4vw, 48px); line-height: 1.1; letter-spacing: -.04em; }
.vehicle-subtitle { margin: 8px 0 0; color: #5b5b5b; font-size: var(--type-body); }
.vehicle-heading-price { display: grid; gap: 4px; text-align: right; }
.vehicle-heading-price span { font-size: var(--type-secondary); color: #595d56; }
.vehicle-heading-price strong { font-size: clamp(32px, 3.6vw, 45px); letter-spacing: -.04em; line-height: 1; white-space: nowrap; }
.vehicle-heading-price small { font-size: var(--type-body); font-weight: 500; letter-spacing: 0; color: #595d56; }
.vehicle-section h2 { margin: 0 0 16px; font-size: 22px; line-height: 1.2; letter-spacing: -.025em; }
.vehicle-edit { margin-top: 12px; }
.vehicle-about p { line-height: 1.65; }
.vehicle-auto-link { display: inline-flex; align-items: center; gap: 7px; margin-top: 13px; color: #6f5200; font-size: var(--type-control); font-weight: 700; }
.vehicle-auto-link:hover { text-decoration: underline; }
.vehicle-page .estimate-trip { border-bottom: 0; }
.estimate .vehicle-conditions { margin-top: 0; padding-top: 12px; border-top: 1px solid #dededb; }
.vehicle-mileage > p { margin-bottom: 8px; }
.vehicle-mileage-options button { gap: 4px; padding: 10px 4px; line-height: 1.15; }
.vehicle-mileage-options strong { font-size: clamp(20px, 3vw, 24px); font-variant-numeric: tabular-nums; letter-spacing: -.025em; }
.vehicle-mileage-options small, .mileage-surcharge { white-space: nowrap; }
.mileage-surcharge { color: #535353; font-size: var(--type-secondary); }
.vehicle-extras { margin-top: 14px; padding: 12px; border-radius: 8px; background: #fff; font-size: var(--type-body); line-height: 1.45; }
.vehicle-extras p { margin: 4px 0; color: #444; }
.vehicle-extras small { color: #666; font-size: var(--type-secondary); }
.vehicle-protection { display: grid; gap: 8px; margin: 16px 0; padding: 14px; border: 1px solid #e4d79e; border-radius: 9px; background: #fff9e6; }
.vehicle-protection label, .vehicle-protection > p { display: flex; align-items: flex-start; gap: 9px; font-size: var(--type-control); }
.vehicle-protection input { flex: none; width: 18px; height: 18px; margin: 1px 0 0; accent-color: #ffc107; }
.vehicle-protection small { display: block; margin-top: 4px; color: #545247; font-size: var(--type-secondary); }
.vehicle-protection .text-button { justify-self: start; text-align: left; }
.vehicle-page .estimate-trip p, .vehicle-page .vehicle-terms dd, .vehicle-page .vehicle-section > p { font-size: var(--type-body); }
.vehicle-page .estimate dl,
.vehicle-page .vehicle-mileage > p, .vehicle-page .vehicle-mileage-options small,
.vehicle-page .spec-grid dt, .vehicle-page .context-tags span { font-size: var(--type-secondary); }
.vehicle-page .vehicle-mileage-options button, .vehicle-page .text-button, .vehicle-page .estimate > .button { font-size: var(--type-control); }
.vehicle-page .estimate > .button { margin-top: 0; }
@media (min-width: 900px) { .vehicle-page .estimate { position: sticky; top: 24px; } }
@media (max-width: 760px) { .vehicle-page .car-detail-grid { grid-template-columns: minmax(0, 1fr); grid-template-areas: "photo" "estimate" "details"; gap: 18px; } }
@media (max-width: 650px) {
  .vehicle-page { padding: 26px 16px 56px; }
  .vehicle-heading { display: grid; gap: 15px; margin: 22px 0 16px; }
  .vehicle-heading-price { text-align: left; }
  .vehicle-heading-price strong { font-size: 31px; }
  .vehicle-page .estimate { padding: 15px; }
}
</style>
