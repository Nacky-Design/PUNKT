<script setup lang="ts">
import { computed, ref } from 'vue';
import { ArrowLeft, ArrowRight, ArrowUpRight, Building2, CalendarDays, CalendarRange, CarFront, CircleDollarSign, Globe2, IdCard, MapPin, Phone, Repeat2, UserRound, Wrench } from 'lucide-vue-next';
import { serviceGroups } from '../data';
import CatalogDateRange from './CatalogDateRange.vue';

const props = defineProps<{ detailId: string; start: string; end: string }>();
const emit = defineEmits<{ 'find-cars': [start: string, end: string] }>();
const startDate = ref(props.start);
const endDate = ref(props.end);
const serviceDetails = {
  daily: { icon: CalendarDays, points: [] },
  'long-term': { icon: CalendarRange, points: ['Срок аренды и нужный класс автомобиля', 'Маршруты и примерный пробег', 'График платежей и обслуживание на весь срок'] },
  subscription: { icon: Repeat2, points: ['Доступные модели и минимальный срок', 'Состав ежемесячного платежа', 'Условия возврата автомобиля'] },
  buyout: { icon: CircleDollarSign, points: ['Автомобили, доступные для выкупа', 'График платежей', 'Когда и как оформляется переход права собственности'] },
  russia: { icon: MapPin, points: ['Города и регионы на маршруте', 'Планируемый пробег', 'Можно ли вернуть машину в другой точке'] },
  abroad: { icon: Globe2, points: ['Страны на маршруте', 'Разрешительные документы и страховка', 'Что делать в случае поломки или изменения маршрута'] },
  driver: { icon: UserRound, points: ['Дата, время и точки маршрута', 'Число пассажиров и объём багажа', 'Стоимость поездки и ожидания'] },
  business: { icon: Building2, points: ['Сколько машин нужно и на какой срок', 'Реквизиты для договора', 'Порядок оплаты и закрывающие документы'] },
  international: { icon: IdCard, points: ['Документы для оформления договора', 'Действительность водительского удостоверения', 'Условия по залогу и оплате'] },
  deposit: { icon: CarFront, points: ['На какие автомобили распространяется условие', 'Ограничения по месту поездки и способу оплаты', 'Размер и срок возврата залога, если он потребуется'] },
  roadside: { icon: Wrench, points: ['Где находится автомобиль', 'Что произошло и можно ли безопасно продолжать движение'] },
};
const groups = serviceGroups.map(group => ({
  ...group,
  items: group.items.map(item => ({ ...item, ...serviceDetails[item.id] })),
}));
const selected = computed(() => groups.flatMap(group => group.items).find(item => item.id === props.detailId));
</script>

<template>
  <main class="interior-page">
    <div class="interior-container">
      <a :href="detailId ? '#services' : '#catalog'" class="interior-back">
        <ArrowLeft :size="16" aria-hidden="true" /> {{ detailId ? 'Все услуги' : 'На главную' }}
      </a>
      <template v-if="detailId">
        <header class="interior-heading">
          <h1>{{ selected?.title ?? 'Услуга не найдена' }}<span>.</span></h1>
          <p v-if="selected">{{ selected.description }}</p>
        </header>
        <form v-if="selected?.id === 'daily'" class="service-detail" aria-labelledby="daily-rental-title" @submit.prevent="emit('find-cars', startDate, endDate)">
          <h2 id="daily-rental-title">Даты аренды</h2>
          <CatalogDateRange v-model:start="startDate" v-model:end="endDate" />
          <button type="submit" class="interior-action">Подобрать автомобиль <ArrowRight :size="17" aria-hidden="true" /></button>
        </form>
        <section v-else-if="selected" class="service-detail" aria-labelledby="service-detail-title">
          <h2 id="service-detail-title">{{ selected.id === 'roadside' ? 'Что сообщить при звонке' : 'Что уточнить перед оформлением' }}</h2>
          <ul><li v-for="point in selected.points" :key="point">{{ point }}</li></ul>
          <div class="page-actions">
            <a href="tel:+74951041010" class="interior-action"><Phone :size="17" aria-hidden="true" /> {{ selected.id === 'roadside' ? 'Позвонить в «Пункт»' : 'Уточнить условия' }}</a>
            <a v-if="selected.id !== 'roadside'" :href="selected.id === 'deposit' ? '#conditions' : '#catalog'" class="interior-action secondary">
              {{ selected.id === 'deposit' ? 'Условия аренды' : 'Посмотреть автомобили' }} <ArrowRight :size="17" aria-hidden="true" />
            </a>
          </div>
        </section>
      </template>
      <template v-else>
        <header class="interior-heading">
          <h1>Услуги<span>.</span></h1>
          <p>Выберите формат аренды или уточните условия поездки.</p>
        </header>
        <div class="service-sections">
          <section v-for="(group, index) in groups" :key="group.title" class="service-group" :aria-labelledby="`service-group-${index}`">
            <div class="group-heading"><h2 :id="`service-group-${index}`">{{ group.title }}</h2></div>
            <div class="service-grid">
              <a v-for="item in group.items" :key="item.id" class="service-card" :href="`#services/${item.id}`">
                <span class="service-icon"><component :is="item.icon" :size="21" aria-hidden="true" /></span>
                <span class="service-copy"><strong>{{ item.title }}</strong><span>{{ item.description }}</span></span>
                <span class="service-arrow"><ArrowUpRight :size="18" aria-hidden="true" /></span>
              </a>
            </div>
          </section>
        </div>
      </template>
    </div>
  </main>
</template>

<style scoped>
.service-detail { max-width: 690px; padding: clamp(18px, 3vw, 30px); background: #fff; border: 1px solid #e4e4df; border-radius: 14px; }
.service-detail h2 { font-size: clamp(21px, 2.2vw, 28px); letter-spacing: -.035em; }
.service-detail .range-picker { grid-template-columns: repeat(2, minmax(0, 1fr)); width: 100%; margin: 15px 0 20px; padding: 5px; border: 1px solid #deded8; border-radius: 9px; }
.service-detail :deep(.date-field:first-child) { border-left: 0; }
.service-detail ul { margin: 12px 0 22px; padding-left: 22px; color: #444640; line-height: 1.55; }
.service-detail li + li { margin-top: 7px; }
.page-actions { display: flex; flex-wrap: wrap; gap: 10px; }
.service-sections{display:grid;gap:42px}.group-heading{display:flex;align-items:end;justify-content:space-between;gap:16px;padding-bottom:15px;border-bottom:1px solid #e0e0dc}.group-heading h2{margin:0;font-size:23px;letter-spacing:-.035em}.group-heading p{margin:5px 0 0;color:#83847e;font-size:13px;line-height:1.45}.service-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:14px}.service-card{display:flex;align-items:flex-start;gap:14px;min-width:0;min-height:104px;padding:19px;border:1px solid #e6e6e1;border-radius:12px;background:#fff;text-align:left;transition:border-color .2s,box-shadow .2s,transform .2s}.service-card:hover,.service-card:focus-visible{border-color:#e6c657;box-shadow:0 6px 20px #2221;transform:translateY(-1px)}.service-icon{display:grid;place-items:center;flex:none;width:40px;height:40px;border-radius:10px;background:#fff2c9;color:#29251a}.service-copy{display:grid;gap:6px;min-width:0;flex:1}.service-copy strong{color:#20211f;font-size:15px;line-height:1.25}.service-copy>span{color:#5d5f5a;font-size:14px;line-height:1.5}.service-arrow{display:grid;place-items:center;flex:none;width:30px;height:30px;border-radius:50%;background:#f4f4f2;color:#494b47}.service-card:hover .service-arrow{background:#ffc107;color:#171717}
@media(max-width:700px){.service-sections{gap:32px}.group-heading h2{font-size:21px}.service-grid{grid-template-columns:1fr}.service-card{min-height:0;padding:16px}.service-copy>span{font-size:13px}}
@media(prefers-reduced-motion:reduce){.service-card{transition:none}}
.service-copy strong { font-size: var(--type-body); }
.service-copy > span { font-size: var(--type-secondary); }
</style>
