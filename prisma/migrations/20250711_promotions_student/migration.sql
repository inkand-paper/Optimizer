-- CreateTable: Promotion
CREATE TABLE "Promotion" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "discountCode" TEXT NOT NULL,
    "discountPercent" INTEGER NOT NULL,
    "targetPlan" TEXT NOT NULL DEFAULT 'ALL',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Promotion_isActive_endsAt_idx" ON "Promotion"("isActive", "endsAt");

-- CreateTable: StudentTrial
CREATE TABLE "StudentTrial" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eduEmail" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "StudentTrial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentTrial_userId_key" ON "StudentTrial"("userId");
CREATE UNIQUE INDEX "StudentTrial_eduEmail_key" ON "StudentTrial"("eduEmail");
CREATE INDEX "StudentTrial_userId_idx" ON "StudentTrial"("userId");
CREATE INDEX "StudentTrial_eduEmail_idx" ON "StudentTrial"("eduEmail");
