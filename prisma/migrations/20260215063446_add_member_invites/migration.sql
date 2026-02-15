-- CreateTable
CREATE TABLE "MemberInvite" (
    "invite_id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "invitedBy" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',

    CONSTRAINT "MemberInvite_pkey" PRIMARY KEY ("invite_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MemberInvite_token_key" ON "MemberInvite"("token");

-- CreateIndex
CREATE INDEX "MemberInvite_token_idx" ON "MemberInvite"("token");

-- CreateIndex
CREATE INDEX "MemberInvite_projectId_idx" ON "MemberInvite"("projectId");

-- CreateIndex
CREATE INDEX "MemberInvite_email_idx" ON "MemberInvite"("email");

-- CreateIndex
CREATE INDEX "ProjectMember_projectId_idx" ON "ProjectMember"("projectId");

-- CreateIndex
CREATE INDEX "ProjectMember_studentId_idx" ON "ProjectMember"("studentId");

-- AddForeignKey
ALTER TABLE "MemberInvite" ADD CONSTRAINT "MemberInvite_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberInvite" ADD CONSTRAINT "MemberInvite_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
