-- CreateEnum
CREATE TYPE "StudentTrialStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable: add new columns to StudentTrial
ALTER TABLE "StudentTrial"
  ADD COLUMN "studentIdUrl"    TEXT,
  ADD COLUMN "status"          "StudentTrialStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "rejectionReason" TEXT,
  ADD COLUMN "rejectionNote"   TEXT,
  ADD COLUMN "reviewedAt"      TIMESTAMP(3),
  ADD COLUMN "reviewedBy"      TEXT,
  ADD COLUMN "submittedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "expiresAt_new"   TIMESTAMP(3);

-- Migrate existing data: treat all existing rows as APPROVED (they were auto-approved before)
UPDATE "StudentTrial" SET "status" = 'APPROVED', "submittedAt" = "verifiedAt";

-- Drop old columns no longer needed
ALTER TABLE "StudentTrial"
  DROP COLUMN IF EXISTS "verifiedAt",
  DROP COLUMN IF EXISTS "used";

-- Rename expiresAt_new if needed (postgres allows keeping expiresAt as nullable now)
-- expiresAt was NOT NULL before — make it nullable for PENDING rows
ALTER TABLE "StudentTrial" ALTER COLUMN "expiresAt" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "StudentTrial_status_idx" ON "StudentTrial"("status");
