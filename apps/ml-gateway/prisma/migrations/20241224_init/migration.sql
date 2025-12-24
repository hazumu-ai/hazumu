-- CreateTable
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

-- CreateIndex
CREATE INDEX "chat_logs_createdAt_idx" ON "chat_logs"("createdAt");
