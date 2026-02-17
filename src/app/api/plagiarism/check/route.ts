import { NextResponse } from "next/server";
import { checkPlagiarism } from "@/lib/plagiarism/checker";
import { plagiarismSchema } from "@/lib/validations/auth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redis } from "@/lib/redis";
import { rateLimit } from "@/lib/rate-limit";
import crypto from "crypto";

interface SessionUser {
    id?: string | number;
    name?: string | null;
    email?: string | null;
    role?: string;
}

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

        const user = session.user as SessionUser;
        if (user?.id) {
            await rateLimit(`plagiarism:${user.id}`);
        }

        const textHash = crypto.createHash("md5").update(validatedData.data.text).digest("hex");
        const cacheKey = `plagiarism:result:${textHash}`;

        // Check cache
        const cached = await redis.get(cacheKey);
        if (cached) {
            console.log("Serving plagiarism result from cache");
            return NextResponse.json(cached);
        }

        const result = await checkPlagiarism(validatedData.data.text);

        // Cache for 24 hours
        await redis.set(cacheKey, result, { ex: 86400 });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Plagiarism API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
