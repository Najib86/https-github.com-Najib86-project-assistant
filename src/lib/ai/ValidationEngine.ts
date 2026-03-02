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
    private readonly MIN_WORDS_PRELIMINARY = 100; // For preliminary pages

    validateSection(sectionTitle: string, content: string): ValidationResult {
        const errors: string[] = [];
        let score = 100;

        const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
        
        // Determine if this is a major chapter or preliminary page
        const isMajorChapter = sectionTitle.toLowerCase().includes("chapter");
        const isPreliminary = this.isPreliminaryPage(sectionTitle);
        
        // Word count validation
        if (isMajorChapter && wordCount < this.MIN_WORDS_PER_CHAPTER) {
            errors.push(`Word count too low (${wordCount}). Minimum required for major chapters: ${this.MIN_WORDS_PER_CHAPTER}.`);
            score -= 40;
        } else if (isPreliminary && wordCount < this.MIN_WORDS_PRELIMINARY) {
            errors.push(`Word count too low (${wordCount}). Minimum required: ${this.MIN_WORDS_PRELIMINARY}.`);
            score -= 30;
        } else if (!isMajorChapter && !isPreliminary && wordCount < 100) {
            errors.push(`Content appears too short (${wordCount} words).`);
            score -= 20;
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

    private isPreliminaryPage(sectionTitle: string): boolean {
        const preliminaryPages = [
            "title page",
            "certification",
            "dedication",
            "acknowledgement",
            "table of contents",
            "abstract"
        ];
        const lower = sectionTitle.toLowerCase();
        return preliminaryPages.some(page => lower.includes(page));
    }

    private detectMissingSections(sectionTitle: string, content: string): string[] {
        const requiredSections: Record<string, string[]> = {
            "Chapter One: Introduction": [
                "Background",
                "Statement of the Problem",
                "Research Questions",
                "Objectives",
                "Significance",
                "Scope"
            ],
            "Chapter Two: Literature Review": [
                "Theoretical framework",
                "Empirical"
            ],
            "Chapter Three: Methodology": [
                "Research design",
                "Population",
                "Data collection"
            ],
            "Chapter Four: Results and Discussion": [
                "Presentation",
                "Discussion"
            ],
            "Chapter Five: Summary, Conclusion and Recommendations": [
                "Summary",
                "Conclusion",
                "Recommendation"
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
        
        // Check if content ends properly
        const lastChar = trimmed[trimmed.length - 1];
        if (![".", "!", "?", "\"", "'", ")", "]"].includes(lastChar)) {
            const lines = trimmed.split('\n');
            const lastLine = lines[lines.length - 1].trim();
            if (lastLine.length > 0 && !lastLine.startsWith('#')) {
                if (![".", "!", "?", "\"", "'", ")", "]"].includes(lastLine[lastLine.length - 1])) {
                    return true;
                }
            }
        }
        
        // Check for common truncation indicators
        const truncationIndicators = [
            "...",
            "[continued]",
            "[to be continued]",
            "etc...",
            "and so on..."
        ];
        const lower = trimmed.toLowerCase();
        const endsWithTruncation = truncationIndicators.some(indicator => 
            lower.endsWith(indicator.toLowerCase())
        );
        
        return endsWithTruncation;
    }

    private detectAIArtifacts(content: string): boolean {
        const artifacts = [
            "as an ai language model",
            "i cannot provide",
            "here is the complete chapter",
            "certainly! here is",
            "sure, here is",
            "i am an ai",
            "as an artificial intelligence",
            "i don't have personal",
            "i apologize, but",
            "here's the chapter",
            "below is the chapter"
        ];
        const lower = content.toLowerCase();
        return artifacts.some(a => lower.includes(a));
    }
}
