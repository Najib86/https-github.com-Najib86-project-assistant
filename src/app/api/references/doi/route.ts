import { NextResponse } from "next/server";
import { fetchDOIMetadata, formatCitation } from "@/lib/references/format";
import { doiSchema } from "@/lib/validations/auth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { doi, style = "APA" } = await req.json();
        const validatedData = doiSchema.safeParse({ doi });

        if (!validatedData.success) {
            return NextResponse.json({ error: validatedData.error.issues[0].message }, { status: 400 });
        }

        const metadata = await fetchDOIMetadata(validatedData.data.doi);
        const citation = formatCitation(metadata, style as any);

        return NextResponse.json({ citation, metadata });
    } catch (error) {
        console.error("DOI API Error:", error);
        return NextResponse.json({ error: "Reference not found or DOI invalid" }, { status: 404 });
    }
}
