# Project Generation System Guide

## Overview

The project generation system automatically creates complete academic research projects following Nigerian university standards (specifically NOUN guidelines). It uses AI to generate content that adheres to strict academic formatting and structural requirements.

## System Architecture

### 1. Template System

Templates define the structure and requirements for each chapter:

```typescript
interface TemplateChapter {
    id: number;
    chapterNumber: number;
    title: string;
    description?: string;
    subsections?: string[];
    wordCount?: number;
    guidelines?: string;
}
```

**Default Template**: Standard Nigerian University Project Template
- 12 chapters (Title Page → Bibliography)
- Follows NOUN guidelines exactly
- Includes word count targets and subsection requirements

### 2. Generation Pipeline

**Flow**: Project Creation → Template Loading → Chapter Generation → Validation → Storage

#### Components:

1. **SectionPipelineEngine** (`src/lib/ai/SectionPipelineEngine.ts`)
   - Orchestrates chapter generation
   - Handles provider fallback (Groq → Gemini → HuggingFace)
   - Implements retry logic with structural repair
   - Integrates template structure into prompts

2. **ValidationEngine** (`src/lib/ai/ValidationEngine.ts`)
   - Validates generated content
   - Checks word count requirements
   - Detects missing sections
   - Identifies AI artifacts
   - Detects truncation

3. **AcademicOrchestrator** (`src/lib/ai/AcademicOrchestrator.ts`)
   - High-level generation coordinator
   - Manages feedback analytics
   - Provides export audit functionality

### 3. AI Provider Configuration

**Priority Order**: Groq → Gemini → HuggingFace

**Models**:
- Groq: `llama-3.1-8b-instant`
- Gemini: `gemini-1.5-flash-latest`
- HuggingFace: `google/flan-t5-large`

**Configuration** (`src/lib/ai/ai.config.ts`):
```typescript
{
    maxTokens: 4000,
    timeouts: { default: 30000 },
    retries: { max: 1, backoff: 1000 }
}
```

## Chapter Structure

### Preliminary Pages (Chapters 1-6)

1. **Title Page** - Project title, student details, institution
2. **Certification** - Supervisor certification
3. **Dedication** - Optional dedication
4. **Acknowledgement** - Acknowledgements
5. **Table of Contents** - Complete listing with page numbers
6. **Abstract** - 400-word synopsis

### Main Chapters (Chapters 7-11)

7. **Chapter One: Introduction** (3500+ words)
   - Background to the Study
   - Statement of the Problem
   - Research Questions
   - Aims and Objectives
   - Hypotheses
   - Significance
   - Scope
   - Definition of Concepts

8. **Chapter Two: Literature Review** (4000+ words)
   - Conceptual Literature
   - Theoretical Framework
   - Empirical Studies

9. **Chapter Three: Methodology** (3000+ words)
   - Research Design
   - Population
   - Sampling
   - Data Collection Instruments
   - Data Analysis Techniques
   - Limitations

10. **Chapter Four: Results and Discussion** (4000+ words)
    - Data Presentation
    - Analysis
    - Hypothesis Testing
    - Discussion of Findings

11. **Chapter Five: Summary, Conclusion and Recommendations** (2500+ words)
    - Summary
    - Conclusion
    - Recommendations

12. **Bibliography** - Complete reference list

## Generation Process

### 1. Project Creation

```typescript
POST /api/projects
FormData: {
    studentId: number,
    title: string,
    level: string,
    type: string,
    templateId?: number,  // Optional, uses default if not provided
    academicMetadata?: {
        institution: {
            name: string,
            faculty: string,
            department: string,
            programme: string
        },
        research: {
            area: string,
            keywords: string[]
        }
    }
}
```

### 2. Automatic Chapter Generation

When a project is created:
1. System loads template (default or specified)
2. Creates 12 empty chapter records
3. Triggers parallel generation for all chapters
4. Each chapter generation:
   - Builds context-aware prompt
   - Includes template structure
   - Includes academic metadata
   - Includes university guidelines
   - Generates content via AI
   - Validates output
   - Retries if validation fails
   - Saves to database

### 3. Validation Criteria

**Major Chapters (1-5)**:
- Minimum 2500 words
- All required subsections present
- No AI artifacts
- Proper ending (not truncated)
- Score ≥ 80/100

**Preliminary Pages**:
- Minimum 100 words
- Appropriate format
- No AI artifacts

### 4. Error Handling

**Transient Errors**: Retry with same provider
**Permanent Errors**: Switch to next provider
**Validation Failures**: Regenerate with repair prompt
**Max Retries**: Mark as "Pending Regeneration"

## Template Management

### Creating Templates

```typescript
POST /api/templates
{
    name: string,
    description: string,
    type: "project",
    content: TemplateChapter[],
    isDefault: boolean
}
```

### Using Templates

Templates are automatically applied during project generation. The system:
1. Checks for specified templateId
2. Falls back to default template if none specified
3. Extracts chapter structure for each chapter
4. Includes structure in generation prompt

### Seeding Default Template

```bash
node scripts/seed-templates.mjs
```

This creates/updates the standard NOUN template.

## Prompt Engineering

### Template Integration

When a template is available, the prompt includes:

```
=== TEMPLATE STRUCTURE FOR THIS CHAPTER ===
Chapter Title: [Title]
Required Subsections:
- [Subsection 1]
- [Subsection 2]
...
Target Word Count: [Count] words
Additional Guidelines: [Guidelines]
===========================================
```

### Context Integration

Prompts include:
- Project topic and title
- Academic level
- Student's institution details
- Research area and keywords
- Problem statement (if available)
- Objectives (if available)
- Methodology (if available)
- University guidelines (NOUN standards)
- Template structure
- Previous content (for continuity)

## Quality Assurance

### Validation Checks

1. **Word Count**: Ensures minimum requirements met
2. **Structure**: Verifies required sections present
3. **Completeness**: Detects truncation
4. **Authenticity**: Removes AI artifacts
5. **Academic Tone**: Validates formal language

### Scoring System

- Base score: 100
- Word count penalty: -40 (major chapters), -30 (preliminary)
- Missing sections: -10 per section
- Truncation: -50
- AI artifacts: -50
- **Pass threshold**: 80/100

## Monitoring & Analytics

### Generation Metrics

Tracked via `FeedbackAnalytics`:
- Provider used
- Retry count
- Validation score
- Word count
- Success/failure
- Failure reason

### Notifications

Real-time events via `NotificationService`:
- Chapter generation started
- Validation in progress
- Provider switched
- Retry attempt
- Chapter completed

## Best Practices

### For Students

1. **Provide Complete Metadata**: Include institution, faculty, department, programme
2. **Add Research Context**: Problem statement, objectives, methodology
3. **Review Generated Content**: Always review and customize
4. **Use Templates**: Leverage templates for consistency

### For Administrators

1. **Monitor API Keys**: Ensure all providers configured
2. **Check Generation Logs**: Review `GenerationLog` table
3. **Update Templates**: Keep templates current with guidelines
4. **Set Rate Limits**: Prevent abuse

### For Developers

1. **Test Validation**: Ensure validation catches issues
2. **Monitor Provider Health**: Track provider failures
3. **Update Guidelines**: Keep `RESEARCH_GUIDELINES` current
4. **Optimize Prompts**: Continuously improve prompt engineering

## Troubleshooting

### Common Issues

**Issue**: Chapters not generating
- Check API keys in `.env`
- Verify database connection
- Check rate limits
- Review generation logs

**Issue**: Content too short
- Increase `maxTokens` in config
- Adjust validation thresholds
- Check provider limits

**Issue**: Missing sections
- Update template structure
- Enhance validation rules
- Improve repair prompts

**Issue**: AI artifacts in content
- Update artifact detection patterns
- Improve prompt instructions
- Add post-processing filters

## API Reference

### Generate Chapter

```typescript
POST /api/chapters/generate
{
    projectId: number,
    chapterNumber: number,
    chapterTitle: string,
    topic: string,
    level: string,
    instruction?: string,
    prompt?: string
}
```

### Get Templates

```typescript
GET /api/templates
Response: Template[]
```

### Create Project

```typescript
POST /api/projects
FormData with project details
Response: Project with chapters
```

## Configuration

### Environment Variables

```env
GEMINI_API_KEY=your_key
GROQ_API_KEY=your_key
HUGGINGFACE_API_TOKEN=your_token
DATABASE_URL=your_database_url
```

### AI Configuration

Edit `src/lib/ai/ai.config.ts`:
- Model selection
- Provider priority
- Timeouts
- Retry settings
- Token limits

## Future Enhancements

- [ ] Custom template builder UI
- [ ] Real-time generation progress
- [ ] Chapter regeneration with feedback
- [ ] Multi-language support
- [ ] Advanced plagiarism detection
- [ ] Citation management integration
- [ ] Collaborative editing
- [ ] Version control for chapters
