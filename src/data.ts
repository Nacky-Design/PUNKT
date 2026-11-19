export type CarPhoto = { label: string; file: string };
export type Car = {
  id: number;
  name: string;
  year: number;
  category: string;
  price: number;
  power: number;
  seats: number;
  fuel: string;
  drive: string;
  body: "Седан" | "Кроссовер" | "Лифтбек";
  image: number | string;
  fleetImage?: string;
  photos?: CarPhoto[];
  extraSpecs?: { label: string; value: string }[];
  trim?: { name: string; features: string[] };
};
export const cars: Car[] = [
  {
    id: 1,
    name: "Hyundai Solaris",
    year: 2021,
    category: "Эконом",
    price: 2900,
    power: 123,
    seats: 5,
    fuel: "Бензин",
    drive: "Передний",
    body: "Седан",
    image: 0,
    fleetImage: "fleet-solaris.webp",
    photos: [
      { label: "Общий вид", file: "solaris-exterior.webp" },
      { label: "Место водителя", file: "solaris-interior.webp" },
      { label: "Задние сиденья", file: "solaris-seats.webp" },
      { label: "Багажник", file: "solaris-trunk.webp" },
    ],
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
    power: 123,
    seats: 5,
    fuel: "Бензин",
    drive: "Передний",
    body: "Седан",
    image: 1,
    fleetImage: "fleet-rio.webp",
  },
  {
    id: 3,
    name: "BMW 3 Series",
    year: 2019,
    category: "Бизнес",
    price: 5500,
    power: 184,
    seats: 5,
    fuel: "Бензин",
    drive: "Задний",
    body: "Седан",
    image: 2,
    fleetImage: "fleet-bmw-3.webp",
  },
  {
    id: 4,
    name: "Toyota Camry",
    year: 2021,
    category: "Бизнес",
    price: 6200,
    power: 200,
    seats: 5,
    fuel: "Бензин",
    drive: "Передний",
    body: "Седан",
    image: 3,
    fleetImage: "fleet-camry.webp",
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
    fleetImage: "fleet-coolray.webp",
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
    fleetImage: "fleet-jolion.webp",
  },
  {
    id: 7,
    name: "Volkswagen Polo",
    year: 2022,
    category: "Эконом",
    price: 3400,
    power: 110,
    seats: 5,
    fuel: "Бензин",
    drive: "Передний",
    body: "Лифтбек",
    image: "polo.webp",
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
    title: "Срок и формат",
    items: [
      { title: "На сутки", description: "Выберите даты в подборе. До оформления согласуем время выдачи и возврата." },
      { title: "Долгосрочная аренда", description: "Сообщите, на какой срок нужна машина. Обсудим тариф, пробег и обслуживание на весь период." },
      { title: "Подписка", description: "Уточните у команды, какие автомобили доступны по подписке и что входит в ежемесячный платёж." },
      { title: "С выкупом", description: "Свяжитесь с нами, чтобы узнать о доступных автомобилях, графике платежей и условиях выкупа." },
    ],
  },
  {
    title: "Поездки и события",
    items: [
      { title: "В аэропорт", description: "Выберите аэропорт в поле «Место получения». Точку встречи и время подачи согласуем заранее." },
      { title: "Поездки по России", description: "Расскажите о маршруте до оформления, чтобы согласовать регионы поездки и подходящий лимит пробега." },
      { title: "Поездки за границу", description: "Сообщите страну и маршрут. Возможность выезда и необходимые документы уточняются заранее." },
      { title: "С водителем", description: "Сообщите дату, маршрут и число пассажиров. Уточним возможность подачи и стоимость поездки." },
      { title: "На свадьбу", description: "Назовите дату, адрес и время подачи. Подберём доступные варианты и обсудим длительность аренды." },
      { title: "Для съёмок", description: "Расскажите о съёмке, площадке и требованиях к автомобилю, чтобы обсудить наличие и условия аренды." },
    ],
  },
  {
    title: "Особые условия",
    items: [
      { title: "Юридическим лицам", description: "Укажите «Для юридических лиц» в подборе. Согласуем порядок оплаты и комплект документов." },
      { title: "Иностранным гражданам", description: "Отметьте «Иностранный гражданин» в подборе. До выдачи уточним требования к документам для аренды." },
      { title: "Без залога", description: "Уточните, какие автомобили и тарифы допускают аренду без залога. Условия зависят от выбранного варианта." },
      { title: "Техпомощь", description: "При неисправности свяжитесь с командой по телефону 8 495 104-10-10, чтобы согласовать дальнейшие действия." },
    ],
  },
];
export const money = (n: number) => new Intl.NumberFormat("ru-RU").format(n);
export const isoDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export const localDate = (str: string) => new Date(str + "T12:00:00");
export const todayISO = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Moscow",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
export const addDays = (str: string, days: number) => {
  const d = localDate(str);
  d.setDate(d.getDate() + days);
  return isoDate(d);
};
