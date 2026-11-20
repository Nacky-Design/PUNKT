<template>
  <section class="company-intro-card" aria-labelledby="company-info-title">
    <div class="portrait-wrap">
      <img :src="`${base}assets/guide-delivery.webp`" alt="" width="180" height="180" loading="lazy" decoding="async" />
    </div>
    <div class="message-content">
      <h2 id="company-info-title">Прокат автомобилей в Москве</h2>
      <p class="company-intro">Выберите машину и даты. Перед оформлением уточните место получения и итоговую стоимость.</p>
      <a href="#about" class="interior-back">О компании <ArrowRight :size="16" aria-hidden="true" /></a>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ArrowRight } from "lucide-vue-next";
const base = import.meta.env.BASE_URL;
</script>

<style scoped>
.company-intro-card{display:flex;align-items:center;gap:30px;margin:38px 0 0;padding:28px 34px;border:1px solid #e7e7e1;border-radius:16px;background:#fff;box-shadow:0 8px 26px #17171708}
.portrait-wrap{flex:none;width:126px;height:126px;padding:4px;border:1px solid #e3d7a9;border-radius:50%;background:#fff8e1}
.portrait-wrap img{display:block;width:100%;height:100%;border-radius:50%;object-fit:cover}
.message-content{min-width:0}
 .company-intro{max-width:950px;margin:0;color:#242522;font-size:clamp(16px,1.4vw,19px);font-weight:600;line-height:1.55;letter-spacing:-.015em}
@media(max-width:650px){.company-intro-card{align-items:flex-start;gap:16px;margin-top:28px;padding:20px;border-radius:13px}.portrait-wrap{width:70px;height:70px;padding:3px} .company-intro{font-size:14px;line-height:1.55}}
@media(max-width:380px){.company-intro-card{display:block}.portrait-wrap{margin-bottom:15px}}
h2 { font-size: clamp(22px, 2vw, 28px); letter-spacing: -.035em; }
.company-intro { margin: 8px 0; }
</style>
