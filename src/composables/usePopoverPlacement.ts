import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type Ref,
} from "vue";

/** Prefer the side with room, so bottom-anchored controls stay inside the viewport. */
export function usePopoverPlacement(
  root: Ref<HTMLElement | undefined>,
  isOpen: () => unknown,
  selector: string,
) {
  const above = ref(true);
  function measure() {
    if (!isOpen()) return;
    const bounds = root.value?.getBoundingClientRect();
    const popup = root.value?.querySelector<HTMLElement>(selector);
    if (!bounds || !popup) return;
    const availableAbove = bounds.top - 16,
      availableBelow = innerHeight - bounds.bottom - 16;
    above.value =
      availableBelow < popup.offsetHeight && availableAbove > availableBelow;
  }
  watch(isOpen, async () => {
    await nextTick();
    measure();
  });
  onMounted(() => {
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
  });
  onBeforeUnmount(() => {
    window.removeEventListener("resize", measure);
    window.removeEventListener("scroll", measure, true);
  });
  return above;
}
