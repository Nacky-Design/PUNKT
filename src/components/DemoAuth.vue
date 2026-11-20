<script lang="ts">
export type DemoProfile = {
  name: string;
  role: 'client' | 'rental';
  kind: 'person' | 'company';
  email: string;
  phone: string;
};
</script>

<script setup lang="ts">
import { nextTick, ref } from 'vue';
import { ArrowLeft, ArrowRight, BriefcaseBusiness, CarFront, Eye, EyeOff, Info, MailCheck, UserRound } from 'lucide-vue-next';

const emit = defineEmits<{ back: []; enter: [profile: DemoProfile] }>();
const screen = ref<'login' | 'register' | 'verify'>('login');
const pendingProfile = ref<DemoProfile | null>(null);
const role = ref<'client' | 'rental'>('client');
const kind = ref<'person' | 'company'>('person');
const login = ref('');
const loginPassword = ref('');
const loginMethod = ref<'password' | 'sms'>('password');
const smsStep = ref<'phone' | 'code'>('phone');
const smsPhone = ref('');
const smsCode = ref('');
const name = ref('');
const phone = ref('');
const email = ref('');
const password = ref('');
const repeatPassword = ref('');
const showLoginPassword = ref(false);
const showPassword = ref(false);
const showRepeatPassword = ref(false);
const consent = ref(false);
const forgotOpen = ref(false);

function clearPasswords() {
  loginPassword.value = '';
  password.value = '';
  repeatPassword.value = '';
}
function changeScreen(value: 'login' | 'register') {
  clearPasswords();
  smsCode.value = '';
  smsStep.value = 'phone';
  forgotOpen.value = false;
  screen.value = value;
  nextTick(() => window.scrollTo({ top: 0, behavior: "instant" }));
}
function changeLoginMethod(value: 'password' | 'sms') {
  loginMethod.value = value;
  loginPassword.value = '';
  smsCode.value = '';
  smsStep.value = 'phone';
  forgotOpen.value = false;
}
function enterSms() {
  const profile: DemoProfile = { name: 'Михаил Иванович', role: 'client', kind: 'person', email: '', phone: smsPhone.value.trim() };
  smsCode.value = '';
  emit('enter', profile);
}
function enterLogin() {
  const profile: DemoProfile = { name: login.value.trim() || 'Гость', role: 'client', kind: 'person', email: login.value.includes('@') ? login.value.trim() : '', phone: '' };
  clearPasswords();
  emit('enter', profile);
}
function enterRegistration() {
  const profile: DemoProfile = { name: name.value.trim() || 'Гость', role: role.value, kind: kind.value, email: email.value.trim(), phone: phone.value.trim() };
  clearPasswords();
  pendingProfile.value = profile;
  screen.value = 'verify';
  nextTick(() => window.scrollTo({ top: 0, behavior: 'instant' }));
}
function confirmDemo() {
  if (!pendingProfile.value) return;
  const profile = pendingProfile.value;
  pendingProfile.value = null;
  emit('enter', profile);
}
</script>

<template>
  <main class="auth-page">
    <div class="auth-container">
      <button class="back-link" type="button" @click="emit('back')"><ArrowLeft :size="17" aria-hidden="true" /> На главную</button>
      <div class="auth-top"><div class="auth-symbol"><CarFront :size="26" aria-hidden="true" /></div></div>
      <section class="auth-card" :aria-labelledby="screen === 'login' ? 'login-title' : screen === 'register' ? 'register-title' : 'verify-title'">
        <div class="auth-heading">
          <h1 v-if="screen === 'login'" id="login-title">Вход в личный кабинет</h1>
          <h1 v-else-if="screen === 'register'" id="register-title">Регистрация</h1>
          <h1 v-else id="verify-title">Проверьте адрес почты</h1>
          <p v-if="screen === 'login'">Все детали аренды — в одном месте</p>
          <p v-else-if="screen === 'register'">Создайте профиль для работы с «Пунктом»</p>
          <p v-else>Адрес для подтверждения</p>
        </div>
        <div class="demo-note"><Info :size="17" aria-hidden="true" /><span><strong>Просмотр кабинета.</strong> Используйте вымышленные данные. Введённое не отправляется.</span></div>
        <div v-if="screen === 'login'" class="login-method" role="group" aria-label="Способ входа">
          <button type="button" :aria-pressed="loginMethod === 'password'" @click="changeLoginMethod('password')">По паролю</button>
          <button type="button" :aria-pressed="loginMethod === 'sms'" @click="changeLoginMethod('sms')">По СМС</button>
        </div>
        <form v-if="screen === 'login' && loginMethod === 'password'" class="auth-form" @submit.prevent="enterLogin">
          <label class="auth-field">Логин или e-mail<input v-model="login" type="text" autocomplete="off" required placeholder="Введите логин или e-mail" /></label>
          <div class="password-heading"><span>Пароль</span><button type="button" class="subtle-link" @click="forgotOpen = !forgotOpen">Забыли пароль?</button></div>
          <div class="password-control"><input v-model="loginPassword" :type="showLoginPassword ? 'text' : 'password'" autocomplete="off" required aria-label="Пароль" placeholder="Введите ваш пароль" /><button type="button" :aria-label="showLoginPassword ? 'Скрыть пароль' : 'Показать пароль'" @click="showLoginPassword = !showLoginPassword"><EyeOff v-if="showLoginPassword" :size="19" aria-hidden="true" /><Eye v-else :size="19" aria-hidden="true" /></button></div>
          <p v-if="forgotOpen" class="recovery-note">Для просмотра подойдёт любая комбинация. Реальный пароль вводить не нужно.</p>
          <button class="submit-button" type="submit">Открыть кабинет <ArrowRight :size="18" aria-hidden="true" /></button>
        </form>
        <form v-else-if="screen === 'login' && smsStep === 'phone'" class="auth-form" @submit.prevent="smsStep = 'code'">
          <label class="auth-field">Телефон<input v-model="smsPhone" type="tel" autocomplete="off" required placeholder="+7 (___) ___-__-__" /></label>
          <p class="sms-note">На следующем шаге введите любую комбинацию цифр.</p>
          <button class="submit-button" type="submit">Продолжить <ArrowRight :size="18" aria-hidden="true" /></button>
        </form>
        <form v-else-if="screen === 'login' && smsStep === 'code'" class="auth-form" @submit.prevent="enterSms">
          <p class="sms-note">Номер телефона: <strong>{{ smsPhone }}</strong></p>
          <label class="auth-field">Код<input v-model="smsCode" type="text" inputmode="numeric" autocomplete="off" required placeholder="Введите любой код" /></label>
          <button class="submit-button" type="submit">Открыть кабинет <ArrowRight :size="18" aria-hidden="true" /></button>
          <button class="sms-back" type="button" @click="smsCode = ''; smsStep = 'phone'"><ArrowLeft :size="16" aria-hidden="true" /> Изменить номер телефона</button>
        </form>
        <form v-else-if="screen === 'register'" class="auth-form register-form" @submit.prevent="enterRegistration">
          <div class="role-grid" role="group" aria-label="Выберите роль">
            <button type="button" :aria-pressed="role === 'client'" :class="{ active: role === 'client' }" @click="role = 'client'"><UserRound :size="22" aria-hidden="true" /><span><strong>Я клиент</strong><small>Арендую автомобили</small></span></button>
            <button type="button" :aria-pressed="role === 'rental'" :class="{ active: role === 'rental' }" @click="role = 'rental'"><CarFront :size="22" aria-hidden="true" /><span><strong>Я прокатчик</strong><small>Сдаю автомобили</small></span></button>
          </div>
          <div class="kind-block"><p>Кто вы</p><div class="kind-options" role="group" aria-label="Тип клиента">
            <button type="button" :aria-pressed="kind === 'person'" :class="{ active: kind === 'person' }" @click="kind = 'person'">Частное лицо</button>
            <button type="button" :aria-pressed="kind === 'company'" :class="{ active: kind === 'company' }" @click="kind = 'company'"><BriefcaseBusiness :size="16" aria-hidden="true" />Компания</button>
          </div></div>
          <label class="auth-field">{{ kind === 'company' ? 'Название компании' : 'Имя' }}<input v-model="name" type="text" autocomplete="off" required :placeholder="kind === 'company' ? 'Название компании' : 'Как к вам обращаться'" /></label>
          <label class="auth-field">Телефон<input v-model="phone" type="tel" autocomplete="off" required placeholder="+7 (___) ___-__-__" /></label>
          <label class="auth-field">E-mail<input v-model="email" type="text" inputmode="email" autocomplete="off" required placeholder="Введите ваш e-mail" /></label>
          <div class="auth-field"><label for="register-password">Пароль</label><div class="password-control"><input id="register-password" v-model="password" :type="showPassword ? 'text' : 'password'" autocomplete="off" required placeholder="Придумайте пароль" /><button type="button" :aria-label="showPassword ? 'Скрыть пароль' : 'Показать пароль'" @click="showPassword = !showPassword"><EyeOff v-if="showPassword" :size="19" aria-hidden="true" /><Eye v-else :size="19" aria-hidden="true" /></button></div></div>
          <div class="auth-field"><label for="register-repeat">Пароль ещё раз</label><div class="password-control"><input id="register-repeat" v-model="repeatPassword" :type="showRepeatPassword ? 'text' : 'password'" autocomplete="off" required placeholder="Повторите пароль" /><button type="button" :aria-label="showRepeatPassword ? 'Скрыть повтор пароля' : 'Показать повтор пароля'" @click="showRepeatPassword = !showRepeatPassword"><EyeOff v-if="showRepeatPassword" :size="19" aria-hidden="true" /><Eye v-else :size="19" aria-hidden="true" /></button></div></div>
          <label class="consent-example"><input v-model="consent" type="checkbox" /><span>Использую вымышленные данные</span></label>
          <button class="submit-button" type="submit">Продолжить <ArrowRight :size="18" aria-hidden="true" /></button>
        </form>
        <div v-else class="verify-content">
          <div class="verify-icon"><MailCheck :size="27" aria-hidden="true" /></div>
          <div class="verify-address">{{ pendingProfile?.email }}</div>
          <p>Если адрес указан верно, можно открыть кабинет.</p>
          <button class="submit-button" type="button" @click="confirmDemo">Открыть кабинет <ArrowRight :size="18" aria-hidden="true" /></button>
          <button class="verify-back" type="button" @click="changeScreen('register')"><ArrowLeft :size="16" aria-hidden="true" /> Вернуться и исправить e-mail</button>
        </div>
      </section>
      <p class="auth-switch" v-if="screen === 'login'">Ещё нет аккаунта? <button type="button" @click="changeScreen('register')">Регистрация</button></p>
      <p class="auth-switch" v-else-if="screen === 'register'">Уже есть аккаунт? <button type="button" @click="changeScreen('login')">Войти</button></p>
    </div>
  </main>
</template>

<style scoped>
.auth-page{min-height:calc(100vh - 94px);background:#f6f6f4;color:#1a1a1a;padding:28px 20px 64px}.auth-container{width:min(100%,560px);margin:0 auto}.back-link{display:inline-flex;align-items:center;gap:7px;padding:0;color:#5c5d59;font-size:14px}.back-link:hover{color:#111}.auth-top{text-align:center;margin:22px 0 20px}.auth-symbol{width:48px;height:48px;margin:0 auto 10px;display:grid;place-items:center;border-radius:13px;background:#ffc107;color:#171717}.auth-top p{margin:0;color:#777;font-size:10px;letter-spacing:.13em;font-weight:750}.auth-card{padding:32px 36px 36px;background:#fff;border:1px solid #e5e5e1;border-radius:16px;box-shadow:0 8px 30px #1a1a1a0a}.auth-heading{text-align:center}.auth-heading h1{margin:0;font-size:27px;line-height:1.2;letter-spacing:-.035em}.auth-heading p{margin:9px 0 0;font-size:13px;color:#777}.demo-note{display:flex;align-items:flex-start;gap:9px;margin:24px 0 22px;padding:12px 13px;border-radius:9px;background:#fff8e2;color:#63501c;font-size:12px;line-height:1.5}.demo-note svg{flex:none;margin-top:1px}.auth-form{display:grid;gap:17px}.auth-field{display:grid;gap:7px;color:#333;font-size:13px;font-weight:650}.auth-field input,.password-control input{width:100%;height:48px;min-width:0;padding:0 13px;border:1px solid #dddedb;border-radius:8px;background:#fff;color:#171717;font:inherit;font-size:14px;font-weight:450}.auth-field input::placeholder,.password-control input::placeholder{color:#a0a39f}.auth-field input:focus-visible,.password-control input:focus-visible{outline:2px solid #d09d00;outline-offset:1px}.password-heading{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:-10px;color:#333;font-size:13px;font-weight:650}.subtle-link,.auth-switch button{padding:0;background:none;color:#6b5a2f;font-size:13px;font-weight:650}.subtle-link:hover,.auth-switch button:hover{text-decoration:underline}.password-control{position:relative;display:block}.password-control input{padding-right:48px}.password-control button{position:absolute;right:5px;top:4px;display:grid;place-items:center;width:40px;height:40px;color:#727570;border-radius:6px}.password-control button:hover{background:#f4f4f1}.recovery-note{margin:-7px 0 0;font-size:12px;color:#777;line-height:1.5}.submit-button{display:flex;align-items:center;justify-content:center;gap:12px;min-height:49px;margin-top:4px;padding:10px 16px;border-radius:9px;background:#ffc107;color:#171717;font-size:14px;font-weight:750}.submit-button:hover{background:#eeb400}.auth-switch{text-align:center;margin:20px 0 0;color:#797b76;font-size:13px}.auth-switch button{font-size:13px;color:#252525}.role-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.role-grid button{min-height:74px;display:flex;align-items:center;gap:12px;padding:12px 14px;border:1px solid #dededb;border-radius:9px;background:#fff;color:#353535;text-align:left}.role-grid button.active,.kind-options button.active{border-color:#e2ad00;background:#fff8df}.role-grid button>svg{flex:none}.role-grid button span{display:grid;gap:4px}.role-grid strong{font-size:14px}.role-grid small{font-size:11px;line-height:1.3;color:#777}.kind-block>p{margin:0 0 8px;font-size:13px;font-weight:650}.kind-options{display:flex;flex-wrap:wrap;gap:8px}.kind-options button{display:inline-flex;align-items:center;gap:6px;padding:10px 13px;border:1px solid #dededb;border-radius:8px;font-size:13px}.consent-example{display:flex;align-items:flex-start;gap:9px;color:#555;font-size:12px;line-height:1.45}.consent-example input{width:17px;height:17px;flex:none;margin:0;accent-color:#ffc107}.consent-example small{color:#888;font-size:12px}
.verify-content{text-align:center}.verify-icon{display:grid;place-items:center;width:58px;height:58px;margin:0 auto 18px;border-radius:50%;background:#fff6da;color:#bf9000}.verify-address{padding:13px;border:1px solid #e5e5e1;border-radius:9px;background:#f7f7f5;font-weight:700;overflow-wrap:anywhere}.verify-content p{margin:15px 0;color:#676963;font-size:13px;line-height:1.55}.verify-content .submit-button{width:100%}.verify-back{display:inline-flex;align-items:center;gap:6px;margin-top:18px;color:#5d5f5a;font-size:13px;font-weight:650}.verify-back:hover{text-decoration:underline}
.login-method{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin:0 0 20px;padding:4px;border-radius:10px;background:#f3f3f0}.login-method button{padding:11px 8px;border-radius:7px;color:#666;font-size:13px;font-weight:650}.login-method button[aria-pressed="true"]{background:#fff;color:#1a1a1a;box-shadow:0 2px 8px #0000000d}.sms-note{margin:0;color:#777;font-size:12px;line-height:1.5}.sms-note strong{color:#333;overflow-wrap:anywhere}.sms-back{display:inline-flex;justify-content:center;align-items:center;gap:6px;color:#5d5f5a;font-size:13px;font-weight:650}.sms-back:hover{text-decoration:underline}
@media(max-width:600px){.auth-page{min-height:calc(100vh - 77px);padding:22px 16px 48px}.auth-top{margin:20px 0 16px}.auth-card{padding:25px 20px 26px;border-radius:13px}.auth-heading h1{font-size:23px}.demo-note{margin:19px 0}.auth-form{gap:15px}.role-grid button{min-height:72px;padding:10px;gap:8px}.role-grid strong{font-size:13px}.role-grid small{font-size:10px}}
/* iOS Safari zooms the entire page when a focused input uses text smaller than 16px. */
@media (max-width:600px), (hover:none) and (pointer:coarse){.auth-field input,.password-control input{font-size:16px}}
@media(max-width:360px){.role-grid{grid-template-columns:1fr}.role-grid button{min-height:58px}}
</style>
