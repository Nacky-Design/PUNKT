<script setup lang="ts">
import { ref } from 'vue';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { daytimeDeliveryHours } from '../data';

const emit = defineEmits<{ 'show-mileage': [] }>();
const asset = (name: string) => `${import.meta.env.BASE_URL}assets/${name}`;
const track = ref<HTMLElement>();
const active = ref(0);

function updateActive() {
  const element = track.value;
  if (!element || element.scrollWidth <= element.clientWidth) return;
  active.value = element.scrollLeft > (element.scrollWidth - element.clientWidth) / 2 ? 1 : 0;
}

function show(index: number) {
  const element = track.value;
  if (!element) return;
  element.scrollTo({ left: index === 0 ? 0 : element.scrollWidth - element.clientWidth });
}
</script>

<template>
  <section class="highlights" aria-labelledby="highlights-title">
    <div class="highlights-heading">
      <h2 id="highlights-title">Акции и преимущества<span>.</span></h2>
      <div class="highlights-controls" role="group" aria-label="Листать предложения">
        <button type="button" aria-label="Предыдущий баннер" aria-controls="catalog-highlights" :aria-disabled="active === 0" @click="show(0)">
          <ChevronLeft :size="20" aria-hidden="true" />
        </button>
        <button type="button" aria-label="Следующий баннер" aria-controls="catalog-highlights" :aria-disabled="active === 1" @click="show(1)">
          <ChevronRight :size="20" aria-hidden="true" />
        </button>
      </div>
    </div>

    <div id="catalog-highlights" ref="track" class="highlights-track" @scroll.passive="updateActive">
      <article class="highlight delivery-highlight">
        <div class="highlight-copy">
          <h3>Бесплатная доставка в пределах МКАД</h3>
          <p>Дневная подача {{ daytimeDeliveryHours }}. Адрес и время согласуем заранее.</p>
          <a href="#promotions/free-delivery" class="highlight-action">
            Условия доставки <ArrowRight :size="17" aria-hidden="true" />
          </a>
        </div>
        <img :src="asset('guide-delivery.webp')" width="900" height="490" alt="" loading="lazy" />
      </article>

      <article class="highlight mileage-highlight">
        <div class="highlight-copy">
          <h3>Меньше ездите — меньше платите</h3>
          <p>Выберите, сколько километров вам нужно в сутки, и сравните стоимость аренды.</p>
          <button type="button" class="highlight-action" @click="emit('show-mileage')">
            Сравнить цены <ArrowRight :size="17" aria-hidden="true" />
          </button>
        </div>
        <img :src="asset('promo-atlas-mileage.webp')" width="1080" height="720" alt="" loading="lazy" />
      </article>
    </div>
    <p class="highlights-position" aria-live="polite">{{ active + 1 }} из 2</p>
  </section>
</template>

<style scoped>
.highlights { margin-top: 48px; }
.highlights-heading { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 16px; }
.highlights-heading h2 { font-size: clamp(26px, 3vw, 38px); line-height: 1.1; letter-spacing: -.045em; }
.highlights-heading h2 span { color: #a87900; }
.highlights-controls, .highlights-position { display: none; }
.highlights-track { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.highlight {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  min-width: 0;
  min-height: 224px;
  overflow: hidden;
  border: 1px solid #e4e4df;
  border-radius: 14px;
  background: #fff;
}
.mileage-highlight { border-color: #ebdeb7; background: #fff8e4; }
.highlight-copy { display: flex; flex-direction: column; align-items: flex-start; justify-content: center; padding: clamp(16px, 2.1vw, 30px); }
.highlight h3 { font-size: clamp(21px, 2.15vw, 31px); line-height: 1.12; letter-spacing: -.04em; }
.highlight p { margin: 9px 0 17px; color: #4c4e48; font-size: var(--type-body); line-height: 1.45; }
.highlight img { display: block; width: 100%; height: 100%; object-fit: cover; }
.mileage-highlight img { object-position: 54% 60%; }
.highlight-action {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 42px;
  margin-top: auto;
  padding: 8px 12px;
  border-radius: 8px;
  background: #ffc107;
  color: #171717;
  font-size: var(--type-control);
  font-weight: 720;
  text-align: left;
}
.highlight-action svg { flex: none; }
.highlight-action:hover { background: #ffd047; }
@media (min-width: 931px) and (max-width: 1150px) {
  .mileage-highlight img { object-position: 38% 60%; }
}
@media (max-width: 930px) {
  .highlights { margin-top: 36px; }
  .highlights-position { display: block; margin-top: 9px; color: #5d5f5a; font-size: var(--type-secondary); }
  .highlights-controls { display: flex; gap: 6px; flex: none; }
  .highlights-controls button {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    padding: 0;
    border: 1px solid #d9d9d4;
    border-radius: 8px;
    background: #fff;
  }
  .highlights-controls button[aria-disabled="true"] { color: #777; background: #f5f5f3; cursor: default; }
  .highlights-track {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    padding: 4px;
    margin: -4px;
    scroll-padding-inline: 4px;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
    overscroll-behavior-inline: contain;
    scrollbar-width: thin;
  }
  .highlight { flex: 0 0 100%; scroll-snap-align: start; }
}
@media (max-width: 520px) {
  .highlight { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto 1fr; }
  .highlight img { grid-row: 1; height: auto; aspect-ratio: 2 / 1; }
  .highlight-copy { padding: 17px; }
}
@media (prefers-reduced-motion: reduce) {
  .highlights-track { scroll-behavior: auto; }
}
</style>
