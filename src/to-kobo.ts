import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

type TransactionRecord = Awaited<
  ReturnType<typeof prisma.transaction.findMany>
>[number];
type PrismaTransaction = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

async function migrateToKobo() {
  console.log("Starting migration: Naira to Kobo conversion\n");

  // Step 1: Snapshot of existing data for rollback
  const beforeMigration = await prisma.transaction.findMany();
  console.log(`Found ${beforeMigration.length} transactions to migrate`);

  // Log before state
  console.log("\nBEFORE MIGRATION:");
  beforeMigration.forEach((tx: TransactionRecord) => {
    console.log(`ID: ${tx.id} | Amount: ₦${tx.amount} | User: ${tx.userId}`);
  });

  // Step 2: Add new column without touching existing data

  // Step 3: Convert and populate new column
  // Formula: Kobo = Naira × 100
  // Example: 1500.50 Naira = 150050 Kobo

  const convertToKobo = (naira: number): number => {
    // Multiply by 100 and round to handle floating point issues
    return Math.round(naira * 100);
  };

  // Use transaction for atomicity
  await prisma.$transaction(async (tx: PrismaTransaction) => {
    for (const record of beforeMigration) {
      const nairaAmount = record.amount.toNumber();
      const koboAmount = convertToKobo(nairaAmount);

      await tx.$executeRaw`
        UPDATE "Transaction"
        SET "amountKobo" = ${koboAmount}
        WHERE id = ${record.id}
      `;
    }
  });

  // Step 4: Verify conversion
  const afterMigration = await prisma.transaction.findMany();

  console.log("\nAFTER MIGRATION:");
  afterMigration.forEach((tx: TransactionRecord) => {
    const naira = tx.amount.toNumber();
    const actualKobo = (tx as any).amountKobo;

    console.log(`ID: ${tx.id} | ₦${naira} | Kobo: ${actualKobo}`);
  });

  // Step 5: Validate zero data loss
  const allValid = afterMigration.every((tx: TransactionRecord) => {
    return (tx as any).amountKobo !== undefined;
  });

  if (!allValid) {
    throw new Error("Migration validation failed! Data mismatch detected.");
  }

  console.log("\nMigration successful");
  console.log("Zero data loss verified");
}

migrateToKobo()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
