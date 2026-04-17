// src/app/api/user/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ProfileSchema = z.object({
  name:        z.string().min(2).max(100).optional(),
  department:  z.string().optional(),
  faculty:     z.string().optional(),
  institution: z.string().optional(),
  phone:       z.string().optional(),
  bio:         z.string().max(500).optional(),
});

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = ProfileSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validation failed" }, { status: 400 });

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: parsed.data,
    select: { id: true, name: true, department: true, faculty: true, institution: true },
  });

  return NextResponse.json({ success: true, user: updated });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, name: true, email: true, role: true,
      department: true, faculty: true, institution: true,
      phone: true, bio: true, image: true,
      emailVerified: true, createdAt: true,
    },
  });

  return NextResponse.json({ user });
}
