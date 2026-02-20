
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // Security: Validate file size (e.g., 20MB limit)
        if (file.size > 20 * 1024 * 1024) {
            return NextResponse.json({ error: "File too large. Max 20MB allowed." }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const uniqueId = crypto.randomUUID();
        const fileName = `${uniqueId}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const relativePath = join("research-uploads", fileName);
        const absolutePath = join(process.cwd(), "public", relativePath);

        // Ensure directory exists
        await mkdir(join(process.cwd(), "public", "research-uploads"), { recursive: true });

        await writeFile(absolutePath, buffer);

        return NextResponse.json({
            fileUrl: `/${relativePath.replace(/\\/g, '/')}`, // URL friendly
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size
        });

    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }
}
