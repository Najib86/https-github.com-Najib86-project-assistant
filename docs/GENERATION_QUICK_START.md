# Project Generation Quick Start

## Setup (One-Time)

### 1. Configure API Keys

Add to `.env`:
```env
GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key
HUGGINGFACE_API_TOKEN=your_hf_token
```

### 2. Seed Default Template

```bash
npm run seed:templates
```

### 3. Test System

```bash
npm run test:generation
```

## How It Works

### Automatic Generation

When a student creates a project:
1. ✅ System loads default template (or specified template)
2. ✅ Creates 12 chapter placeholders
3. ✅ Generates all chapters in parallel
4. ✅ Validates each chapter
5. ✅ Retries failed chapters automatically
6. ✅ Saves completed content

### Template-Driven

Each chapter follows a template with:
- **Title**: Official chapter name
- **Subsections**: Required sections
- **Word Count**: Minimum words
- **Guidelines**: Specific instructions

### Quality Assurance

Every chapter is validated for:
- ✅ Minimum word count (2500+ for major chapters)
- ✅ Required subsections present
- ✅ No AI artifacts ("As an AI...")
- ✅ Proper ending (not truncated)
- ✅ Academic tone and formatting

## Chapter Structure

### Preliminary (Chapters 1-6)
1. Title Page
2. Certification
3. Dedication
4. Acknowledgement
5. Table of Contents
6. Abstract (400 words max)

### Main Content (Chapters 7-11)
7. **Introduction** (3500+ words)
   - Background, Problem, Questions, Objectives, Significance, Scope

8. **Literature Review** (4000+ words)
   - Concepts, Theories, Empirical Studies

9. **Methodology** (3000+ words)
   - Design, Population, Sampling, Instruments, Analysis

10. **Results & Discussion** (4000+ words)
    - Data Presentation, Analysis, Hypothesis Testing

11. **Conclusion** (2500+ words)
    - Summary, Conclusions, Recommendations

12. **Bibliography**

## Generation Flow

```
Student Creates Project
         ↓
Load Template (Default or Custom)
         ↓
Create 12 Empty Chapters
         ↓
┌────────────────────────┐
│  For Each Chapter:     │
│  1. Build Prompt       │
│  2. Call AI Provider   │
│  3. Validate Output    │
│  4. Retry if Failed    │
│  5. Save to Database   │
└────────────────────────┘
         ↓
Project Ready for Review
```

## AI Provider Fallback

```
Try Groq (Fast)
    ↓ Failed?
Try Gemini (Reliable)
    ↓ Failed?
Try HuggingFace (Backup)
    ↓ Failed?
Mark "Pending Regeneration"
```

## Validation Scoring

- **Base Score**: 100 points
- **Penalties**:
  - Short content: -40 points
  - Missing sections: -10 per section
  - Truncated: -50 points
  - AI artifacts: -50 points
- **Pass Threshold**: 80/100

## Common Issues & Solutions

### Issue: Chapters Not Generating

**Check**:
```bash
# Verify API keys
cat .env | grep API_KEY

# Test database
npm run test:generation

# Check logs
tail -f logs/generation.log
```

**Solution**: Ensure at least one AI provider is configured

### Issue: Content Too Short

**Cause**: Token limits or provider issues

**Solution**:
1. Increase `maxTokens` in `src/lib/ai/ai.config.ts`
2. Switch to Gemini (higher limits)
3. Regenerate specific chapter

### Issue: Missing Sections

**Cause**: Template not applied or validation too strict

**Solution**:
1. Verify template loaded: Check `templateStructureReference` in logs
2. Update template with correct subsections
3. Adjust validation rules if needed

### Issue: "Pending Regeneration" Status

**Cause**: All providers failed or validation failed repeatedly

**Solution**:
1. Check provider health
2. Review generation logs for specific errors
3. Manually regenerate chapter via UI

## Manual Regeneration

If automatic generation fails:

1. Navigate to project page
2. Click chapter to edit
3. Use "Regenerate" button
4. Optionally provide specific instructions

## Monitoring

### Check Generation Status

```bash
npm run test:generation
```

### View Recent Logs

```sql
SELECT * FROM GenerationLog 
ORDER BY createdAt DESC 
LIMIT 10;
```

### Check Chapter Status

```sql
SELECT 
    p.title as project,
    c.chapterNumber,
    c.title,
    c.status,
    LENGTH(c.content) as content_length
FROM Chapter c
JOIN Project p ON c.projectId = p.project_id
WHERE p.project_id = YOUR_PROJECT_ID
ORDER BY c.chapterNumber;
```

## Best Practices

### For Students

1. ✅ Provide complete academic metadata
2. ✅ Fill out questionnaire thoroughly
3. ✅ Review and customize generated content
4. ✅ Add citations and references
5. ✅ Proofread before submission

### For Administrators

1. ✅ Monitor API usage and costs
2. ✅ Review generation logs regularly
3. ✅ Update templates as guidelines change
4. ✅ Set appropriate rate limits
5. ✅ Backup database regularly

## Advanced Configuration

### Custom Templates

Create custom templates via API:

```typescript
POST /api/templates
{
    "name": "Engineering Project Template",
    "description": "Template for engineering projects",
    "type": "project",
    "isDefault": false,
    "content": [
        {
            "id": 1,
            "chapterNumber": 1,
            "title": "Title Page",
            "subsections": ["Title", "Author", "Date"],
            "wordCount": 100,
            "guidelines": "Follow IEEE format"
        }
        // ... more chapters
    ]
}
```

### Adjust AI Settings

Edit `src/lib/ai/ai.config.ts`:

```typescript
export const AI_CONFIG = {
    models: {
        groq: "llama-3.1-8b-instant",
        gemini: "gemini-1.5-flash-latest",
        huggingface: "google/flan-t5-large"
    },
    priority: ["groq", "gemini", "huggingface"],
    timeouts: {
        default: 30000  // Increase for slower providers
    },
    retries: {
        max: 1,  // Increase for more retries
        backoff: 1000
    },
    maxTokens: 4000  // Increase for longer content
};
```

### Custom Validation Rules

Edit `src/lib/ai/ValidationEngine.ts`:

```typescript
private readonly MIN_WORDS_PER_CHAPTER = 2500;  // Adjust minimum
private readonly MIN_WORDS_PRELIMINARY = 100;
```

## Troubleshooting Commands

```bash
# Seed templates
npm run seed:templates

# Test system
npm run test:generation

# Check database
npx prisma studio

# View logs
npm run logs

# Reset failed chapters
npm run reset:failed-chapters
```

## Support

For issues or questions:
1. Check logs: `npm run test:generation`
2. Review documentation: `docs/PROJECT_GENERATION_GUIDE.md`
3. Check diagnostics: `npm run diagnostics`
4. Contact support with project ID and error details
