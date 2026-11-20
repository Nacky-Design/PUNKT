<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ArrowRight, Gauge, Settings2, UsersRound } from 'lucide-vue-next';
import CarArt from './CarArt.vue';
import HeroVideo from './HeroVideo.vue';
import CatalogDateRange from './CatalogDateRange.vue';
import CatalogFilters, { type CatalogFilterState } from './CatalogFilters.vue';
import FleetFaq from './FleetFaq.vue';
import CatalogMileage from './CatalogMileage.vue';
import CatalogHighlights from './CatalogHighlights.vue';
import SelectField from './SelectField.vue';
import CompanyIntro from './CompanyIntro.vue';
import RentalTerms from './RentalTerms.vue';
import PickupAddressDialog from './PickupAddressDialog.vue';
import { messengerLinks } from '../contact';
import { money, type Car } from '../data';
import { deliveryAddressLine, hasDeliveryAddress, type DeliveryPoint, type DeliverySelection } from '../delivery';

const props = defineProps<{
  cars: Car[];
  allCars: Car[];
  filters: CatalogFilterState;
  categories: string[];
  category: string;
  sort: string;
  start: string;
  end: string;
  location: string;
  locationOptions: string[];
  addressMode: string;
  address: string;
  deliveryPoint?: DeliveryPoint;
  mileage: string;
  mileagePrices: Record<string, number>;
  mileageLabel: string;
  protection: boolean;
  rate: (car: Car) => number;
}>();
const emit = defineEmits<{
  (event: 'update:category' | 'update:sort' | 'update:start' | 'update:end' | 'update:location' | 'update:mileage', value: string): void;
  (event: 'apply-search' | 'edit-search'): void;
  (event: 'update:filters', value: CatalogFilterState): void;
  (event: 'show-car', car: Car): void;
  (event: 'confirm-address', selection: DeliverySelection): void;
}>();
const lowestRate = computed(() => Math.min(...props.allCars.map(car => car.price)));
const draftCategory = ref(props.category);
const draftStart = ref(props.start);
const draftEnd = ref(props.end);
const draftLocation = ref(props.location);
const addressEditor = ref<'manual' | 'map'>();
const savedPickup = computed(() => hasDeliveryAddress(props.address) ? `Москва, ${deliveryAddressLine(props.address)}` : '');
const pickupValue = computed(() => draftLocation.value === props.addressMode && savedPickup.value ? savedPickup.value : draftLocation.value);
const pickupOptions = computed(() => [
  ...props.locationOptions,
  ...(savedPickup.value ? [savedPickup.value] : []),
  'Ввести адрес', 'Выбрать на карте',
]);

function choosePickup(value: string) {
  if (value === 'Ввести адрес' || value === 'Выбрать на карте') {
    addressEditor.value = value === 'Ввести адрес' ? 'manual' : 'map';
    return;
  }
  draftLocation.value = value === savedPickup.value ? props.addressMode : value;
}
function confirmAddress(selection: DeliverySelection) {
  draftLocation.value = props.addressMode;
  emit('confirm-address', selection);
  addressEditor.value = undefined;
}
const sortOptions = ['Сначала дешевле', 'Сначала дороже', 'По названию'];
watch(() => [props.start, props.end], ([start, end]) => {
  draftStart.value = start!; draftEnd.value = end!;
});
watch(() => props.location, value => { draftLocation.value = value; });
watch(() => props.category, category => { draftCategory.value = category; });
function applySearch() {
  emit('update:category', draftCategory.value);
  emit('update:start', draftStart.value);
  emit('update:end', draftEnd.value);
  emit('update:location', draftLocation.value);
  emit('apply-search');
}
function clearFilters() {
  draftCategory.value = 'Все классы';
  emit('update:category', draftCategory.value);
  emit('update:filters', { brand: '', fuel: '', drive: '', transmission: '', seats: null, extras: [] });
}
const mileageField = ref<InstanceType<typeof CatalogMileage>>();
</script>

<template>
  <main class="fleet-page" id="catalog">
    <div class="fleet-container">
      <section class="fleet-banner" aria-labelledby="fleet-banner-title">
        <HeroVideo banner />
        <div class="banner-shade" aria-hidden="true"></div>
        <div class="banner-copy">
          <h1 id="fleet-banner-title">Автомобиль<br />под ваши планы<span>.</span></h1>
          <p>Прокат автомобилей в Москве.</p>
          <a v-if="Number.isFinite(lowestRate)" href="#prices" class="banner-price">
            <span>От <strong>{{ money(lowestRate) }} ₽</strong> / сутки</span><ArrowRight :size="17" aria-hidden="true" />
          </a>
        </div>
      </section>

      <form class="search-bar" aria-label="Параметры аренды" @submit.prevent="applySearch">
        <SelectField v-model="draftCategory" class="class-field" label="Класс автомобиля" :options="categories" appearance="catalog" />
        <CatalogDateRange v-model:start="draftStart" v-model:end="draftEnd" />
        <SelectField :model-value="pickupValue" class="location-field" label="Место получения" :options="pickupOptions" appearance="catalog"
          @update:model-value="choosePickup" />
        <CatalogMileage ref="mileageField" :model-value="mileage" :prices="mileagePrices"
          @update:model-value="emit('update:mileage', $event)" />
        <CatalogFilters :filters="filters" :all-cars="allCars" @apply="emit('update:filters', $event)" />
        <button class="search-submit" type="submit">Применить <ArrowRight :size="18" /></button>
      </form>
      <PickupAddressDialog v-if="addressEditor" :initial="addressEditor" :address="address"
        :point="deliveryPoint" :address-mode="addressMode" @close="addressEditor = undefined" @confirm="confirmAddress" />

      <div class="fleet-heading">
        <h2>Наш автопарк</h2>
        <div class="sort-label">
          <span aria-hidden="true">Сортировка</span>
          <SelectField :model-value="sort" :display-value="sort" label="Сортировка" :options="sortOptions"
            appearance="inline" @update:model-value="emit('update:sort', $event)" />
        </div>
      </div>
      <p v-if="filters.extras.length" class="extras-summary"><strong>Пожелания:</strong> {{ filters.extras.join(', ') }}</p>
      <div v-if="cars.length" class="fleet-grid">
        <article v-for="car in cars" :key="car.id" class="fleet-card">
          <button type="button" class="car-image" :data-car-action="`image-${car.id}`" :aria-label="`Подробнее: ${car.name}`" @click="emit('show-car', car)">
            <CarArt :index="car.image" :name="car.name" />
            <span>{{ car.category }}</span>
          </button>
          <div class="car-content">
            <div class="car-title"><h3>{{ car.name }}</h3><span>{{ car.year }}</span></div>
            <div class="car-specs"><span><Settings2 :size="15" /> Автомат</span><span><UsersRound :size="15" /> {{ car.seats }} мест</span><span><Gauge :size="15" /> {{ car.power }} л.с.</span></div>
            <div class="car-price"><div><strong>{{ money(rate(car)) }} ₽</strong><span> / сутки</span></div></div>
            <p v-if="protection && car.protectionPrice == null" class="unpriced-option">Защита+ оплачивается дополнительно, стоимость уточняется</p>
            <div class="card-bottom"><span><Gauge :size="14" /> {{ mileageLabel }}</span><button type="button" :data-car-action="`details-${car.id}`" @click="emit('show-car', car)">Подробнее <ArrowRight :size="16" /></button></div>
          </div>
        </article>
      </div>
      <div v-else class="empty"><h3>По этим параметрам автомобилей нет</h3><p>Измените параметры или посмотрите весь автопарк.</p><button type="button" @click="clearFilters">Сбросить фильтры <ArrowRight :size="16" /></button></div>
      <CatalogHighlights @show-mileage="mileageField?.reveal()" />
      <CompanyIntro />
      <FleetFaq :messenger-links="messengerLinks" />
      <RentalTerms />
    </div>
  </main>
</template>

<style scoped>
.fleet-page{background:#f7f7f5;color:#191919;min-height:100vh;padding:38px 0 75px}.fleet-container{width:min(1380px,calc(100% - 64px));margin:0 auto}.fleet-intro{display:flex;justify-content:space-between;align-items:end;margin-bottom:26px}.eyebrow{font-size:10px;letter-spacing:.16em;font-weight:800;color:#777;margin:0 0 12px}.fleet-intro h1{font-size:clamp(34px,4vw,55px);line-height:1.05;letter-spacing:-.055em;margin:0;font-weight:750}.fleet-intro h1 span{color:#edb600}.intro-copy{font-size:15px;color:#6b6b68;margin:12px 0 0}.intro-caption{display:flex;gap:20px;align-items:end;text-transform:uppercase}.intro-caption span{font-size:10px;letter-spacing:.1em;color:#999}.intro-caption strong{font-size:13px;line-height:1.2;letter-spacing:.02em}.search-bar{display:grid;grid-template-columns:150px 1fr 1fr 1.4fr auto;align-items:stretch;background:#fff;border:1px solid #dededb;border-radius:12px;padding:8px;box-shadow:0 8px 30px #17171708}.search-caption{display:flex;gap:10px;align-items:center;padding:0 15px;font-size:12px;line-height:1.3;color:#777}.search-caption svg{color:#d3a000}.search-caption strong{color:#222}.search-submit{border:0;border-radius:8px;background:#ffc107;padding:0 22px;display:flex;align-items:center;justify-content:center;gap:18px;font-weight:750;cursor:pointer}.search-submit:hover{background:#eeb400}.fleet-heading{display:flex;justify-content:space-between;align-items:end;margin-top:24px}.fleet-heading h2{font-size:29px;letter-spacing:-.04em;margin:0}.sort-label{font-size:12px;color:#777;display:flex;align-items:center;gap:10px}.fleet-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.fleet-card{background:#fff;border:1px solid #e2e2de;border-radius:12px;overflow:hidden;transition:box-shadow .2s,border-color .2s}.fleet-card:hover,.fleet-card:focus-within{border-color:#dfc878;box-shadow:0 8px 25px #1b1b1b10}.car-image{display:block;width:100%;height:150px;padding:0;border:0;position:relative;background:#f1f1ef;cursor:pointer;overflow:hidden}.car-image :deep(.car-art){height:150px;aspect-ratio:auto;container-type:size}.car-image :deep(.car-art:before){width:min(100%,245px,calc((100cqh - 13px)*1.6));transform:translate(-50%,-54%)}.car-image>span{position:absolute;left:14px;top:13px;background:#fff;border:1px solid #e7e7e4;border-radius:5px;padding:5px 8px;font-size:10px;font-weight:700}.car-content{padding:15px 17px}.car-title{display:flex;justify-content:space-between;gap:10px;align-items:center}.car-title h3{margin:0;font-size:18px;letter-spacing:-.025em}.car-title>span{color:#999;font-size:12px}.car-specs{display:flex;flex-wrap:wrap;gap:15px;color:#777;font-size:11px;margin:11px 0 16px}.car-specs span,.card-bottom span{display:flex;align-items:center;gap:5px}.car-price{display:flex;justify-content:space-between;align-items:end;gap:5px;border-top:1px solid #eeeeeb;padding-top:13px}.car-price strong{font-size:22px;letter-spacing:-.04em}.car-price span{font-size:11px;color:#888}.car-price small{font-size:11px;color:#777;text-align:right}.card-bottom{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:14px}.card-bottom span{font-size:11px;color:#888}.card-bottom button,.empty button{border:0;background:#f3f3f1;padding:10px 12px;border-radius:7px;font-weight:700;font-size:12px;display:flex;align-items:center;gap:12px;cursor:pointer}.card-bottom button:hover,.empty button:hover{background:#ffc107}.empty{background:#fff;border:1px solid #e2e2de;border-radius:12px;padding:30px}.empty h3{margin:0}.empty p{color:#777;font-size:14px}.empty button{margin-top:15px}
@media(max-width:1000px){.search-bar{grid-template-columns:1fr 1fr 1.4fr auto}.search-caption{display:none}.fleet-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.intro-caption{display:none}}
@media(max-width:650px){.fleet-page{padding:28px 0 50px}.fleet-container{width:calc(100% - 32px)}.fleet-intro h1{font-size:37px}.intro-copy{font-size:13px}.search-bar{grid-template-columns:1fr 1fr;gap:0}.search-bar .location-field{border-left:0;border-top:1px solid #e8e8e5;grid-column:1/-1}.search-submit{min-height:46px;grid-column:1/-1}.fleet-heading{margin-top:30px;display:block}.fleet-heading h2{font-size:26px}.sort-label{margin-top:15px;justify-content:space-between}.fleet-grid{grid-template-columns:1fr}.car-image,.car-image :deep(.car-art){height:170px}}

/* Keep the fleet in view as soon as the page opens. */
.fleet-page{padding-top:24px}.fleet-intro{margin-bottom:18px}.fleet-intro .eyebrow,.intro-caption{display:none}.fleet-intro h1{font-size:clamp(30px,3.1vw,42px)}.intro-copy{margin-top:5px}.fleet-heading{margin-top:20px}
@media(max-width:650px){.fleet-page{padding-top:20px}.fleet-intro h1{font-size:29px}.intro-copy{margin-top:5px}.fleet-heading{margin-top:18px}.sort-label{margin-top:8px}}

/* A compact version of the original animated hero, keeping the fleet close by. */
.fleet-banner{position:relative;isolation:isolate;overflow:hidden;height:clamp(350px,35vw,460px);margin-bottom:18px;border-radius:14px;background:#1d2628;color:#fff}
.fleet-banner :deep(.hero-visual){position:absolute;inset:0;z-index:0;width:100%;height:100%;background-position:center 60%;background-size:cover}
.fleet-banner :deep(.hero-visual video){width:100%;height:100%;object-fit:cover;object-position:center 60%;transition:object-position .7s ease}
.fleet-banner :deep(.hero-visual video.hero-video-people){object-position:center top}
.fleet-banner :deep(.arrival-logo){position:absolute;top:23px;right:24px;z-index:3;width:190px;height:64px;overflow:hidden;pointer-events:none;opacity:0;transform:translateY(12px) scale(.96);transition:opacity .6s ease,transform .6s ease}
.fleet-banner :deep(.arrival-logo-visible){opacity:1;transform:translateY(0) scale(1)}
.fleet-banner :deep(.arrival-logo span){position:absolute;inset:0;background-position:50% 45.5%;background-repeat:no-repeat;background-size:calc(100% + 10px) auto;filter:url(#logo-white) drop-shadow(0 2px 4px #0008)}
.fleet-banner .banner-shade{position:absolute;inset:0;z-index:1;background:linear-gradient(90deg,rgba(12,17,19,.87) 0%,rgba(12,17,19,.67) 37%,rgba(12,17,19,.08) 78%);pointer-events:none}
.fleet-banner .banner-copy{position:relative;z-index:2;display:flex;flex-direction:column;justify-content:center;height:100%;padding:24px 38px;pointer-events:none}

.fleet-banner h1{margin:0;font-size:clamp(32px,3.2vw,48px);line-height:1.03;letter-spacing:-.045em;font-weight:750;color:#fff}
.fleet-banner h1 span{color:#ffc107}
.fleet-banner .banner-copy > p{margin:12px 0 0;color:#fff;line-height:1.4}
.banner-price { display: inline-flex; align-self: flex-start; align-items: center; gap: 9px; min-height: 40px; margin-top: 12px; padding: 6px 12px; border-radius: 8px; background: #fffffff0; color: #171717; font-size: var(--type-control); pointer-events: auto; }
.banner-price:hover { background: #fff; }
.banner-price strong { font-size: 21px; }
.fleet-banner :deep(.hero-playback){top:auto;right:14px;bottom:14px;z-index:3}
@media(max-width:650px){.fleet-banner{height:205px;margin-bottom:14px;border-radius:11px}.fleet-banner :deep(.hero-visual){height:100%;background-position:center 60%}.fleet-banner :deep(.hero-visual video){height:100%;object-position:center 50%}.fleet-banner :deep(.hero-visual video.hero-video-people){object-position:center 0%}.fleet-banner .banner-shade{background:linear-gradient(90deg,rgba(12,17,19,.88),rgba(12,17,19,.52) 66%,rgba(12,17,19,.16))}.fleet-banner .banner-copy{padding:18px 20px}.fleet-banner h1{font-size:31px}.fleet-banner .banner-copy > p:last-child{font-size:12px;margin-top:9px}.desktop-break{display:none}.fleet-banner :deep(.hero-playback){right:10px;bottom:10px}}
@media(max-width:650px){.fleet-banner .banner-copy h1,.fleet-banner .banner-copy p,.fleet-banner .banner-shade{transition:opacity .6s ease}.fleet-banner:has(.hero-video-people) .banner-copy h1,.fleet-banner:has(.hero-video-people) .banner-copy p{opacity:0}.fleet-banner:has(.hero-video-people) .banner-shade{opacity:.2}}
@media(max-width:650px){.fleet-banner :deep(.arrival-logo){top:8px;right:10px;width:118px;height:41px}}
@media(prefers-reduced-motion:reduce){.fleet-banner :deep(.arrival-logo){transition:none}}


.search-bar {
  position: relative;
  grid-template-columns: 1.1fr 1fr 1fr 1.35fr 1.15fr auto;
  gap: 0;
  z-index: 5;
}
.search-bar .location-field { border-left: 1px solid #e8e8e5; }
.search-bar :deep(.date-field) { padding: 8px 11px; gap: 5px; min-height: 52px; }
.search-bar :deep(.field-caption),
.search-bar :deep(.date-caption),
.search-bar :deep(.date-value),
.search-bar :deep(.mileage-label),
.search-bar :deep(.mileage-value) { line-height: 1.2; }
.fleet-heading { align-items: center; margin-bottom: 14px; }
.search-bar .search-submit { grid-column: auto; grid-row: auto; margin-top: 0; font-size: var(--type-control); }
.sort-label { color: #5d5f5a; font-size: var(--type-secondary); }
.sort-label :deep(.field) { gap: 12px; }
@media (min-width: 701px) {
  .location-field :deep(.select-menu) { left: auto; right: 0; }
}
.car-image > span, .car-title > span, .car-specs, .car-price span, .car-price small, .card-bottom span, .unpriced-option, .extras-summary {
  font-size: var(--type-secondary);
}
.card-bottom { flex-wrap: wrap; }
.car-title > span, .car-specs, .car-price span, .card-bottom span { color: #5d5f5a; }
.car-price > div { display: flex; align-items: baseline; gap: 5px; }
.card-bottom button, .empty button { font-size: var(--type-control); }
.empty p { font-size: var(--type-body); }
.fleet-banner .banner-copy > p { font-size: var(--type-body); }
@media (max-width: 700px) {
  .search-bar { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 6px; border-color: #e7cc79; }
  .search-bar .class-field, .search-bar .location-field, .search-bar .search-submit,
  .search-bar :deep(.range-picker), .search-bar :deep(.catalog-mileage), .search-bar :deep(.catalog-parameters) { grid-column: 1 / -1; }
  .search-bar .location-field { border-left: 0; border-top: 1px solid #e8e8e5; }
  .search-bar :deep(.date-field:first-child) { border-left: 0; }
  .search-submit { min-height: 46px; }
}
@media (min-width: 701px) and (max-width: 1179px) {
  .search-bar { grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.72fr); row-gap: 8px; }
  .search-bar .location-field { grid-column: 4; grid-row: 1; }
  .search-bar :deep(.catalog-mileage) { grid-column: 1 / 3; grid-row: 2; border-top: 0; }
  .search-bar :deep(.mileage-trigger) { width: 100%; min-width: 0; }
  .search-bar :deep(.catalog-parameters) { grid-column: 3; grid-row: 2; margin-inline: 8px; }
  .search-bar .search-submit { grid-column: 4; grid-row: 2; }
}
@media (min-width: 701px) and (max-width: 1270px) {
  .search-bar :deep(.parameters-trigger) { gap: 5px; padding-inline: 7px; white-space: normal; }
  .search-bar :deep(.parameters-trigger > svg:first-child) { display: none; }
}
@media (max-width: 650px) {
  .fleet-banner .banner-copy > p { font-size: var(--type-secondary); }
}

/* On wider screens the search straddles the lower edge of the hero. */
@media(min-width:931px){
  .fleet-banner .banner-copy{padding-bottom:100px}
  .fleet-banner :deep(.hero-playback){bottom:56px;right:20px}
  .search-bar{width:calc(100% - 48px);margin:-18px 24px -18px;transform:translateY(-50%);border-color:#e6bc3b;box-shadow:0 8px 28px #17171724}
}


.unpriced-option{margin:9px 0 0;color:#686864;line-height:1.4}.extras-summary{margin:0 0 12px;color:#565653;line-height:1.5}.extras-summary strong{color:#272727}

/* The photograph fills the whole image area, as in a rental catalog. */
.car-image{height:auto;aspect-ratio:3 / 2}
.car-image :deep(.car-art){position:absolute;inset:0;width:100%;height:100%}
.car-image :deep(.car-art--photo img){object-fit:cover}

@media (min-width: 1180px) {
  .search-bar { grid-template-columns: minmax(172px, 1.13fr) minmax(110px, .9fr) minmax(110px, .9fr) minmax(165px, 1.29fr) minmax(148px, 1fr) minmax(155px, 1.12fr) auto; }
  .search-bar :deep(.mileage-trigger) { gap: 5px 8px; padding-block: 8px; }
  .search-bar :deep(.mileage-label) { grid-column: 1 / -1; white-space: nowrap; }
  .search-bar :deep(.mileage-trigger svg) { grid-row: 2; }
}
</style>
