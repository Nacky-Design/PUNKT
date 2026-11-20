<script setup lang="ts">
import { computed } from 'vue';
import { ArrowLeft, ArrowRight } from 'lucide-vue-next';

const props = defineProps<{ detailId: string }>();
const article = {
  id: 'kak-osmotret-avtomobil',
  title: 'Как осмотреть автомобиль перед поездкой',
  intro: 'Что проверить при получении машины и какие снимки пригодятся при возврате.',
  date: '2026-11-20',
  dateLabel: '20 ноября 2026',
};
const articleLink = `#news/${article.id}`;
const isArticle = computed(() => props.detailId === article.id);
const assets = `${import.meta.env.BASE_URL}assets/`;
</script>

<template>
  <main class="interior-page">
    <div class="interior-container">
      <a :href="detailId ? '#news' : '#catalog'" class="interior-back">
        <ArrowLeft :size="16" aria-hidden="true" /> {{ detailId ? 'Все новости' : 'На главную' }}
      </a>

      <article v-if="isArticle" class="news-article">
        <header class="interior-heading">
          <time :datetime="article.date">{{ article.dateLabel }}</time>
          <h1>{{ article.title }}</h1>
          <p>{{ article.intro }}</p>
        </header>
        <figure class="article-cover">
          <img :src="assets + 'guide-inspection.webp'" alt="Два человека осматривают переднее крыло автомобиля" width="900" height="447" />
        </figure>
        <div class="article-copy">
          <h2>Обойдите автомобиль вместе с сотрудником</h2>
          <p>Осмотрите бамперы, пороги, диски и стёкла. Если заметите скол или царапину, попросите отметить её в акте. Снимите машину с нескольких сторон, а повреждения — крупным планом.</p>
          <h2>Сверьте пробег и уровень топлива</h2>
          <p>Сравните показания на приборной панели с данными в акте. Уточните, с каким уровнем топлива нужно вернуть машину, и сохраните снимок панели.</p>
          <figure>
            <img :src="assets + 'guide-delivery.webp'" alt="Передача ключей рядом с автомобилем" width="900" height="490" loading="lazy" />
            <figcaption>Сохраните фотографии и копию акта до возврата автомобиля.</figcaption>
          </figure>
          <h2>Проверьте, что всё нужное под рукой</h2>
          <p>Уточните место и время возврата, сохраните номер для связи и настройте кресло и зеркала перед выездом. Если осталось что-то непонятное, удобнее обсудить это ещё при получении.</p>
          <a href="#news" class="interior-back"><ArrowLeft :size="16" aria-hidden="true" /> Все новости</a>
        </div>
      </article>

      <header v-else-if="detailId" class="interior-heading">
        <h1>Новость не найдена<span>.</span></h1>
      </header>

      <template v-else>
        <header class="interior-heading">
          <h1>Новости<span>.</span></h1>
          <p>Новости «Пункта» и советы по аренде автомобилей.</p>
        </header>
        <a :href="articleLink" class="news-card">
          <img :src="assets + 'guide-inspection.webp'" alt="" width="900" height="447" />
          <div class="news-card-copy">
            <time :datetime="article.date">{{ article.dateLabel }}</time>
            <h2>{{ article.title }}</h2>
            <p>{{ article.intro }}</p>
            <span>Читать <ArrowRight :size="17" aria-hidden="true" /></span>
          </div>
        </a>
      </template>
    </div>
  </main>
</template>

<style scoped>
.news-card {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  align-items: stretch;
  max-width: 920px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e4e4df;
  border-radius: 14px;
}
.news-card img { width: 100%; height: 100%; aspect-ratio: 16 / 10; object-fit: cover; }
.news-card-copy { align-self: center; padding: clamp(20px, 4vw, 36px); }
time { display: block; margin-bottom: 10px; color: #62645e; font-size: 13px; }
.news-card h2 { font-size: clamp(22px, 2.5vw, 32px); line-height: 1.15; letter-spacing: -.035em; }
.news-card p { margin: 10px 0 18px; color: #5d5f5a; line-height: 1.55; }
.news-card span { display: inline-flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; }
.news-card:hover span { text-decoration: underline; text-underline-offset: 4px; }
.news-article { max-width: 980px; margin: 0 auto; }
.news-article .interior-heading { max-width: 680px; margin: 24px auto 28px; }
.news-article figure { margin: 0; }
.news-article img { display: block; width: 100%; height: auto; border-radius: 14px; }
.article-copy { max-width: 680px; margin: 38px auto 0; }
.article-copy h2 { font-size: clamp(23px, 2.5vw, 30px); line-height: 1.2; letter-spacing: -.035em; }
.article-copy p { margin: 12px 0 28px; color: #343631; font-size: 16px; line-height: 1.7; }
.article-copy figure { margin: 10px 0 30px; }
.article-copy figcaption { margin-top: 8px; color: #62645e; font-size: 13px; line-height: 1.45; }
@media (max-width: 700px) {
  .news-card { grid-template-columns: 1fr; }
  .news-card img { height: auto; }
  .article-copy { margin-top: 28px; }
}
</style>
