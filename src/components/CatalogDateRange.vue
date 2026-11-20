<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { useMobileSheet } from '../composables/useMobileSheet';
import { usePopoverPlacement } from '../composables/usePopoverPlacement';
import BaseModal from './BaseModal.vue';
import { isoDate, localDate, todayISO } from '../data';

const props = defineProps<{ start: string; end: string }>();
const emit = defineEmits<{ 'update:start': [value: string]; 'update:end': [value: string] }>();
const root = ref<HTMLElement>();
const open = ref(false);
const sheet = useMobileSheet();
const above = usePopoverPlacement(root, () => open.value && !sheet.value, '.range-popover');
const selectingEnd = ref(false);
const chosenStart = ref('');
const chosenEnd = ref('');
const month = ref(firstOfMonth(props.start));
let returnFocus: HTMLElement | null = null;
const today = todayISO();
const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function firstOfMonth(date: string) {
  const d = localDate(date);
  return new Date(d.getFullYear(), d.getMonth(), 1, 12);
}
function shiftMonth(base: Date, delta: number) {
  return new Date(base.getFullYear(), base.getMonth() + delta, 1, 12);
}
const months = computed(() => [month.value, shiftMonth(month.value, 1)]);
const previousDisabled = computed(() => month.value <= firstOfMonth(today));
const displayedStart = computed(() => selectingEnd.value ? chosenStart.value : props.start);
const displayedEnd = computed(() => selectingEnd.value ? '' : props.end);
function monthLabel(d: Date) {
  return d.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }).replace(' г.', '');
}
function dateLabel(s: string) {
  return localDate(s).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function fullDate(s: string) {
  return localDate(s).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}
function daysOfMonth(d: Date) {
  const offset = (d.getDay() + 6) % 7;
  const length = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  return [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length }, (_, index) => isoDate(new Date(d.getFullYear(), d.getMonth(), index + 1, 12))),
  ];
}
function toggle(which: 'start' | 'end', event: MouseEvent) {
  if (open.value) { close(false); return; }
  returnFocus = event.currentTarget as HTMLElement;
  if (sheet.value) returnFocus.focus({ preventScroll: true });
  chosenStart.value = props.start;
  chosenEnd.value = props.end;
  selectingEnd.value = false;
  month.value = firstOfMonth(props[which]);
  if (month.value < firstOfMonth(today)) month.value = firstOfMonth(today);
  open.value = true;
}
function choose(date: string) {
  if (!selectingEnd.value || date <= chosenStart.value) {
    chosenStart.value = date;
    chosenEnd.value = '';
    selectingEnd.value = true;
    return;
  }
  chosenEnd.value = date;
  emit('update:start', chosenStart.value);
  emit('update:end', chosenEnd.value);
  close(true);
}
function close(restore: boolean) {
  open.value = false;
  if (restore) nextTick(() => returnFocus?.focus());
}
function onOutside(event: PointerEvent) {
  if (!sheet.value && open.value && !root.value?.contains(event.target as Node)) close(false);
}
function onKey(event: KeyboardEvent) {
  if (!sheet.value && open.value && event.key === 'Escape') { event.preventDefault(); close(true); }
}
watch(sheet, () => { if (open.value) close(true); });
onMounted(() => { document.addEventListener('pointerdown', onOutside); document.addEventListener('keydown', onKey); });
onBeforeUnmount(() => { document.removeEventListener('pointerdown', onOutside); document.removeEventListener('keydown', onKey); });
</script>

<template>
  <div ref="root" class="range-picker">
    <button type="button" class="date-field" :aria-expanded="open" :aria-controls="open ? 'catalog-date-calendar' : undefined" :aria-haspopup="sheet ? 'dialog' : undefined" @click="toggle('start', $event)">
      <span class="date-caption">Получение</span><span class="date-value"><CalendarDays :size="16" aria-hidden="true" />{{ dateLabel(start) }}</span>
    </button>
    <button type="button" class="date-field" :aria-expanded="open" :aria-controls="open ? 'catalog-date-calendar' : undefined" :aria-haspopup="sheet ? 'dialog' : undefined" @click="toggle('end', $event)">
      <span class="date-caption">Возврат</span><span class="date-value"><CalendarDays :size="16" aria-hidden="true" />{{ dateLabel(end) }}</span>
    </button>
    <component v-if="open" :is="sheet ? BaseModal : 'div'"
      v-bind="sheet ? { title: 'Выбор дат аренды', sheet: true }
        : { class: ['range-popover', { 'range-popover--above': above }], role: 'dialog', 'aria-label': 'Выбор дат аренды' }"
      @close="close(true)">
      <div id="catalog-date-calendar">
        <div class="range-top">
          <div><strong v-if="!sheet">Даты аренды</strong><p aria-live="polite">{{ selectingEnd ? 'Теперь выберите дату возврата' : 'Выберите дату получения, затем возврата' }}</p></div>
          <div class="month-navigation">
            <button type="button" aria-label="Предыдущий месяц" :disabled="previousDisabled" @click="month = shiftMonth(month, -1)"><ChevronLeft :size="19" aria-hidden="true" /></button>
            <button type="button" aria-label="Следующий месяц" @click="month = shiftMonth(month, 1)"><ChevronRight :size="19" aria-hidden="true" /></button>
          </div>
        </div>
        <div class="months">
          <section v-for="(item, index) in months" :key="item.toISOString()" class="month" :class="{ 'second-month': index === 1 }" :aria-label="monthLabel(item)">
            <h3>{{ monthLabel(item) }}</h3>
            <div class="date-grid">
              <span v-for="day in weekdays" :key="day" class="weekday">{{ day }}</span>
              <template v-for="(date, i) in daysOfMonth(item)" :key="date || 'empty-' + i">
                <span v-if="!date" aria-hidden="true"></span>
                <button v-else type="button" :disabled="date < today" :aria-label="fullDate(date)" :aria-pressed="date === displayedStart || date === displayedEnd" :class="{ endpoint: date === displayedStart || date === displayedEnd, between: displayedStart && displayedEnd && date > displayedStart && date < displayedEnd, today: date === today }" @click="choose(date)">{{ localDate(date).getDate() }}</button>
              </template>
            </div>
          </section>
        </div>
        <p class="range-help">Возврат — не ранее следующего дня после получения</p>
      </div>
    </component>
  </div>
</template>

<style scoped>
.range-picker{position:relative;grid-column:span 2;display:grid;grid-template-columns:1fr 1fr;min-width:0;align-self:stretch}
.date-field{display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:5px;min-width:0;text-align:left;border-left:1px solid #e8e8e5;padding:7px 14px 5px;background:transparent;cursor:pointer}
.date-field:hover .date-value{color:#171717}.date-caption{font-size:var(--type-secondary);font-weight:650;color:#5d5f5a}.date-value{display:flex;align-items:center;gap:6px;font-size:var(--type-control);font-weight:650;color:#222;white-space:nowrap}.date-value svg{color:#888}
.range-popover{position:absolute;left:0;top:calc(100% + 13px);z-index:35;width:min(660px,calc(100vw - 48px));padding:20px;background:#fff;border:1px solid #e2e2de;border-radius:15px;box-shadow:0 14px 45px #17171724;color:#1d1d1d}
.range-top{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:18px}.range-top strong{font-size:16px}.range-top p{margin:4px 0 0;color:#5d5f5a;font-size:var(--type-secondary);line-height:1.4}.month-navigation{display:flex;gap:5px}.month-navigation button{width:36px;height:36px;display:grid;place-items:center;border-radius:50%;background:#f3f3f1}.month-navigation button:hover:not(:disabled){background:#ffce3d}.month-navigation button:disabled{opacity:.3;cursor:not-allowed}
.months{display:grid;grid-template-columns:1fr 1fr;gap:22px}.month{min-width:0}.month+.month{border-left:1px solid #e8e8e5;padding-left:22px}.month h3{text-align:center;text-transform:capitalize;margin:0 0 13px;font-size:15px}.date-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:3px}.weekday{display:grid;place-items:center;color:#888;font-size:11px;font-weight:650;height:27px}.date-grid button{aspect-ratio:1;min-width:0;border-radius:9px;font-size:13px;color:#242424}.date-grid button:hover:not(:disabled):not(.endpoint){background:#fff2c8}.date-grid button:disabled{color:#d1d1ce;cursor:not-allowed}.date-grid button.between{background:#fff6da;border-radius:3px}.date-grid button.endpoint{background:#202020;color:#fff;font-weight:700}.date-grid button.today:not(.endpoint){box-shadow:inset 0 0 0 1px #e0a800}.range-help{margin:14px 0 0;color:#777;font-size:11px}
.range-popover--above { top: auto; bottom: calc(100% + 13px); }
@media(max-width:760px){.date-field{padding:9px 10px}.date-field:first-child{border-left:0}.range-popover{padding:16px}.months{grid-template-columns:1fr}.second-month{display:none}.date-grid button{max-height:43px}.range-top{margin-bottom:13px}}

.date-field { min-height: 48px; }
.date-field[aria-expanded="true"], .date-field:hover { background: #f5f5f3; }
@media (min-width: 701px) and (max-width: 1270px) {
  .date-field { padding-inline: 9px; }
  .date-value svg { display: none; }
}
</style>
