import { NextResponse } from "next/server";
import * as mammoth from "mammoth";
// pdf-parse is imported dynamically to avoid ESM default export issues in Turbopack

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        let text = "";

        if (file.type === "application/pdf") {
            const pdfModule = await import("pdf-parse");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const pdfFunc = (pdfModule as any).default || pdfModule;
            const data = await pdfFunc(buffer);
            text = data.text;
        } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            const result = await mammoth.extractRawText({ buffer: buffer });
            text = result.value;
        } else if (file.type === "text/plain") {
            text = buffer.toString("utf-8");
        } else {
            return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
        }

        // Return extracted text. We could also save it to DB if needed.
        return NextResponse.json({ text });

    } catch (error) {
        console.error("Error parsing file:", error);
        return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
    }
}
