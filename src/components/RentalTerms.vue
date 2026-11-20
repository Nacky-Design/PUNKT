<script setup lang="ts">
import { BadgeCheck, Check, CreditCard, FileText, Globe2, KeyRound, MapPin, ShieldCheck, UserRound } from 'lucide-vue-next';
defineProps<{ embedded?: boolean }>();
</script>

<template>
  <section class="rental-terms" :aria-labelledby="embedded ? undefined : 'rental-terms-title'" :aria-label="embedded ? 'Требования к аренде' : undefined">
    <div v-if="!embedded" class="terms-heading">
      <h2 id="rental-terms-title">Условия аренды<span>.</span></h2>
      <span class="heading-rule" aria-hidden="true"></span>
      <a class="terms-link" href="#conditions">Все условия аренды</a>
    </div>
    <div class="terms-grid">
      <article class="terms-card driver-card">
        <div class="card-top"><span class="title-icon"><UserRound :size="22" aria-hidden="true" /></span><h3>Требования к водителю</h3></div>
        <div class="requirements">
          <div><span class="requirement-badge">21+</span><span>Возраст от 21 года</span></div>
          <div><span class="requirement-badge"><ShieldCheck :size="20" aria-hidden="true" /></span><span>Стаж от 1 года</span></div>
        </div>
      </article>
      <article class="terms-card documents-card">
        <div class="card-top"><span class="title-icon"><FileText :size="22" aria-hidden="true" /></span><h3>Документы</h3></div>
        <ul class="documents-list">
          <li><Check :size="18" aria-hidden="true" />Паспорт</li>
          <li><Check :size="18" aria-hidden="true" />Водительское удостоверение</li>
        </ul>
        <div class="foreign-docs"><span class="title-icon"><Globe2 :size="21" aria-hidden="true" /></span><div><h4>Иностранным гражданам</h4><p>Требуется миграционная карта или виза.</p></div></div>
      </article>
      <article class="terms-card deposit-card">
        <KeyRound class="deposit-art" :size="128" :stroke-width="1" aria-hidden="true" />
        <h3 :id="embedded ? 'rental-deposit-title' : undefined" :tabindex="embedded ? -1 : undefined">Когда возможна аренда без залога</h3>
        <ul class="deposit-list">
          <li><span class="list-icon"><CreditCard :size="19" aria-hidden="true" /></span><span>Оплата банковской картой</span></li>
          <li><span class="list-icon"><MapPin :size="19" aria-hidden="true" /></span><span>Поездки по Москве и Московской области</span></li>
          <li><span class="list-icon"><BadgeCheck :size="19" aria-hidden="true" /></span><span>Гражданство РФ</span></li>
        </ul>
        <p class="asterisk">В отдельных случаях арендодатель может запросить залог.</p>
        <p class="asterisk">Для поездок за пределы Москвы и Московской области залог обязателен.</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.rental-terms { margin: 52px 0 36px; color: #1c1c1b; }
.terms-heading { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 10px 16px; margin-bottom: 20px; }
.terms-heading .heading-rule { grid-row: 2; margin-top: 0; }
.terms-link { grid-area: 1 / 2; display: inline-flex; align-items: center; min-height: 44px; color: #775500; font-size: var(--type-control); text-decoration: underline; text-underline-offset: 3px; }
#rental-deposit-title { scroll-margin-top: 24px; }
@media (max-width: 520px) {
  .terms-heading { grid-template-columns: 1fr; gap: 8px; }
  .terms-heading .terms-link { grid-area: 3 / 1; justify-self: start; }
}
.terms-heading h2 { font-size: clamp(30px, 3vw, 40px); letter-spacing: -.045em; line-height: 1.1; }
.terms-heading h2 span { color: #b58500; }
.heading-rule { display: block; width: 44px; height: 4px; margin-top: 13px; border-radius: 2px; background: #ffc107; }
.terms-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.terms-card { position: relative; min-width: 0; padding: clamp(18px, 3vw, 28px); border: 1px solid #e4e4df; border-radius: 14px; background: #fff; }
.terms-card h3 { font-size: clamp(21px, 2vw, 26px); letter-spacing: -.035em; line-height: 1.2; }
.card-top { display: flex; align-items: center; gap: 11px; }
.list-icon, .title-icon, .requirement-badge { display: grid; place-items: center; flex: none; width: 36px; height: 36px; border-radius: 9px; background: #fff1c5; color: #24221b; }
.requirements { display: grid; gap: 8px; margin-top: 21px; }
.requirements > div { display: flex; align-items: center; gap: 10px; padding: 6px; border-radius: 9px; background: #f5f5f3; font-weight: 600; }
.requirement-badge { font-size: var(--type-secondary); font-weight: 800; }
.documents-list { display: grid; gap: 10px; margin: 21px 0; padding: 0; list-style: none; }
.documents-list li { display: flex; align-items: center; gap: 8px; }
.documents-list svg { flex: none; color: #805e00; }
.foreign-docs { display: flex; gap: 11px; align-items: flex-start; padding-top: 17px; border-top: 1px solid #e9e9e5; }
.foreign-docs h4 { margin: 0; font-size: var(--type-body); line-height: 1.25; }
.foreign-docs p { margin: 5px 0 0; color: #53554f; line-height: 1.45; }
.deposit-card { grid-column: 1 / -1; isolation: isolate; overflow: hidden; border-color: #edd176; background: linear-gradient(112deg, #fff6d9, #ffe58c 66%, #ffc641); }
.deposit-art { position: absolute; right: 5%; top: -14px; z-index: -1; transform: rotate(-19deg); color: #aa740032; }
.deposit-list { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin: 20px 0 16px; padding: 0; list-style: none; }
.deposit-list li { display: flex; align-items: center; gap: 10px; min-width: 0; padding: 10px; border-radius: 10px; background: #ffffff88; font-weight: 600; line-height: 1.35; }
.deposit-list .list-icon { background: #fff8e0; }
.asterisk { margin: 0; color: #4d3b06; line-height: 1.45; }
.asterisk + .asterisk { margin-top: 6px; }
@media (max-width: 700px) {
  .rental-terms { margin: 34px 0 28px; }
  .terms-grid, .deposit-list { grid-template-columns: minmax(0, 1fr); }
  .deposit-card { grid-column: auto; }
  .deposit-list { gap: 7px; }
}
</style>
