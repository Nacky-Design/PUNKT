<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import { Camera, Check, ImagePlus, Trash2, Upload } from 'lucide-vue-next';

type Photo = { id: number; name: string; url: string };
const photos = ref<Photo[]>([]);
const feedback = ref('');
let nextId = 0;

function addPhotos(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = Array.from(input.files ?? []).filter((file) => file.type.startsWith('image/'));
  for (const file of files) {
    photos.value.push({ id: nextId++, name: file.name, url: URL.createObjectURL(file) });
  }
  if (files.length) feedback.value = `Добавлено фотографий: ${files.length}.`;
  else if (input.files?.length) feedback.value = 'Выберите изображение.';
  input.value = '';
}

function removePhoto(id: number) {
  const photo = photos.value.find((item) => item.id === id);
  if (!photo) return;
  URL.revokeObjectURL(photo.url);
  photos.value = photos.value.filter((item) => item.id !== id);
  feedback.value = 'Фотография удалена.';
}

function demonstrateSend() {
  if (!photos.value.length) return;
  feedback.value = 'Фотографии доступны на этой странице. Чтобы передать их, свяжитесь с офисом.';
}

onBeforeUnmount(() => {
  photos.value.forEach((photo) => URL.revokeObjectURL(photo.url));
});
</script>

<template>
  <section class="photo-card" aria-labelledby="car-photos-title">
    <div class="photo-card-top">
      <span class="photo-icon"><Camera :size="22" aria-hidden="true" /></span>
      <div><h2 id="car-photos-title">Зафиксировать состояние</h2><p class="photo-description">Добавьте фотографии кузова, колёс и приборной панели.</p></div>
    </div>
    <div class="upload-area">
      <label class="upload-tile">
        <span class="upload-icon"><ImagePlus :size="25" aria-hidden="true" /></span>
        <strong>Добавить фото</strong>
        <input type="file" accept="image/*" multiple aria-label="Выбрать фотографии автомобиля" @change="addPhotos" />
      </label>
      <div class="upload-details">
        <p class="photo-hint">Добавьте несколько снимков или сделайте фото на камеру. Фотографии остаются на этой странице.</p>
        <label class="photo-action"><Camera :size="18" aria-hidden="true" /> Снять фото<input type="file" accept="image/*" capture="environment" aria-label="Снять фотографию автомобиля" @change="addPhotos" /></label>
        <p v-if="!photos.length" class="photo-empty">Здесь появятся добавленные фотографии</p>
        <ul v-else class="photo-list" aria-label="Добавленные фотографии">
          <li v-for="(photo, index) in photos" :key="photo.id">
            <img :src="photo.url" :alt="`Фото автомобиля ${index + 1}: ${photo.name}`" />
            <button type="button" class="remove-photo" :aria-label="`Удалить фотографию ${index + 1}`" @click="removePhoto(photo.id)"><Trash2 :size="17" aria-hidden="true" /></button>
          </li>
        </ul>
      </div>
    </div>
    <div class="photo-footer">
      <button class="send-demo" type="button" :disabled="!photos.length" @click="demonstrateSend"><Upload :size="17" aria-hidden="true" /> Проверить снимки</button>
      <span v-if="photos.length" class="photo-count"><Check :size="15" aria-hidden="true" /> Добавлено: {{ photos.length }}</span>
    </div>
    <p v-if="feedback" class="photo-feedback" role="status">{{ feedback }}</p>
  </section>
</template>

<style scoped>
.photo-card{min-width:0;padding:24px;border:1px solid #e6e6e1;border-radius:14px;background:#fff;color:#191919}.photo-card-top{display:flex;align-items:flex-start;gap:14px}.photo-icon{display:grid;place-items:center;flex:none;width:46px;height:46px;border-radius:11px;background:#fff1be;color:#2d2819}.eyebrow{margin:0 0 6px;color:#8b8981;font-size:10px;font-weight:750;letter-spacing:.12em}.photo-card h2{margin:0;font-size:20px;line-height:1.25;letter-spacing:-.025em}.photo-description{margin:7px 0 0;color:#747672;font-size:13px;line-height:1.5}.upload-area{display:flex;align-items:flex-start;gap:20px;margin-top:20px}.upload-tile{position:relative;display:flex;flex:0 0 150px;flex-direction:column;align-items:center;justify-content:center;gap:6px;width:150px;aspect-ratio:1;padding:10px;border:1.5px dashed #d6b65b;border-radius:12px;background:#fffaf0;text-align:center;cursor:pointer}.upload-tile:hover{background:#fff4d5;border-color:#b48a20}.upload-icon{display:grid;place-items:center;width:42px;height:42px;margin-bottom:2px;border-radius:50%;background:#ffefbc;color:#352c16}.upload-tile strong{font-size:13px;line-height:1.3}.upload-tile small{color:#8a8171;font-size:10px;line-height:1.3}.upload-tile input,.photo-action input{position:absolute;width:1px;height:1px;opacity:0;overflow:hidden}.upload-tile:focus-within,.photo-action:focus-within{outline:2px solid #a87d00;outline-offset:2px}.upload-details{min-width:0;flex:1}.photo-hint{margin:0;color:#777b75;font-size:12px;line-height:1.5}.photo-action{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:40px;margin-top:12px;padding:9px 12px;border:1px solid #e0e0dc;border-radius:8px;background:#fff;font-size:12px;font-weight:700;cursor:pointer}.photo-action:hover{background:#f6f6f3}.photo-empty{margin:12px 0 0;color:#999b95;font-size:11px;line-height:1.45}.photo-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(94px,1fr));gap:9px;margin:15px 0 0;padding:0;list-style:none}.photo-list li{position:relative;min-width:0;aspect-ratio:4/3;overflow:hidden;border-radius:9px;background:#f1f1ef}.photo-list img{display:block;width:100%;height:100%;object-fit:cover}.remove-photo{position:absolute;top:6px;right:6px;display:grid;place-items:center;width:32px;height:32px;border-radius:7px;background:#fff;color:#2a2a29;box-shadow:0 2px 8px #0002}.remove-photo:hover{background:#fff1be}.photo-footer{display:flex;align-items:center;flex-wrap:wrap;gap:12px;margin-top:18px}.send-demo{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:42px;padding:10px 14px;border-radius:8px;background:#202222;color:#fff;font-size:12px;font-weight:700}.send-demo:hover:not(:disabled){background:#454741}.send-demo:disabled{cursor:not-allowed;opacity:.42}.photo-count{display:inline-flex;align-items:center;gap:6px;color:#657263;font-size:12px}.photo-feedback{margin:12px 0 0;color:#6b5a2f;font-size:12px;line-height:1.5}
@media(max-width:560px){.photo-card{padding:18px}.photo-card h2{font-size:18px}.upload-area{gap:14px}.upload-tile{flex-basis:120px;width:120px}.upload-tile strong{font-size:12px}.photo-hint{font-size:11px}.photo-list{grid-template-columns:repeat(auto-fill,minmax(72px,1fr))}.photo-footer,.send-demo{width:100%}}
@media(max-width:360px){.upload-area{flex-direction:column}.upload-tile{flex-basis:auto;width:132px}.upload-details{width:100%}}
</style>
