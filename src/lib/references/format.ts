export type CitationStyle = "APA" | "MLA" | "Chicago";

export async function fetchDOIMetadata(doi: string) {
    try {
        const response = await fetch(`https://api.crossref.org/works/${doi}`);
        if (!response.ok) throw new Error("DOI not found");
        const data = await response.json();
        return data.message;
    } catch (error) {
        console.error("CrossRef Fetch Error:", error);
        throw error;
    }
}

export function formatCitation(metadata: any, style: CitationStyle): string {
    const authors = metadata.author || [];
    const authorNames = authors.map((a: any) => `${a.family}, ${a.given?.[0] || ""}.`).join(", ");
    const year = metadata.issued?.['date-parts']?.[0]?.[0] || "n.d.";
    const title = metadata.title?.[0] || "No Title";
    const journal = metadata["container-title"]?.[0] || "";
    const volume = metadata.volume || "";
    const issue = metadata.issue || "";
    const pages = metadata.page || "";
    const doi = metadata.DOI;

    switch (style) {
        case "APA":
            return `${authorNames} (${year}). ${title}. ${journal}, ${volume}${issue ? `(${issue})` : ""}, ${pages}. https://doi.org/${doi}`;
        case "MLA":
            return `${authorNames}. "${title}." ${journal}, vol. ${volume}, no. ${issue}, ${year}, pp. ${pages}.`;
        case "Chicago":
            return `${authorNames}. "${title}." ${journal} ${volume}, no. ${issue} (${year}): ${pages}. https://doi.org/${doi}.`;
        default:
            return `${authorNames} (${year}). ${title}.`;
    }
}
