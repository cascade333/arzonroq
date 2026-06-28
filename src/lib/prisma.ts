import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Prisma 7 убрала встроенный движок подключения — теперь обязателен
// Driver Adapter, даже для обычного прямого подключения к Postgres.
//
// max: размер пула соединений на ОДИН процесс. Приложение работает в PM2
// cluster mode (2 инстанса) — значит общий потолок к Postgres это
// 2 × max. Держим его заметно ниже стандартного max_connections=100
// у Postgres, чтобы оставить запас для Yaqin и служебных подключений
// на этом же сервере.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
