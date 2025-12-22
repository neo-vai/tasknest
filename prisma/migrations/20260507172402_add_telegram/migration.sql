-- AlterTable
ALTER TABLE "users" ADD COLUMN     "telegram_chat_id" TEXT,
ADD COLUMN     "telegram_linked_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "telegram_link_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "telegram_link_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "telegram_link_codes_code_key" ON "telegram_link_codes"("code");

-- CreateIndex
CREATE INDEX "telegram_link_codes_userId_idx" ON "telegram_link_codes"("userId");

-- AddForeignKey
ALTER TABLE "telegram_link_codes" ADD CONSTRAINT "telegram_link_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
