
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { studentId, title, level, type, supervisorId } = await req.json();

        // Basic validation
        if (!studentId || !title || !level || !type) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
        }

        const project = await prisma.project.create({
            data: {
                title,
                level,
                type,
                studentId: parseInt(studentId),
                supervisorId: supervisorId ? parseInt(supervisorId) : null,
            },
        });

        return new Response(JSON.stringify(project), { status: 201 });
    } catch (error) {
        console.error("Error creating project:", error);
        return new Response(JSON.stringify({ error: "Failed to create project" }), { status: 500 });
    }
}
