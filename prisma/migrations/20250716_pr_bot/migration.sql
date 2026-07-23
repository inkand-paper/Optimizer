CREATE TABLE "PRBotConfig" (
    "id"            TEXT NOT NULL,
    "userId"        TEXT NOT NULL,
    "repoFullName"  TEXT NOT NULL,
    "enabled"       BOOLEAN NOT NULL DEFAULT true,
    "webhookSecret" TEXT NOT NULL,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PRBotConfig_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PRBotConfig_userId_repoFullName_key" ON "PRBotConfig"("userId", "repoFullName");
CREATE INDEX "PRBotConfig_userId_idx" ON "PRBotConfig"("userId");
CREATE INDEX "PRBotConfig_repoFullName_idx" ON "PRBotConfig"("repoFullName");
ALTER TABLE "PRBotConfig" ADD CONSTRAINT "PRBotConfig_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
