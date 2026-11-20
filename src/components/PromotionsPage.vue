<script setup lang="ts">
import { computed } from 'vue';
import { ArrowLeft, ArrowRight, ArrowUpRight, Phone } from 'lucide-vue-next';

import { daytimeDeliveryHours } from '../data';

const props = defineProps<{ detailId: string }>();
const offers = [
  {
    id: 'free-delivery', title: 'Бесплатная доставка по Москве', image: 'guide-delivery.webp', discount: null,
    summary: `Дневная подача ${daytimeDeliveryHours}.`,
    description: `Дневная доставка в пределах Москвы бесплатна в часы ${daytimeDeliveryHours}. Согласуйте адрес и время подачи до оформления. Для ночной доставки, области и аэропортов действуют отдельные тарифы.`,
  },
  {
    id: 'families', title: 'Участникам СВО и членам их семей', image: 'promo-families.webp', discount: '20%',
    summary: 'Условия аренды для участников СВО и членов их семей.',
    description: 'До выбора машины уточните, на какие автомобили и даты действует предложение и какие документы нужны при оформлении.',
  },
  {
    id: 'bloggers', title: 'Для блогеров', image: 'hero-moscow.webp', discount: '20%',
    summary: 'Аренда автомобиля для съёмки или публикации.',
    description: 'Расскажите о формате, датах съёмки и нужной модели. Условия сотрудничества можно обсудить с командой «Пункта».',
  },
  {
    id: 'half-day', title: 'Аренда на полдня', image: 'guide-road.webp', discount: '30%',
    summary: 'Вариант для поездок на несколько часов.',
    description: 'Уточните время получения и возврата. Возможность аренды на полдня и стоимость зависят от автомобиля и даты.',
  },
  {
    id: 'large-families', title: 'Многодетным семьям', image: 'hero-wan-hd.webp', discount: '20%',
    summary: 'Условия аренды для многодетных семей.',
    description: 'Перед оформлением уточните подходящие автомобили, сроки предложения и документы, которые понадобятся.',
  },
];
const selected = computed(() => offers.find(offer => offer.id === props.detailId));
const asset = (file: string) => `${import.meta.env.BASE_URL}assets/${file}`;
</script>

<template>
  <main class="interior-page">
    <div class="interior-container">
      <a :href="detailId ? '#promotions' : '#catalog'" class="interior-back">
        <ArrowLeft :size="16" aria-hidden="true" /> {{ detailId ? 'Все акции' : 'На главную' }}
      </a>
      <article v-if="selected" class="offer-detail">
        <div class="offer-image">
          <img :src="asset(selected.image)" alt="" width="720" height="540" />
          <span v-if="selected.discount" class="offer-discount" :aria-label="`Скидка ${selected.discount}`">−{{ selected.discount }}</span>
        </div>
        <div class="detail-copy">
          <header class="interior-heading">
            <h1>{{ selected.title }}<span>.</span></h1>
            <p>{{ selected.description }}</p>
          </header>
          <div class="detail-actions">
            <a href="tel:+74951041010" class="interior-action"><Phone :size="17" aria-hidden="true" /> Уточнить условия</a>
            <a href="#catalog" class="interior-action secondary">Посмотреть автомобили <ArrowRight :size="17" aria-hidden="true" /></a>
          </div>
        </div>
      </article>
      <header v-else-if="detailId" class="interior-heading">
        <h1>Акция не найдена<span>.</span></h1>
      </header>
      <template v-else>
        <header class="interior-heading">
          <h1>Акции<span>.</span></h1>
        </header>
        <div class="offers">
          <a v-for="offer in offers" :key="offer.id" class="offer-card" :href="`#promotions/${offer.id}`">
            <div class="offer-image">
              <img :src="asset(offer.image)" alt="" width="400" height="300" loading="lazy" />
              <span v-if="offer.discount" class="offer-discount" :aria-label="`Скидка ${offer.discount}`">−{{ offer.discount }}</span>
            </div>
            <div class="promotion-copy">
              <h2>{{ offer.title }}</h2>
              <p>{{ offer.summary }}</p>
              <span class="interior-action secondary offer-more">Подробнее <ArrowUpRight :size="16" aria-hidden="true" /></span>
            </div>
          </a>
        </div>
      </template>
    </div>
  </main>
</template>

<style scoped>
.offers { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.offer-card {
  display: grid;
  grid-template-columns: minmax(0, .8fr) minmax(0, 1fr);
  min-height: 192px;
  overflow: hidden;
  border: 1px solid #e4e4df;
  border-radius: 14px;
  background: #fff;
}
.offer-card img, .offer-detail img { display: block; width: 100%; object-fit: cover; }
.offer-image { position: relative; min-width: 0; }
.offer-discount { position: absolute; top: 12px; left: 12px; padding: 7px 12px; border-radius: 8px; background: #ffc107; color: #171717; font-size: 23px; font-weight: 800; line-height: 1.15; }
.offer-card img { height: 100%; }
.promotion-copy { display: flex; flex-direction: column; align-items: flex-start; padding: 20px; }
.promotion-copy h2 { font-size: 19px; line-height: 1.22; letter-spacing: -.025em; }
.promotion-copy p { margin: 8px 0 18px; color: #5d5f5a; font-size: var(--type-body); line-height: 1.5; }
.offer-more { margin-top: auto; }
.offer-card:hover .offer-more { background: #efefeb; }
.offer-detail { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: clamp(20px, 4vw, 54px); align-items: center; margin-top: 26px; }
.offer-detail img { height: auto; aspect-ratio: 4 / 3; border-radius: 14px; }
.detail-copy .interior-heading { margin-top: 0; }
.detail-actions { display: flex; flex-wrap: wrap; gap: 10px; }
@media (max-width: 860px) {
  .offer-card { grid-template-columns: 1fr; }
  .offer-card img { height: auto; aspect-ratio: 16 / 9; }
}
@media (max-width: 700px) {
  .offers, .offer-detail { grid-template-columns: 1fr; }
  .offer-detail img { aspect-ratio: 16 / 10; }
}
</style>
