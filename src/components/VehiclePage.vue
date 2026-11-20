<script setup lang="ts">
import { ArrowRight, ArrowUpRight, CalendarRange, CarFront, Check, ChevronLeft, Fuel, Gauge, MapPin, Settings2, UsersRound, Zap } from "lucide-vue-next";
import VehicleGallery from "./VehicleGallery.vue";
import FleetFaq from "./FleetFaq.vue";
import RentalTerms from "./RentalTerms.vue";
import { messengerLinks } from "../contact";
import { money, type Car } from "../data";

defineProps<{
  car: Car;
  backLabel?: string;
  days: number;
  dayLabel: string;
  dateText: string;
  pickupLabel: string;
  mileage: string;
  mileagePrices: Record<string, number>;
  mileageExtra: number;
  protection: boolean;
  renterContext: string[];
  extras: string[];
  delivery: boolean;
  rate: number;
}>();
const emit = defineEmits<{
  back: [];
  "update:mileage": [value: string];
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
        <aside class="estimate" aria-label="Расчёт аренды">
          <div class="estimate-total">
            <span>Предварительно за {{ days }} {{ dayLabel }}</span>
            <strong>{{ money(rate * days) }} ₽</strong>
          </div>
          <p class="detail-daily">{{ money(rate) }} ₽ <span>/ сутки</span></p>
          <div class="vehicle-mileage" role="group" aria-label="Выбор тарифа по пробегу">
            <p>Лимит пробега в сутки</p>
            <div class="vehicle-mileage-options">
              <button v-for="(price, option) in mileagePrices" :key="option" type="button" :aria-pressed="mileage === option" @click="emit('update:mileage', option)">
                <strong>{{ option }}</strong>
                <small>{{ price ? '+' + money(price) + ' ₽ / сутки' : 'Включено' }}</small>
              </button>
            </div>
          </div>
          <div class="estimate-trip">
            <p><CalendarRange :size="17" aria-hidden="true" />{{ dateText }}</p>
            <p><MapPin :size="17" aria-hidden="true" />{{ pickupLabel }}</p>
            <div class="estimate-mileage">
              <p><Gauge :size="17" aria-hidden="true" /><span>Пробег · <strong>{{ mileage }} включено</strong></span></p>
              <small>Сверх лимита — {{ car.overagePrice == null ? "стоимость уточняется" : money(car.overagePrice) + " ₽ / км" }}.</small>
            </div>
          </div>
          <dl class="vehicle-conditions" aria-label="Дополнительные условия расчёта">
            <div><dt>Залог</dt><dd>{{ car.deposit == null ? 'Уточняется' : money(car.deposit) + ' ₽' }}</dd></div>
            <div><dt>Пробег сверх лимита</dt><dd>{{ car.overagePrice == null ? 'Уточняется' : money(car.overagePrice) + ' ₽ / км' }}</dd></div>
            <div><dt>Мойка при необходимости</dt><dd>{{ car.washPrice == null ? 'Уточняется' : money(car.washPrice) + ' ₽' }}</dd></div>
          </dl>
          <p class="vehicle-conditions-note">Залог и дополнительные услуги рассчитываются отдельно.</p>
          <button class="vehicle-edit text-button" type="button" @click="emit('edit-search')">Изменить параметры <ArrowUpRight :size="15" aria-hidden="true" /></button>
          <div v-if="extras.length" class="vehicle-extras"><strong>Пожелания к аренде</strong><p>{{ extras.join(", ") }}</p><small>Наличие и стоимость уточняются.</small></div>
          <div v-if="renterContext.length" class="context-tags"><span v-for="tag in renterContext" :key="tag">{{ tag }}</span></div>
          <dl v-if="mileageExtra || protection">
            <div><dt>Аренда</dt><dd>{{ money(car.price * days) }} ₽</dd></div>
            <div v-if="mileageExtra"><dt>Пакет {{ mileage }}</dt><dd>{{ money(mileageExtra * days) }} ₽</dd></div>
            <div v-if="protection"><dt>Защита+</dt><dd>{{ car.protectionPrice == null ? "Уточняется" : money(car.protectionPrice * days) + " ₽" }}</dd></div>
          </dl>
          <button class="button button-primary full-width" type="button" @click="emit('request', false)">Подготовить заявку <ArrowRight :size="18" aria-hidden="true" /></button>
          <button class="mileage-discuss text-button" type="button" @click="emit('request', true)">Обсудить пробег <ArrowUpRight :size="15" aria-hidden="true" /></button>
          <p class="vehicle-estimate-note"><span v-if="protection && car.protectionPrice == null">Стоимость Защиты+ не включена и уточняется отдельно. </span>Подтвердите наличие и полную стоимость перед оформлением.</p>
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
.vehicle-back { display: inline-flex; align-items: center; gap: 5px; border: 0; padding: 0; background: transparent; color: #555; font-size: 14px; cursor: pointer; }
.vehicle-back:hover { color: #111; }
.vehicle-heading { display: flex; justify-content: space-between; align-items: end; gap: 24px; margin: 28px 0 24px; }
.vehicle-heading h1 { margin: 0; font-size: clamp(32px, 4vw, 48px); line-height: 1.1; letter-spacing: -.04em; }
.vehicle-subtitle { margin: 8px 0 0; color: #5b5b5b; font-size: 15px; }
.vehicle-heading-price { display: grid; gap: 4px; text-align: right; }
.vehicle-heading-price span { font-size: 13px; color: #777; }
.vehicle-heading-price strong { font-size: 22px; white-space: nowrap; }
.vehicle-heading-price small { font-size: 14px; font-weight: 400; color: #666; }
.vehicle-section h2 { margin: 0 0 16px; font-size: 22px; line-height: 1.2; letter-spacing: -.025em; }
.vehicle-edit { margin-top: 12px; }
.vehicle-about p { line-height: 1.65; }
.vehicle-auto-link { display: inline-flex; align-items: center; gap: 7px; margin-top: 13px; color: #6f5200; font-size: 13px; font-weight: 700; }
.vehicle-auto-link:hover { text-decoration: underline; }
.estimate .vehicle-conditions { margin-top: 14px; padding-top: 14px; border-top: 1px solid #dededb; }
.vehicle-conditions-note { margin: 9px 0 0; font-size: 11px; color: #686963; line-height: 1.45; }
.vehicle-extras { margin-top: 14px; padding: 12px; border-radius: 8px; background: #fff; font-size: 13px; line-height: 1.45; }
.vehicle-extras p { margin: 4px 0; color: #444; }
.vehicle-extras small { color: #666; }
.vehicle-estimate-note { margin: 12px 0 0; color: #666; font-size: 12px; line-height: 1.5; }
@media (min-width: 900px) { .vehicle-page .estimate { position: sticky; top: 24px; } }
@media (max-width: 760px) { .vehicle-page .car-detail-grid { grid-template-columns: minmax(0, 1fr); grid-template-areas: "photo" "estimate" "details"; gap: 18px; } }
@media (max-width: 650px) { .vehicle-page { padding: 26px 16px 56px; } .vehicle-heading { align-items: start; margin: 24px 0 18px; } .vehicle-heading-price { display: none; } }
</style>
