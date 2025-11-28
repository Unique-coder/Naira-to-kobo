# Naira to Kobo Migration

A database migration that converts transaction amounts from **Naira (Decimal)** to **Kobo (Integer)** with zero data loss.

## Why Kobo?

No precision loss

**Formula:** `Kobo = Naira × 100`

## Tech Stack

- TypeScript + Node.js
- Prisma ORM
- PostgreSQL

## Migration Steps

```bash
# 1. Create initial schema with Decimal amount
npx prisma migrate dev --name init_with_decimal

# 2. Seed test data
npm run seed

# 3. Add nullable kobo column (Int?)
npx prisma migrate dev --name add_kobo_column

# 4. Convert Naira → Kobo
npx ts-node src/to-kobo.ts

# 5. Make kobo column required (Int)
npx prisma migrate dev --name make_kobo_required
```
