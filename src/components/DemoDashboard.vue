<script setup lang="ts">
import { computed, ref } from 'vue';
import { ArrowRight, Building2, CalendarDays, Camera, CarFront, ChevronRight, ClipboardList, FileText, LayoutGrid, LogOut, Mail, MapPin, Phone, UserRound } from 'lucide-vue-next';
import DemoCarPhotos from './DemoCarPhotos.vue';
import HeaderMessengerIcon from './HeaderMessengerIcon.vue';
import { messengerLinks } from '../contact';
import { profileInitials } from '../data';

const props = defineProps<{ user: { name: string; role: 'client' | 'rental'; kind: 'person' | 'company'; email: string; phone: string } }>();
const emit = defineEmits<{ catalog: []; logout: [] }>();
type Section = 'overview' | 'activity' | 'photos' | 'profile';
const section = ref<Section>('overview');
const roleLabel = computed(() => props.user.role === 'client' ? 'Клиент' : 'Прокатчик');
const activityLabel = computed(() => props.user.role === 'client' ? 'Мои аренды' : 'Мои автомобили');
const displayName = computed(() => props.user.name.trim() || (props.user.kind === 'company' ? 'ООО «Пример»' : 'Гость'));
const initials = computed(() => profileInitials(displayName.value, props.user.kind === 'company' ? 'К' : 'П'));
const dateOffset = (days: number) => { const date = new Date(); date.setHours(12, 0, 0, 0); date.setDate(date.getDate() + days); return date; };
const dateLabel = (date: Date) => new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
const dateInput = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const rentalStart = dateLabel(dateOffset(-2));
const rentalEnd = dateLabel(dateOffset(3));
const minimumExtension = dateInput(dateOffset(4));
const extensionDate = ref(minimumExtension);
const extensionOpen = ref(false);
const extensionPrepared = ref(false);
const requestedDate = ref('');
function prepareExtension() { requestedDate.value = extensionDate.value; extensionPrepared.value = true; extensionOpen.value = false; }
</script>

<template>
  <main class="cabinet">
    <div class="cabinet-container">
      <div class="cabinet-topline"><button class="back-link" type="button" @click="emit('catalog')">← На главную</button><div class="cabinet-top-actions"><button class="logout" type="button" @click="emit('logout')"><LogOut :size="18" aria-hidden="true" /> Выйти</button></div></div>
      <div class="cabinet-header">
        <div><h1>{{ user.kind === 'company' ? 'Кабинет компании' : `Здравствуйте, ${displayName}` }}<span>.</span></h1><p class="subtitle">{{ roleLabel }} · {{ user.kind === 'company' ? 'Юридическое лицо' : 'Частное лицо' }}</p></div>
      </div>
      <div class="cabinet-layout">
        <aside class="sidebar" aria-label="Меню кабинета">
          <div class="identity"><span class="avatar">{{ initials }}</span><div><strong>{{ displayName }}</strong><small>{{ roleLabel }}</small></div></div>
          <nav aria-label="Разделы кабинета">
            <button type="button" :class="{active: section === 'overview'}" :aria-current="section === 'overview' ? 'page' : undefined" @click="section = 'overview'"><LayoutGrid :size="19" aria-hidden="true" /> Обзор <ChevronRight :size="15" aria-hidden="true" /></button>
            <button type="button" :class="{active: section === 'activity'}" :aria-current="section === 'activity' ? 'page' : undefined" @click="section = 'activity'"><ClipboardList :size="19" aria-hidden="true" /> {{ activityLabel }} <ChevronRight :size="15" aria-hidden="true" /></button>
            <button v-if="user.role === 'client'" type="button" :class="{active: section === 'photos'}" :aria-current="section === 'photos' ? 'page' : undefined" @click="section = 'photos'"><Camera :size="19" aria-hidden="true" /> Фото автомобиля <ChevronRight :size="15" aria-hidden="true" /></button>
            <button type="button" :class="{active: section === 'profile'}" :aria-current="section === 'profile' ? 'page' : undefined" @click="section = 'profile'"><UserRound :size="19" aria-hidden="true" /> {{ user.kind === 'company' ? 'Реквизиты' : 'Профиль' }} <ChevronRight :size="15" aria-hidden="true" /></button>
          </nav>
          <div v-if="user.role === 'client'" class="cashback"><div><span>Мои баллы</span></div><strong>300</strong></div>
        </aside>
        <div class="cabinet-content">
          <div v-if="user.role === 'client' && (section === 'overview' || section === 'activity')" class="demo-notice"><span class="notice-mark">i</span><p>Здесь показан пример поездки. Чтобы изменить условия реальной аренды, свяжитесь с «Пунктом».</p></div>
          <section class="support-card" aria-label="Связь с техподдержкой">
            <div><h2>Техподдержка</h2><p>Поможем с вопросами по аренде.</p></div>
            <div class="support-actions"><div class="direct-contacts"><a class="support-phone" href="tel:+74951041010"><Phone :size="16" aria-hidden="true" /> 8 495 104-10-10</a><a class="support-mail" href="mailto:info@punktprokat.ru"><Mail :size="16" aria-hidden="true" /> info@punktprokat.ru</a></div>
              <div v-if="messengerLinks.telegram || messengerLinks.max" class="messengers" aria-label="Мессенджеры"><a v-if="messengerLinks.telegram" :href="messengerLinks.telegram" target="_blank" rel="noopener noreferrer"><HeaderMessengerIcon kind="telegram" /> Telegram</a><a v-if="messengerLinks.max" :href="messengerLinks.max" target="_blank" rel="noopener noreferrer"><HeaderMessengerIcon kind="max" /> Max</a></div></div>
          </section>

          <template v-if="user.role === 'client' && (section === 'overview' || section === 'activity')">
            <div class="section-title"><div><h2>{{ section === 'overview' ? 'Ваша поездка' : 'Мои аренды' }}</h2></div><span class="status"><span></span> Пример поездки</span></div>
            <article class="rental-card">
              <div class="rental-body"><div class="rental-heading"><div><h3>Hyundai Solaris</h3><p class="rental-specs">Эконом · Автомат · 5 мест</p></div><p class="booking-number">Заказ № PUNKT-261117</p></div>
                <div class="rental-dates"><div><span>Получение</span><strong>{{ rentalStart }}</strong><small>10:00 · Офис на Авиационной</small></div><div><span>Возврат</span><strong>{{ rentalEnd }}</strong><small>10:00 · Офис на Авиационной</small></div></div>
                <button class="extend-button" type="button" @click="extensionOpen = !extensionOpen"><CalendarDays :size="17" aria-hidden="true" /> Уточнить продление аренды</button>
                <p v-if="extensionPrepared" class="inline-result" role="status">Назовите новую дату возврата при звонке: {{ dateLabel(new Date(requestedDate + 'T12:00:00')) }}.</p>
                <form v-if="extensionOpen" class="extension-form" @submit.prevent="prepareExtension"><label for="extension-date">Новая дата возврата</label><div><input id="extension-date" v-model="extensionDate" type="date" :min="minimumExtension" required /><button type="submit">Проверить дату</button></div></form>
              </div>
            </article>

          </template>

          <template v-else-if="section === 'photos' && user.role === 'client'"><div class="section-title"><div><h2>Фото автомобиля</h2><p>Зафиксируйте состояние автомобиля и подготовьте фотографии для офиса.</p></div></div></template>
          <template v-else-if="section === 'profile'"><div class="section-title"><div><h2>{{ user.kind === 'company' ? 'Реквизиты компании' : 'Профиль' }}</h2></div></div>
            <section class="content-card profile-details"><div class="profile-heading"><span class="avatar large">{{ initials }}</span><div><h3>{{ displayName }}</h3><p>{{ user.kind === 'company' ? 'Юридическое лицо' : 'Частное лицо' }}</p></div></div>
              <dl v-if="user.kind === 'company'"><div><dt><Building2 :size="17" /> Название компании</dt><dd>{{ user.name || 'ООО «Пример»' }}</dd></div><div><dt>ИНН</dt><dd>Не указан</dd></div><div><dt>КПП</dt><dd>Не указан</dd></div><div><dt>ОГРН</dt><dd>Не указан</dd></div><div><dt><MapPin :size="17" /> Юридический адрес</dt><dd>Не указан</dd></div><div><dt><Phone :size="17" /> Телефон</dt><dd>{{ user.phone || 'Не указан' }}</dd></div><div><dt><Mail :size="17" /> E-mail</dt><dd>{{ user.email || 'Не указан' }}</dd></div></dl>
              <dl v-else><div><dt><UserRound :size="17" /> Имя</dt><dd>{{ displayName }}</dd></div><div><dt><Phone :size="17" /> Телефон</dt><dd>{{ user.phone || 'Не указан' }}</dd></div><div><dt><Mail :size="17" /> E-mail</dt><dd>{{ user.email || 'Не указан' }}</dd></div></dl>
            </section>
          </template>
          <template v-else><div class="section-title"><div><h2>{{ section === 'overview' ? 'Обзор' : activityLabel }}</h2></div></div><section class="content-card empty-state"><span class="card-icon"><CarFront :size="25" /></span><h3>В этом профиле нет автомобилей</h3><button class="catalog-button" type="button" @click="emit('catalog')">Посмотреть автопарк <ArrowRight :size="17" /></button></section></template>
          <DemoCarPhotos v-if="user.role === 'client'" v-show="section === 'photos' || section === 'overview' || section === 'activity'" :class="{ 'photos-overview': section !== 'photos' }" />
          <template v-if="user.role === 'client' && (section === 'overview' || section === 'activity')">
            <article class="content-card quick-card documents-card"><span class="card-icon"><FileText :size="21" aria-hidden="true" /></span><div><h3>Документы и история</h3><p><a href="#conditions">Запросить документы по аренде</a></p></div></article>

          </template>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.cabinet{min-height:calc(100vh - 94px);background:#f7f7f5;color:#191919;padding:30px 24px 72px}.cabinet-container{max-width:1280px;margin:0 auto}.cabinet-topline{display:flex;align-items:center;justify-content:space-between;gap:12px}.back-link{padding:0;font-size:13px;color:#686864}.demo-badge{display:flex;align-items:center;gap:7px;padding:7px 10px;border:1px solid #e4e4df;border-radius:20px;background:#fff;font-size:11px;font-weight:650;color:#666}.demo-badge span,.status span{width:7px;height:7px;border-radius:50%;background:#dbad19}.cabinet-header{display:flex;align-items:end;justify-content:space-between;gap:20px;margin:30px 0 28px}.eyebrow{font-size:10px;letter-spacing:.15em;font-weight:750;color:#8a8a85;margin:0 0 9px}.cabinet-header h1{font-size:clamp(30px,3.4vw,46px);line-height:1.08;letter-spacing:-.045em;overflow-wrap:anywhere}.cabinet-header h1 span{color:#e1af09}.subtitle{margin-top:9px;font-size:14px;color:#777}.catalog-button,.extend-button,.extension-form button{display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:13px 17px;border-radius:9px;background:#ffc107;font-weight:700;font-size:13px}.catalog-button:hover,.extend-button:hover,.extension-form button:hover{background:#ffd047}.cabinet-layout{display:grid;grid-template-columns:245px minmax(0,1fr);gap:22px;align-items:start}.sidebar,.content-card,.rental-card{background:#fff;border:1px solid #e6e6e1;border-radius:14px}.sidebar{padding:18px}.identity{display:flex;align-items:center;gap:11px;min-width:0;padding:0 0 18px;border-bottom:1px solid #eee}.identity div{min-width:0}.identity strong,.identity small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.identity strong{font-size:14px}.identity small{margin-top:4px;color:#888;font-size:12px}.avatar{display:grid;place-items:center;flex:none;width:43px;height:43px;border-radius:50%;background:#fff1be;font-size:14px;font-weight:750;color:#29230f}.sidebar nav{display:grid;gap:3px;margin:16px -6px}.sidebar nav button{display:flex;align-items:center;gap:10px;width:100%;padding:11px 10px;border-radius:8px;text-align:left;font-size:13px;color:#60605d}.sidebar nav button svg:last-child{margin-left:auto}.sidebar nav button.active{background:#fff4d4;color:#1e1d17;font-weight:700}.sidebar nav button:hover:not(.active){background:#f5f5f3}.logout{display:flex;align-items:center;gap:10px;padding:12px 4px 0;border-top:1px solid #eee;width:100%;font-size:13px;color:#777}.cabinet-content{min-width:0}.demo-notice{display:flex;align-items:flex-start;gap:10px;padding:13px 15px;border:1px solid #f0e0ae;border-radius:10px;background:#fff9e8;font-size:12px;color:#675c3c;line-height:1.45}.notice-mark{display:grid;place-items:center;flex:none;width:17px;height:17px;border:1px solid #c09a32;border-radius:50%;font-size:11px;font-weight:700}.section-title{display:flex;justify-content:space-between;align-items:end;gap:16px;margin:28px 0 16px}.section-title h2{font-size:26px;letter-spacing:-.035em}.section-title>div>p:last-child:not(.eyebrow){margin-top:6px;color:#777;font-size:13px;line-height:1.45}.status{display:flex;align-items:center;gap:7px;padding:8px 11px;border-radius:20px;background:#eaf6ec;color:#346e3f;font-size:11px;font-weight:700;white-space:nowrap}.status span{background:#4b9a5d}.rental-card{display:grid;grid-template-columns:minmax(210px,.85fr) minmax(0,1.15fr);overflow:hidden}.rental-body{padding:24px}.rental-body h3{font-size:24px;letter-spacing:-.035em}.rental-specs{margin-top:6px;color:#777;font-size:12px}.rental-dates{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:21px 0;padding:17px 0;border-top:1px solid #eee;border-bottom:1px solid #eee}.rental-dates span,.rental-dates strong,.rental-dates small{display:block}.rental-dates span{color:#888;font-size:11px}.rental-dates strong{margin-top:6px;font-size:14px}.rental-dates small{margin-top:5px;color:#777;font-size:11px;line-height:1.4}.extension-form{margin-top:14px;padding:15px;border-radius:10px;background:#f7f7f5}.extension-form label{display:block;margin-bottom:7px;font-size:12px;font-weight:700}.extension-form>div{display:flex;gap:8px}.extension-form input{min-width:0;padding:10px;border:1px solid #deded8;border-radius:8px;background:#fff;font:inherit;font-size:13px}.extension-form button{padding:10px 12px}.extension-form p,.inline-result{margin-top:10px;color:#777;font-size:11px;line-height:1.5}.inline-result{color:#517145}.dashboard-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px}.content-card{padding:21px}.quick-card{display:flex;gap:14px}.card-icon{display:grid;place-items:center;flex:none;width:43px;height:43px;border-radius:10px;background:#fff3cd}.content-card h3{font-size:16px;letter-spacing:-.02em}.quick-card p,.empty-state p{margin-top:7px;color:#777;font-size:12px;line-height:1.55}.text-action{display:inline-flex;align-items:center;gap:6px;margin-top:12px;padding:0;color:#5b4a11;font-size:12px;font-weight:750}.small-label{display:inline-block;margin-top:12px;color:#93938e;font-size:11px}.support-card{display:flex;justify-content:space-between;gap:20px;margin-top:14px;padding:25px;border-radius:14px;background:#202424;color:#fff}.support-card .eyebrow{color:#f5cb4c}.support-card h2{font-size:21px;letter-spacing:-.03em}.support-card p:last-child{margin-top:7px;color:#c9ceca;font-size:12px}.support-actions{min-width:210px}.support-phone{display:flex;align-items:center;gap:8px;font-size:16px;font-weight:750}.messengers{display:flex;flex-wrap:wrap;gap:7px;margin-top:12px}.messengers a,.messengers span{display:flex;align-items:center;gap:6px;padding:7px 9px;border:1px solid #555b59;border-radius:7px;color:#fff;font-size:11px}.support-actions small{display:block;margin-top:9px;color:#afb4b0;font-size:10px}.profile-details{padding:24px}.profile-heading{display:flex;align-items:center;gap:13px}.avatar.large{width:54px;height:54px;font-size:17px}.profile-heading h3{font-size:18px;overflow-wrap:anywhere}.profile-heading p{margin-top:4px;color:#777;font-size:13px}.profile-details dl{margin:24px 0 0;border-top:1px solid #eee}.profile-details dl>div{display:flex;justify-content:space-between;gap:18px;padding:15px 0;border-bottom:1px solid #eee;font-size:13px}.profile-details dt{display:flex;align-items:center;gap:8px;color:#777}.profile-details dd{margin:0;text-align:right;overflow-wrap:anywhere}.profile-note{margin-top:16px;color:#888;font-size:12px}.empty-state{padding:40px;text-align:center}.empty-state .card-icon{margin:0 auto 16px}.empty-state p{margin:8px auto 18px}
@media(max-width:800px){.cabinet-layout{grid-template-columns:minmax(0,1fr)}.sidebar{min-width:0;padding:12px}.identity{display:none}.sidebar nav{display:flex;gap:5px;margin:0;overflow-x:auto}.sidebar nav button{width:auto;flex:none}.sidebar nav button svg:last-child{display:none}.logout{margin-top:8px;padding:10px;border-top:1px solid #eee}.cabinet-header{margin:24px 0 20px}.cabinet-header h1{font-size:32px}}
@media(max-width:560px){.cabinet{padding:20px 16px 48px}.cabinet-header{display:block}.cabinet-header h1{font-size:29px}.catalog-button{margin-top:16px}.demo-badge{font-size:10px}.section-title{margin:22px 0 14px;align-items:start;flex-direction:column;gap:10px}.rental-card{grid-template-columns:1fr}.rental-body{padding:19px}.rental-dates{gap:12px}.dashboard-grid{grid-template-columns:1fr}.support-card{flex-direction:column;padding:20px}.profile-details dl>div{display:block}.profile-details dd{margin-top:7px;text-align:left}.extension-form>div{flex-wrap:wrap}.extension-form input,.extension-form button{width:100%}}
.support-card{align-items:center}.support-actions{min-width:0}.direct-contacts{display:flex;align-items:center;gap:18px;flex-wrap:wrap}.support-mail{display:flex;align-items:center;gap:7px;color:#fff;font-size:13px}.messengers svg{width:16px;height:16px;flex:none}.photos-overview,.documents-card{margin-top:14px}
.cashback{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 0 14px;padding:13px 12px;border:1px solid #e4efe5;border-radius:9px;background:#f5faf5}.cashback span,.cashback small{display:block}.cashback span{color:#414741;font-size:12px;font-weight:700}.cashback small{margin-top:4px;color:#879087;font-size:10px}.cashback strong{color:#27864b;font-size:19px;white-space:nowrap}
@media(max-width:800px){.cashback{margin:12px 0 0}.logout{margin-top:8px}}
@media(max-width:560px){.support-card{align-items:stretch}.direct-contacts{gap:10px;flex-direction:column;align-items:flex-start}}
.cabinet-top-actions{display:flex;align-items:center;justify-content:flex-end;gap:10px;flex-wrap:wrap}.cabinet-top-actions .logout{width:auto;min-height:36px;margin:0;padding:7px 10px;border:1px solid #e4e4df;border-radius:20px;background:#fff;color:#666}.cabinet-top-actions .logout:hover{background:#f2f2ef}.cabinet-top-actions .logout svg{flex:none}
@media(max-width:560px){.cabinet-topline{flex-wrap:wrap}.cabinet-top-actions{gap:8px}.cabinet-top-actions .logout{font-size:12px}}
.rental-card{display:block}.rental-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}.booking-number{padding:7px 10px;border-radius:8px;background:#f5f5f3;color:#686864;font-size:12px;font-weight:700;white-space:nowrap}
@media(max-width:560px){.rental-heading{flex-wrap:wrap;gap:12px}}
</style>
