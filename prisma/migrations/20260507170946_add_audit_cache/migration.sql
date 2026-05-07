-- CreateTable
CREATE TABLE "AuditCache" (
    "id" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "review" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuditCache_hash_key" ON "AuditCache"("hash");

-- CreateIndex
CREATE INDEX "AuditCache_hash_idx" ON "AuditCache"("hash");
