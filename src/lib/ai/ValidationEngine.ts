export interface ValidationResult {
    isValid: boolean;
    wordCount: number;
    missingHeadings: string[];
    isTruncated: boolean;
    hasAIArtifacts: boolean;
    score: number;
    errors: string[];
}

export class ValidationEngine {
    private readonly MIN_WORDS_PER_CHAPTER = 2500; // Realistic academic minimum

    validateSection(sectionTitle: string, content: string): ValidationResult {
        const errors: string[] = [];
        let score = 100;

        const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
        if (wordCount < 100) {
            // Basic chapters might be smaller (like Dedication), but let's check true chapter sizes
            const isMajorChapter = sectionTitle.toLowerCase().includes("chapter");
            if (isMajorChapter && wordCount < this.MIN_WORDS_PER_CHAPTER) {
                errors.push(`Word count too low (${wordCount}). Minimum required: ${this.MIN_WORDS_PER_CHAPTER}.`);
                score -= 40;
            }
        }

        const missingHeadings = this.detectMissingSections(sectionTitle, content);
        if (missingHeadings.length > 0) {
            errors.push(`Missing required sections: ${missingHeadings.join(", ")}`);
            score -= (missingHeadings.length * 10);
        }

        const isTruncated = this.detectTruncation(content);
        if (isTruncated) {
            errors.push(`Content appears truncated or abruptly ended.`);
            score -= 50;
        }

        const hasAIArtifacts = this.detectAIArtifacts(content);
        if (hasAIArtifacts) {
            errors.push(`Content contains AI language model artifacts (e.g., "As an AI").`);
            score -= 50;
        }

        return {
            isValid: score >= 80 && !isTruncated && !hasAIArtifacts,
            wordCount,
            missingHeadings,
            isTruncated,
            hasAIArtifacts,
            score: Math.max(0, score),
            errors
        };
    }

    private detectMissingSections(sectionTitle: string, content: string): string[] {
        const requiredSections: Record<string, string[]> = {
            "Chapter One: Introduction": [
                "Background of the Study",
                "Statement of the Problem",
                "Research Questions",
                "Objectives",
                "Significance",
                "Scope",
                "Definition of Terms"
            ],
            "Chapter Two: Literature Review": [
                "Theoretical framework",
                "Empirical studies"
            ],
            "Chapter Three: Methodology": [
                "Research design",
                "Population",
                "Data collection",
                "Data analysis"
            ],
            "Chapter Four: Results and Discussion": [
                "Presentation of results",
                "Discussion"
            ],
            "Chapter Five: Summary, Conclusion and Recommendations": [
                "Summary",
                "Conclusion",
                "Recommendations"
            ]
        };

        const requirements = requiredSections[sectionTitle] || [];
        const missing: string[] = [];
        const lowerContent = content.toLowerCase();

        for (const req of requirements) {
            if (!lowerContent.includes(req.toLowerCase())) {
                missing.push(req);
            }
        }

        return missing;
    }

    private detectTruncation(content: string): boolean {
        const trimmed = content.trim();
        if (!trimmed) return true;
        const lastChar = trimmed[trimmed.length - 1];
        if (![".", "!", "?", "\"", "'"].includes(lastChar)) {
            const lines = trimmed.split('\n');
            const lastLine = lines[lines.length - 1].trim();
            if (lastLine.length > 0 && !lastLine.startsWith('#')) {
                if (![".", "!", "?", "\"", "'"].includes(lastLine[lastLine.length - 1])) {
                    return true;
                }
            }
        }
        return false;
    }

    private detectAIArtifacts(content: string): boolean {
        const artifacts = [
            "as an ai language model",
            "i cannot provide",
            "here is the complete chapter",
            "certainly! here is",
            "sure, here is",
            "i am an ai"
        ];
        const lower = content.toLowerCase();
        return artifacts.some(a => lower.includes(a));
    }
}
