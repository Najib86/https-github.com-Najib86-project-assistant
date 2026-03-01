import { ValidationResult } from "./ValidationEngine";

export class RepairEngine {
    generateRepairPrompt(chapterTitle: string, validationResult: ValidationResult): string {
        return `
Your previous output for "${chapterTitle}" was incomplete or structurally invalid.

Validation Failures:
${validationResult.errors.map(e => `- ${e}`).join("\n")}

You MUST:
- Expand all required sub-sections specified in the guidelines
- Ensure minimum word count is met
- Complete unfinished paragraphs
- Remove summary-style tone
- Produce a full academic draft

Rewrite the entire chapter properly. DO NOT output conversational filler like "Here is the revised chapter". Just the academic content.
        `.trim();
    }
}
