<script setup lang="ts">
import { ref } from 'vue';
import { CarFront, ShieldAlert, Wrench } from 'lucide-vue-next';

const emit = defineEmits<{ 'open-terms': []; 'explain-protection': [] }>();
type DamageRow = { damage: string; prices: [string, string, string, string] };
const noReplacement: DamageRow[] = [
  { damage: 'Сколы Л.П. размером от 3 мм до 5 мм', prices: ['500 ₽', '500 ₽', '800 ₽', '800 ₽'] },
  { damage: 'Полировка (один элемент)', prices: ['2 500 ₽', '2 500 ₽', '2 500 ₽', '2 500 ₽'] },
  { damage: 'Вмятины, трещина (без учета окраса)', prices: ['7 000 ₽', '7 000 ₽', '7 000 ₽', '9 000 ₽'] },
  { damage: 'Прокол покрышки', prices: ['1 500 ₽', '1 500 ₽', '2 000 ₽', '2 000 ₽'] },
  { damage: 'Колесный диск', prices: ['5 000 ₽', '5 000 ₽', '15 000 ₽', '15 000 ₽'] },
  { damage: 'Скол на лобовом стекле (подлежащий ремонту)', prices: ['10 000 ₽', '10 000 ₽', '15 000 ₽', '15 000 ₽'] },
  { damage: 'Повреждение элемента салона (пластик)', prices: ['10 000 ₽', '15 000 ₽', '25 000 ₽', '30 000 ₽'] },
  { damage: 'Порез или прожог', prices: ['15 000 ₽', '15 000 ₽', '20 000 ₽', '25 000 ₽'] },
  { damage: 'Царапины (окрас): крыло / бампер / порог', prices: ['23 000 ₽', '23 000 ₽', '26 000 ₽', '26 000 ₽'] },
  { damage: 'Царапины (окрас): капот / дверь / крышка багажника', prices: ['26 000 ₽', '26 000 ₽', '35 000 ₽', '35 000 ₽'] },
  { damage: 'Повреждение крыши', prices: ['50 000 ₽', '60 000 ₽', '70 000 ₽', '90 000 ₽'] },
];
const replacement: DamageRow[] = [
  { damage: 'Крыло (без окраса)', prices: ['25 000 ₽', '32 000 ₽', 'От 70 000 ₽', 'От 100 000 ₽'] },
  { damage: 'Бампер (без окраса)', prices: ['25 000 ₽', '32 000 ₽', 'От 70 000 ₽', 'От 100 000 ₽'] },
  { damage: 'Дверь / крышка багажника / капот (без окраса)', prices: ['30 000 ₽', '30 000 ₽', 'От 70 000 ₽', 'От 100 000 ₽'] },
  { damage: 'Порог (без окраса)', prices: ['20 000 ₽', '30 000 ₽', 'От 70 000 ₽', 'От 100 000 ₽'] },
  { damage: 'Повреждение крыши (без окраса)', prices: ['70 000 ₽', '90 000 ₽', 'От 120 000 ₽', 'От 130 000 ₽'] },
  { damage: 'Покрышка', prices: ['7 000 ₽', '9 000 ₽', 'От 20 000 ₽', 'От 35 000 ₽'] },
  { damage: 'Покрышка RunFlat', prices: ['—', '—', 'От 25 000 ₽', 'От 40 000 ₽'] },
  { damage: 'Колпак колесный', prices: ['4 000 ₽', '4 000 ₽', '4 000 ₽', '6 000 ₽'] },
  { damage: 'Колесный диск', prices: ['7 000 ₽', '10 000 ₽', 'От 30 000 ₽', 'От 50 000 ₽'] },
  { damage: 'Фара передняя', prices: ['35 000 ₽', '40 000 ₽', 'От 90 000 ₽', 'От 180 000 ₽'] },
  { damage: 'Фонарь задний', prices: ['15 000 ₽', '25 000 ₽', '35 000 ₽', '50 000 ₽'] },
  { damage: 'ПТФ / ДХО', prices: ['8 000 ₽', '10 000 ₽', '17 000 ₽', '22 000 ₽'] },
  { damage: 'Стекло лобовое / заднее', prices: ['20 000 ₽', '25 000 ₽', '45 000 ₽', 'От 70 000 ₽'] },
  { damage: 'Стекло боковое', prices: ['12 000 ₽', '15 000 ₽', '30 000 ₽', 'От 35 000 ₽'] },
  { damage: 'Зеркало заднего вида (боковое)', prices: ['15 000 ₽', '20 000 ₽', '45 000 ₽', 'От 80 000 ₽'] },
  { damage: 'Пол в багажнике', prices: ['5 000 ₽', '7 000 ₽', '10 000 ₽', '10 000 ₽'] },
];
const classes = ['Эконом', 'Стандарт', 'Бизнес', 'Кроссовер'];
const selectedClass = ref(0);
</script>

<template>
  <section class="damage-compensation" aria-labelledby="damage-title">
    <div class="damage-heading">
      <div>
        <h2 id="damage-title">Компенсация ущерба</h2>
        <p>Суммы без «Защиты+». Действующую сумму уточняйте перед подписанием договора.</p>
        <div class="damage-links">
          <button type="button" class="terms-link" @click="emit('explain-protection')">Что покрывает «Защита+»</button>
          <button type="button" class="terms-link" @click="emit('open-terms')">Условия аренды</button>
        </div>
      </div>
    </div>
    <div class="damage-classes" role="group" aria-labelledby="damage-classes-title">
      <h3 id="damage-classes-title">Класс автомобиля</h3>
      <div class="damage-class-options">
        <button v-for="(item, index) in classes" :key="item" type="button" :aria-pressed="index === selectedClass"
          @click="selectedClass = index">{{ item }}</button>
      </div>
    </div>
    <div v-for="(group, groupIndex) in [{ title: 'Не требуется замена элемента', rows: noReplacement }, { title: 'Требуется замена элемента', rows: replacement }]" :key="group.title" class="damage-card">
      <div class="damage-card-heading">
        <span class="card-icon"><ShieldAlert v-if="groupIndex === 0" :size="23" aria-hidden="true" /><Wrench v-else :size="23" aria-hidden="true" /></span>
        <div><h3>{{ group.title }}</h3><p>Размер компенсации в зависимости от класса автомобиля</p></div>
      </div>
      <div class="table-wrap" tabindex="0" :aria-label="group.title + ': таблица компенсации'">
        <table>
          <thead><tr><th scope="col">Вид повреждения</th><th v-for="(item, index) in classes" :key="item" scope="col" :class="{ 'other-class': index !== selectedClass }"><CarFront :size="18" aria-hidden="true" /><span>{{ item }}</span></th></tr></thead>
          <tbody><tr v-for="row in group.rows" :key="row.damage"><th scope="row">{{ row.damage }}</th><td v-for="(price, index) in row.prices" :key="index" :class="{ 'other-class': index !== selectedClass }">{{ price }}</td></tr></tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<style scoped>
.damage-compensation{color:#1d1e1d;padding:30px 0 15px}.damage-heading{display:flex;align-items:flex-start;gap:14px;margin-bottom:22px}.heading-mark{width:29px;height:5px;flex:none;margin-top:17px;background:#ffc107;border-radius:4px}.damage-heading h2{margin:7px 0 6px;font-size:clamp(26px,3vw,34px);letter-spacing:-.035em}.damage-heading p{margin:4px 0;color:#5e615d;font-size:14px;line-height:1.5}.demo-badge{display:inline-block;padding:5px 9px;border-radius:6px;background:#fff4d4;color:#745900;font-size:11px;font-weight:700}.terms-link{padding:0;background:none;color:#916b00;text-decoration:underline;font-size:inherit}.damage-card{margin-top:16px;padding:20px;border:1px solid #e5e5e1;border-radius:14px;background:#fff;box-shadow:0 3px 14px #15151508}.damage-card-heading{display:flex;align-items:center;gap:13px;margin-bottom:16px}.card-icon{display:grid;place-items:center;flex:none;width:45px;height:45px;border-radius:11px;background:#fff1c1;color:#25210e}.damage-card-heading h3{margin:0;font-size:19px;letter-spacing:-.025em}.damage-card-heading p{margin:4px 0 0;color:#777;font-size:12px}.table-wrap{overflow-x:auto;border-radius:9px;overscroll-behavior-x:contain}table{border-collapse:separate;border-spacing:0;width:100%;min-width:790px;table-layout:fixed;font-size:13px;line-height:1.35}thead th{background:#fff1c4;color:#24231d;font-weight:700;text-align:center;padding:10px 8px}thead th:first-child{width:38%;background:#eceeec;text-align:left}thead th:not(:first-child){border-left:1px solid #fff}thead th svg{display:block;margin:0 auto 4px}tbody tr:nth-child(even){background:#f2f3f1}tbody tr:nth-child(odd){background:#fbfbfa}tbody th,tbody td{padding:9px 11px;border-top:1px solid #fff}tbody th{text-align:left;font-weight:500}tbody td{text-align:center;font-weight:700;white-space:nowrap;border-left:1px solid #fff}@media(max-width:760px){.damage-compensation{padding-top:24px}.damage-heading{gap:10px}.heading-mark{width:20px}.damage-heading p{font-size:13px}.damage-card{padding:15px}.damage-card-heading h3{font-size:17px}.table-wrap:focus-visible{outline:2px solid #a97500;outline-offset:3px}table{font-size:12px}}
@media (max-width: 1000px) {
  table { min-width: 580px; }
  thead th:first-child { width: 128px; }
  thead th:first-child, tbody th { position: sticky; left: 0; z-index: 1; }
  tbody th { background: #fbfbfa; }
  tbody tr:nth-child(even) th { background: #f2f3f1; }
}
.damage-heading p { font-size: var(--type-body); }
.damage-card-heading p, table { font-size: var(--type-secondary); }
.table-wrap:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.damage-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0 18px;
  margin-top: 6px;
}
.damage-links .terms-link { min-height: 36px; font-size: var(--type-secondary); }
.damage-classes { display: none; }
@media (max-width: 760px) {
  .damage-classes { display: grid; gap: 8px; }
  .damage-classes h3 { font-size: var(--type-body); }
  .damage-class-options {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 6px;
  }
  .damage-class-options button {
    min-height: 44px;
    padding: 5px 4px;
    border: 1px solid #dededb;
    border-radius: 8px;
    background: #fff;
    font-size: var(--type-secondary);
    font-weight: 650;
  }
  .damage-class-options button[aria-pressed="true"] { border-color: #dfb33f; background: #fff3cc; }
  .damage-compensation table { min-width: 0; }
  .damage-compensation .other-class { display: none; }
  .damage-compensation thead th:first-child { width: 61%; }
  .damage-compensation thead th:first-child, .damage-compensation tbody th { position: static; }
  .damage-compensation thead th svg { display: none; }
  .damage-compensation tbody th, .damage-compensation tbody td { padding: 8px; }
  .damage-compensation tbody td { white-space: normal; }
}
@media (max-width: 420px) {
  .damage-class-options { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>
