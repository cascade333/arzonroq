import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SELLERS = [
  { name: "Шерзод Каримов", phone: "+998901234567" },
  { name: "Дилшод Юсупов", phone: "+998931112233" },
  { name: "Азиз Турдиев", phone: "+998971234455" },
  { name: "Нодира Абдуллаева", phone: "+998935556677" },
];

// Разнообразный набор тестовых авто: разные марки, модели, города, цены —
// чтобы сразу было видно работу фильтров и сортировки по цене.
const CARS = [
  { brand: "Chevrolet", model: "Tracker", year: 2023, mileage: 43000, region: "Ташкент", price: 13500, transmission: "AUTOMATIC", fuelType: "PETROL", description: "Один владелец, без аварий. Полная сервисная история у официального дилера." },
  { brand: "Chevrolet", model: "Tracker", year: 2023, mileage: 55000, region: "Ташкент", price: 13700, transmission: "AUTOMATIC", fuelType: "PETROL", description: "Второй владелец. Все ТО пройдены по графику." },
  { brand: "Chevrolet", model: "Cobalt", year: 2022, mileage: 38000, region: "Самарканд", price: 9800, transmission: "MANUAL", fuelType: "PETROL", description: "Город Самарканд, идеальное состояние." },
  { brand: "Chevrolet", model: "Nexia", year: 2021, mileage: 72000, region: "Бухара", price: 7200, transmission: "MANUAL", fuelType: "PETROL", description: null },
  { brand: "Chevrolet", model: "Onix", year: 2024, mileage: 12000, region: "Ташкент", price: 15800, transmission: "AUTOMATIC", fuelType: "PETROL", description: "Практически новый автомобиль." },
  { brand: "Daewoo", model: "Matiz", year: 2019, mileage: 95000, region: "Андижан", price: 5400, transmission: "MANUAL", fuelType: "PETROL", description: "Бюджетный городской вариант." },
  { brand: "Daewoo", model: "Nexia", year: 2020, mileage: 81000, region: "Фергана", price: 6900, transmission: "MANUAL", fuelType: "PETROL", description: null },
  { brand: "Ravon", model: "R4", year: 2021, mileage: 54000, region: "Наманган", price: 9200, transmission: "AUTOMATIC", fuelType: "PETROL", description: "Вместительный кроссовер для семьи." },
  { brand: "Hyundai", model: "Sonata", year: 2022, mileage: 61000, region: "Самарканд", price: 15900, transmission: "AUTOMATIC", fuelType: "PETROL", description: "Комфортный седан бизнес-класса." },
  { brand: "Hyundai", model: "Tucson", year: 2023, mileage: 28000, region: "Ташкент", price: 24500, transmission: "AUTOMATIC", fuelType: "PETROL", description: "Полный привод, панорамная крыша." },
  { brand: "Hyundai", model: "Accent", year: 2021, mileage: 67000, region: "Кашкадарья", price: 11300, transmission: "AUTOMATIC", fuelType: "PETROL", description: null },
  { brand: "Kia", model: "Sportage", year: 2022, mileage: 41000, region: "Ташкент", price: 21800, transmission: "AUTOMATIC", fuelType: "PETROL", description: "Один из самых популярных кроссоверов в стране." },
  { brand: "Kia", model: "Cerato", year: 2023, mileage: 19000, region: "Бухара", price: 17200, transmission: "AUTOMATIC", fuelType: "PETROL", description: null },
  { brand: "Toyota", model: "Camry", year: 2021, mileage: 58000, region: "Ташкент", price: 26500, transmission: "AUTOMATIC", fuelType: "PETROL", description: "Легендарная надёжность, полный комплект документов." },
  { brand: "Toyota", model: "Land Cruiser Prado", year: 2020, mileage: 73000, region: "Сурхандарья", price: 42000, transmission: "AUTOMATIC", fuelType: "DIESEL", description: "Внедорожник в отличном состоянии." },
  { brand: "Toyota", model: "Corolla", year: 2022, mileage: 35000, region: "Хорезм", price: 19800, transmission: "AUTOMATIC", fuelType: "PETROL", description: null },
  { brand: "Changan", model: "CS35", year: 2023, mileage: 22000, region: "Ташкент", price: 16400, transmission: "AUTOMATIC", fuelType: "PETROL", description: "Городской кроссовер, гарантия дилера." },
  { brand: "Changan", model: "Eado", year: 2024, mileage: 8000, region: "Ташкент", price: 14900, transmission: "AUTOMATIC", fuelType: "PETROL", description: "Практически новый седан, заводская гарантия." },
  { brand: "Changan", model: "UNI-K", year: 2024, mileage: 5000, region: "Наманган", price: 32000, transmission: "AUTOMATIC", fuelType: "PETROL", description: "Топовая комплектация, флагман модельного ряда." },
  { brand: "BYD", model: "Song Plus", year: 2023, mileage: 31000, region: "Ташкент", price: 28900, transmission: "AUTOMATIC", fuelType: "HYBRID", description: "Гибридный кроссовер, экономичный расход." },
  { brand: "Chery", model: "Tiggo 7", year: 2022, mileage: 47000, region: "Джизак", price: 18600, transmission: "AUTOMATIC", fuelType: "PETROL", description: null },
  { brand: "Lada (ВАЗ)", model: "Granta", year: 2022, mileage: 33000, region: "Сырдарья", price: 8400, transmission: "MANUAL", fuelType: "PETROL", description: "Простой и экономичный вариант на каждый день." },
  { brand: "Lada (ВАЗ)", model: "Niva Travel", year: 2023, mileage: 15000, region: "Каракалпакстан", price: 12700, transmission: "MANUAL", fuelType: "PETROL", description: "Полный привод, отлично для региона." },
] as const;

async function main() {
  const sellers = [];
  for (const s of SELLERS) {
    const seller = await prisma.seller.upsert({
      where: { phone: s.phone },
      update: {},
      create: s,
    });
    sellers.push(seller);
  }

  let count = 0;
  for (const car of CARS) {
    const seller = sellers[count % sellers.length];
    const created = await prisma.car.create({
      data: {
        brand: car.brand,
        model: car.model,
        year: car.year,
        mileage: car.mileage,
        region: car.region,
        price: car.price,
        transmission: car.transmission,
        fuelType: car.fuelType,
        description: car.description,
        status: "AVAILABLE",
        sellerId: seller.id,
        lastConfirmedAt: new Date(),
      },
    });
    await prisma.carImage.create({
      data: { carId: created.id, imageUrl: "/cars/placeholder.jpg", position: 0 },
    });
    count++;
  }

  // Один пример заявки "на проверке" — для тестирования /admin/moderation
  const pendingSeller = sellers[0];
  const pendingCar = await prisma.car.create({
    data: {
      brand: "Hyundai",
      model: "Elantra",
      year: 2022,
      mileage: 49000,
      region: "Ташкент",
      price: 16900,
      transmission: "AUTOMATIC",
      fuelType: "PETROL",
      description: "Подана через форму /sell, ждёт проверки менеджера.",
      status: "PENDING_VERIFICATION",
      sellerId: pendingSeller.id,
      isDamaged: false,
      registrationDocFrontUrl: "/uploads/docs/example-front.webp",
      registrationDocBackUrl: "/uploads/docs/example-back.webp",
      photoFrontUrl: "/cars/placeholder.jpg",
      photoBackUrl: "/cars/placeholder.jpg",
      photoLeftUrl: "/cars/placeholder.jpg",
      photoRightUrl: "/cars/placeholder.jpg",
    },
  });
  await prisma.carImage.create({
    data: { carId: pendingCar.id, imageUrl: "/cars/placeholder.jpg", position: 0 },
  });

  console.log(`Засеяно: ${sellers.length} продавца, ${count} авто в продаже + 1 заявка на проверке`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
