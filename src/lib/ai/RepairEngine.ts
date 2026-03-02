import { ValidationResult } from "./ValidationEngine";

export class RepairEngine {
    generateRepairPrompt(chapterTitle: string, validationResult: ValidationResult): string {
        const issues = validationResult.errors.join("\n- ");
        const wordCount = validationResult.wordCount;
        const isMajorChapter = chapterTitle.toLowerCase().includes("chapter");
        const targetWords = isMajorChapter ? 2500 : 500;
        
        return `
CRITICAL: Your previous output for "${chapterTitle}" failed validation.

VALIDATION FAILURES:
- ${issues}

CURRENT WORD COUNT: ${wordCount} words
REQUIRED WORD COUNT: ${targetWords}+ words

MANDATORY REQUIREMENTS:
1. Write COMPLETE, DETAILED academic content (not an outline or summary)
2. Include ALL required subsections with full explanations
3. Write at least ${targetWords} words of substantive content
4. Use proper academic tone and formal language
5. End paragraphs and sections properly (no truncation)
6. DO NOT include phrases like "As an AI", "Here is the chapter", "Certainly"
7. Start DIRECTLY with the academic content
8. Use Markdown formatting: ## for main headings, ### for subheadings
9. Provide examples, explanations, and detailed analysis
10. Ensure content flows logically from introduction to conclusion

REWRITE THE ENTIRE CHAPTER NOW with full academic detail:
        `.trim();
    }
}
