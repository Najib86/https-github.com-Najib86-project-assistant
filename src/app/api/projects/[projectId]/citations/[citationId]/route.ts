import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
    _: Request,
    { params }: { params: Promise<{ projectId: string; citationId: string }> }
) {
    try {
        const { projectId, citationId } = await params;

        // Verify if the citation exists and belongs to the project
        const citation = await prisma.citation.findFirst({
            where: {
                citation_id: parseInt(citationId),
                projectId: parseInt(projectId)
            }
        });

        if (!citation) {
            return NextResponse.json({ error: "Citation not found" }, { status: 404 });
        }

        await prisma.citation.delete({
            where: {
                citation_id: parseInt(citationId)
            }
        });

        return NextResponse.json({ message: "Citation removed" });
    } catch (error) {
        console.error("Failed to remove citation", error);
        return NextResponse.json({ error: "Failed to remove citation" }, { status: 500 });
    }
}
