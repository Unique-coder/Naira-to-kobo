import { PrismaClient, Prisma } from "@prisma/client";
import { Decimal } from "decimal.js";

const prisma = new PrismaClient();

async function main() {
  // 5 demo transactions in Naira format
  const transactions = [
    {
      userId: "user_15283827",
      description: "Car loan payment",
      amount: new Decimal("1500000.00"),
    },
    {
      userId: "user_15272843",
      description: "mortgage payment",
      amount: new Decimal("252450.75"),
    },
    {
      userId: "user_152352255",
      description: "Electricity bill",
      amount: new Decimal("34500.75"),
    },
    {
      userId: "user_152725525",
      description: "shopping",
      amount: new Decimal("45000.99"),
    },
    {
      userId: "user_15216678",
      description: "water bill",
      amount: new Decimal("35200.25"),
    },
  ];

  console.log("Seeding initial transactions in Naira format...");

  for (const tx of transactions) {
    const created = await prisma.transaction.create({ data: tx });
    console.log(`Created: ${created.description} - ₦${created.amount}`);
  }

  console.log("\nInitial data seeded successfully");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
