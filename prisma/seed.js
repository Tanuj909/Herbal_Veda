const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
const bcrypt = require("bcryptjs");

// Load environment variables natively in Node 20+
try {
  process.loadEnvFile();
} catch (e) {
  // Ignore error if file is missing
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const phone = process.env.SUPER_ADMIN_PHONE;
  const name = process.env.SUPER_ADMIN_NAME || "Super Admin";

  if (!databaseUrl) {
    console.error("Error: DATABASE_URL must be defined in the .env file.");
    process.exit(1);
  }

  if (!email || !password) {
    console.error(
      "Error: SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be defined in the .env file."
    );
    process.exit(1);
  }

  console.log("Connecting to the database...");

  // Parse connection details using built-in URL parser
  const dbUrl = new URL(databaseUrl);
  
  // Create MariaDB/MySQL driver adapter instance
  const adapter = new PrismaMariaDb({
    host: dbUrl.hostname,
    port: parseInt(dbUrl.port || "3306", 10),
    user: dbUrl.username,
    password: decodeURIComponent(dbUrl.password || ""),
    database: dbUrl.pathname.substring(1),
    connectionLimit: 5,
    ssl: true,
  });

  const prisma = new PrismaClient({ adapter });

  console.log("Seeding super admin...");

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Upsert user
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      name,
      phone,
      role: "SUPER_ADMIN",
    },
    create: {
      email,
      password: hashedPassword,
      name,
      phone,
      role: "SUPER_ADMIN",
      is_active: true,
    },
  });

  console.log(
    `Super admin upserted successfully: id=${user.id.toString()}, email=${user.email}`
  );

  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  });
