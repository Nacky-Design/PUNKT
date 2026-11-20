<script setup lang="ts">
import { computed, ref } from 'vue';
import { ArrowUpRight, ChevronDown, Phone } from 'lucide-vue-next';
import HeaderMessengerIcon from './HeaderMessengerIcon.vue';

const props = defineProps<{ messengerLinks?: { telegram?: string; max?: string } }>();
const messengers = computed(() => [
  { kind: 'telegram' as const, label: 'Telegram', href: props.messengerLinks?.telegram },
  { kind: 'max' as const, label: 'Max', href: props.messengerLinks?.max },
]);
const active = ref<number | null>(0);
const questions = [
  {
    question: 'Как выбрать автомобиль и оформить заявку?',
    answer: 'Укажите даты и место получения, затем выберите автомобиль в каталоге. Чтобы согласовать аренду, позвоните нам.',
  },
  {
    question: 'Можно ли согласовать аренду заранее?',
    answer: 'Свяжитесь с нами по телефону и расскажите, когда и где вам нужен автомобиль. Наличие машины, время выдачи и условия согласуем до оформления.',
  },
  {
    question: 'От чего зависит стоимость аренды?',
    answer: 'Цена за сутки зависит от автомобиля, лимита пробега и выбранных опций. Итог за поездку рассчитывается после выбора дат в карточке.',
    link: { href: '#prices', label: 'Посмотреть цены за сутки' },
  },
  {
    question: 'Какие документы нужны для аренды?',
    answer: 'Для оформления понадобятся паспорт и водительское удостоверение. Требования к водителю и другим документам уточним до подтверждения аренды.',
  },
  {
    question: 'Можно ли получить автомобиль с доставкой?',
    answer: 'В подборе можно указать адрес в Москве или выбрать аэропорт. Дневная доставка по Москве бесплатна.',
    link: { href: '#prices/services', label: 'Тарифы доставки' },
  },
  {
    question: 'Нужен ли залог?',
    answer: 'Размер залога указан в ценах и карточке автомобиля. Возможность аренды без залога зависит от условий поездки и арендатора.',
    link: { href: '#conditions/deposit', label: 'Когда можно без залога' },
  },
  {
    question: 'Как работает лимит пробега?',
    answer: 'Выберите 100, 250 или 500 км в сутки. Цена меняется с выбранным лимитом. Пробег сверх лимита оплачивается отдельно.',
    link: { href: '#prices', label: 'Сравнить тарифы по пробегу' },
  },
  {
    question: 'Можно ли добавить второго водителя или детское кресло?',
    answer: 'Отметьте нужные опции в параметрах автомобиля. Их наличие и стоимость уточните для выбранного автомобиля.',
  },
  {
    question: 'Как продлить аренду или изменить даты?',
    answer: 'Позвоните нам, чтобы обсудить новые даты. Возможность продления зависит от наличия автомобиля; срок и стоимость согласуем отдельно.',
  },
];
</script>

<template>
  <section class="faq" aria-labelledby="faq-title">
    <div class="faq-heading"><h2 id="faq-title">Частые вопросы<span>.</span></h2></div>
    <div class="faq-layout">
      <div class="faq-list">
        <article v-for="(item, index) in questions" :key="item.question" class="faq-item" :class="{ 'is-open': active === index }">
          <h3><button type="button" :aria-expanded="active === index" :aria-controls="`faq-answer-${index}`" @click="active = active === index ? null : index"><span>{{ item.question }}</span><span class="faq-toggle"><ChevronDown :size="20" aria-hidden="true" /></span></button></h3>
          <div v-show="active === index" :id="`faq-answer-${index}`" class="faq-answer"><p>{{ item.answer }}</p><a v-if="item.link" :href="item.link.href">{{ item.link.label }} <ArrowUpRight :size="16" aria-hidden="true" /></a></div>
        </article>
      </div>
      <aside class="help-card" aria-labelledby="help-title">
        <div class="help-decor" aria-hidden="true"></div>
        <div class="help-content">
          <p class="help-eyebrow">Мы на связи</p>
          <h2 id="help-title">Не нашли ответ на свой вопрос?</h2>
          <p class="help-copy">Задайте его нашим специалистам</p>
          <a class="help-phone" href="tel:+74951041010"><span class="phone-icon"><Phone :size="21" aria-hidden="true" /></span><span>8 495 104-10-10</span><ArrowUpRight :size="18" aria-hidden="true" /></a>
          <div class="messengers" role="group" aria-label="Мессенджеры">
            <component v-for="messenger in messengers" :key="messenger.kind" :is="messenger.href ? 'a' : 'span'"
              class="messenger-chip" :href="messenger.href"
              :target="messenger.href ? '_blank' : undefined" :rel="messenger.href ? 'noopener noreferrer' : undefined">
              <HeaderMessengerIcon :kind="messenger.kind" />{{ messenger.label }}
            </component>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.faq{padding:54px 0 8px;border-top:1px solid #e2e2de;margin-top:46px}.faq-heading{margin-bottom:26px}.eyebrow{margin:0 0 10px;color:#858581;font-size:10px;font-weight:750;letter-spacing:.15em}.faq-heading h2{font-size:clamp(30px,3vw,40px);letter-spacing:-.045em;line-height:1.1}.faq-heading h2 span{color:#e0ab00}.faq-heading>p:last-child{margin:8px 0 0;color:#777;font-size:14px}.faq-layout{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(290px,1fr);align-items:start;gap:20px}.faq-list{display:grid;gap:10px;min-width:0}.faq-item{border:1px solid #e5e5e1;border-radius:12px;background:#fff;overflow:hidden}.faq-item h3{margin:0}.faq-item h3 button{display:flex;width:100%;align-items:center;justify-content:space-between;gap:18px;padding:20px 22px;text-align:left;font-size:15px;font-weight:700;line-height:1.4}.faq-item h3 button:hover .faq-toggle{background:#ffe7a0}.faq-toggle{display:grid;place-items:center;flex:none;width:34px;height:34px;border-radius:50%;background:#f1f1ef;color:#1d1d1d;transition:background .2s}.faq-toggle svg{transition:transform .2s}.is-open .faq-toggle{background:#ffc107}.is-open .faq-toggle svg{transform:rotate(180deg)}.faq-answer{padding:0 70px 22px 22px}.faq-answer p{margin:0;color:#666863;font-size:14px;line-height:1.6}.help-card{position:relative;overflow:hidden;border-radius:14px;background:#202727;color:#fff;isolation:isolate}.help-card::before{content:"";position:absolute;inset:0;background:linear-gradient(135deg,#60655b99,transparent 57%),linear-gradient(180deg,#1b2720 0%,#151a1a 100%);z-index:-2}.help-decor{position:absolute;width:260px;height:260px;top:-125px;right:-85px;border-radius:50%;border:1px solid #ffffff25;box-shadow:0 0 0 38px #ffffff08,0 0 0 76px #ffffff06;z-index:-1}.help-content{padding:27px}.help-eyebrow{font-size:10px;letter-spacing:.15em;font-weight:750;color:#e2be4f;margin:0 0 38px}.help-content h2{font-size:clamp(23px,2.2vw,30px);letter-spacing:-.035em;line-height:1.15;max-width:300px}.help-copy{color:#c6cac7;font-size:14px;margin:10px 0 25px}.help-phone{margin-top:16px;display:flex;align-items:center;gap:12px;font-size:20px;font-weight:700;white-space:nowrap}.help-phone>svg{margin-left:auto}.phone-icon{display:grid;place-items:center;flex:none;width:42px;height:42px;border-radius:50%;background:#ffc107;color:#202020}.messengers{display:flex;flex-wrap:wrap;gap:8px;margin-top:20px}.messenger-chip{display:inline-flex;align-items:center;gap:8px;padding:6px 12px 6px 6px;border-radius:22px;background:#fff;color:#222;font-size:12px;font-weight:700}.messenger-chip :deep(svg),.messenger-chip :deep(img){width:22px;height:22px}
@media(max-width:800px){.faq-layout{grid-template-columns:1fr}.help-card{min-height:0}.help-eyebrow{margin-bottom:22px}.help-content{padding:24px}.help-content h2{max-width:none}.help-phone{max-width:330px}}
@media(max-width:600px){.faq{padding-top:35px;margin-top:34px}.faq-heading{margin-bottom:19px}.faq-heading h2{font-size:30px}.faq-item h3 button{padding:15px;font-size:14px;gap:10px}.faq-toggle{width:31px;height:31px}.faq-answer{padding:0 55px 18px 15px}.faq-answer p{font-size:13px}.help-content{padding:22px}.help-content h2{font-size:24px}.help-copy{margin-bottom:20px}.help-phone{font-size:18px}}
@media(prefers-reduced-motion:reduce){.faq-toggle,.faq-toggle svg{transition:none}}

.faq-item h3 button, .faq-answer p { font-size: var(--type-body); }
.help-card { --focus-ring: #ffcd45; }
.help-eyebrow { text-transform: uppercase; font-size: var(--type-secondary); margin-bottom: clamp(20px, 3vw, 36px); }
.help-copy { font-size: var(--type-body); margin: 10px 0 20px; }
.help-phone { min-height: 44px; width: 100%; max-width: none; }
.help-phone:hover { color: #ffe18a; }
.messenger-chip { font-size: var(--type-control); min-height: 44px; padding-inline: 11px 14px; }
span.messenger-chip { background: #e1e5e1; }
.messenger-chip:is(:hover, :focus-visible) { background: #ffc107; }
.faq-answer a { display: inline-flex; gap: 6px; align-items: center; min-height: 36px; margin-top: 4px; color: #775500; text-decoration: underline; text-underline-offset: 3px; }
.faq-item h3 button:focus-visible { outline-offset: -3px; }
</style>
