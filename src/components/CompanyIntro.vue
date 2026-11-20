<template>
  <section class="company-intro-card" aria-labelledby="company-info-title">
    <img class="director-portrait" :src="portrait" alt="Иллюстративный портрет" width="480" height="480" loading="lazy" decoding="async" />
    <h2 id="company-info-title">Обращение директора</h2>
    <blockquote>«Мы ценим каждого клиента и делаем всё, чтобы аренда была комфортной. До оформления согласуем окончательную стоимость — без скрытых надбавок. А если предусмотрен залог, вернём его вовремя, в срок, указанный в договоре».</blockquote>
    <p class="signature">Директор «Пункта»</p>
  </section>
</template>

<script setup lang="ts">
const portrait = `${import.meta.env.BASE_URL}assets/director-demo.webp`;
</script>

<style scoped>
.company-intro-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  grid-template-areas: "portrait title" "portrait quote" "portrait signature";
  align-items: start;
  gap: 10px 28px;
  margin-top: 38px;
  padding: clamp(20px, 4vw, 40px);
  border: 1px solid #e7e7e1;
  border-radius: 16px;
  background: #fff;
}
.director-portrait {
  grid-area: portrait;
  display: block;
  width: 126px;
  height: auto;
  aspect-ratio: 1;
  border: 1px solid #e3d7a9;
  border-radius: 50%;
  padding: 4px;
  background: #fff8e1;
  object-fit: cover;
}
h2 { grid-area: title; font-size: clamp(22px, 2vw, 28px); letter-spacing: -.035em; }
blockquote { grid-area: quote; max-width: 68ch; margin: 0; color: #343631; font-size: var(--type-body); line-height: 1.6; }
.signature { grid-area: signature; color: #53564d; font-size: var(--type-secondary); font-weight: 650; }
@media (max-width: 650px) {
  .company-intro-card { grid-template-areas: "portrait title" "quote quote" "signature signature"; gap: 12px; margin-top: 28px; }
  .director-portrait { width: 70px; padding: 3px; }
  h2 { align-self: center; line-height: 1.2; }
}
</style>
