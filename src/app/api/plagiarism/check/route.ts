import { NextResponse } from "next/server";
import { checkPlagiarism } from "@/lib/plagiarism/checker";
import { plagiarismSchema } from "@/lib/validations/auth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const validatedData = plagiarismSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json({ error: validatedData.error.issues[0].message }, { status: 400 });
        }

        const result = await checkPlagiarism(validatedData.data.text);

        return NextResponse.json(result);
    } catch (error) {
        console.error("Plagiarism API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
