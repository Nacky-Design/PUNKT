<template>
  <section class="company-intro-card" aria-labelledby="company-info-title">
    <span class="quote-mark" aria-hidden="true"><Quote :size="38" :stroke-width="1.5" /></span>
    <div class="message-content">
      <h2 id="company-info-title">Обращение директора</h2>
      <blockquote>«Мы ценим каждого клиента и делаем всё, чтобы аренда была комфортной. До оформления согласуем окончательную стоимость — без скрытых надбавок. А если предусмотрен залог, вернём его вовремя, в срок, указанный в договоре».</blockquote>
      <p class="signature">Директор «Пункта»</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Quote } from "lucide-vue-next";
</script>

<style scoped>
.company-intro-card { display: flex; align-items: flex-start; gap: 28px; margin-top: 38px; padding: clamp(20px, 4vw, 40px); border: 1px solid #e7e7e1; border-radius: 16px; background: #fff; }
.quote-mark { display: grid; place-items: center; flex: none; width: 72px; height: 72px; border-radius: 14px; background: #fff2c8; color: #4e3b05; }
.message-content { min-width: 0; }
h2 { font-size: clamp(22px, 2vw, 28px); letter-spacing: -.035em; }
blockquote { max-width: 68ch; margin: 10px 0 14px; color: #343631; font-size: var(--type-body); line-height: 1.6; }
.signature { color: #53564d; font-size: var(--type-secondary); font-weight: 650; }
@media (max-width: 650px) {
  .company-intro-card { display: grid; gap: 14px; margin-top: 28px; }
  .quote-mark { width: 48px; height: 48px; border-radius: 10px; }
  .quote-mark svg { width: 26px; height: 26px; }
}
</style>
