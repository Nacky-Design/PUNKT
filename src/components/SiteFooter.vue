<script setup lang="ts">
import { Clock3, MapPin, Phone } from 'lucide-vue-next';
import HeaderMessengerIcon from './HeaderMessengerIcon.vue';
import { messengerLinks } from '../contact';

const emit = defineEmits<{ navigate: [item: string] }>();
const navItems = ['Цены', 'Услуги', 'Условия', 'Акции', 'Новости', 'О компании', 'Контакты'];
const logoAsset = `${import.meta.env.BASE_URL}assets/logo-source.webp`;
const year = new Date().getFullYear();
</script>

<template>
  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-main">
        <div class="footer-brand-block">
          <button class="footer-brand" type="button" aria-label="Пункт — к автопарку" @click="emit('navigate', 'Автопарк')">
            <span :style="{ backgroundImage: `url('${logoAsset}')` }"></span>
          </button>
          <p>Автомобиль под ваши планы.</p>
        </div>

        <nav class="footer-nav" aria-label="Навигация в подвале">
          <p class="footer-label">НАВИГАЦИЯ</p>
          <div class="footer-nav-grid">
            <button v-for="item in navItems" :key="item" type="button" @click="emit('navigate', item)">{{ item }}</button>
          </div>
        </nav>

        <div class="footer-contact">
          <p class="footer-label">МЫ НА СВЯЗИ</p>
          <a class="footer-phone" href="tel:+74951041010"><Phone :size="18" aria-hidden="true" />8 495 104-10-10</a>
          <p><Clock3 :size="16" aria-hidden="true" />Пн–пт, 8:00–17:00 (МСК)</p>
          <p><MapPin :size="16" aria-hidden="true" />Москва, ул. Авиационная, 24с1</p>
        </div>

        <div v-if="messengerLinks.telegram || messengerLinks.whatsapp || messengerLinks.max" class="footer-social">
          <p class="footer-label">МЕССЕНДЖЕРЫ</p>
          <div class="social-icons" aria-label="Мессенджеры">
            <a v-if="messengerLinks.whatsapp" class="social-icon whatsapp" :href="messengerLinks.whatsapp" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><HeaderMessengerIcon kind="whatsapp" /></a>
            <a v-if="messengerLinks.telegram" class="social-icon" :href="messengerLinks.telegram" target="_blank" rel="noopener noreferrer" aria-label="Telegram"><HeaderMessengerIcon kind="telegram" /></a>
            <a v-if="messengerLinks.max" class="social-icon" :href="messengerLinks.max" target="_blank" rel="noopener noreferrer" aria-label="Max"><HeaderMessengerIcon kind="max" /></a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="footer-bottom-left">
          <p class="footer-copyright">© {{ year }} Пункт. Прокат автомобилей. Все права защищены.</p>
        </div>
        <a class="footer-credit" href="https://relevant.ru/" target="_blank" rel="noopener noreferrer">Разработка Relevant Ai</a>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer { background:#1c1e1e; color:#f7f7f5; padding:44px 32px 25px; }
.footer-inner { width:min(100%, 1380px); margin:0 auto; }
.footer-main { display:grid; grid-template-columns:1.1fr 1.05fr 1.25fr; gap:30px; align-items:start; }
.footer-main:has(.footer-social) { grid-template-columns: 1.1fr 1.05fr 1.25fr .8fr; }
.footer-main > * + * { border-left:1px solid #ffffff28; padding-left:30px; min-height:108px; }
.footer-brand { display:block; position:relative; width:175px; height:60px; padding:0; overflow:hidden; }
.footer-brand span { position:absolute; inset:0; background-position:50% 45.5%; background-repeat:no-repeat; background-size:calc(100% + 10px) auto; filter:url(#logo-white); }
.footer-brand-block p { margin:10px 0 0; color:#a9adab; font-size:12px; line-height:1.5; }
.footer-label { margin:0 0 16px; color:#9fa5a1; font-size:10px; font-weight:700; letter-spacing:.13em; }
.footer-nav-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:11px 24px; }
.footer-nav-grid button { padding:0; text-align:left; color:#e5e7e5; font-size:13px; }
.footer-nav-grid button:hover,.footer-nav-grid button:focus-visible { color:#ffc107; }
.footer-contact p:not(.footer-label) { display:flex; align-items:center; gap:10px; margin:11px 0 0; color:#c3c8c4; font-size:12px; white-space:nowrap; }
.footer-contact p:not(.footer-label) svg { color:#ffc107; }
.footer-phone { display:flex; align-items:center; gap:9px; font-weight:700; font-size:17px; white-space:nowrap; }
.footer-phone svg { color:#ffc107; }
.footer-phone:hover { color:#ffc107; }
.social-icons { display:flex; gap:9px; align-items:center; }
.social-icon { display:grid; place-items:center; width:34px; height:34px; flex:none; }
.social-icon svg { width:24px; height:24px; }
.social-icon { color:#f4f4f2; }
.social-icon.whatsapp { color:#f4f4f2; }
.social-icon.whatsapp svg { width:21px; height:21px; }
.social-note { color:#a9adab; font-size:11px; line-height:1.4; margin:11px 0 0; }
.footer-bottom { display:flex; justify-content:space-between; align-items:end; gap:20px; margin-top:33px; padding-top:20px; border-top:1px solid #ffffff2b; color:#a9adab; font-size:11px; line-height:1.5; }
.footer-bottom p { margin:0; }
.footer-bottom-left { min-width:0; }
.footer-bottom .footer-copyright { margin-top:12px; }
.footer-credit { flex:none; color:#c5c8c6; text-decoration:none; text-align:right; }
.footer-credit:hover,.footer-credit:focus-visible { color:#ffc107; text-decoration:underline; }
.footer-legal { display:flex; justify-content:flex-start; align-items:center; flex-wrap:wrap; gap:10px 18px; text-align:left; }
.footer-legal span { color:#c5c8c6; }
.footer-legal small { color:#898f8b; font-size:10px; width:100%; }
@media (max-width:1000px) { .footer-main, .footer-main:has(.footer-social) { grid-template-columns:1fr 1fr; gap:28px; } .footer-main > * + * { border-left:0; padding-left:0; min-height:0; } .footer-main > :nth-child(even) { padding-left:24px; border-left:1px solid #ffffff28; } }
@media (max-width:600px) { .site-footer { padding:35px 16px 24px; } .footer-main { gap:25px 18px; } .footer-main > :nth-child(even) { padding-left:16px; } .footer-brand { width:145px; height:51px; } .footer-nav-grid { grid-template-columns:1fr; gap:10px; } .footer-phone { font-size:14px; } .footer-contact p:not(.footer-label) { white-space:normal; line-height:1.35; } .footer-contact p:not(.footer-label) svg { flex:none; } .footer-bottom { margin-top:25px; gap:12px; } .footer-legal { gap:8px 14px; } }
@media (max-width:360px) { .footer-main, .footer-main:has(.footer-social) { grid-template-columns:1fr; } .footer-main > :nth-child(even) { border-left:0; padding-left:0; } .footer-nav-grid { grid-template-columns:1fr 1fr; } }
</style>
