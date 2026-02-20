
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const { supervisorId } = await req.json();

        if (!supervisorId) {
            return NextResponse.json({ error: "Supervisor ID is required" }, { status: 400 });
        }

        // Verify supervisor exists
        const supervisor = await prisma.user.findUnique({
            where: { id: parseInt(supervisorId) }
        });

        if (!supervisor || supervisor.role !== 'supervisor') {
            return NextResponse.json({ error: "Invalid supervisor" }, { status: 403 });
        }

        // Generate or fetch existing code
        let code = supervisor.inviteCode;

        if (!code) {
            // Generate a random 6-character alphanumeric code
            code = crypto.randomBytes(3).toString('hex').toUpperCase();

            // Save to database
            await prisma.user.update({
                where: { id: supervisor.id },
                data: { inviteCode: code }
            });
        }

        return NextResponse.json({
            code: code,
            message: "Invite code generated successfully"
        });

    } catch (error) {
        console.error("Error creating invite code:", error);
        return NextResponse.json({ error: "Failed to create invite code" }, { status: 500 });
    }
}
