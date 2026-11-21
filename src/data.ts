export type CarPhoto = {
  label: string;
  file: string;
  role?: "front" | "exterior" | "rear" | "interior" | "trunk" | "other";
  thumbnail?: string;
  thumbnailHorizontalPosition?: number;
  verticalPosition?: number;
};
export const mileageOptions = ["100 км / сутки", "250 км / сутки", "500 км / сутки"] as const;
export const baseMileage = mileageOptions[0];
export const washPrices = { Эконом: 1300, Стандарт: 1500, Кроссовер: 1800, Бизнес: 2000 };
type MileageLimit = 100 | 250 | 500;
export type Car = {
  id: number;
  name: string;
  hidden?: boolean;
  year?: number;
  category: keyof typeof washPrices;
  rates: Record<MileageLimit, number>;
  protectionPrice: number;
  deposit: number;
  overagePrice: number;
  modelDescription?: string;
  autoUrl?: string;
  power?: number;
  seats?: number;
  fuel: string;
  drive: string;
  body: "Седан" | "Кроссовер";
  image: number;
  photos?: CarPhoto[];
  extraSpecs?: { label: string; value: string }[];
  trim?: { name: string; features: string[] };
};
export function mileageLimit(option: string): MileageLimit {
  if (option === mileageOptions[1]) return 250;
  if (option === mileageOptions[2]) return 500;
  return 100;
}
export function rentalRate(car: Car, option: string) {
  return car.rates[mileageLimit(option)];
}
const demoPhotos = (model: string): CarPhoto[] => [
  { label: "Вид спереди", file: `demo-${model}-front.webp`, thumbnail: `demo-${model}-thumb.webp`, role: "front" },
  { label: "Вид сзади", file: `demo-${model}-rear.webp`, role: "rear" },
];
const fleetPhotoVersion = "punkt-plates-1";
function fleetPhotos(directory: string, frames: [
  name: string, label: string, role: NonNullable<CarPhoto["role"]>, verticalPosition?: number,
  thumbnailHorizontalPosition?: number,
][]): CarPhoto[] {
  return frames.map(([name, label, role, verticalPosition, thumbnailHorizontalPosition]) => ({
    label,
    file: `cars/${directory}/${name}.webp?v=${fleetPhotoVersion}`,
    thumbnail: `cars/${directory}/${name}-thumb.webp?v=${fleetPhotoVersion}`,
    thumbnailHorizontalPosition,
    role,
    verticalPosition,
  }));
}
const fleet: Car[] = [
  {
    id: 1,
    name: "Hyundai Solaris",
    year: 2021,
    category: "Эконом",
    rates: { 100: 2600, 250: 3000, 500: 4000 },
    protectionPrice: 500,
    deposit: 10000,
    overagePrice: 8,
    modelDescription: "Практичный седан для города и загородных поездок. Hyundai Solaris сочетает экономичность, комфорт и доступное обслуживание.",
    power: 123,
    seats: 5,
    fuel: "Бензин",
    drive: "Передний",
    body: "Седан",
    image: 0,
    photos: fleetPhotos("solaris", [
      ["blue-front", "Синий, вид спереди", "front", undefined, 70],
      ["blue-rear-quarter", "Синий, вид сзади под углом", "rear"],
      ["blue-side", "Синий, вид сбоку", "exterior", 80],
      ["blue-front-other-side", "Синий, вид спереди с другой стороны", "exterior"],
      ["blue-rear", "Синий, вид сзади", "rear", 72],
      ["black-front", "Чёрный, вид спереди", "exterior", undefined, 72],
      ["black-rear-quarter", "Чёрный, вид сзади под углом", "rear"],
      ["black-rear", "Чёрный, вид сзади", "rear", 66],
      ["blue-interior", "Синий, общий вид салона", "interior"],
      ["blue-dashboard", "Синий, руль и приборная панель", "interior"],
      ["blue-front-seats", "Синий, передние сиденья", "interior"],
      ["black-interior", "Чёрный, общий вид салона", "interior"],
      ["black-driver-seat", "Чёрный, место водителя", "interior"],
      ["black-front-seats", "Чёрный, передние сиденья", "interior"],
      ["black-rear-seats", "Чёрный, задние сиденья", "interior"],
      ["climate-controls", "Панель климат-контроля", "interior"],
      ["black-trunk", "Чёрный, багажник", "trunk"],
    ]),
    extraSpecs: [
      { label: "Двигатель", value: "1,6 л" },
      { label: "Объём багажника", value: "480 л" },
      { label: "Клиренс", value: "160 мм" },
      { label: "Средний расход", value: "6,6 л / 100 км" },
      { label: "Разгон до 100 км/ч", value: "11,2 с" },
      { label: "Длина × ширина × высота", value: "4 405 × 1 729 × 1 469 мм" },
    ],
    trim: {
      name: "Elegance",
      features: ["Apple CarPlay и Android Auto", "Камера заднего вида", "Датчик света", "Противотуманные фары"],
    },
  },
  {
    id: 2,
    name: "Kia Rio",
    year: 2022,
    category: "Эконом",
    rates: { 100: 2800, 250: 3200, 500: 4200 },
    protectionPrice: 600,
    deposit: 10000,
    overagePrice: 9,
    power: 123,
    seats: 5,
    fuel: "Бензин",
    drive: "Передний",
    body: "Седан",
    image: 1,
    photos: fleetPhotos("rio-white", [
      ["front", "Вид спереди под углом", "front"],
      ["side", "Вид сбоку", "exterior"],
      ["rear-left", "Вид сзади слева", "rear"],
      ["rear-right", "Вид сзади справа", "rear"],
      ["dashboard", "Место водителя", "interior"],
      ["passenger-seat", "Переднее пассажирское место", "interior"],
    ]),
    extraSpecs: [{ label: "Двигатель", value: "1,6 л" }],
    trim: {
      name: "Comfort",
      features: ["Мультимедиа с FM и Bluetooth", "Датчик света", "Противотуманные фары", "Обогрев лобового стекла"],
    },
  },
  {
    id: 3,
    name: "BMW 318d (G20)",
    hidden: true,
    category: "Бизнес",
    rates: { 100: 5500, 250: 6500, 500: 8000 },
    protectionPrice: 1500,
    deposit: 20000,
    overagePrice: 15,
    seats: 5,
    fuel: "Дизель",
    drive: "Задний",
    body: "Седан",
    image: 2,
    photos: demoPhotos("bmw"),
  },
  {
    id: 5,
    name: "Geely Coolray",
    year: 2023,
    category: "Кроссовер",
    rates: { 100: 3200, 250: 4000, 500: 5000 },
    protectionPrice: 700,
    deposit: 12000,
    overagePrice: 10,
    power: 150,
    seats: 5,
    fuel: "Бензин",
    drive: "Передний",
    body: "Кроссовер",
    image: 4,
    photos: fleetPhotos("coolray-white", [
      ["front", "Вид спереди", "front", undefined, 35],
      ["side", "Вид сбоку", "exterior"],
      ["rear", "Вид сзади", "rear"],
      ["interior", "Салон", "interior"],
      ["panoramic-roof", "Панорамная крыша", "interior"],
      ["trunk", "Багажник", "trunk"],
    ]),
    extraSpecs: [{ label: "Двигатель", value: "1,5 л" }],
  },
  {
    id: 6,
    name: "Haval Jolion",
    year: 2023,
    category: "Кроссовер",
    rates: { 100: 3200, 250: 4000, 500: 5000 },
    protectionPrice: 700,
    deposit: 12000,
    overagePrice: 10,
    seats: 5,
    fuel: "Бензин",
    drive: "Полный",
    body: "Кроссовер",
    image: 5,
    photos: fleetPhotos("jolion", [
      ["silver-front", "Серебристый, вид спереди", "front"],
      ["silver-side", "Серебристый, вид сбоку", "exterior"],
      ["white-front", "Белый, вид спереди", "exterior", 58],
      ["white-rear-left", "Белый, вид сзади слева", "rear", 70],
      ["white-rear-right", "Белый, вид сзади справа", "rear", 70],
      ["silver-interior", "Серебристый, салон", "interior"],
      ["white-interior", "Белый, салон", "interior"],
      ["white-trunk", "Белый, багажник", "trunk"],
    ]),
    extraSpecs: [{ label: "Двигатель", value: "1,5 л" }],
  },
  {
    id: 7,
    name: "Hyundai Creta 4WD",
    category: "Кроссовер",
    rates: { 100: 3300, 250: 4200, 500: 5200 },
    protectionPrice: 700,
    deposit: 12000,
    overagePrice: 10,
    fuel: "Бензин",
    drive: "Полный",
    body: "Кроссовер",
    image: 6,
    photos: fleetPhotos("creta-white", [
      ["front", "Белая, вид спереди", "front", 80, 42],
      ["side", "Белая, вид сбоку", "exterior", 84],
      ["rear-quarter", "Белая, вид сзади под углом", "rear"],
      ["rear", "Белая, вид сзади", "rear"],
      ["front-turned-wheel", "Белая, передний ракурс с повёрнутыми колёсами", "exterior", undefined, 30],
      ["rear-lights", "Белая, задние фонари", "rear"],
      ["interior", "Белая, общий вид салона", "interior"],
    ]),
    extraSpecs: [{ label: "Двигатель", value: "2,0 л" }],
  },
  {
    id: 8,
    name: "Geely Cityray",
    category: "Кроссовер",
    rates: { 100: 3800, 250: 4500, 500: 5500 },
    protectionPrice: 900,
    deposit: 15000,
    overagePrice: 12,
    fuel: "Бензин",
    drive: "Передний",
    body: "Кроссовер",
    image: 7,
    photos: fleetPhotos("cityray", [
      ["white-front", "Белый, вид спереди", "front", undefined, 35],
      ["white-side", "Белый, вид сбоку", "exterior"],
      ["gray-front-right", "Серый, вид спереди справа", "exterior", undefined, 70],
      ["gray-front-left", "Серый, вид спереди слева", "exterior"],
      ["gray-side", "Серый, вид сбоку", "exterior"],
      ["gray-rear", "Серый, вид сзади под углом", "rear", undefined, 32],
      ["interior", "Салон и приборная панель", "interior"],
      ["white-trunk", "Белый, багажник со сложенными сиденьями", "trunk"],
    ]),
    extraSpecs: [{ label: "Двигатель", value: "1,5 л" }],
  },
];
export const cars = fleet.filter(car => !car.hidden);
export const categories = [
  "Все классы",
  "Эконом",
  "Стандарт",
  "Бизнес",
  "Кроссовер",
];
export const serviceGroups = [
  {
    title: "Формат аренды",
    items: [
      { id: "driver", title: "С водителем", description: "Сообщите дату, маршрут и число пассажиров. Уточним возможность подачи и стоимость поездки." },
      { id: "daily", title: "На сутки", description: "Автомобиль на один день или несколько суток." },
      { id: "long-term", title: "Долгосрочная аренда", description: "Сообщите, на какой срок нужна машина. Обсудим тариф, пробег и обслуживание на весь период." },
      { id: "subscription", title: "Подписка", description: "Уточните у команды, какие автомобили доступны по подписке и что входит в ежемесячный платёж." },
      { id: "buyout", title: "С выкупом", description: "Свяжитесь с нами, чтобы узнать о доступных автомобилях, графике платежей и условиях выкупа." },
    ],
  },
  {
    title: "Поездки и события",
    items: [
      { id: "russia", title: "Поездки по России", description: "Расскажите о маршруте до оформления. Согласуем лимит пробега и укажем в договоре территорию поездки." },
      { id: "abroad", title: "Поездки за границу", description: "На наших автомобилях можно поехать в Беларусь по согласованию. До выдачи согласуем условия, документы и территорию поездки в договоре." },
    ],
  },
  {
    title: "Особые условия",
    items: [
      { id: "business", title: "Юридическим лицам", description: "Укажите «Для юридических лиц» в подборе. Согласуем порядок оплаты и комплект документов." },
      { id: "international", title: "Иностранным гражданам", description: "Отметьте «Иностранный гражданин» в подборе. До выдачи уточним требования к документам для аренды." },
      { id: "deposit", title: "Без залога", description: "Уточните, какие автомобили и тарифы допускают аренду без залога. Условия зависят от выбранного варианта." },
      { id: "roadside", title: "Техпомощь", description: "При неисправности свяжитесь с командой по телефону 8 495 104-10-10, чтобы согласовать дальнейшие действия." },
    ],
  },
] as const;
export const officePickupHours = "09:00–21:00";
export const daytimeDeliveryHours = "09:00–21:00";
export const officeAddress = "Москва, ул. Авиационная, 24с1";
export const money = (n: number) => new Intl.NumberFormat("ru-RU").format(n);
export const isoDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export const localDate = (str: string) => new Date(str + "T12:00:00");
export function rentalTime(value: string) {
  const time = value.trim().replace(/^(\d):/, "0$1:").replace(/^(\d{2})(\d{2})$/, "$1:$2");
  return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time) ? time : "";
}
export type RentalPeriod = { start: string; end: string; startTime: string; endTime: string };
export function checkRentalPeriod(period: RentalPeriod, now: Date) {
  if (!period.start || !period.end) return { days: 0, error: "Выберите даты получения и возврата." };
  const pickup = Date.parse(`${period.start}T${rentalTime(period.startTime)}:00+03:00`);
  const dropoff = Date.parse(`${period.end}T${rentalTime(period.endTime)}:00+03:00`);
  if (!Number.isFinite(pickup) || !Number.isFinite(dropoff)) {
    return { days: 0, error: "Укажите время получения и возврата в формате ЧЧ:ММ." };
  }
  const currentMinute = Math.floor(now.getTime() / 60000) * 60000;
  if (pickup < currentMinute) return { days: 0, error: "Выберите дату и время получения в будущем." };
  if (dropoff <= pickup) return { days: 0, error: "Возврат должен быть позже получения." };
  return { days: Math.ceil((dropoff - pickup) / 86400000), error: "" };
}
export const todayISO = (date = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Moscow",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
export const addDays = (str: string, days: number) => {
  const d = localDate(str);
  d.setDate(d.getDate() + days);
  return isoDate(d);
};

export function defaultVehiclePeriod(now: Date): RentalPeriod {
  const nextHour = new Date(Math.ceil(now.getTime() / 3600000) * 3600000);
  const hour = (nextHour.getUTCHours() + 3) % 24;
  const start = hour >= 21 ? addDays(todayISO(nextHour), 1) : todayISO(nextHour);
  const time = hour < 9 || hour >= 21 ? "09:00" : `${String(hour).padStart(2, "0")}:00`;
  return { start, end: addDays(start, 1), startTime: time, endTime: time };
}


export function profileInitials(name: string, fallback: string) {
  return name.trim().split(/\s+/u).slice(0, 2)
    .map(word => word.match(/[\p{L}\p{N}]/u)?.[0] ?? '').join('').toLocaleUpperCase('ru-RU') || fallback;
}
