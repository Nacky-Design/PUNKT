export type CarPhoto = { label: string; file: string; role?: "front" | "rear" | "interior" | "other"; thumbnail?: string; illustration?: boolean };
export type Car = {
  id: number;
  name: string;
  year: number;
  category: string;
  price: number;
  protectionPrice?: number;
  deposit?: number;
  overagePrice?: number;
  washPrice?: number;
  modelDescription?: string;
  autoUrl?: string;
  power: number;
  seats: number;
  fuel: string;
  drive: string;
  body: "Седан" | "Кроссовер";
  image: number;
  photos?: CarPhoto[];
  extraSpecs?: { label: string; value: string }[];
  trim?: { name: string; features: string[] };
};
const demoPhotos = (model: string): CarPhoto[] => [
  { label: "Вид спереди", file: `demo-${model}-front.webp`, thumbnail: `demo-${model}-thumb.webp`, role: "front", illustration: true },
  { label: "Вид сзади", file: `demo-${model}-rear.webp`, role: "rear", illustration: true },
];
export const cars: Car[] = [
  {
    id: 1,
    name: "Hyundai Solaris",
    year: 2021,
    category: "Эконом",
    price: 2900,
    protectionPrice: 490,
    deposit: 10000,
    overagePrice: 8,
    washPrice: 1500,
    modelDescription: "Практичный седан для города и загородных поездок. Hyundai Solaris сочетает экономичность, комфорт и доступное обслуживание.",
    autoUrl: "https://auto.ru/catalog/cars/hyundai/solaris/21796089/21796128/equipment/21796128_21800863_21796132/",
    power: 123,
    seats: 5,
    fuel: "Бензин",
    drive: "Передний",
    body: "Седан",
    image: 0,
    photos: demoPhotos("solaris"),
    extraSpecs: [
      { label: "Двигатель", value: "1,6 л" },
      { label: "Объём багажника", value: "480 л" },
      { label: "Клиренс", value: "160 мм" },
      { label: "Средний расход", value: "6,6 л / 100 км" },
      { label: "Разгон до 100 км/ч", value: "11,2 с" },
      { label: "Длина × ширина × высота", value: "4 405 × 1 729 × 1 469 мм" },
    ],
    trim: {
      name: "Comfort",
      features: [
        "Кондиционер", "Подогрев передних сидений", "Мультимедиа с Bluetooth",
        "Управление аудио на руле", "Электростеклоподъёмники",
        "Электрорегулировка зеркал", "Центральный замок", "Две подушки безопасности",
      ],
    },
  },
  {
    id: 2,
    name: "Kia Rio",
    year: 2022,
    category: "Эконом",
    price: 3200,
    protectionPrice: 590,
    deposit: 12000,
    power: 123,
    seats: 5,
    fuel: "Бензин",
    drive: "Передний",
    body: "Седан",
    image: 1,
    photos: demoPhotos("rio"),
  },
  {
    id: 3,
    name: "BMW 3 Series",
    year: 2019,
    category: "Бизнес",
    price: 5500,
    protectionPrice: 890,
    deposit: 20000,
    power: 184,
    seats: 5,
    fuel: "Бензин",
    drive: "Задний",
    body: "Седан",
    image: 2,
    photos: demoPhotos("bmw"),
  },
  {
    id: 4,
    name: "Toyota Camry",
    year: 2021,
    category: "Бизнес",
    price: 6200,
    protectionPrice: 990,
    deposit: 25000,
    power: 200,
    seats: 5,
    fuel: "Бензин",
    drive: "Передний",
    body: "Седан",
    image: 3,
    photos: demoPhotos("camry"),
  },
  {
    id: 5,
    name: "Geely Coolray",
    year: 2023,
    category: "Кроссовер",
    price: 4800,
    power: 150,
    seats: 5,
    fuel: "Бензин",
    drive: "Передний",
    body: "Кроссовер",
    image: 4,
    photos: demoPhotos("coolray"),
  },
  {
    id: 6,
    name: "Haval Jolion",
    year: 2023,
    category: "Кроссовер",
    price: 4600,
    power: 143,
    seats: 5,
    fuel: "Бензин",
    drive: "Передний",
    body: "Кроссовер",
    image: 5,
    photos: demoPhotos("jolion"),
  },
];
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
      { id: "russia", title: "Поездки по России", description: "Расскажите о маршруте до оформления, чтобы согласовать регионы поездки и подходящий лимит пробега." },
      { id: "abroad", title: "Поездки за границу", description: "На наших автомобилях можно поехать в Беларусь. Условия поездки и документы согласуем заранее." },
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
export const daytimeDeliveryHours = "09:00–21:00";
export const money = (n: number) => new Intl.NumberFormat("ru-RU").format(n);
export const isoDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export const localDate = (str: string) => new Date(str + "T12:00:00");
export function rentalTime(value: string) {
  const time = value.trim().replace(/^(\d):/, "0$1:").replace(/^(\d{2})(\d{2})$/, "$1:$2");
  return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time) ? time : "";
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
