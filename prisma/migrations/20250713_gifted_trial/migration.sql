-- CreateTable: GiftedTrial
CREATE TABLE "GiftedTrial" (
    "id"        TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "giftedBy"  TEXT NOT NULL,
    "plan"      TEXT NOT NULL DEFAULT 'PRO',
    "reason"    TEXT,
    "permanent" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),
    "giftedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GiftedTrial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GiftedTrial_userId_key" ON "GiftedTrial"("userId");
CREATE INDEX "GiftedTrial_userId_idx" ON "GiftedTrial"("userId");
CREATE INDEX "GiftedTrial_expiresAt_idx" ON "GiftedTrial"("expiresAt");

-- AddForeignKey
ALTER TABLE "GiftedTrial" ADD CONSTRAINT "GiftedTrial_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
