<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-vue-next";
import { todayISO, localDate, isoDate } from "../data";
const props = defineProps<{ start: string; end: string }>();
const emit = defineEmits<{
  "update:start": [value: string];
  "update:end": [value: string];
}>();
const root = ref<HTMLElement>(),
  active = ref<"start" | "end" | null>(null),
  month = ref(
    new Date(
      localDate(props.start).getFullYear(),
      localDate(props.start).getMonth(),
      1,
    ),
  );
const today = todayISO();
const label = (s: string) =>
  localDate(s)
    .toLocaleDateString("ru-RU", { day: "numeric", month: "short" })
    .replace(".", "");
const title = computed(() =>
  month.value.toLocaleDateString("ru-RU", { month: "long", year: "numeric" }),
);
const cells = computed(() => {
  const first = new Date(month.value);
  const shift = (first.getDay() + 6) % 7;
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(first);
    d.setDate(i - shift + 1);
    return {
      date: isoDate(d),
      num: d.getDate(),
      outside: d.getMonth() !== first.getMonth(),
    };
  });
});
function show(which: "start" | "end") {
  active.value = active.value === which ? null : which;
  month.value = new Date(
    localDate(props[which]).getFullYear(),
    localDate(props[which]).getMonth(),
    1,
  );
}
function shift(delta: number) {
  month.value = new Date(
    month.value.getFullYear(),
    month.value.getMonth() + delta,
    1,
  );
}
function choose(date: string) {
  if (active.value === "start") {
    emit("update:start", date);
    if (date >= props.end) {
      const next = localDate(date);
      next.setDate(next.getDate() + 1);
      emit("update:end", isoDate(next));
    }
    active.value = "end";
  } else {
    emit("update:end", date);
    active.value = null;
  }
}
function close(e: MouseEvent) {
  if (!root.value?.contains(e.target as Node)) active.value = null;
}
onMounted(() => document.addEventListener("click", close));
onBeforeUnmount(() => document.removeEventListener("click", close));
</script>
<template>
  <div ref="root" class="dates" @keydown.esc.stop="active = null">
    <button
      type="button"
      class="field"
      :class="{ 'field-active': active === 'start' }"
      aria-label="Дата получения"
      :aria-expanded="active === 'start'"
      @click="show('start')"
    >
      <CalendarDays :size="21" /><span class="field-text"
        ><span class="field-caption">Дата получения</span
        ><span class="field-value">{{ label(start) }}</span></span
      ></button
    ><span class="date-arrow"><ArrowRight :size="15" /></span
    ><button
      type="button"
      class="field"
      :class="{ 'field-active': active === 'end' }"
      aria-label="Дата возврата"
      :aria-expanded="active === 'end'"
      @click="show('end')"
    >
      <CalendarDays :size="21" /><span class="field-text"
        ><span class="field-caption">Дата возврата</span
        ><span class="field-value">{{ label(end) }}</span></span
      ></button
    ><Transition name="popover"
      ><div v-if="active" class="calendar popover-surface">
        <div class="calendar-purpose">
          {{
            active === "start"
              ? "Когда заберёте автомобиль?"
              : "Когда вернёте автомобиль?"
          }}
        </div>
        <div class="calendar-heading">
          <button
            type="button"
            class="icon-button"
            aria-label="Предыдущий месяц"
            @click="shift(-1)"
          >
            <ChevronLeft :size="18" /></button
          ><strong>{{ title }}</strong
          ><button
            type="button"
            class="icon-button"
            aria-label="Следующий месяц"
            @click="shift(1)"
          >
            <ChevronRight :size="18" />
          </button>
        </div>
        <div class="calendar-grid">
          <span
            v-for="day in ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']"
            :key="day"
            class="weekday"
            >{{ day }}</span
          ><button
            v-for="cell in cells"
            :key="cell.date"
            type="button"
            :aria-label="
              localDate(cell.date).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
            "
            :aria-pressed="cell.date === start || cell.date === end"
            :disabled="
              cell.date < today || (active === 'end' && cell.date <= start)
            "
            :class="{
              outside: cell.outside,
              endpoint: cell.date === start || cell.date === end,
              'in-range': cell.date > start && cell.date < end,
            }"
            @click="choose(cell.date)"
          >
            {{ cell.num }}
          </button>
        </div>
        <p class="calendar-footer">
          {{ label(start) }} — {{ label(end) }} · Возврат после получения
        </p>
      </div></Transition
    >
  </div>
</template>
