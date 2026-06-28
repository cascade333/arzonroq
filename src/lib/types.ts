export type CarStatus = "pending_verification" | "available" | "sold" | "delisted" | "rejected" | "archived";

export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  region: string;
  price: number;
  transmission: "Автомат" | "Механика";
  fuelType: "Бензин" | "Дизель" | "Газ" | "Электро" | "Гибрид";
  description?: string;
  status: CarStatus;
  images: string[];
  createdAt: string; // ISO date
  sellerPhone: string;
  isDamaged: boolean;
  damageDescription?: string;
}

export const REGIONS = [
  "Весь Узбекистан",
  "Ташкент",
  "Ташкентская область",
  "Самарканд",
  "Бухара",
  "Андижан",
  "Фергана",
  "Наманган",
  "Кашкадарья",
  "Сурхандарья",
  "Хорезм",
  "Навои",
  "Джизак",
  "Сырдарья",
  "Каракалпакстан",
] as const;

export const BRANDS = [
  "Chevrolet",
  "Daewoo",
  "Ravon",
  "Hyundai",
  "Kia",
  "Toyota",
  "Changan",
  "BYD",
  "Chery",
  "Geely",
  "Haval",
  "Lada (ВАЗ)",
  "Mercedes",
  "BMW",
  "Audi",
  "Volkswagen",
  "Nissan",
  "Honda",
  "Mazda",
  "Mitsubishi",
  "Lexus",
  "GAZ (ГАЗ)",
  "Moskvich (Москвич)",
  "Dongfeng",
  "Jetour",
  "Voyah",
  "Deepal",
  "Leapmotor",
  "Zeekr",
] as const;

export const MODELS_BY_BRAND: Record<string, string[]> = {
  Chevrolet: ["Tracker", "Cobalt", "Nexia", "Onix", "Malibu", "Captiva", "Spark", "Niva"],
  Daewoo: ["Matiz", "Nexia", "Damas", "Lacetti"],
  Ravon: ["R2", "R3", "R4", "Nexia R3"],
  Hyundai: ["Sonata", "Tucson", "Elantra", "Santa Fe", "Accent", "Creta"],
  Kia: ["Sportage", "K5", "Sorento", "Cerato", "Seltos", "Sonet", "Optima"],
  Toyota: ["Camry", "Corolla", "RAV4", "Land Cruiser", "Land Cruiser Prado", "Hilux"],
  Changan: ["CS35", "CS55", "CS55 Plus", "Eado", "UNI-K", "UNI-V", "Alsvin", "T3"],
  BYD: ["Han", "Song Plus", "Seal", "Atto 3", "Dolphin", "Qin Plus", "Yuan Plus", "Yuan Up"],
  Chery: ["Tiggo 7", "Tiggo 8", "Arrizo 5"],
  Geely: ["Coolray", "Monjaro", "Atlas Pro"],
  Haval: ["Jolion", "F7", "M6"],
  "Lada (ВАЗ)": ["Granta", "Vesta", "Niva Travel", "Largus", "2106", "2107", "2114", "2115"],
  Mercedes: ["E-Class", "S-Class", "C-Class", "GLE", "ML350", "GLC"],
  BMW: ["3 Series", "5 Series", "X5", "X6", "X3", "7 Series"],
  Audi: ["A6", "A4", "Q7", "Q5"],
  Volkswagen: ["Passat", "Tiguan", "Polo", "Golf"],
  Nissan: ["X-Trail", "Qashqai", "Patrol", "Almera"],
  Honda: ["CR-V", "Civic", "Accord", "Pilot"],
  Mazda: ["CX-5", "Mazda 6", "Mazda 3"],
  Mitsubishi: ["Outlander", "Pajero", "ASX"],
  Lexus: ["RX", "LX", "ES", "NX"],
  "GAZ (ГАЗ)": ["Volga", "Gazel"],
  "Moskvich (Москвич)": ["3", "6"],
  Dongfeng: ["Shine GS", "008", "Box"],
  Jetour: ["Dashing", "X70"],
  Voyah: ["Free", "Dream"],
  Deepal: ["S07", "S05", "S09"],
  Leapmotor: ["C11", "C10"],
  Zeekr: ["001", "007", "X"],
};
