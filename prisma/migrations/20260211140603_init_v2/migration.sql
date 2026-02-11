-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "anchorText" TEXT,
ADD COLUMN     "positionIndex" INTEGER;

-- AlterTable
ALTER TABLE "PlagiarismNote" ADD COLUMN     "score" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "SupervisorInvite" (
    "id" SERIAL NOT NULL,
    "supervisorId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupervisorInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMember" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChapterVersion" (
    "id" SERIAL NOT NULL,
    "chapterId" INTEGER NOT NULL,
    "contentSnapshot" TEXT,
    "editedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "versionNumber" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "ChapterVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Citation" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "style" TEXT NOT NULL,
    "sourceText" TEXT NOT NULL,
    "formatted" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Citation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SupervisorInvite_code_key" ON "SupervisorInvite"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMember_projectId_studentId_key" ON "ProjectMember"("projectId", "studentId");

-- AddForeignKey
ALTER TABLE "SupervisorInvite" ADD CONSTRAINT "SupervisorInvite_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("project_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChapterVersion" ADD CONSTRAINT "ChapterVersion_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("chapter_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChapterVersion" ADD CONSTRAINT "ChapterVersion_editedById_fkey" FOREIGN KEY ("editedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Citation" ADD CONSTRAINT "Citation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("project_id") ON DELETE RESTRICT ON UPDATE CASCADE;
