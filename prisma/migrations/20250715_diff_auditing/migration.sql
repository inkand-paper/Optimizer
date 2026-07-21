ALTER TABLE "CodeReview"
  ADD COLUMN "previousReviewId" TEXT,
  ADD COLUMN "previousScore"    INTEGER;

CREATE INDEX "CodeReview_userId_repoName_idx" ON "CodeReview"("userId", "repoName");
