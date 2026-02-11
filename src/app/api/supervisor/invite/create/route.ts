
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const { supervisorId } = await req.json();

        if (!supervisorId) {
            return NextResponse.json({ error: "Supervisor ID required" }, { status: 400 });
        }

        // Generate a 6-character alphanumeric code
        const code = crypto.randomBytes(3).toString('hex').toUpperCase();

        // Expire in 7 days
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const invite = await prisma.supervisorInvite.create({
            data: {
                supervisorId: parseInt(supervisorId),
                code,
                expiresAt
            }
        });

        return NextResponse.json({ code: invite.code, expiresAt: invite.expiresAt });

    } catch (error) {
        console.error("Error creating invite:", error);
        return NextResponse.json({ error: "Failed to create invite" }, { status: 500 });
    }
}
