# Project Generation System Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Student Interface                         │
│                    (Create Project Form)                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    POST /api/projects                            │
│  • Receives project details                                      │
│  • Loads template (default or specified)                         │
│  • Creates 12 empty chapter records                              │
│  • Triggers parallel chapter generation                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Template System                                 │
│  ┌──────────────────────────────────────────────────┐           │
│  │  Default Template (NOUN Guidelines)              │           │
│  │  • 12 Chapters                                   │           │
│  │  • Subsections defined                           │           │
│  │  • Word count targets                            │           │
│  │  • Specific guidelines                           │           │
│  └──────────────────────────────────────────────────┘           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Chapter Generation Pipeline                         │
│  (For each of 12 chapters in parallel)                          │
│                                                                  │
│  ┌────────────────────────────────────────────────┐             │
│  │  1. SectionPipelineEngine                      │             │
│  │     • Extract template structure               │             │
│  │     • Build context-aware prompt               │             │
│  │     • Include institution metadata             │             │
│  │     • Add NOUN guidelines                      │             │
│  └────────────────┬───────────────────────────────┘             │
│                   │                                              │
│                   ▼                                              │
│  ┌────────────────────────────────────────────────┐             │
│  │  2. AI Provider (with fallback)                │             │
│  │     ┌──────────────┐                           │             │
│  │     │ Try Groq     │ (Fast, primary)           │             │
│  │     └──────┬───────┘                           │             │
│  │            │ Failed?                            │             │
│  │            ▼                                    │             │
│  │     ┌──────────────┐                           │             │
│  │     │ Try Gemini   │ (Reliable, fallback)      │             │
│  │     └──────┬───────┘                           │             │
│  │            │ Failed?                            │             │
│  │            ▼                                    │             │
│  │     ┌──────────────┐                           │             │
│  │     │ Try HF       │ (Backup)                  │             │
│  │     └──────────────┘                           │             │
│  └────────────────┬───────────────────────────────┘             │
│                   │                                              │
│                   ▼                                              │
│  ┌────────────────────────────────────────────────┐             │
│  │  3. ValidationEngine                           │             │
│  │     • Check word count (2500+ major chapters)  │             │
│  │     • Verify required sections present         │             │
│  │     • Detect AI artifacts                      │             │
│  │     • Check for truncation                     │             │
│  │     • Calculate score (pass: 80/100)           │             │
│  └────────────────┬───────────────────────────────┘             │
│                   │                                              │
│                   ▼                                              │
│  ┌────────────────────────────────────────────────┐             │
│  │  4. Retry Logic (if validation fails)          │             │
│  │     • Generate repair prompt                   │             │
│  │     • Retry up to 3 times                      │             │
│  │     • Switch provider if permanent error       │             │
│  └────────────────┬───────────────────────────────┘             │
│                   │                                              │
│                   ▼                                              │
│  ┌────────────────────────────────────────────────┐             │
│  │  5. Save to Database                           │             │
│  │     • Update chapter content                   │             │
│  │     • Set status (Draft/Pending Regeneration)  │             │
│  │     • Log generation metrics                   │             │
│  └────────────────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Database (PostgreSQL)                       │
│  • Project record                                                │
│  • 12 Chapter records with content                               │
│  • Generation logs                                               │
│  • Template records                                              │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Student Dashboard                             │
│  • View generated chapters                                       │
│  • Edit and customize content                                    │
│  • Regenerate specific chapters                                  │
│  • Export to DOCX/PDF                                            │
└─────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Template System

**Location**: `src/lib/template-utils.ts`, Database `Template` table

**Responsibilities**:
- Store chapter structure definitions
- Provide subsection requirements
- Define word count targets
- Include chapter-specific guidelines

**Data Structure**:
```typescript
{
    id: 1,
    chapterNumber: 7,
    title: "Chapter One: Introduction",
    subsections: [
        "1.1 Background to the Study",
        "1.2 Statement of the Problem",
        "1.3 Research Questions",
        // ...
    ],
    wordCount: 3500,
    guidelines: "Establish context, identify problem..."
}
```

### 2. SectionPipelineEngine

**Location**: `src/lib/ai/SectionPipelineEngine.ts`

**Responsibilities**:
- Orchestrate chapter generation
- Build context-aware prompts
- Integrate template structure
- Manage provider fallback
- Handle retry logic

**Prompt Components**:
1. Project context (topic, level)
2. Institution metadata (name, faculty, department, programme)
3. Research context (problem, objectives, methodology)
4. Template structure (subsections, word count, guidelines)
5. NOUN guidelines (complete formatting rules)
6. Critical instructions (no artifacts, proper formatting)

### 3. AI Providers

**Location**: `src/lib/ai/providers/`

**Provider Chain**:
1. **Groq** (`groq.ts`) - Primary, fast
   - Model: `llama-3.1-8b-instant`
   - Best for: Quick generation
   
2. **Gemini** (`gemini.ts`) - Fallback, reliable
   - Model: `gemini-1.5-flash-latest`
   - Best for: Quality content
   
3. **HuggingFace** (`huggingface.ts`) - Backup
   - Model: `google/flan-t5-large`
   - Best for: Availability

**Configuration**: `src/lib/ai/ai.config.ts`
```typescript
{
    priority: ["groq", "gemini", "huggingface"],
    maxTokens: 4000,
    timeouts: { default: 30000 },
    retries: { max: 1, backoff: 1000 }
}
```

### 4. ValidationEngine

**Location**: `src/lib/ai/ValidationEngine.ts`

**Validation Checks**:
1. **Word Count**
   - Major chapters: 2500+ words
   - Preliminary pages: 100+ words
   
2. **Structure**
   - Required subsections present
   - Proper headings
   
3. **Quality**
   - No AI artifacts (11 patterns detected)
   - No truncation
   - Proper endings
   
4. **Scoring**
   - Base: 100 points
   - Penalties applied for issues
   - Pass threshold: 80/100

### 5. Database Schema

**Tables**:
- `Project` - Project metadata
- `Chapter` - Chapter content and status
- `Template` - Template definitions
- `GenerationLog` - Generation metrics

**Chapter Status Values**:
- `Generating` - Currently being generated
- `Draft` - Successfully generated
- `Pending Regeneration` - Failed, needs retry

## Data Flow

### 1. Project Creation
```
Student Form → API → Database
    ↓
Create Project Record
    ↓
Create 12 Empty Chapters
    ↓
Load Template
    ↓
Trigger Generation
```

### 2. Chapter Generation
```
For Each Chapter:
    ↓
Extract Template Structure
    ↓
Build Prompt with:
  • Template subsections
  • Institution metadata
  • Research context
  • NOUN guidelines
    ↓
Call AI Provider (Groq)
    ↓
Validate Output
    ↓
Pass? → Save to DB
    ↓
Fail? → Retry (max 3x)
    ↓
Still Fail? → Mark "Pending Regeneration"
```

### 3. Validation Flow
```
Generated Content
    ↓
Check Word Count
    ↓
Check Required Sections
    ↓
Check for AI Artifacts
    ↓
Check for Truncation
    ↓
Calculate Score
    ↓
Score ≥ 80? → Valid
    ↓
Score < 80? → Generate Repair Prompt → Retry
```

## Error Handling

### Transient Errors
- Network timeouts
- Rate limits
- Temporary API issues

**Action**: Retry with same provider

### Permanent Errors
- Model not found (404)
- Invalid API key
- Model decommissioned

**Action**: Switch to next provider in chain

### Validation Failures
- Short content
- Missing sections
- AI artifacts
- Truncation

**Action**: Generate repair prompt, retry up to 3 times

### Complete Failure
All providers failed or max retries exceeded

**Action**: Mark chapter as "Pending Regeneration", allow manual retry

## Monitoring & Analytics

### Generation Logs
```sql
CREATE TABLE GenerationLog (
    id INT PRIMARY KEY,
    projectId INT,
    chapterNumber INT,
    provider VARCHAR,
    retries INT,
    validationScore FLOAT,
    wordCount INT,
    success BOOLEAN,
    failureReason TEXT,
    createdAt TIMESTAMP
);
```

### Metrics Tracked
- Provider used
- Retry count
- Validation score
- Word count
- Success/failure
- Failure reason
- Generation time

### Health Monitoring
```bash
npm run test:generation
```

Checks:
- ✅ Templates available
- ✅ AI providers configured
- ✅ Database connected
- ✅ Recent activity
- ✅ Generation success rate

## Configuration

### Environment Variables
```env
GEMINI_API_KEY=your_key
GROQ_API_KEY=your_key
HUGGINGFACE_API_TOKEN=your_token
DATABASE_URL=postgresql://...
```

### AI Configuration
`src/lib/ai/ai.config.ts`
- Model selection
- Provider priority
- Timeouts
- Retry settings
- Token limits

### Validation Configuration
`src/lib/ai/ValidationEngine.ts`
- Minimum word counts
- Required sections
- AI artifact patterns
- Scoring thresholds

## Scalability

### Current Capacity
- Parallel chapter generation (12 chapters simultaneously)
- Provider fallback for reliability
- Redis caching for repeated prompts
- Rate limiting per user

### Optimization Opportunities
- Batch generation for multiple projects
- Caching common chapter structures
- Pre-warming AI models
- Distributed generation workers

## Security

### API Key Management
- Stored in environment variables
- Never exposed to client
- Rotated regularly

### Rate Limiting
- Per-user limits
- Per-endpoint limits
- Prevents abuse

### Content Validation
- Sanitize user inputs
- Validate template structure
- Check for malicious content

## Future Enhancements

### Short Term
- Real-time generation progress UI
- Chapter regeneration with feedback
- Template builder UI

### Medium Term
- Multi-language support
- Advanced plagiarism detection
- Collaborative editing

### Long Term
- Custom AI model fine-tuning
- Automated peer review
- University system integration
