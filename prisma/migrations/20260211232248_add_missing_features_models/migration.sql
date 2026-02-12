/*
  Warnings:

  - The primary key for the `ChapterVersion` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `editedById` on the `ChapterVersion` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `ChapterVersion` table. All the data in the column will be lost.
  - The primary key for the `Citation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Citation` table. All the data in the column will be lost.
  - You are about to drop the column `anchorText` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `positionIndex` on the `Comment` table. All the data in the column will be lost.
  - The primary key for the `ProjectMember` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `ProjectMember` table. All the data in the column will be lost.
  - You are about to drop the `SupervisorInvite` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `contentSnapshot` on table `ChapterVersion` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ChapterVersion" DROP CONSTRAINT "ChapterVersion_chapterId_fkey";

-- DropForeignKey
ALTER TABLE "ChapterVersion" DROP CONSTRAINT "ChapterVersion_editedById_fkey";

-- DropForeignKey
ALTER TABLE "Citation" DROP CONSTRAINT "Citation_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectMember" DROP CONSTRAINT "ProjectMember_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectMember" DROP CONSTRAINT "ProjectMember_studentId_fkey";

-- DropForeignKey
ALTER TABLE "SupervisorInvite" DROP CONSTRAINT "SupervisorInvite_supervisorId_fkey";

-- DropIndex
DROP INDEX "ProjectMember_projectId_studentId_key";

-- AlterTable
ALTER TABLE "ChapterVersion" DROP CONSTRAINT "ChapterVersion_pkey",
DROP COLUMN "editedById",
DROP COLUMN "id",
ADD COLUMN     "version_id" SERIAL NOT NULL,
ALTER COLUMN "contentSnapshot" SET NOT NULL,
ALTER COLUMN "versionNumber" DROP DEFAULT,
ADD CONSTRAINT "ChapterVersion_pkey" PRIMARY KEY ("version_id");

-- AlterTable
ALTER TABLE "Citation" DROP CONSTRAINT "Citation_pkey",
DROP COLUMN "id",
ADD COLUMN     "citation_id" SERIAL NOT NULL,
ALTER COLUMN "style" SET DEFAULT 'APA',
ADD CONSTRAINT "Citation_pkey" PRIMARY KEY ("citation_id");

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "anchorText",
DROP COLUMN "positionIndex";

-- AlterTable
ALTER TABLE "ProjectMember" DROP CONSTRAINT "ProjectMember_pkey",
DROP COLUMN "id",
ADD COLUMN     "member_id" SERIAL NOT NULL,
ADD CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("member_id");

-- DropTable
DROP TABLE "SupervisorInvite";

-- AddForeignKey
ALTER TABLE "ChapterVersion" ADD CONSTRAINT "ChapterVersion_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("chapter_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Citation" ADD CONSTRAINT "Citation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
