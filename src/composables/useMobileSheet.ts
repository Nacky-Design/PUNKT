import { onBeforeUnmount, onMounted, ref } from 'vue';

export function useMobileSheet() {
  const media = window.matchMedia('(max-width: 760px)');
  const mobile = ref(media.matches);
  const update = () => { mobile.value = media.matches; };
  onMounted(() => media.addEventListener('change', update));
  onBeforeUnmount(() => media.removeEventListener('change', update));
  return mobile;
}
