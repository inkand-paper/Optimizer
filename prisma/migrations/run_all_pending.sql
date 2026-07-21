-- Run all pending migrations in order
-- Execute this in your Supabase SQL editor or via psql

-- 20250711: Promotions + Student Trial
CREATE TABLE IF NOT EXISTS "Promotion" (
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
CREATE INDEX IF NOT EXISTS "Promotion_isActive_endsAt_idx" ON "Promotion"("isActive", "endsAt");

DO $$ BEGIN
  CREATE TYPE "StudentTrialStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "StudentTrial" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eduEmail" TEXT NOT NULL,
    "studentIdUrl" TEXT,
    "status" "StudentTrialStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "rejectionNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    CONSTRAINT "StudentTrial_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "StudentTrial_userId_key" ON "StudentTrial"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "StudentTrial_eduEmail_key" ON "StudentTrial"("eduEmail");
CREATE INDEX IF NOT EXISTS "StudentTrial_userId_idx" ON "StudentTrial"("userId");
CREATE INDEX IF NOT EXISTS "StudentTrial_eduEmail_idx" ON "StudentTrial"("eduEmail");
CREATE INDEX IF NOT EXISTS "StudentTrial_status_idx" ON "StudentTrial"("status");
ALTER TABLE "StudentTrial" DROP CONSTRAINT IF EXISTS "StudentTrial_userId_fkey";
ALTER TABLE "StudentTrial" ADD CONSTRAINT "StudentTrial_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 20250713: Gifted Trial
CREATE TABLE IF NOT EXISTS "GiftedTrial" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "giftedBy" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'PRO',
    "reason" TEXT,
    "permanent" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),
    "giftedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GiftedTrial_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "GiftedTrial_userId_key" ON "GiftedTrial"("userId");
CREATE INDEX IF NOT EXISTS "GiftedTrial_userId_idx" ON "GiftedTrial"("userId");
CREATE INDEX IF NOT EXISTS "GiftedTrial_expiresAt_idx" ON "GiftedTrial"("expiresAt");
ALTER TABLE "GiftedTrial" DROP CONSTRAINT IF EXISTS "GiftedTrial_userId_fkey";
ALTER TABLE "GiftedTrial" ADD CONSTRAINT "GiftedTrial_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 20250714: Status Page
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "statusPageSlug" TEXT UNIQUE;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "statusPageEnabled" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS "User_statusPageSlug_idx" ON "User"("statusPageSlug");
ALTER TABLE "Monitor" ADD COLUMN IF NOT EXISTS "isPublic" BOOLEAN NOT NULL DEFAULT true;

-- 20250715: Weekly Digest
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "weeklyDigestEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastDigestSentAt" TIMESTAMP(3);

-- 20250715: Diff Auditing
ALTER TABLE "CodeReview" ADD COLUMN IF NOT EXISTS "previousReviewId" TEXT;
ALTER TABLE "CodeReview" ADD COLUMN IF NOT EXISTS "previousScore" INTEGER;
CREATE INDEX IF NOT EXISTS "CodeReview_userId_repoName_idx" ON "CodeReview"("userId", "repoName");
