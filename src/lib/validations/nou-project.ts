
/**
 * NOU Project Validation Rules
 * Following Faculty of Social Sciences Research Project Guidelines
 */

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    metrics: {
        abstractWordCount: number;
        totalPageEstimate: number;
        requiredSectionsFound: string[];
        missingRequiredSections: string[];
    };
}

export function validateNOUProject(project: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const requiredSections = [
        "Declaration",
        "Certification",
        "Acknowledgement",
        "Abstract",
        "Table of Contents",
        "Chapter One",
        "Chapter Two",
        "Chapter Three",
        "Chapter Four",
        "Chapter Five",
        "Bibliography"
    ];

    const chapters = project.chapters || [];
    const foundSections = chapters.map((c: any) => c.title || "");
    const missingSections = requiredSections.filter(req =>
        !foundSections.some((found: string) => found.toLowerCase().includes(req.toLowerCase()))
    );

    if (missingSections.length > 0) {
        errors.push(`Missing required sections: ${missingSections.join(", ")}`);
    }

    // Abstract Validation
    const abstract = chapters.find((c: any) => c.title?.toLowerCase().includes("abstract"));
    let abstractWordCount = 0;
    if (abstract) {
        abstractWordCount = abstract.content?.split(/\s+/).filter(Boolean).length || 0;
        if (abstractWordCount > 400) {
            errors.push(`Abstract exceeds 400 words (Current: ${abstractWordCount})`);
        }
    } else {
        errors.push("Abstract section is missing.");
    }

    // Page Count Estimation (Roughly 350 words per page for double spaced)
    const totalWordCount = chapters.reduce((acc: number, c: any) => acc + (c.content?.split(/\s+/).filter(Boolean).length || 0), 0);
    const estimatedPages = Math.ceil(totalWordCount / 350);

    if (estimatedPages < 40) {
        warnings.push(`Project length might be too short (Estimated ${estimatedPages} pages, target 40-60)`);
    } else if (estimatedPages > 60) {
        warnings.push(`Project length might be too long (Estimated ${estimatedPages} pages, target 40-60)`);
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
        metrics: {
            abstractWordCount,
            totalPageEstimate: estimatedPages,
            requiredSectionsFound: requiredSections.filter(s => !missingSections.includes(s)),
            missingRequiredSections: missingSections,
        }
    };
}
