<script setup lang="ts">
import { BadgeCheck, Check, CreditCard, FileText, Globe2, MapPin, ShieldCheck, UserRound } from 'lucide-vue-next';
defineProps<{ embedded?: boolean }>();
</script>

<template>
  <section class="rental-terms" :aria-labelledby="embedded ? undefined : 'rental-terms-title'" :aria-label="embedded ? 'Требования к аренде' : undefined">
    <div v-if="!embedded" class="terms-heading">
      <h2 id="rental-terms-title">Условия аренды<span>.</span></h2>
      <span class="heading-rule" aria-hidden="true"></span>
    </div>
    <div class="terms-grid">
      <article class="terms-card driver-card">
        <div class="card-top"><span class="title-icon"><UserRound :size="22" aria-hidden="true" /></span><h3>Чтобы взять машину<br />вам нужно</h3></div>
        <div class="requirements">
          <div><span class="requirement-badge">21+</span><span>Возраст от 21 года</span></div>
          <div><span class="requirement-badge"><ShieldCheck :size="20" aria-hidden="true" /></span><span>Стаж от 1 года</span></div>
        </div>
        <p class="card-subtle">Требования уточняются<br />перед оформлением.</p>
      </article>
      <article class="terms-card documents-card">
        <div class="card-top"><span class="title-icon"><FileText :size="22" aria-hidden="true" /></span><h3>Предоставить<br />документы</h3></div>
        <ul class="documents-list">
          <li><Check :size="18" aria-hidden="true" />Паспорт</li>
          <li><Check :size="18" aria-hidden="true" />Водительское удостоверение</li>
        </ul>
        <div class="foreign-docs"><span class="title-icon"><Globe2 :size="21" aria-hidden="true" /></span><div><h4>Иностранным гражданам</h4><p>Требуется миграционная карта или виза.</p></div></div>
      </article>
      <article class="terms-card deposit-card">
        <h3>Когда возможна аренда без залога</h3>
        <ul class="deposit-list">
          <li><span class="list-icon"><CreditCard :size="19" aria-hidden="true" /></span><span>Оплата банковской картой</span></li>
          <li><span class="list-icon"><MapPin :size="19" aria-hidden="true" /></span><span>Поездки по Москве<br />и Московской области</span></li>
          <li><span class="list-icon"><BadgeCheck :size="19" aria-hidden="true" /></span><span>Гражданство РФ</span></li>
        </ul>
        <p class="asterisk">В отдельных случаях арендодатель может запросить залог.</p>
      </article>
    </div>
    <p class="terms-note">Подтвердите требования и условия залога перед оформлением аренды.</p>
  </section>
</template>

<style scoped>
.rental-terms{margin:60px 0 54px;color:#1c1c1b}.terms-heading{margin-bottom:20px}.terms-eyebrow{margin:0 0 9px;font-size:10px;letter-spacing:.15em;font-weight:750;color:#888}.terms-heading h2{margin:0;font-size:clamp(30px,3vw,40px);letter-spacing:-.045em;line-height:1.1}.terms-heading h2 span{color:#e0ab00}.heading-rule{display:block;width:44px;height:4px;border-radius:2px;margin-top:13px;background:linear-gradient(90deg,#ffc107 70%,#ffe488 70%)}.terms-grid{display:grid;grid-template-columns:.9fr 1fr 1.07fr;gap:15px;align-items:stretch}.terms-card{position:relative;min-width:0;min-height:250px;padding:24px;border:1px solid #e9e9e5;border-radius:14px;background:#fff;overflow:hidden;box-shadow:0 4px 14px #17171708}.terms-card h3{margin:0;font-size:18px;letter-spacing:-.025em;line-height:1.22}.deposit-card h3,.deposit-list,.asterisk{position:relative;z-index:1}.deposit-list{display:grid;gap:10px;list-style:none;margin:22px 0 24px;padding:0;font-size:13px;font-weight:600;line-height:1.35}.deposit-list li{display:flex;align-items:center;gap:9px}.list-icon,.title-icon{display:grid;place-items:center;flex:none;width:34px;height:34px;border-radius:9px;background:#ffe8a0;color:#24221b}.asterisk{margin:auto 0 0;font-size:11px;line-height:1.4;color:#665a38;max-width:260px}.card-top{display:flex;align-items:flex-start;gap:11px}.requirements{display:grid;gap:8px;margin-top:24px}.requirements>div{display:flex;align-items:center;gap:10px;min-height:42px;padding:4px 10px 4px 5px;border-radius:9px;background:#f5f5f3;font-size:13px;font-weight:600}.requirement-badge{display:grid;place-items:center;flex:none;width:36px;height:32px;border-radius:7px;background:#ffecb2;font-size:15px;font-weight:800}.card-subtle{margin:22px 0 0;color:#8a8b86;font-size:11px;line-height:1.5}.documents-list{display:grid;gap:10px;margin:22px 0;padding:0;list-style:none;color:#353632;font-size:13px;font-weight:600;line-height:1.35}.documents-list li{display:flex;align-items:flex-start;gap:8px}.documents-list svg{flex:none;color:#b78800}.foreign-docs{display:flex;gap:11px;align-items:flex-start;padding-top:17px;border-top:1px solid #e9e9e5}.foreign-docs h4{margin:0;font-size:13px;line-height:1.3}.foreign-docs p{margin:5px 0 0;color:#686964;font-size:12px;line-height:1.45}.terms-note{margin:13px 0 0;color:#888;font-size:11px;line-height:1.5}
@media(max-width:1000px){.terms-grid{grid-template-columns:1fr 1fr}.deposit-card{grid-column:1/-1;min-height:0}.deposit-list{grid-template-columns:repeat(3,minmax(0,1fr));margin-bottom:20px}}
@media(max-width:650px){.rental-terms{margin:45px 0 40px}.terms-heading h2{font-size:30px}.terms-grid{grid-template-columns:1fr;gap:11px}.terms-card{min-height:0;padding:20px}.deposit-card{grid-column:auto}.deposit-list{grid-template-columns:1fr}.requirements{margin-top:18px}.card-subtle{margin-top:16px}.documents-list{margin:18px 0}.foreign-docs{padding-top:15px}}
</style>
