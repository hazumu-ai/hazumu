# Prisma Database Setup

This directory contains the Prisma schema and migrations for the ML Gateway database.

## Schema

The main schema file is `schema.prisma`. It defines:

- **ChatLog** model: Stores all chat interactions with the AI models

## Migrations

Migrations are stored in the `migrations/` directory. Each migration is a separate folder with:
- A timestamp-based name
- A `migration.sql` file containing the SQL commands

## Initial Setup

The initial migration (`20241224_init`) creates the `chat_logs` table with the following schema:

```sql
CREATE TABLE "chat_logs" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "prompt" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "response" TEXT,
    "duration" INTEGER,
    "error" TEXT,
    CONSTRAINT "chat_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "chat_logs_createdAt_idx" ON "chat_logs"("createdAt");
```

## Development

### Generate Prisma Client

After modifying the schema, regenerate the client:

```bash
pnpm prisma:generate
```

### Create a Migration

When you modify the schema:

```bash
pnpm prisma:migrate
```

### View Database

Use Prisma Studio to view and edit data:

```bash
pnpm prisma:studio
```

## Production

Migrations are automatically applied when the Docker container starts via the entrypoint script.

The command used is:

```bash
npx prisma migrate deploy
```

This applies all pending migrations without prompting.
