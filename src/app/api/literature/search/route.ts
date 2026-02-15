
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');

    if (!query) {
        return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
    }

    try {
        const response = await fetch(`https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=5&fields=title,authors,year,url,abstract`, {
            headers: {
                // If you have an API key, add it here: 'x-api-key': process.env.SEMANTIC_SCHOLAR_KEY
            }
        });

        if (!response.ok) {
            throw new Error(`Semantic Scholar API error: ${response.statusText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Literature search error:", error);
        return NextResponse.json({ error: "Failed to fetch literature" }, { status: 500 });
    }
}
