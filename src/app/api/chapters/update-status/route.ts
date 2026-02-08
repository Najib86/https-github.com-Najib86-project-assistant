
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { chapterId, status } = await req.json(); // status: Draft / Submitted / Reviewed / Approved

        const updatedChapter = await prisma.chapter.update({
            where: { chapter_id: parseInt(chapterId) },
            data: { status },
        });

        return NextResponse.json(updatedChapter);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update chapter status" }, { status: 500 });
    }
}
