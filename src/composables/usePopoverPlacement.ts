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
  fitHeight = false,
) {
  const above = ref(true);
  function measure() {
    if (!isOpen()) return;
    const bounds = root.value?.getBoundingClientRect();
    const popup = root.value?.querySelector<HTMLElement>(selector);
    if (!bounds || !popup) return;
    const clearance = fitHeight ? 24 : 16;
    const availableAbove = bounds.top - clearance;
    const availableBelow = innerHeight - bounds.bottom - clearance;
    const height = fitHeight ? popup.scrollHeight + popup.offsetHeight - popup.clientHeight : popup.offsetHeight;
    above.value = availableBelow < height && availableAbove > availableBelow;
    if (fitHeight) {
      const availableHeight = above.value ? availableAbove : availableBelow;
      popup.style.setProperty("--popover-max-height", `${Math.max(0, availableHeight)}px`);
    }
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
