/*
  Warnings:

  - You are about to drop the column `code` on the `SupervisorInvite` table. All the data in the column will be lost.
  - You are about to drop the column `supervisorId` on the `SupervisorInvite` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[token]` on the table `SupervisorInvite` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `projectId` to the `SupervisorInvite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `token` to the `SupervisorInvite` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "SupervisorInvite" DROP CONSTRAINT "SupervisorInvite_supervisorId_fkey";

-- DropIndex
DROP INDEX "SupervisorInvite_code_key";

-- AlterTable
ALTER TABLE "SupervisorInvite" DROP COLUMN "code",
DROP COLUMN "supervisorId",
ADD COLUMN     "acceptedAt" TIMESTAMP(3),
ADD COLUMN     "acceptedById" INTEGER,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "projectId" INTEGER NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "token" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "password",
ADD COLUMN     "password_hash" TEXT,
ADD COLUMN     "provider" TEXT DEFAULT 'credentials';

-- CreateTable
CREATE TABLE "Message" (
    "message_id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "senderId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("message_id")
);

-- CreateTable
CREATE TABLE "ProjectActivity" (
    "activity_id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectActivity_pkey" PRIMARY KEY ("activity_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SupervisorInvite_token_key" ON "SupervisorInvite"("token");

-- CreateIndex
CREATE INDEX "SupervisorInvite_token_idx" ON "SupervisorInvite"("token");

-- CreateIndex
CREATE INDEX "SupervisorInvite_projectId_idx" ON "SupervisorInvite"("projectId");

-- AddForeignKey
ALTER TABLE "SupervisorInvite" ADD CONSTRAINT "SupervisorInvite_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupervisorInvite" ADD CONSTRAINT "SupervisorInvite_acceptedById_fkey" FOREIGN KEY ("acceptedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectActivity" ADD CONSTRAINT "ProjectActivity_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectActivity" ADD CONSTRAINT "ProjectActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
