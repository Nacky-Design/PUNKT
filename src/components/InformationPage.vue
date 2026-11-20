<script setup lang="ts">
import { ArrowLeft, ArrowRight, ArrowUpRight, Clock3, Mail, MapPin, Phone } from 'lucide-vue-next';
import RentalTerms from './RentalTerms.vue';
import HeaderMessengerIcon from './HeaderMessengerIcon.vue';
import { messengerLinks } from '../contact';

defineProps<{ page: 'conditions' | 'contacts' | 'about' }>();
const officeAddress = 'Москва, ул. Авиационная, 24с1';
const directions = `https://yandex.ru/maps/?mode=routes&rtext=~${encodeURIComponent(officeAddress)}`;
const officeMap = `https://yandex.ru/map-widget/v1/?mode=search&text=${encodeURIComponent(officeAddress)}&z=16`;
</script>

<template>
  <main class="interior-page">
    <div class="interior-container">
      <a href="#catalog" class="interior-back"><ArrowLeft :size="16" aria-hidden="true" /> На главную</a>

      <template v-if="page === 'conditions'">
        <header class="interior-heading">
          <h1>Условия аренды<span>.</span></h1>
          <p>Требования к водителю, документы и залог.</p>
        </header>
        <RentalTerms embedded />
        <section class="terms-contact" aria-labelledby="terms-contact-title">
          <h2 id="terms-contact-title">Действующие и архивные условия</h2>
          <p>Запросите действующие условия или редакцию на дату вашей аренды.</p>
          <a href="mailto:info@punktprokat.ru?subject=Условия%20аренды" class="interior-action secondary">
            <Mail :size="17" aria-hidden="true" /> Запросить условия
          </a>
        </section>
      </template>

      <template v-else-if="page === 'contacts'">
        <header class="interior-heading">
          <h1>Контакты<span>.</span></h1>
          <p>Свяжитесь с нами, чтобы обсудить автомобиль, получение и возврат.</p>
        </header>
        <div class="contact-layout office-layout">
          <section class="contact-aside office-details" aria-labelledby="office-title">
            <div class="office-heading">
              <span class="contact-icon"><MapPin :size="22" aria-hidden="true" /></span>
              <div><h2 id="office-title">Офис «Пункта»</h2><p>{{ officeAddress }}</p></div>
            </div>
            <a class="contact-row contact-phone" href="tel:+74951041010">
              <span class="contact-icon"><Phone :size="19" aria-hidden="true" /></span>
              <span><small>Телефон</small><strong>8 495 104-10-10</strong></span>
              <ArrowRight :size="18" aria-hidden="true" />
            </a>
            <a class="contact-row" href="mailto:info@punktprokat.ru">
              <span class="contact-icon"><Mail :size="19" aria-hidden="true" /></span>
              <span><small>Электронная почта</small><strong>info@punktprokat.ru</strong></span>
              <ArrowRight :size="18" aria-hidden="true" />
            </a>
            <div class="contact-row">
              <span class="contact-icon"><Clock3 :size="19" aria-hidden="true" /></span>
              <span><small>Часы работы офиса</small><strong>Пн–пт, 8:00–17:00 (МСК)</strong></span>
            </div>
            <div v-if="messengerLinks.telegram || messengerLinks.max" class="messengers" aria-label="Мессенджеры">
              <a v-if="messengerLinks.telegram" :href="messengerLinks.telegram"><HeaderMessengerIcon kind="telegram" />Telegram</a>
              <a v-if="messengerLinks.max" :href="messengerLinks.max"><HeaderMessengerIcon kind="max" />Max</a>
            </div>
            <a :href="directions" class="interior-action" target="_blank" rel="noopener noreferrer">
              Построить маршрут <ArrowUpRight :size="17" aria-hidden="true" />
            </a>
          </section>
          <iframe class="office-map" :src="officeMap" title="Офис «Пункта» на Яндекс Картах" loading="lazy"></iframe>
        </div>
      </template>

      <template v-else>
        <header class="interior-heading">
          <h1>О компании<span>.</span></h1>
          <p>«Пункт» — прокат автомобилей в Москве. Машину можно забрать в офисе или обсудить доставку.</p>
        </header>
        <div class="contact-layout about-layout">
          <section class="contact-card" aria-labelledby="about-rental-title">
            <h2 id="about-rental-title">Как проходит аренда</h2>
            <p>Мы выдаём чистые, обслуженные автомобили. Год выпуска и характеристики можно посмотреть в карточке машины. На автомобилях «Пункта» можно ездить по России и в Беларусь.</p>
            <a href="#catalog" class="interior-action">Выбрать автомобиль <ArrowRight :size="17" aria-hidden="true" /></a>
          </section>
          <aside class="contact-aside">
            <span class="contact-icon"><MapPin :size="23" aria-hidden="true" /></span>
            <h2>Офис «Пункта»</h2>
            <p>{{ officeAddress }}</p>
            <a href="#contacts" class="interior-action">Контакты <ArrowRight :size="17" aria-hidden="true" /></a>
          </aside>
        </div>
      </template>
    </div>
  </main>
</template>

<style scoped>
.terms-contact {
  border-top: 1px solid #e4e4df;
  margin-top: 36px;
  padding-top: 25px;
}
.terms-contact h2, .about-layout h2 { font-size: clamp(23px, 2.5vw, 30px); letter-spacing: -.035em; }
.terms-contact p, .about-layout .contact-card p { max-width: 56ch; margin: 10px 0 16px; color: #5d5f5a; line-height: 1.55; }
.contact-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  align-items: start;
  gap: 18px;
}
.contact-card { padding: 24px; border: 1px solid #e4e4df; border-radius: 14px; background: #fff; }
.contact-row { display: flex; align-items: center; gap: 13px; min-width: 0; padding: 14px 0; }
.contact-row + .contact-row { border-top: 1px solid #eeefec; }
.contact-row > span:nth-child(2) { display: grid; flex: 1; gap: 5px; min-width: 0; }
.contact-row small { color: #62645e; font-size: var(--type-secondary); }
.contact-row strong { font-size: var(--type-body); line-height: 1.35; overflow-wrap: anywhere; }
.contact-row > svg { flex: none; }
a.contact-row:hover strong { text-decoration: underline; text-underline-offset: 4px; }
.contact-phone strong { font-size: 19px; }
.contact-icon {
  display: grid;
  place-items: center;
  flex: none;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #fff2c8;
  color: #27251c;
}
.messengers { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 14px; padding-top: 14px; border-top: 1px solid #eeefec; }
.messengers a { display: inline-flex; align-items: center; gap: 6px; font-size: var(--type-control); }
.messengers :deep(svg) { width: 22px; height: 22px; }
.contact-aside { padding: 24px; border-radius: 14px; background: linear-gradient(145deg, #3a4240, #191d1c); color: #fff; }
.contact-aside .contact-icon { margin-bottom: 18px; background: #ffc107; }
.contact-aside h2 { font-size: 27px; letter-spacing: -.035em; }
.contact-aside p { margin: 10px 0 18px; color: #f0f0eb; line-height: 1.5; }
.office-layout { grid-template-areas: "map details"; align-items: stretch; }
.office-map { grid-area: map; width: 100%; height: 100%; min-height: 380px; border: 1px solid #deded8; border-radius: 14px; background: #e9ebe5; }
.office-details { grid-area: details; padding: clamp(20px, 3.3vw, 34px); }
.office-heading { display: flex; align-items: flex-start; gap: 13px; margin-bottom: 8px; }
.office-heading p { margin: 4px 0; }
.office-details .contact-icon { margin: 0; }
.office-details .contact-row .contact-icon { background: #ffffff17; color: #ffe287; }
.office-details .contact-row + .contact-row, .office-details .messengers { border-color: #ffffff29; }
.office-details .contact-row small { color: #d3d8d3; }
.office-details > .interior-action { margin-top: 16px; }
@media (max-width: 700px) {
  .contact-layout { grid-template-columns: minmax(0, 1fr); }
  .contact-card, .contact-aside { padding: 18px; }
  .office-layout { grid-template-areas: "details" "map"; }
  .office-map { height: 300px; min-height: 0; }
}

.office-details { --focus-ring: #b7c1bc; }
</style>
