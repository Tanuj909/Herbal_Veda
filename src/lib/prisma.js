import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

let prisma;

const initPrisma = () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is missing.");
  }
  const dbUrl = new URL(databaseUrl);
  const adapter = new PrismaMariaDb({
    host: dbUrl.hostname,
    port: parseInt(dbUrl.port || "3306", 10),
    user: dbUrl.username,
    password: decodeURIComponent(dbUrl.password || ""),
    database: dbUrl.pathname.substring(1),
    connectionLimit: process.env.NODE_ENV === "production" ? 10 : 5,
    ssl: true,
  });
  return new PrismaClient({ adapter });
};

if (process.env.NODE_ENV === "production") {
  prisma = initPrisma();
} else {
  if (!global.globalPrisma) {
    global.globalPrisma = initPrisma();
  }
  prisma = global.globalPrisma;
}

export default prisma;
