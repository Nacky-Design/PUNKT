<script setup lang="ts">
import { computed } from 'vue';
import { ArrowLeft, ArrowRight, Baby, ChevronDown, Clock3, Droplets, Fuel, MapPin, Phone, ShieldCheck, Wrench } from 'lucide-vue-next';
import CarArt from './CarArt.vue';
import DamageCompensation from './DamageCompensation.vue';
import { daytimeDeliveryHours, money, type Car } from '../data';

const props = defineProps<{ cars: Car[]; mileage: string; mileagePrices: Record<string, number> }>();
const emit = defineEmits<{
  'update:mileage': [value: string];
  'show-car': [car: Car, withProtection?: boolean];
  'explain-protection': [];
  'open-terms': [];
}>();
const activeTab = defineModel<'rental' | 'services' | 'damage'>('tab', { required: true });
const selectedExtra = computed(() => props.mileagePrices[props.mileage] ?? 0);
const sortedCars = computed(() => [...props.cars].sort((a, b) => a.price - b.price));
const faq = [
  { question: 'Предусмотрены ли скидки на длительную аренду?', answer: 'Стоимость зависит от автомобиля и срока аренды. Возможные скидки и итоговую цену уточним до оформления.' },
  { question: 'Можно ли взять автомобиль без залога?', answer: 'Аренда без залога возможна при соблюдении условий. Применимость, а также размер залога в остальных случаях уточняются до подтверждения.' },
  { question: 'Есть ли дополнительные платежи?', answer: 'Доставка, выбранные услуги и пробег сверх лимита могут оплачиваться отдельно. Состав и размер платежей согласуем до оформления.' },
  { question: 'Нужно ли мыть и заправлять автомобиль перед возвратом?', answer: 'Автомобиль возвращают чистым и с тем же уровнем топлива. При необходимости мойка и дозаправка оплачиваются отдельно; условия уточняются до оформления.' },
];
</script>

<template>
  <main class="prices-page interior-page">
    <div class="interior-container">
      <a href="#catalog" class="interior-back"><ArrowLeft :size="16" aria-hidden="true" /> На главную</a>
      <header class="interior-heading price-heading">
        <h1>Цены на аренду<span>.</span></h1>
        <a class="interior-action" href="tel:+74951041010"><Phone :size="17" aria-hidden="true" /> Позвонить</a>
      </header>
      <div class="price-tabs" role="group" aria-label="Разделы цен">
        <button id="price-tab-rental" type="button" :aria-pressed="activeTab === 'rental'" aria-controls="price-content" @click="activeTab = 'rental'">Аренда авто</button>
        <button id="price-tab-services" type="button" :aria-pressed="activeTab === 'services'" aria-controls="price-content" @click="activeTab = 'services'">Доп. услуги</button>
        <button id="price-tab-damage" type="button" :aria-pressed="activeTab === 'damage'" aria-controls="price-content" @click="activeTab = 'damage'">Компенсация ущерба</button>
      </div>
      <div id="price-content">
        <template v-if="activeTab === 'rental'">
          <div class="price-toolbar">
            <div>
              <h2 id="prices-mileage">Пробег в сутки</h2>
              <div class="mileage-switch" role="group" aria-labelledby="prices-mileage">
                <button v-for="(extra, option) in mileagePrices" :key="option" type="button" :aria-pressed="mileage === option" @click="emit('update:mileage', option)">
                  <span>{{ option.replace(' / сутки', '') }}</span><small v-if="extra">+{{ money(extra) }} ₽</small>
                </button>
              </div>
            </div>
            <button class="protection-guide-link" type="button" aria-label="Что покрывает «Защита+»" @click="emit('explain-protection')">
              <ShieldCheck :size="18" aria-hidden="true" />
              <span class="guide-label-full">Что покрывает «Защита+»</span>
              <span class="guide-label-short">О «Защите+»</span>
            </button>
          </div>
          <div class="table-shell">
            <table class="price-table">
              <thead><tr><th scope="col">Автомобиль</th><th scope="col">Цена за сутки</th><th scope="col">Защита+</th><th scope="col">Залог</th><th scope="col"><span class="visually-hidden">Подробнее</span></th></tr></thead>
              <tbody>
                <tr v-for="car in sortedCars" :key="car.id">
                  <td class="car-cell">
                    <div class="car-wrap">
                      <CarArt :index="car.image" :name="car.name" />
                      <div><strong>{{ car.name }}</strong><small>{{ car.category }} · {{ car.year }} г.</small></div>
                    </div>
                  </td>
                  <td class="daily-cell" data-label="Цена за сутки"><strong class="price">{{ money(car.price + selectedExtra) }} ₽</strong></td>
                  <td class="detail-cell" data-label="Защита+">
                    <div v-if="car.protectionPrice !== undefined" class="price-cell-content">
                      <span class="protection-rate"><strong>+{{ money(car.protectionPrice) }} ₽</strong><small>за сутки</small></span>
                      <button type="button" class="protection-add" :data-car-action="`protect-${car.id}`" :aria-label="`Добавить «Защиту+» для ${car.name}`" @click="emit('show-car', car, true)">Добавить</button>
                    </div>
                    <span v-else class="muted">Цена по запросу</span>
                  </td>
                  <td class="detail-cell" data-label="Залог">
                    <div v-if="car.deposit !== undefined" class="price-cell-content">
                      <strong>{{ money(car.deposit) }} ₽</strong>
                      <small><a href="#conditions">Когда можно без залога</a></small>
                    </div>
                    <span v-else class="muted">Уточняется</span>
                  </td>
                  <td class="action-cell"><button type="button" class="car-link" :data-car-action="`price-${car.id}`" :aria-label="`Подробнее: ${car.name}`" @click="emit('show-car', car)"><span>Подробнее</span><ArrowRight :size="18" aria-hidden="true" /></button></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="fleet-travel">
            <p>Выдаём чистые и обслуженные автомобили. Год выпуска и характеристики указаны в карточках.</p>
            <a href="#services/abroad">Поездки по России и в Беларусь <ArrowRight :size="16" aria-hidden="true" /></a>
          </div>
          <section class="price-questions" aria-labelledby="prices-faq-heading">
            <div><h2 id="prices-faq-heading">Вопросы о стоимости<span>.</span></h2></div>
            <div class="question-list">
              <details v-for="item in faq" :key="item.question"><summary><span>{{ item.question }}</span><span class="toggle"><ChevronDown :size="19" aria-hidden="true" /></span></summary><p>{{ item.answer }}</p></details>
            </div>
          </section>
        </template>
        <section v-else-if="activeTab === 'services'" class="service-prices" aria-labelledby="service-prices-title">
          <div class="service-intro"><h2 id="service-prices-title">Дополнительные услуги</h2></div>
          <div class="service-grid">
            <article class="service-card wash-card">
              <div class="service-card-heading"><span class="service-icon"><Droplets :size="22" aria-hidden="true" /></span><div><h3>Мойка при возврате</h3><p>Стоимость зависит от класса автомобиля</p></div></div>
              <dl class="service-list"><div><dt>Эконом</dt><dd>1 500 ₽</dd></div><div><dt>Стандарт</dt><dd>1 700 ₽</dd></div><div><dt>Бизнес</dt><dd>1 800 ₽</dd></div><div><dt>Кроссовер</dt><dd>2 000 ₽</dd></div></dl>
            </article>
            <div class="option-grid" aria-label="Дополнительные услуги">
              <article class="option-card"><span class="service-icon"><Fuel :size="21" aria-hidden="true" /></span><div><h3>Топливо при возврате</h3><p>90 ₽ <small>/ л</small></p></div></article>
              <article class="option-card"><span class="service-icon"><Baby :size="21" aria-hidden="true" /></span><div><h3>Детское кресло</h3><p>Бесплатно</p></div></article>
              <article class="option-card"><span class="service-icon"><Clock3 :size="21" aria-hidden="true" /></span><div><h3>Ожидание водителем клиента</h3><p>500 ₽ <small>/ час</small></p></div></article>
              <article class="option-card"><span class="service-icon"><Wrench :size="21" aria-hidden="true" /></span><div><h3>Помощь на дороге</h3><p class="option-note">Выезд платный, стоимость по согласованию</p></div></article>
            </div>
          </div>
          <article class="service-card delivery-card">
            <div class="delivery-header"><div class="service-card-heading"><span class="service-icon"><MapPin :size="22" aria-hidden="true" /></span><div><h3>Доставка автомобиля</h3><p>Тариф зависит от места и времени подачи.</p></div></div></div>
            <div class="delivery-table-wrap"><table class="delivery-table"><thead><tr><th scope="col">Место доставки</th><th scope="col"><span>Днём</span>{{ daytimeDeliveryHours }}</th><th scope="col"><span>Ночью</span>21:00–09:00</th></tr></thead><tbody><tr><th scope="row">Москва</th><td :data-time="daytimeDeliveryHours">Бесплатно</td><td data-time="21:00–09:00">3 000 ₽</td></tr><tr><th scope="row">Московская область</th><td :data-time="daytimeDeliveryHours">По согласованию</td><td data-time="21:00–09:00">По согласованию</td></tr><tr><th scope="row">Аэропорты</th><td :data-time="daytimeDeliveryHours">3 000 ₽</td><td data-time="21:00–09:00">4 000 ₽</td></tr></tbody></table></div>
            <p class="delivery-note">Доставка по области согласуется с учётом расстояния и доступности.</p>
          </article>
        </section>
        <DamageCompensation v-else @open-terms="emit('open-terms')" />
      </div>
    </div>
  </main>
</template>

<style scoped>
.eyebrow,.section-label{margin:0 0 10px;color:#888883;font-size:10px;font-weight:750;letter-spacing:.14em}.prices-page h1 span,.price-questions h2 span{color:#e0ac00}.intro{margin:10px 0 0;color:#6e706b;font-size:15px}.price-tabs{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:27px;padding:6px;border:1px solid #e1e1dd;border-radius:11px;background:#fff}.price-tabs button{padding:13px 18px;border-radius:8px;color:#5e605c;font-weight:650;font-size:13px}.price-tabs button[aria-pressed=true]{background:#202222;color:#fff}.price-tabs button:hover:not([aria-pressed=true]){background:#f4f4f1;color:#171717}.price-toolbar{display:flex;justify-content:space-between;align-items:end;gap:18px;margin-top:38px}.price-toolbar h2,.price-questions h2{font-size:clamp(24px,2.5vw,32px);letter-spacing:-.035em;line-height:1.15}.price-toolbar p:last-child{margin-top:7px;color:#777;font-size:13px}.mileage-switch{display:flex;gap:6px;flex-wrap:wrap}.mileage-switch button{display:flex;align-items:center;gap:6px;min-height:42px;padding:9px 12px;border:1px solid #dddeda;border-radius:8px;background:#fff;color:#454742;font-size:12px;font-weight:650}.mileage-switch button[aria-pressed=true]{border-color:#deb12b;background:#fff2c7;color:#1c1c1c}.mileage-switch small{font-size:10px;font-weight:500;color:#777}.demo-note{display:flex;align-items:center;gap:8px;margin:19px 0 12px;color:#777;font-size:12px;line-height:1.45}.demo-note svg{flex:none}.table-shell{overflow:hidden;border:1px solid #e1e1dd;border-radius:13px;background:#fff}.price-table{border-collapse:collapse;width:100%;table-layout:fixed}.price-table th{padding:15px 17px;background:#f0f0ed;color:#777;text-align:left;font-size:11px;font-weight:700}.price-table th:first-child{width:35%}.price-table th:last-child{width:156px}.price-table td{padding:16px 17px;border-top:1px solid #ecece8;vertical-align:middle;font-size:14px}.price-table tbody tr:first-child td{border-top:0}.car-wrap{display:flex;align-items:center;gap:14px;min-width:0}.car-wrap :deep(.car-art){width:95px;height:63px;flex:none;aspect-ratio:auto;container-type:size;border-radius:7px;background:#f3f3f1}.car-wrap :deep(.car-art::before){width:min(100%,calc(100cqh * 1.65));transform:translate(-50%,-53%)}.car-wrap strong,.price-table td small{display:block}.car-wrap strong{font-size:15px}.price-table td small{margin-top:4px;color:#858782;font-size:11px;line-height:1.3}.price-table .price{font-size:18px;white-space:nowrap}.price-table s{color:#81837e;font-size:13px}.muted{color:#888;font-size:12px}.car-link{display:flex;margin-inline-start:auto;align-items:center;justify-content:center;gap:8px;padding:10px 12px;border-radius:8px;background:#f2f2ef;font-size:12px;font-weight:700;white-space:nowrap}.car-link:hover{background:#ffc107}.table-note{margin:12px 0 0;color:#81837e;font-size:11px;line-height:1.5}.price-questions{display:grid;grid-template-columns:minmax(220px,.8fr) minmax(0,1.5fr);gap:45px;margin-top:60px;padding-top:42px;border-top:1px solid #e2e2de}.faq-intro{margin-top:9px;color:#777;font-size:13px;line-height:1.5}.question-list{display:grid;gap:9px}.question-list details{border:1px solid #e3e3df;border-radius:11px;background:#fff}.question-list summary{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:16px 18px;cursor:pointer;list-style:none;font-size:14px;font-weight:700;line-height:1.4}.question-list summary::-webkit-details-marker{display:none}.toggle{display:grid;place-items:center;flex:none;width:32px;height:32px;border-radius:50%;background:#f1f1ef}.question-list details[open] .toggle{background:#ffc107}.question-list details[open] .toggle svg{transform:rotate(180deg)}.question-list details>p{padding:0 60px 18px 18px;color:#666;font-size:13px;line-height:1.55}.empty-prices{margin-top:32px;padding:42px;border:1px solid #e3e3df;border-radius:13px;background:#fff}.empty-icon{display:grid;place-items:center;width:46px;height:46px;margin-bottom:18px;border-radius:11px;background:#fff2c7}.empty-prices h2{font-size:25px;letter-spacing:-.03em}.empty-prices p{margin:9px 0 20px;color:#777;line-height:1.5}.empty-prices a{display:inline-flex;align-items:center;gap:8px;font-weight:700}.visually-hidden{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
@media(max-width:850px){.price-toolbar{align-items:start;flex-direction:column}.price-table th:first-child{width:30%}.price-table th:last-child{width:64px}.price-table th,.price-table td{padding:13px 10px}.car-wrap :deep(.car-art){width:65px;height:50px}.car-link span{display:none}.car-link{padding:10px}.price-questions{gap:25px}}

.service-prices{margin-top:38px}.service-intro h2{font-size:clamp(24px,2.5vw,32px);letter-spacing:-.035em}.service-intro>p:last-child{margin:8px 0 20px;color:#777;font-size:13px;line-height:1.5}.service-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.service-card{min-width:0;padding:24px;border:1px solid #e1e1dd;border-radius:13px;background:#fff}.service-card h3{font-size:18px;letter-spacing:-.025em}.service-card>p{margin:8px 0 0;color:#777;font-size:12px;line-height:1.5}.service-list{margin:20px 0 0}.service-list>div{display:flex;justify-content:space-between;align-items:baseline;gap:18px;padding:12px 0;border-top:1px solid #ecece8;font-size:13px}.service-list dt{color:#5b5d59}.service-list dd{margin:0;text-align:right;font-weight:700;line-height:1.4}.delivery-card{margin-top:16px}.delivery-table-wrap{margin-top:20px}.delivery-table{width:100%;border-collapse:collapse;table-layout:fixed}.delivery-table th,.delivery-table td{padding:13px 12px;border-top:1px solid #ecece8;text-align:left;font-size:13px}.delivery-table thead th{color:#777;font-size:11px;font-weight:700}.delivery-table tbody th{font-weight:600}.delivery-table td{font-weight:700}.delivery-card .delivery-note{margin-top:10px;font-size:11px}
@media(max-width:650px){.service-prices{margin-top:28px}.service-grid{grid-template-columns:1fr;gap:12px}.service-card{padding:18px}.delivery-card{margin-top:12px}.delivery-table th,.delivery-table td{padding:11px 5px;font-size:11px}.delivery-table thead th{font-size:10px}.service-list>div{gap:12px}}

.service-intro{display:flex;justify-content:space-between;align-items:end;gap:24px;margin-bottom:24px}
.service-intro h2 span{color:#e0ac00}.service-intro>div>p:last-child{margin:9px 0 0;color:#777;font-size:14px;line-height:1.5}
.service-demo{display:flex;align-items:center;gap:8px;max-width:300px;margin:0!important;color:#858782;font-size:12px;line-height:1.5}.service-demo svg{flex:none}
.service-grid{grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr);gap:16px}
.service-card,.option-card{border:1px solid #e7e7e2;border-radius:16px;background:#fff;box-shadow:0 6px 20px #20202008}
.service-card{padding:26px}.service-card-heading{display:flex;align-items:flex-start;gap:15px}.service-icon{display:grid;place-items:center;flex:none;width:46px;height:46px;border-radius:12px;background:#fff1bf;color:#28251b}
.service-card-heading h3,.option-card h3{margin:0;font-size:17px;line-height:1.3;letter-spacing:-.025em}.service-card-heading>div>p:last-child{margin:6px 0 0;color:#858782;font-size:12px;line-height:1.45}.card-label{margin:0 0 5px;color:#9c8a53;font-size:9px;font-weight:800;letter-spacing:.12em}
.service-list{margin-top:22px}.service-list>div{align-items:center;padding:13px 0;font-size:14px}.service-list dd{font-size:15px;white-space:nowrap}.service-list>div:last-child{padding-bottom:0}
.option-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.option-card{display:flex;align-items:flex-start;gap:14px;min-width:0;padding:22px}.option-card h3{font-size:15px}.option-card p{margin:15px 0 0;font-size:21px;font-weight:750;letter-spacing:-.03em;line-height:1.2}.option-card p small{color:#858782;font-size:12px;font-weight:500;letter-spacing:0}.option-card p.option-note{max-width:190px;margin-top:10px;color:#666a64;font-size:12px;font-weight:500;letter-spacing:0;line-height:1.5}
.delivery-card{margin-top:16px}.delivery-header{display:flex;justify-content:space-between;align-items:center;gap:25px}.delivery-hint{max-width:310px;margin:0;color:#858782;font-size:11px;line-height:1.5}.delivery-table-wrap{overflow:hidden;margin-top:24px;border:1px solid #eeefea;border-radius:10px}.delivery-table th,.delivery-table td{padding:14px 18px;border-top:1px solid #eeefea;font-size:13px}.delivery-table thead th{border-top:0;background:#f7f7f4;color:#72746e;font-size:12px}.delivery-table thead th span{display:block;margin-bottom:4px;color:#2b2c29;font-size:13px}.delivery-table th:first-child{width:40%}.delivery-table tbody th{color:#555852}.delivery-table td{font-size:14px}.delivery-card .delivery-note{margin-top:14px;color:#858782;font-size:11px}
@media(max-width:850px){.service-grid{grid-template-columns:1fr}.option-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.delivery-hint{max-width:240px}}
@media(max-width:650px){.service-intro{align-items:start;flex-direction:column;gap:12px;margin-bottom:18px}.service-intro h2{font-size:27px}.service-demo{max-width:none}.service-card{padding:20px}.option-grid{gap:10px}.option-card{flex-direction:column;gap:12px;padding:17px}.option-card h3{font-size:14px}.option-card p{margin-top:10px;font-size:19px}.delivery-header{align-items:start;flex-direction:column;gap:12px}.delivery-hint{max-width:none}.delivery-table-wrap{margin-top:18px}.delivery-table thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)}.delivery-table,.delivery-table tbody,.delivery-table tr,.delivery-table th,.delivery-table td{display:block;width:100%}.delivery-table tr{display:grid;grid-template-columns:1fr 1fr;gap:0 12px;padding:14px 15px;border-top:1px solid #eeefea}.delivery-table tr:first-child{border-top:0}.delivery-table th:first-child{grid-column:1/-1;width:100%;padding:0 0 10px;border:0;color:#252723}.delivery-table td{padding:0;border:0;font-size:13px}.delivery-table td::before{content:attr(data-time);display:block;margin-bottom:5px;color:#92948e;font-size:11px;font-weight:500}}
@media(max-width:380px){.option-grid{grid-template-columns:1fr}.option-card{flex-direction:row;align-items:center}.option-card p{margin-top:6px}}
.price-table td small a { color: #595955; text-decoration: underline; text-underline-offset: 2px; }
.price-heading { display: flex; flex-wrap: wrap; align-items: end; justify-content: space-between; gap: 14px 20px; }
.price-heading .interior-action { flex: none; }
.price-toolbar h2 { margin-bottom: 10px; font-size: clamp(20px, 2vw, 24px); }
.price-table .price { font-size: clamp(23px, 2.5vw, 30px); letter-spacing: -.035em; }
.car-wrap :deep(.car-art--photo) { display: flex; align-items: center; justify-content: center; overflow: hidden; }
.car-wrap :deep(.car-art--photo img) { width: auto; height: auto; max-width: 100%; max-height: 100%; border-radius: inherit; }
.protection-guide-link, .protection-add { display: inline-flex; align-items: center; gap: 7px; min-height: 40px; padding: 0; color: #625019; font-size: var(--type-secondary); font-weight: 650; text-align: left; text-decoration: underline; text-underline-offset: 3px; }
.protection-guide-link svg { flex: none; }
.guide-label-short { display: none; }
.protection-add { min-height: 36px; }
.table-shell { margin-top: 16px; }
.fleet-travel { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px 24px; margin-top: 18px; }
.fleet-travel p { max-width: 58ch; color: #5d5f5a; line-height: 1.5; }
.fleet-travel a { display: inline-flex; align-items: center; gap: 7px; font-size: var(--type-control); font-weight: 650; text-decoration: underline; text-underline-offset: 3px; }
.price-toolbar p:last-child, .price-table th, .price-table td small, .price-table td::before, .muted,
.mileage-switch small, .service-card-heading > div > p:last-child, .option-card p small,
.delivery-table th, .delivery-table thead th, .delivery-table thead th span, .delivery-table td::before {
  color: #5d5f5a;
  font-size: var(--type-secondary);
}
.price-tabs button, .mileage-switch button, .car-link { font-size: var(--type-control); }
.price-table td, .car-wrap strong, .question-list summary, .question-list details > p,
.service-list > div, .service-list dd, .option-card h3, .option-card p.option-note,
.delivery-table td, .delivery-card .delivery-note { font-size: var(--type-body); }
@media (min-width: 701px) {
  .prices-page h1 { font-size: clamp(36px, 4vw, 52px); line-height: 1.08; letter-spacing: -.045em; }
}
@media (min-width: 851px) {
  .price-table th:last-child { width: 180px; }
}
@media (min-width: 701px) and (max-width: 850px) {
  .price-table th:first-child { width: 31%; }
  .car-wrap { flex-wrap: wrap; gap: 5px; }
}
@media (max-width: 700px) {
  .price-heading { margin-bottom: 18px; }
  .price-heading .interior-action { display: none; }
  .price-tabs { display: grid; grid-template-columns: 1fr 1fr 1.4fr; gap: 4px; margin-top: 0; }
  .price-tabs button { min-width: 0; min-height: 44px; padding: 6px 4px; font-size: var(--type-secondary); line-height: 1.2; text-align: center; }
  .price-toolbar {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 2px 8px;
    margin-top: 12px;
  }
  .price-toolbar > div { display: contents; }
  .price-toolbar h2 { grid-area: 1 / 1; margin: 0; font-size: 18px; }
  .mileage-switch { display: grid; grid-area: 2 / 1 / 3 / -1; grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .mileage-switch button { display: grid; align-content: center; justify-items: center; gap: 3px; min-height: 52px; padding: 7px 4px; text-align: center; }
  .mileage-switch button span { font-size: var(--type-body); }
  .protection-guide-link { grid-area: 1 / 2; min-height: 44px; white-space: nowrap; }
  .guide-label-full { display: none; }
  .guide-label-short { display: inline; }

  .table-shell { overflow: visible; margin-top: 14px; border: 0; background: transparent; }
  .price-table, .price-table tbody { display: block; }
  .price-table thead { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  .price-table tbody { display: grid; gap: 14px; }
  .price-table tr { display: block; padding: 15px; border: 1px solid #e1e1dd; border-radius: 13px; background: #fff; }
  .price-table td, .price-table tbody tr:first-child td { border: 0; }
  .price-table .car-cell, .price-table .action-cell { display: block; padding: 0; }
  .car-wrap { gap: 11px; }
  .car-wrap :deep(.car-art) { width: 70px; height: 48px; }
  .car-wrap strong { font-size: 17px; line-height: 1.25; overflow-wrap: anywhere; }
  .price-table .daily-cell, .price-table .detail-cell {
    display: grid;
    grid-template-columns: max-content minmax(0, 1fr);
    align-items: baseline;
    gap: 12px;
  }
  .price-table .daily-cell {
    margin: 12px 0 2px;
    padding: 9px 11px;
    border-radius: 8px;
    background: #f4f4f1;
  }
  .price-table td[data-label]::before {
    content: attr(data-label);
    color: #51534f;
    font-size: var(--type-secondary);
  }
  .price-table .price { justify-self: end; font-size: 27px; line-height: 1.15; }
  .price-table .detail-cell { padding: 11px 0; }
  .price-table tr > .detail-cell + .detail-cell { border-top: 1px solid #eeefec; }
  .detail-cell > * { text-align: right; }
  .detail-cell strong { font-size: 16px; }
  .price-cell-content { min-width: 0; }
  .protection-rate { display: inline-flex; flex-wrap: wrap; align-items: baseline; justify-content: end; gap: 2px 5px; }
  .price-table .protection-rate small { display: inline; margin: 0; }
  .price-cell-content .protection-add { display: flex; min-height: 36px; margin-inline-start: auto; }
  .price-cell-content small a { display: inline-flex; align-items: center; min-height: 36px; line-height: 1.3; }
  .car-link { justify-content: space-between; width: 100%; min-height: 44px; margin-top: 2px; padding: 10px 13px; white-space: normal; }
  .car-link span { display: inline; }
  .price-questions { grid-template-columns: 1fr; gap: 20px; margin-top: 42px; padding-top: 32px; }
  .question-list summary { padding: 14px; }
  .question-list details > p { padding-right: 18px; }
}
@media (max-width: 650px) {
  .delivery-table tr { padding-inline: 10px; }
  .delivery-table td { overflow-wrap: anywhere; }
}
</style>
