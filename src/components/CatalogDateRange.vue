<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { useMobileSheet } from '../composables/useMobileSheet';
import { usePopoverPlacement } from '../composables/usePopoverPlacement';
import BaseModal from './BaseModal.vue';
import { addDays, checkRentalPeriod, isoDate, localDate, rentalTime, todayISO, type RentalPeriod } from '../data';

const props = defineProps<{
  start: string;
  end: string;
  times?: { start: string; end: string; confirmed: boolean };
}>();
const emit = defineEmits<{
  'update:start': [value: string];
  'update:end': [value: string];
  'apply-period': [value: RentalPeriod];
}>();
const root = ref<HTMLElement>();
const calendar = ref<HTMLElement>();
const openedFrom = ref<'start' | 'end'>();
const focusedDate = ref('');
const open = ref(false);
const sheet = useMobileSheet();
const above = usePopoverPlacement(root, () => open.value && !sheet.value, '.range-popover', true);
const selectingEnd = ref(false);
const chosenStart = ref('');
const chosenEnd = ref('');
const chosenStartTime = ref('');
const chosenEndTime = ref('');
const openedAt = ref(new Date());
const draft = computed<RentalPeriod>(() => ({
  start: chosenStart.value,
  end: chosenEnd.value,
  startTime: rentalTime(chosenStartTime.value),
  endTime: rentalTime(chosenEndTime.value),
}));
const draftError = computed(() => checkRentalPeriod(draft.value, openedAt.value).error);
const dialogTitle = computed(() => props.times ? 'Даты и время аренды' : 'Выбор дат аренды');
const fields = [
  { key: 'start', label: 'Получение' },
  { key: 'end', label: 'Возврат' },
] as const;
const month = ref(firstOfMonth(props.start));
let returnFocus: HTMLElement | null = null;
const today = computed(() => todayISO(openedAt.value));
const minimumDate = computed(() => {
  const firstReturn = props.times && selectingEnd.value ? addDays(chosenStart.value, 1) : '';
  return firstReturn > today.value ? firstReturn : today.value;
});
const arrowOffsets: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function firstOfMonth(date: string) {
  const d = localDate(date);
  return new Date(d.getFullYear(), d.getMonth(), 1, 12);
}
function shiftMonth(base: Date, delta: number) {
  return new Date(base.getFullYear(), base.getMonth() + delta, 1, 12);
}
const months = computed(() => sheet.value ? [month.value] : [month.value, shiftMonth(month.value, 1)]);
const previousDisabled = computed(() => month.value <= firstOfMonth(minimumDate.value));
const displayedStart = computed(() => props.times || selectingEnd.value ? chosenStart.value : props.start);
const displayedEnd = computed(() => props.times ? chosenEnd.value : (selectingEnd.value ? '' : props.end));
const selectionHint = computed(() => {
  if (props.times) return selectingEnd.value ? 'Выберите дату возврата' : 'Выберите дату получения';
  return selectingEnd.value ? 'Теперь выберите дату возврата' : 'Выберите дату получения, затем возврата';
});
const proposedPeriod = computed(() => props.times && !props.times.confirmed &&
  chosenStart.value === props.start && chosenEnd.value === props.end &&
  draft.value.startTime === props.times.start && draft.value.endTime === props.times.end);
const shortDay = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' });

function endpointValue(which: 'start' | 'end') {
  const date = which === 'start' ? chosenStart.value : chosenEnd.value;
  const time = which === 'start' ? draft.value.startTime : draft.value.endTime;
  if (!date) return 'Выберите дату';
  return [shortDay.format(localDate(date)), time].filter(Boolean).join(', ');
}
function monthLabel(d: Date) {
  return d.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }).replace(' г.', '');
}
function dateLabel(s: string) {
  return localDate(s).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function fullDate(s: string) {
  return localDate(s).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}
function fieldValue(which: 'start' | 'end') {
  if (!props.times) return dateLabel(props[which]);
  if (!props.times.confirmed) return 'Выберите дату';
  const day = localDate(props[which]).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
  return `${day}, ${props.times[which]}`;
}
function daysOfMonth(d: Date) {
  const offset = (d.getDay() + 6) % 7;
  const length = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  return [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length }, (_, index) => isoDate(new Date(d.getFullYear(), d.getMonth(), index + 1, 12))),
  ];
}
function focusDay(date: string, moveFocus = true) {
  const target = date >= minimumDate.value ? date : minimumDate.value;
  const targetMonth = firstOfMonth(target);
  const lastMonth = months.value.at(-1)!;
  if (targetMonth < month.value || targetMonth > lastMonth) month.value = targetMonth;
  focusedDate.value = target;
  if (!moveFocus) return;
  nextTick(() => {
    const button = calendar.value?.querySelector<HTMLElement>(`[data-date="${target}"]`);
    const panel = calendar.value?.closest<HTMLElement>('[role="dialog"]');
    if (!button || !panel) return;
    button.focus({ preventScroll: true });
    const dayBounds = button.getBoundingClientRect();
    const panelBounds = panel.getBoundingClientRect();
    if (dayBounds.top < panelBounds.top) panel.scrollTop += dayBounds.top - panelBounds.top;
    if (dayBounds.bottom > panelBounds.bottom) panel.scrollTop += dayBounds.bottom - panelBounds.bottom;
  });
}

function selectEndpoint(which: 'start' | 'end') {
  selectingEnd.value = which === 'end';
  focusDay(selectingEnd.value ? chosenEnd.value : chosenStart.value);
}

function toggle(which: 'start' | 'end', event: MouseEvent) {
  if (open.value && openedFrom.value === which) { close(true); return; }
  returnFocus = event.currentTarget as HTMLElement;
  openedFrom.value = which;
  if (sheet.value) returnFocus.focus({ preventScroll: true });
  if (open.value) { selectEndpoint(which); return; }
  chosenStart.value = props.start;
  chosenEnd.value = props.end;
  chosenStartTime.value = props.times?.start ?? '';
  chosenEndTime.value = props.times?.end ?? '';
  openedAt.value = new Date();
  month.value = firstOfMonth(props[which]);
  open.value = true;
  selectEndpoint(props.times ? which : 'start');
}

function moveMonth(delta: number) {
  month.value = shiftMonth(month.value, delta);
  focusDay(isoDate(month.value), false);
}

function onDayKey(event: KeyboardEvent, date: string) {
  const offset = arrowOffsets[event.key];
  if (offset === undefined) return;
  event.preventDefault();
  focusDay(addDays(date, offset));
}

function choose(date: string) {
  if (!selectingEnd.value || date <= chosenStart.value) {
    chosenStart.value = date;
    chosenEnd.value = '';
    selectingEnd.value = true;
    if (props.times) focusDay(date);
    return;
  }
  chosenEnd.value = date;
  if (props.times) return;
  emit('update:start', chosenStart.value);
  emit('update:end', chosenEnd.value);
  close(true);
}
function applyPeriod() {
  openedAt.value = new Date();
  if (draftError.value) return;
  emit('apply-period', draft.value);
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
  <div ref="root" class="range-picker" :class="{ 'range-picker--timed': times }">
    <button v-for="field in fields" :key="field.key" type="button" class="date-field"
      :aria-expanded="open && openedFrom === field.key" :aria-controls="open ? 'catalog-date-calendar' : undefined"
      :aria-haspopup="times || sheet ? 'dialog' : undefined"
      :aria-label="times?.confirmed ? `${field.label}, ${fullDate(field.key === 'start' ? start : end)}, ${times[field.key]}` : undefined"
      @click="toggle(field.key, $event)">
      <span class="date-caption">{{ field.label }}<CalendarDays v-if="times" :size="15" aria-hidden="true" /></span>
      <span class="date-value"><CalendarDays v-if="!times" :size="16" aria-hidden="true" />{{ fieldValue(field.key) }}</span>
    </button>
    <component v-if="open" :is="sheet ? BaseModal : 'div'"
      v-bind="sheet ? { title: dialogTitle, sheet: true }
        : { class: ['range-popover', { 'range-popover--above': above }], role: 'dialog', 'aria-label': dialogTitle }"
      @close="close(true)">
      <div id="catalog-date-calendar" ref="calendar" :class="{ 'range-calendar--timed': times }">
        <div class="range-top">
          <div><strong v-if="!sheet">{{ times ? dialogTitle : 'Даты аренды' }}</strong><p aria-live="polite">{{ selectionHint }}</p></div>
          <div class="month-navigation">
            <button type="button" aria-label="Предыдущий месяц" :disabled="previousDisabled" @click="moveMonth(-1)"><ChevronLeft :size="19" aria-hidden="true" /></button>
            <button type="button" aria-label="Следующий месяц" @click="moveMonth(1)"><ChevronRight :size="19" aria-hidden="true" /></button>
          </div>
        </div>
        <div v-if="times" class="range-endpoints">
          <p v-if="proposedPeriod">Предложенный период</p>
          <div class="range-endpoint-options" role="group" aria-label="Получение и возврат">
            <button v-for="field in fields" :key="field.key" type="button"
              :aria-label="`${field.key === 'start' ? 'Изменить дату получения' : 'Изменить дату возврата'}, ${endpointValue(field.key)}`"
              :aria-pressed="selectingEnd === (field.key === 'end')" @click="selectEndpoint(field.key)">
              <span>{{ field.label }}</span>
              <strong>{{ endpointValue(field.key) }}</strong>
            </button>
          </div>
        </div>
        <div class="months">
          <section v-for="item in months" :key="item.toISOString()" class="month" :aria-label="monthLabel(item)">
            <h3>{{ monthLabel(item) }}</h3>
            <div class="date-grid">
              <span v-for="day in weekdays" :key="day" class="weekday">{{ day }}</span>
              <template v-for="(date, i) in daysOfMonth(item)" :key="date || 'empty-' + i">
                <span v-if="!date" aria-hidden="true"></span>
                <button v-else type="button" :data-date="date" :disabled="date < minimumDate"
                  :tabindex="date === focusedDate ? 0 : -1"
                  :aria-label="fullDate(date)" :aria-pressed="date === displayedStart || date === displayedEnd"
                  :class="{ endpoint: date === displayedStart || date === displayedEnd, between: displayedStart && displayedEnd && date > displayedStart && date < displayedEnd, today: date === today }"
                  @focus="focusedDate = date" @keydown="onDayKey($event, date)" @click="choose(date)">{{ localDate(date).getDate() }}</button>
              </template>
            </div>
          </section>
        </div>
        <div v-if="times" class="range-times">
          <p>Время по Москве</p>
          <div class="range-time-fields">
            <label>Время получения
              <input v-model="chosenStartTime" type="text" inputmode="numeric" maxlength="5" placeholder="ЧЧ:ММ"
                @blur="chosenStartTime = rentalTime(chosenStartTime) || chosenStartTime" />
            </label>
            <label>Время возврата
              <input v-model="chosenEndTime" type="text" inputmode="numeric" maxlength="5" placeholder="ЧЧ:ММ"
                @blur="chosenEndTime = rentalTime(chosenEndTime) || chosenEndTime" />
            </label>
          </div>
          <p v-if="chosenEnd && draftError" class="error-text" role="alert">{{ draftError }}</p>
          <button type="button" class="interior-action" :disabled="!!draftError" @click="applyPeriod">Подтвердить период</button>
        </div>
        <p v-else class="range-help">Возврат — не ранее следующего дня после получения</p>
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
.range-popover { max-height: var(--popover-max-height, calc(100dvh - 24px)); overflow-y: auto; overscroll-behavior-y: contain; }
.range-popover--above { top: auto; bottom: calc(100% + 13px); }
@media(max-width:760px){.date-field{padding:9px 10px}.date-field:first-child{border-left:0}.range-popover{padding:16px}.months{grid-template-columns:1fr}.date-grid button{max-height:43px}.range-top{margin-bottom:13px}}

.date-field { min-height: 48px; }
.date-field[aria-expanded="true"], .date-field:hover { background: #f5f5f3; }
.range-picker--timed .date-caption { display: flex; align-items: center; justify-content: space-between; gap: 4px; width: 100%; }
.range-picker--timed .date-caption svg { flex: none; color: #777b74; }
.range-picker--timed .date-value { font-size: clamp(14px, 3.8vw, 16px); }
.range-endpoints { margin-bottom: 12px; }
.range-endpoints > p { margin-bottom: 5px; color: #5d5f5a; font-size: var(--type-secondary); }
.range-endpoint-options { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.range-endpoint-options button {
  display: grid;
  gap: 2px;
  min-height: 44px;
  padding: 5px 8px;
  border: 1px solid #dededb;
  border-radius: 8px;
  text-align: left;
  font-size: var(--type-secondary);
}
.range-endpoint-options button[aria-pressed="true"] { background: #fff3cc; border-color: #dfb33f; }
.range-endpoint-options span { color: #5d5f5a; }
.date-grid button:focus-visible { outline-offset: -2px; }
.date-grid button.endpoint:disabled { color: #fff; }
.range-times { display: grid; gap: 8px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #e8e8e5; }
.range-times > p { color: #5d5f5a; font-size: var(--type-secondary); }
.range-times > p.error-text { color: #9b3733; }
.range-time-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.range-time-fields label { display: grid; gap: 5px; color: #5d5f5a; font-size: var(--type-secondary); }
.range-time-fields input { width: 100%; min-width: 0; min-height: 40px; padding: 7px 10px; border: 1px solid #dededb; border-radius: 8px; background: #fafaf8; color: #222; font-size: var(--type-control); }
.range-times .interior-action { justify-self: stretch; }
@media (max-width: 760px) {
  .range-calendar--timed .range-top { margin-bottom: 10px; }
  .range-calendar--timed .month h3 { margin-bottom: 7px; }
  .range-calendar--timed .weekday { height: 22px; }
  .range-calendar--timed .date-grid button { height: 38px; aspect-ratio: auto; }
  .range-times { margin-top: 9px; padding-top: 9px; }
}
@media (min-width: 701px) and (max-width: 1270px) {
  .date-field { padding-inline: 9px; }
  .date-value svg { display: none; }
}
</style>
