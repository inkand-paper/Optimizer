-- Add status page fields to User
ALTER TABLE "User"
  ADD COLUMN "statusPageSlug"    TEXT UNIQUE,
  ADD COLUMN "statusPageEnabled" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "User_statusPageSlug_idx" ON "User"("statusPageSlug");

-- Add isPublic to Monitor (default true — existing monitors all shown)
ALTER TABLE "Monitor"
  ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT true;
