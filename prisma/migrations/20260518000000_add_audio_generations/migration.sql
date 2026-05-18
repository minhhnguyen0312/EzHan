-- Existing schema field that was present in Prisma schema but absent from the
-- checked-in initial migration. Keep this idempotent for databases that already
-- have the column.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "geminiApiKey" TEXT;

-- CreateTable
CREATE TABLE "audio_generations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "voiceName" TEXT NOT NULL,
    "voiceLabel" TEXT NOT NULL,
    "speed" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL DEFAULT 'audio/wav',
    "sampleRate" INTEGER NOT NULL DEFAULT 24000,
    "durationSeconds" INTEGER,
    "audioData" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audio_generations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audio_generations_userId_createdAt_idx" ON "audio_generations"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "audio_generations" ADD CONSTRAINT "audio_generations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
