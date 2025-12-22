-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ADDED_TO_PROJECT', 'REMOVED_FROM_PROJECT', 'ROLE_CHANGED', 'TASK_ASSIGNED', 'TASK_UNASSIGNED', 'TASK_COMPLETED', 'TASK_REOPENED', 'TASK_DELETED');

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_notification_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "user_notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_userId_created_at_idx" ON "notifications"("userId", "created_at");

-- CreateIndex
CREATE INDEX "user_notification_preferences_userId_idx" ON "user_notification_preferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_notification_preferences_userId_type_key" ON "user_notification_preferences"("userId", "type");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notification_preferences" ADD CONSTRAINT "user_notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
