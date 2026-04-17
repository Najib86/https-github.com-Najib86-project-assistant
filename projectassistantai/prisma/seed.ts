// prisma/seed.ts
// Seed script for development data

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding ProjectAssistantAI database...");

  // ── Admin user ────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin@12345", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@projectassistantai.com.ng" },
    update: {},
    create: {
      name: "Platform Admin",
      email: "admin@projectassistantai.com.ng",
      password: adminPassword,
      role: "ADMIN",
      emailVerified: new Date(),
      department: "Platform Management",
      institution: "ProjectAssistantAI",
    },
  });
  console.log("✓ Admin user:", admin.email);

  // ── Demo student ──────────────────────────────────────────────
  const studentPassword = await bcrypt.hash("Student@123", 12);
  const student = await prisma.user.upsert({
    where: { email: "student@demo.com" },
    update: {},
    create: {
      name: "IBRAHIM, Aminu Suleiman",
      email: "student@demo.com",
      password: studentPassword,
      role: "STUDENT",
      emailVerified: new Date(),
      department: "Mass Communication",
      faculty: "Social Sciences",
      institution: "National Open University of Nigeria",
    },
  });
  console.log("✓ Demo student:", student.email);

  // ── Demo supervisor ───────────────────────────────────────────
  const supervisorPassword = await bcrypt.hash("Supervisor@123", 12);
  const supervisor = await prisma.user.upsert({
    where: { email: "supervisor@demo.com" },
    update: {},
    create: {
      name: "Dr. OKAFOR, Emmanuel Chukwuemeka",
      email: "supervisor@demo.com",
      password: supervisorPassword,
      role: "SUPERVISOR",
      emailVerified: new Date(),
      department: "Mass Communication",
      faculty: "Social Sciences",
      institution: "National Open University of Nigeria",
    },
  });
  console.log("✓ Demo supervisor:", supervisor.email);

  // ── Demo project ──────────────────────────────────────────────
  const existingProject = await prisma.project.findFirst({
    where: { ownerId: student.id },
  });

  if (!existingProject) {
    const project = await prisma.project.create({
      data: {
        title: "The Role of Digital Media in Promoting Peace and Social Cohesion in Plateau State Conflict-Prone Communities",
        topic: "Digital media and peacebuilding in conflict-prone communities",
        description: "A mixed-methods study examining WhatsApp, Facebook, and community digital platforms as tools for inter-community dialogue and social cohesion in Plateau State, Nigeria.",
        level: "BSc",
        department: "Mass Communication",
        faculty: "Social Sciences",
        institution: "National Open University of Nigeria",
        studyLocation: "Plateau State, Nigeria",
        theory1: "Peace Communication Theory (Kempf, 2003)",
        theory2: "Social Identity Theory (Tajfel & Turner, 1979)",
        researchDesign: "Mixed Methods (Quantitative + Qualitative)",
        sampleSize: "385 respondents (Yamane formula, e=0.05)",
        targetPages: "90-120",
        supervisorCode: "DEMO-CODE-01",
        status: "IN_PROGRESS",
        ownerId: student.id,
        supervisorId: supervisor.id,
      },
    });

    // Create 5 chapters
    const chapterTitles = [
      "Introduction",
      "Literature Review",
      "Research Methodology",
      "Data Presentation and Analysis",
      "Summary, Conclusion and Recommendations",
    ];

    const chapterStatuses = [
      "APPROVED", "SUBMITTED", "DRAFT", "NOT_STARTED", "NOT_STARTED"
    ] as const;

    for (let i = 0; i < 5; i++) {
      await prisma.chapter.create({
        data: {
          projectId: project.id,
          number: i + 1,
          title: chapterTitles[i],
          status: chapterStatuses[i],
          wordCount: i === 0 ? 12450 : i === 1 ? 8320 : i === 2 ? 3200 : 0,
          aiGenerated: i < 3,
          lastAiAt: i < 3 ? new Date() : null,
        },
      });
    }

    console.log("✓ Demo project created:", project.title);
  }

  // ── Site stats ────────────────────────────────────────────────
  await prisma.siteStats.upsert({
    where: { id: "main" },
    update: {},
    create: {
      id: "main",
      totalUsers: 3,
      totalProjects: 1,
      totalPrompts: 0,
      totalChapters: 5,
    },
  });

  console.log("✓ Site stats initialised");
  console.log("\n🎉 Seed complete!");
  console.log("\n📧 Demo Credentials:");
  console.log("   Student:    student@demo.com / Student@123");
  console.log("   Supervisor: supervisor@demo.com / Supervisor@123");
  console.log("   Admin:      admin@projectassistantai.com.ng / Admin@12345");
}

main()
  .catch(e => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
