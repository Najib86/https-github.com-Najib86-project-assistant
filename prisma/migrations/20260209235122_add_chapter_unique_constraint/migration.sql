/*
  Warnings:

  - A unique constraint covering the columns `[projectId,chapterNumber]` on the table `Chapter` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Chapter" DROP CONSTRAINT "Chapter_projectId_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "Chapter_projectId_chapterNumber_key" ON "Chapter"("projectId", "chapterNumber");

-- AddForeignKey
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;
