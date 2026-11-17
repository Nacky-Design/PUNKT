export type Car = {
  id: number;
  name: string;
  year: number;
  category: string;
  price: number;
  power: number;
  fuel: string;
  drive: string;
  image: number;
};
export const cars: Car[] = [
  {
    id: 1,
    name: "Hyundai Solaris",
    year: 2021,
    category: "Эконом",
    price: 2900,
    power: 123,
    fuel: "Бензин",
    drive: "Передний",
    image: 0,
  },
  {
    id: 2,
    name: "Kia Rio",
    year: 2022,
    category: "Эконом",
    price: 3200,
    power: 123,
    fuel: "Бензин",
    drive: "Передний",
    image: 1,
  },
  {
    id: 3,
    name: "BMW 3 Series",
    year: 2019,
    category: "Бизнес",
    price: 5500,
    power: 184,
    fuel: "Бензин",
    drive: "Задний",
    image: 2,
  },
  {
    id: 4,
    name: "Toyota Camry",
    year: 2021,
    category: "Бизнес",
    price: 6200,
    power: 200,
    fuel: "Бензин",
    drive: "Передний",
    image: 3,
  },
  {
    id: 5,
    name: "Geely Coolray",
    year: 2023,
    category: "Кроссовер",
    price: 4800,
    power: 150,
    fuel: "Бензин",
    drive: "Передний",
    image: 4,
  },
  {
    id: 6,
    name: "Haval Jolion",
    year: 2023,
    category: "Кроссовер",
    price: 4600,
    power: 143,
    fuel: "Бензин",
    drive: "Передний",
    image: 5,
  },
];
export const categories = [
  "Все классы",
  "Эконом",
  "Стандарт",
  "Бизнес",
  "Кроссовер",
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
