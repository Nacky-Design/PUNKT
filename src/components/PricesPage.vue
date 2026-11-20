<script setup lang="ts">
import { computed } from 'vue';
import { ArrowLeft, ArrowRight, Baby, ChevronDown, CircleHelp, Clock3, Droplets, Fuel, Gauge, MapPin, Wrench } from 'lucide-vue-next';
import CarArt from './CarArt.vue';
import DamageCompensation from './DamageCompensation.vue';
import { daytimeDeliveryHours, money, type Car } from '../data';

type PriceCar = Car & { protectionPrice?: number; deposit?: number };
const props = defineProps<{ cars: PriceCar[]; mileage: string; mileagePrices: Record<string, number>; days: number; dayLabel: string }>();
const emit = defineEmits<{ 'update:mileage': [value: string]; 'show-car': [car: Car]; 'open-terms': [] }>();
const activeTab = defineModel<'rental' | 'services' | 'damage'>('tab', { required: true });
const selectedExtra = computed(() => props.mileagePrices[props.mileage] ?? 0);
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
      <header class="interior-heading"><h1>Цены на аренду<span>.</span></h1><p>Сравните стоимость аренды, защиту и дополнительные услуги.</p></header>
      <div class="price-tabs" role="group" aria-label="Разделы цен">
        <button id="price-tab-rental" type="button" :aria-pressed="activeTab === 'rental'" aria-controls="price-content" @click="activeTab = 'rental'">Цены на аренду автомобилей</button>
        <button id="price-tab-services" type="button" :aria-pressed="activeTab === 'services'" aria-controls="price-content" @click="activeTab = 'services'">Цены на доп. услуги</button>
        <button id="price-tab-damage" type="button" :aria-pressed="activeTab === 'damage'" aria-controls="price-content" @click="activeTab = 'damage'">Компенсация ущерба</button>
      </div>
      <div id="price-content">
        <template v-if="activeTab === 'rental'">
          <div class="price-toolbar">
            <div><h2>Стоимость аренды</h2><p>Выберите включённый пробег на сутки</p></div>
            <div class="mileage-switch" role="group" aria-label="Лимит пробега в сутки">
              <button v-for="(extra, option) in mileagePrices" :key="option" type="button" :aria-pressed="mileage === option" @click="emit('update:mileage', option)"><Gauge :size="15" aria-hidden="true" /><span>{{ option }}</span><small v-if="extra">+{{ money(extra) }} ₽</small></button>
            </div>
          </div>
          <p class="demo-note"><CircleHelp :size="16" aria-hidden="true" /> Суммы приведены для предварительного расчёта. Наличие и итоговую стоимость уточняйте перед оформлением.</p>
          <div class="table-shell">
            <table class="price-table">
              <thead><tr><th scope="col">Автомобиль</th><th scope="col">Цена за сутки</th><th scope="col">Защита+</th><th scope="col">Залог</th><th scope="col"><span class="visually-hidden">Подробнее</span></th></tr></thead>
              <tbody>
                <tr v-for="car in cars" :key="car.id">
                  <td class="car-cell"><div class="car-wrap"><CarArt :index="car.image" :name="car.name" /><div><strong>{{ car.name }}</strong><small>{{ car.category }} · {{ car.year }} г.</small></div></div></td>
                  <td data-label="Цена за сутки"><strong class="price">{{ money(car.price + selectedExtra) }} ₽</strong><small>{{ money((car.price + selectedExtra) * days) }} ₽ за {{ days }} {{ dayLabel }}</small></td>
                  <td data-label="Защита+"><template v-if="car.protectionPrice !== undefined"><strong>{{ money(car.protectionPrice) }} ₽</strong><small>за сутки</small></template><span v-else class="muted">Уточняется</span></td>
                  <td data-label="Залог"><template v-if="car.deposit !== undefined"><strong>{{ money(car.deposit) }} ₽</strong><small><a href="#conditions">Когда можно без залога</a></small></template><span v-else class="muted">Уточняется</span></td>
                  <td class="action-cell"><button type="button" class="car-link" :data-car-action="`price-${car.id}`" :aria-label="`Подробнее: ${car.name}`" @click="emit('show-car', car)"><span>Подробнее</span><ArrowRight :size="18" aria-hidden="true" /></button></td>
                </tr>
              </tbody>
            </table>
          </div>
          <section class="price-questions" aria-labelledby="prices-faq-heading">
            <div><h2 id="prices-faq-heading">Вопросы о стоимости<span>.</span></h2></div>
            <div class="question-list">
              <details v-for="item in faq" :key="item.question"><summary><span>{{ item.question }}</span><span class="toggle"><ChevronDown :size="19" aria-hidden="true" /></span></summary><p>{{ item.answer }}</p></details>
            </div>
          </section>
        </template>
        <section v-else-if="activeTab === 'services'" class="service-prices" aria-labelledby="service-prices-title">
          <div class="service-intro"><div><h2 id="service-prices-title">Дополнительные услуги</h2></div><p class="service-demo"><CircleHelp :size="16" aria-hidden="true" /> Наличие и стоимость услуг уточняйте при оформлении.</p></div>
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
            <div class="delivery-header"><div class="service-card-heading"><span class="service-icon"><MapPin :size="22" aria-hidden="true" /></span><div><h3>Доставка автомобиля</h3><p>Тариф зависит от места и времени подачи.</p></div></div><p class="delivery-hint">Указанные интервалы относятся к доставке; режим работы офиса указан в шапке.</p></div>
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
.eyebrow,.section-label{margin:0 0 10px;color:#888883;font-size:10px;font-weight:750;letter-spacing:.14em}.prices-page h1{font-size:clamp(36px,4vw,52px);line-height:1.08;letter-spacing:-.045em}.prices-page h1 span,.price-questions h2 span{color:#e0ac00}.intro{margin:10px 0 0;color:#6e706b;font-size:15px}.price-tabs{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:27px;padding:6px;border:1px solid #e1e1dd;border-radius:11px;background:#fff}.price-tabs button{padding:13px 18px;border-radius:8px;color:#5e605c;font-weight:650;font-size:13px}.price-tabs button[aria-pressed=true]{background:#202222;color:#fff}.price-tabs button:hover:not([aria-pressed=true]){background:#f4f4f1;color:#171717}.price-toolbar{display:flex;justify-content:space-between;align-items:end;gap:18px;margin-top:38px}.price-toolbar h2,.price-questions h2{font-size:clamp(24px,2.5vw,32px);letter-spacing:-.035em;line-height:1.15}.price-toolbar p:last-child{margin-top:7px;color:#777;font-size:13px}.mileage-switch{display:flex;gap:6px;flex-wrap:wrap}.mileage-switch button{display:flex;align-items:center;gap:6px;min-height:42px;padding:9px 12px;border:1px solid #dddeda;border-radius:8px;background:#fff;color:#454742;font-size:12px;font-weight:650}.mileage-switch button[aria-pressed=true]{border-color:#deb12b;background:#fff2c7;color:#1c1c1c}.mileage-switch small{font-size:10px;font-weight:500;color:#777}.demo-note{display:flex;align-items:center;gap:8px;margin:19px 0 12px;color:#777;font-size:12px;line-height:1.45}.demo-note svg{flex:none}.table-shell{overflow:hidden;border:1px solid #e1e1dd;border-radius:13px;background:#fff}.price-table{border-collapse:collapse;width:100%;table-layout:fixed}.price-table th{padding:15px 17px;background:#f0f0ed;color:#777;text-align:left;font-size:11px;font-weight:700}.price-table th:first-child{width:35%}.price-table th:last-child{width:156px}.price-table td{padding:16px 17px;border-top:1px solid #ecece8;vertical-align:middle;font-size:14px}.price-table tbody tr:first-child td{border-top:0}.car-wrap{display:flex;align-items:center;gap:14px;min-width:0}.car-wrap :deep(.car-art){width:95px;height:63px;flex:none;aspect-ratio:auto;container-type:size;border-radius:7px;background:#f3f3f1}.car-wrap :deep(.car-art::before){width:min(100%,calc(100cqh * 1.65));transform:translate(-50%,-53%)}.car-wrap strong,.price-table td small{display:block}.car-wrap strong{font-size:15px}.price-table td small{margin-top:4px;color:#858782;font-size:11px;line-height:1.3}.price-table .price{font-size:18px;white-space:nowrap}.price-table s{color:#81837e;font-size:13px}.muted{color:#888;font-size:12px}.car-link{display:flex;margin-inline-start:auto;align-items:center;justify-content:center;gap:8px;padding:10px 12px;border-radius:8px;background:#f2f2ef;font-size:12px;font-weight:700;white-space:nowrap}.car-link:hover{background:#ffc107}.table-note{margin:12px 0 0;color:#81837e;font-size:11px;line-height:1.5}.price-questions{display:grid;grid-template-columns:minmax(220px,.8fr) minmax(0,1.5fr);gap:45px;margin-top:60px;padding-top:42px;border-top:1px solid #e2e2de}.faq-intro{margin-top:9px;color:#777;font-size:13px;line-height:1.5}.question-list{display:grid;gap:9px}.question-list details{border:1px solid #e3e3df;border-radius:11px;background:#fff}.question-list summary{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:16px 18px;cursor:pointer;list-style:none;font-size:14px;font-weight:700;line-height:1.4}.question-list summary::-webkit-details-marker{display:none}.toggle{display:grid;place-items:center;flex:none;width:32px;height:32px;border-radius:50%;background:#f1f1ef}.question-list details[open] .toggle{background:#ffc107}.question-list details[open] .toggle svg{transform:rotate(180deg)}.question-list details>p{padding:0 60px 18px 18px;color:#666;font-size:13px;line-height:1.55}.empty-prices{margin-top:32px;padding:42px;border:1px solid #e3e3df;border-radius:13px;background:#fff}.empty-icon{display:grid;place-items:center;width:46px;height:46px;margin-bottom:18px;border-radius:11px;background:#fff2c7}.empty-prices h2{font-size:25px;letter-spacing:-.03em}.empty-prices p{margin:9px 0 20px;color:#777;line-height:1.5}.empty-prices a{display:inline-flex;align-items:center;gap:8px;font-weight:700}.visually-hidden{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
@media(max-width:850px){.price-toolbar{align-items:start;flex-direction:column}.price-table th:first-child{width:30%}.price-table th:last-child{width:64px}.price-table th,.price-table td{padding:13px 10px}.car-wrap :deep(.car-art){width:65px;height:50px}.car-link span{display:none}.car-link{padding:10px}.price-questions{gap:25px}}
@media(max-width:650px){.price-tabs{display:grid;grid-template-columns:1fr;margin-top:22px}.price-tabs button{text-align:left;padding:11px 13px}.price-toolbar{margin-top:28px}.mileage-switch{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));width:100%}.mileage-switch button{display:grid;justify-items:center;gap:3px;padding:9px 4px;text-align:center}.mileage-switch button svg{display:none}.mileage-switch button span{font-size:11px}.price-table,.price-table tbody,.price-table tr,.price-table td{display:block;width:100%}.price-table thead{display:none}.price-table tr{display:grid;grid-template-columns:1fr 1fr;gap:0 16px;padding:14px 15px;border-top:1px solid #ecece8}.price-table tr:first-child{border-top:0}.price-table td{padding:10px 0;border:0!important}.price-table td::before{content:attr(data-label);display:block;margin-bottom:5px;color:#888;font-size:11px}.price-table .car-cell{grid-column:1/-1;padding-top:0;padding-bottom:12px;border-bottom:1px solid #eee!important}.price-table .car-cell::before,.price-table .action-cell::before{display:none}.car-wrap :deep(.car-art){width:80px;height:55px}.price-table .action-cell{align-self:end}.car-link span{display:inline}.price-questions{grid-template-columns:1fr;gap:20px;margin-top:42px;padding-top:32px}.empty-prices{padding:26px}.question-list summary{padding:14px}.question-list details>p{padding:0 50px 16px 14px}}

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
.demo-note { color: #595955; }
</style>
