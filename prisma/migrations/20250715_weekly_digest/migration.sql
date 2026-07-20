ALTER TABLE "User"
  ADD COLUMN "weeklyDigestEnabled" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "lastDigestSentAt"    TIMESTAMP(3);
