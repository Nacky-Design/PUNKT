<script setup lang="ts">
import { Clock3, MapPin, Phone } from 'lucide-vue-next';
import MessengerIcons from './MessengerIcons.vue';
import { messengerLinks } from '../contact';

const navItems = [
  { label: 'Цены', href: '#prices' }, { label: 'Услуги', href: '#services' },
  { label: 'Условия', href: '#conditions' }, { label: 'Акции', href: '#promotions' },
  { label: 'Новости', href: '#news' }, { label: 'О компании', href: '#about' },
  { label: 'Контакты', href: '#contacts' },
];
const logoAsset = `${import.meta.env.BASE_URL}assets/logo-source.webp`;
const year = new Date().getFullYear();
</script>

<template>
  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-main">
        <div class="footer-brand-block">
          <a class="footer-brand" href="#catalog" aria-label="Пункт — к автопарку">
            <span :style="{ backgroundImage: `url('${logoAsset}')` }"></span>
          </a>
          <p>Автомобиль под ваши планы.</p>
        </div>

        <nav class="footer-nav" aria-label="Навигация в подвале">
          <p class="footer-label">НАВИГАЦИЯ</p>
          <div class="footer-nav-grid">
            <a v-for="item in navItems" :key="item.href" :href="item.href">{{ item.label }}</a>
          </div>
        </nav>

        <div class="footer-contact">
          <p class="footer-label">МЫ НА СВЯЗИ</p>
          <a class="footer-phone" href="tel:+74951041010"><Phone :size="18" aria-hidden="true" />8 495 104-10-10</a>
          <p><Clock3 :size="16" aria-hidden="true" />Пн–пт, 8:00–17:00 (МСК)</p>
          <p><MapPin :size="16" aria-hidden="true" />Москва, ул. Авиационная, 24с1</p>
        </div>

        <div class="footer-social">
          <p class="footer-label">МЕССЕНДЖЕРЫ</p>
          <MessengerIcons class="social-icons" icon-class="social-icon" :channels="['whatsapp', 'telegram', 'max']" />
          <p v-if="!messengerLinks.whatsapp || !messengerLinks.telegram || !messengerLinks.max" class="social-note">Ссылки на мессенджеры уточняются.</p>
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
.footer-brand-block p { margin:10px 0 0; color:#a9adab; font-size:var(--type-secondary); line-height:1.5; }
.footer-label { margin:0 0 16px; color:#9fa5a1; font-size:var(--type-secondary); font-weight:650; letter-spacing:.02em; }
.footer-nav-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:2px 24px; }
.footer-nav-grid a { display:flex; align-items:center; min-height:34px; text-align:left; color:#e5e7e5; font-size:var(--type-secondary); }
.footer-nav-grid a:hover,.footer-nav-grid a:focus-visible { color:#ffc107; }
.footer-contact p:not(.footer-label) { display:flex; align-items:center; gap:10px; margin:11px 0 0; color:#c3c8c4; font-size:var(--type-secondary); }
.footer-contact p:not(.footer-label) svg { color:#ffc107; }
.footer-phone { display:flex; align-items:center; min-height:44px; gap:9px; font-weight:700; font-size:17px; white-space:nowrap; }
.footer-phone svg { color:#ffc107; }
.footer-phone:hover { color:#ffc107; }
.social-icons { display:flex; gap:9px; align-items:center; }
.social-icons :deep(.social-icon) { display:grid; place-items:center; width:42px; height:44px; flex:none; color:#f4f4f2; }
.social-icons :deep(.social-icon svg) { width:22px; height:22px; }
.social-icons :deep(a.social-icon:hover) { color:#ffc107; }
.social-icons :deep(span.social-icon) { opacity:.8; }
.social-note { color:#a9adab; font-size:var(--type-secondary); line-height:1.4; margin:11px 0 0; }
.footer-bottom { display:flex; justify-content:space-between; align-items:end; gap:20px; margin-top:33px; padding-top:20px; border-top:1px solid #ffffff2b; color:#a9adab; font-size:var(--type-secondary); line-height:1.5; }
.footer-bottom p { margin:0; }
.footer-bottom-left { min-width:0; }
.footer-bottom .footer-copyright { margin-top:12px; }
.footer-credit { flex:none; color:#c5c8c6; text-decoration:none; text-align:right; }
.footer-credit:hover,.footer-credit:focus-visible { color:#ffc107; text-decoration:underline; }
.footer-legal { display:flex; justify-content:flex-start; align-items:center; flex-wrap:wrap; gap:10px 18px; text-align:left; }
.footer-legal span { color:#c5c8c6; }
.footer-legal small { color:#898f8b; font-size:10px; width:100%; }
@media (max-width:1000px) { .footer-main, .footer-main:has(.footer-social) { grid-template-columns:1fr 1fr; gap:28px; } .footer-main > * + * { border-left:0; padding-left:0; min-height:0; } .footer-main > :nth-child(even) { padding-left:24px; border-left:1px solid #ffffff28; } }
@media (max-width:600px) {
  .site-footer { padding:29px 16px 20px; }
  .footer-main, .footer-main:has(.footer-social) { grid-template-columns: minmax(0, 1fr); gap:22px; }
  .footer-main > :nth-child(even) { padding-left:0; border-left:0; }
  .footer-brand { width:145px; height:51px; }
  .footer-label { margin-bottom:8px; }
  .footer-nav-grid { grid-template-columns:repeat(2,minmax(0,1fr)); gap:0 18px; }
  .footer-nav-grid a { min-height:40px; }
  .footer-phone { font-size:16px; }
  .footer-contact p:not(.footer-label) { margin-top:6px; line-height:1.35; }
  .footer-bottom { margin-top:20px; padding-top:16px; gap:12px; align-items:flex-end; }
  .footer-bottom .footer-copyright { margin:0; }
  .footer-credit { flex:0 1 12ch; }
}

.site-footer { --focus-ring: #b7c1bc; }
.footer-contact p svg { flex: none; }
</style>
