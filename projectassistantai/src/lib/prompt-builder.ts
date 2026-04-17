// src/lib/prompt-builder.ts
// Builds the complete master AI prompt for project generation

export interface PromptConfig {
  title: string;
  studentName: string;
  matric: string;
  university: string;
  faculty: string;
  degree: string;
  location: string;
  year: string;
  theory1: string;
  theory2: string;
  researchDesign: string;
  population: string;
  sampleSize: string;
  dataMethod: string;
  objectives: string;
  pageTarget: string;
  fontSpec: string;
  citation: string;
  refCount: string;
  exportFormat: string;
  statsTool: string;
  charts: string[];
  tables: string[];
  chapters: string[];
}

export function buildMasterPrompt(c: PromptConfig): string {
  return `╔══════════════════════════════════════════════════════════════════════════════╗
║         PROJECTASSISTANTAI.COM.NG — MASTER RESEARCH PROJECT PROMPT         ║
║         Complete Academic Project Generator | NOUN-Compliant | ${c.year}         ║
╚══════════════════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 1: MASTER INSTRUCTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are an expert Nigerian academic writing assistant. Your task is to produce a 
COMPLETE, FULL-LENGTH, PUBLICATION-QUALITY research project document following 
ALL specifications below. 

CRITICAL RULES:
✗ Do NOT produce summaries, outlines, or partial sections — produce ENTIRE content
✗ Do NOT use first person ("I think/feel/believe") — use objective scholarly voice
✓ Cite in-text using ${c.citation}: (Author, Year) or Author (Year) found that...
✓ Write in formal academic English — objective, scholarly, precise
✓ Every paragraph minimum 5 sentences; every section minimum 3 paragraphs
✓ All tables: title ABOVE, source/note BELOW
✓ All figures: caption BELOW with "Figure N: Description"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 2: PROJECT IDENTITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROJECT TITLE     : ${c.title}
STUDENT NAME      : ${c.studentName}
MATRICULATION NO  : ${c.matric}
UNIVERSITY        : ${c.university}
FACULTY/DEPT      : ${c.faculty}
DEGREE PROGRAMME  : ${c.degree}
GEOGRAPHIC FOCUS  : ${c.location}
SUBMISSION YEAR   : ${c.year}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 3: FORMATTING SPECIFICATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FONT & SPACING    : ${c.fontSpec}
TARGET LENGTH     : ${c.pageTarget}
CITATION STYLE    : ${c.citation}
MINIMUM REFS      : ${c.refCount}
PAPER SIZE        : A4 (297 × 210mm)
MARGINS           : Top 1", Bottom 1", Left 1.25", Right 1"
PARAGRAPH INDENT  : 0.5" first-line indent on all body paragraphs
HEADING STYLES    : Chapter titles UPPERCASE BOLD centered; numbered sub-headings
PRELIMINARY PAGES : Roman numeral pagination (i, ii, iii...)
MAIN BODY PAGES   : Arabic numeral pagination (1, 2, 3...) starting Chapter 1
EXPORT FORMAT     : ${c.exportFormat}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 4: DOCUMENT STRUCTURE — PRODUCE EVERY SECTION IN FULL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CHAPTERS REQUIRED : ${c.chapters.join(", ")}

PRELIMINARY PAGES (produce each fully):
  ► Cover Page — Title at upper half; student name (surname first);
                 matric number; "A project submitted to the ${c.faculty}
                 of ${c.university} in partial fulfillment of requirements
                 for the award of ${c.degree}"; Month, Year at bottom.
  ► Declaration  — Full original declaration with signature line
  ► Certification — Supervisor + HOD certification with signature/date lines
  ► Dedication   — Personalised dedication (150+ words)
  ► Acknowledgement — Comprehensive (400+ words): God, supervisor, university,
                      field participants, research assistants, family
  ► Abstract     — ONE blocked paragraph, SINGLE-SPACED, max 400 words.
                   Must cover: problem, purpose, methodology, findings,
                   recommendations. End with 6-8 keywords.
  ► List of Tables  — Numbered with page numbers
  ► List of Figures — Numbered with page numbers
  ► List of Abbreviations — All acronyms used
  ► Table of Contents — Full, all sub-headings with page numbers

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 5: CHAPTER-BY-CHAPTER SPECIFICATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

╌╌ CHAPTER ONE: INTRODUCTION (18–22 pages) ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌

1.1 Background to the Study (6-8 paragraphs, minimum 4 pages)
    - Broad context establishing significance; narrow to ${c.location}
    - Establish research gap; cite minimum 8 academic sources
    - End with bridge sentence explaining why study needed now

1.2 Statement of the Problem (4-5 paragraphs, 2-3 pages)
    - Specific knowledge gap; practical consequences; single-sentence problem statement

1.3 Research Questions — exactly 5, numbered, active interrogative verbs

1.4 Aims and Objectives
    - One overarching AIM; Five OBJECTIVES starting with infinitive verbs

1.5 Hypotheses — exactly 3 (H1, H2, H3) as testable variable relationships

1.6 Significance (sub-sections: Theoretical, Methodological, Policy, Practical)

1.7 Scope (Geographic: specific LGAs; Thematic: specific platforms; Temporal: years)

1.8 Definition of Concepts — 5-6 key concepts with scholarly citations each:
    Primary frameworks: ${c.theory1} + ${c.theory2}

${c.objectives ? `RESEARCH OBJECTIVES:\n${c.objectives}` : ""}

╌╌ CHAPTER TWO: LITERATURE REVIEW (28–35 pages) ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌

2.1 Conceptual Literature (10-14 pages)
    - 4-5 major conceptual sub-sections on key study variables
    - Trace evolution from foundational to contemporary scholarship
    - Cite minimum 15 different sources in this section

2.2 Theoretical Framework (10-12 pages)
    PRIMARY THEORY: ${c.theory1}
    SECONDARY THEORY: ${c.theory2}
    - Origin, development, core propositions, key scholars for each
    - Specific application to this study
    - Critical evaluation and limitations
    - Sub-section 2.2.3: Integration of frameworks
    ► INSERT FIGURE 6: Conceptual Framework diagram (inputs → mediating factors → outcomes)

2.3 Empirical Review (8-10 pages)
    - Review 10-15 directly relevant prior studies
    - Organised thematically; include Nigerian/African studies prominently
    - For each: author, year, methodology, findings, relevance
    ► INSERT FIGURE 7: Trend line chart (2016-2024, dual line)

2.4 Summary of Literature Review (1-2 pages)
    - 5 key conclusions; explicit identification of the gap

╌╌ CHAPTER THREE: RESEARCH METHODOLOGY (14–18 pages) ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌

3.1 Preamble — Epistemological orientation (pragmatic mixed methods)
3.2 Research Design: ${c.researchDesign}
    - Justify with reference to research questions
3.3 Population: ${c.population}
    - Cite population size sources (NPC 2006 + projections)
3.4 Sampling: ${c.sampleSize}
    - Apply Yamane (1967) explicitly: n = N / (1 + Ne²)
    - Multi-stage: Stage 1 (community selection), Stage 2 (household), Stage 3 (Kish grid)
    - Qualitative: 18 key informants + 3 FGDs (8 each)
3.5 Data Collection: ${c.dataMethod}
    - Questionnaire sections A (Demographics), B (Platform Use),
      C (Peace Communication), D (Social Cohesion — 16-item Likert)
    - Content validity: expert review by 2 academics
    - Cronbach's Alpha = 0.81; pre-test n=40
    - Translation to local languages + back-translation
3.6 Data Analysis: ${c.statsTool}
    - Univariate: frequencies, percentages, means, SDs
    - Bivariate: Pearson r (H1), Chi-Square (H2, H3), α = 0.05
    - Report effect sizes: Cramér's V, r²
    - Qualitative: Braun & Clarke (2006) 6-phase thematic analysis
3.7 Limitations — 4-5 specific limitations with mitigations

╌╌ CHAPTER FOUR: DATA PRESENTATION & ANALYSIS (25–32 pages) ╌╌╌╌╌╌╌╌╌

4.1 Preamble — Fieldwork summary; response rates; n=371 valid questionnaires

4.2 Analysis by Research Questions:
  4.2.1 Demographic Profile
        ► INSERT TABLE 1: Full demographics (sex, age, education, occupation, LGA, religion)
        ► INSERT FIGURE 2: Age distribution pie chart
        ► INSERT FIGURE 8: Occupational distribution bar chart

  4.2.2 RQ1 — Platform Usage & Peacebuilding Activities
        ► INSERT FIGURE 1: Platform usage bar (WhatsApp 84.1%, Facebook 61.3%,
          YouTube 38.7%, Twitter/X 22.1%, Blogs 14.8%)
        ► INSERT TABLE 2: Digital media access & peacebuilding use (12 activities)
        ► INSERT FIGURE 9: LGA comparison grouped bar chart
        Include verbatim quote from civil society key informant interview

  4.2.3 RQ2 — Content Effectiveness
        ► INSERT FIGURE 3: Horizontal bar — content effectiveness scores
        ► INSERT TABLE 3: Effectiveness table (mean, SD, min, max, rating label)
        ► INSERT TABLE 4: Activity frequency (daily/weekly/monthly/never)
        ► INSERT FIGURE 11: Stacked bar — WhatsApp group content composition
        Include verbatim quote from FGD participant

  4.2.4 RQ3 — Attitudes Toward Peace (67.3% vs 38.9% comparison)
  4.2.5 RQ4 — Challenges
        ► INSERT FIGURE 5: Challenges bar chart
        ► INSERT FIGURE 13: Connectivity sub-challenges horizontal bar
        Include verbatim quote from digital literacy trainer
  4.2.6 Social Cohesion Likert Analysis
        ► INSERT TABLE 5: 8-item Likert (SA/A/U/D/SD % + mean)
        ► INSERT FIGURE 10: Social cohesion radar chart
        ► INSERT TABLE 6: Cross-tabulation (DM use × cohesion category)

4.3 Hypothesis Testing:
  H1: Pearson r=0.63, r²=0.40, p=0.000
      ► INSERT FIGURE 12: Scatter plot with regression line; ACCEPT H1
  H2: χ²=47.82, df=4, Cramér's V=0.36, p=0.000; ACCEPT H2
      Active DM mean=3.79 vs No DM mean=2.93
  H3: χ²=52.41, df=4, Cramér's V=0.38, p=0.000; ACCEPT H3
      High hate speech mean=2.47 vs Low hate speech mean=3.62
  ► INSERT TABLE 7: Hypothesis summary (all 3 with all statistics)
  ► INSERT FIGURE 4: Grouped bar — cohesion scores by engagement group

4.4 Discussion of Findings (6-8 pages, 4 sub-sections):
  4.4.1 The WhatsApp-Centred Digital Peacebuilding Ecosystem
  4.4.2 The Power of Personal Narrative in Digital Peace Communication
  4.4.3 Structural Constraints as a Fundamental Barrier
  4.4.4 Qualitative Dimension — Key Informant Perspectives
        ► INSERT TABLE 8: Qualitative theme matrix (6 themes × 4 columns)

╌╌ CHAPTER FIVE: SUMMARY, CONCLUSION & RECOMMENDATIONS (12–16 pages) ╌

5.1 Summary — One paragraph per chapter (5 min); include all key statistics
5.2 Conclusion — 5 named sub-conclusions (5.2.1–5.2.5):
    5.2.1 Dual nature of digital media confirmed
    5.2.2 Peacebuilding potential real but conditional
    5.2.3 Hate speech as measurable social cohesion threat
    5.2.4 Content quality and source trust as primary determinants
    5.2.5 Structural barriers limiting realisation of potential
5.3 Recommendations — 9 detailed recommendations (150+ words each):
    ► INSERT TABLE 9: Recommendations framework
    ► INSERT FIGURE 14: Proposed digital peace communication framework
    Targets: PLASPA, NCC, NITDA, Meta Nigeria, Civil Society,
    University of Jos, UNDP, State Government, Ministry of Education

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 6: CHARTS & FIGURES SPECIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GENERATE EACH CHART using Python matplotlib (150 DPI, white facecolor, tight layout):

${c.charts.includes("bar") ? `Figure 1: Bar chart — Platform usage (WhatsApp 84.1%, Facebook 61.3%, YouTube 38.7%, Twitter/X 22.1%, Blogs 14.8%) | 9×5in | Blue/teal palette` : ""}
${c.charts.includes("pie") ? `Figure 2: Pie chart — Age distribution (18-25: 28.6%, 26-35: 34.5%, 36-45: 22.6%, 46+: 14.3%) | 7×6in | explode=0.04 on largest slice` : ""}
${c.charts.includes("hbar") ? `Figure 3: Horizontal bar — Content effectiveness (10 types, colour-coded Green≥3.5, Amber≥3.0, Red<3.0) | 9×5.5in` : ""}
${c.charts.includes("grouped") ? `Figure 4: Grouped bar — Cohesion scores by engagement group (3 hypothesis categories) | 9×5in` : ""}
Figure 5: Bar chart — Challenges (Poor connectivity 72.8%, Digital literacy 67.4%, Misinformation 64.1%, Distrust govt 58.7%, No strategy 52.3%) | 9×5in
${c.charts.includes("framework") ? `Figure 6: Flow diagram — Conceptual framework using FancyBboxPatch boxes connected with arrows | 11×7in | Blue/green/gold palette` : ""}
Figure 7: Dual line chart — Peace content 2016-2024 vs harmful content, fill_between shading | 9×5in
Figure 8: Bar chart — Occupation (Farmer 34.5%, Trader 28.3%, Civil Servant 16.7%, Student 12.9%, Other 7.6%) | 8×4.5in
Figure 9: Grouped bar — LGA comparison (Barkin Ladi, Riyom, Mangu × peace vs harmful content) | 9×5in
${c.charts.includes("radar") ? `Figure 10: Radar chart — Social cohesion 5 dimensions pre vs post digital peacebuilding | 7×6in | polar subplot` : ""}
Figure 11: Stacked bar — WhatsApp group content composition (4 group types: well-moderated 78.3% peace, unmoderated 40.3% harmful, political 68.9% harmful, religious 55.6% peace) | 9×5in
${c.charts.includes("scatter") ? `Figure 12: Scatter plot n=371 points (alpha=0.35) with regression line r=0.63 | 8×5in` : ""}
Figure 13: Horizontal bar — Connectivity challenges (Network unavailability 72.8%, High data costs 61.5%, Power outages 58.3%, Device problems 34.7%, Low bandwidth 48.2%) | 8×4.5in
${c.charts.includes("proposal") ? `Figure 14: Multi-row framework diagram (title banner + 4 input boxes + 2 process rows + 3 output boxes) | 11×8in` : ""}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 7: TABLES SPECIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FORMATTING RULES FOR ALL TABLES:
- Use WidthType.DXA (NEVER WidthType.PERCENTAGE) — total width = 9160 DXA
- Header: fill="#1F4E79", white bold text, HDR_BORDERS (single 6pt blue)
- Alternate rows: fill="#DEEAF1", CELL_BORDERS (single 4pt grey #CCCCCC)
- ALWAYS use ShadingType.CLEAR — NEVER ShadingType.SOLID (causes black cells)
- Cell margins: top:80, bottom:80, left:120, right:120

${c.tables.includes("demo") ? `Table 1: Demographics — Variable | Category | Frequency (%)
  Rows: Sex (2), Age (4), Education (4), Occupation (5), LGA (3), Religion (2)` : ""}
${c.tables.includes("dm-use") ? `Table 2: Digital Media Use — Activity | Yes (%) | No (%)  
  12 rows covering smartphone, internet, platforms, peace activities, harmful content` : ""}
${c.tables.includes("effectiveness") ? `Table 3: Content Effectiveness — Content Type | Mean | SD | Min | Max | Rating
  10 content types with SD values and effectiveness labels (Very High → Very Low)` : ""}
${c.tables.includes("freq") ? `Table 4: Activity Frequency — Activity | Daily | Weekly | Monthly | Never
  6 digital peacebuilding activity types` : ""}
${c.tables.includes("likert") ? `Table 5: Social Cohesion Likert — Statement | SA% | A% | U% | D% | SD% | Mean
  8 statements measuring trust, participation, perception, identity` : ""}
${c.tables.includes("crosstab") ? `Table 6: Cross-tabulation — DM Use Category × Cohesion Score Category
  5 cohesion categories × 4 engagement groups + Total column` : ""}
${c.tables.includes("hypothesis") ? `Table 7: Hypothesis Summary — Hypothesis | Test Statistic | df | p-value | Effect Size | Decision
  All 3 hypotheses with complete statistics` : ""}
${c.tables.includes("themes") ? `Table 8: Qualitative Theme Matrix — Theme | Evidence Sources | Key Findings | Implications
  6 themes from key informant interviews` : ""}
${c.tables.includes("recs") ? `Table 9: Recommendations — No. | Recommendation | Responsible Actor(s) | Timeframe & Indicators
  9 recommendations with implementer and measurable indicators` : ""}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 8: WORD DOCUMENT EXPORT — NODE.JS DOCX LIBRARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXPORT FORMAT: ${c.exportFormat}
LIBRARY: npm install -g docx (v9+)

CRITICAL DOCX RULES:
1. NEVER use unicode bullets (•) — use LevelFormat.BULLET via numbering config
2. NEVER use \\n newlines — use separate Paragraph elements
3. PageBreak MUST be inside a Paragraph: new Paragraph({ children:[new PageBreak()] })
4. ImageRun REQUIRES type param: { type:"png", data:fs.readFileSync(path), ... }
5. Tables: WidthType.DXA only; columnWidths must sum exactly to total width
6. ShadingType.CLEAR only — never SOLID

DOCUMENT TEMPLATE:
const doc = new Document({
  numbering: { config: [
    { reference:"bullets", levels:[{ level:0, format:LevelFormat.BULLET, text:"•",
      alignment:AlignmentType.LEFT,
      style:{ paragraph:{ indent:{ left:720, hanging:360 }, spacing:{line:480} } } }] },
    { reference:"numbers", levels:[{ level:0, format:LevelFormat.DECIMAL, text:"%1.",
      alignment:AlignmentType.LEFT,
      style:{ paragraph:{ indent:{ left:720, hanging:360 }, spacing:{line:480} } } }] }
  ]},
  styles: {
    default: { document: { run: { font:"Times New Roman", size:24 } } },
    paragraphStyles: [
      { id:"Heading1", name:"Heading 1", basedOn:"Normal", next:"Normal",
        run:{ size:28, bold:true, font:"Times New Roman", color:"000000" },
        paragraph:{ spacing:{ before:600, after:280 }, outlineLevel:0 } },
      { id:"Heading2", name:"Heading 2", basedOn:"Normal", next:"Normal",
        run:{ size:26, bold:true, font:"Times New Roman", color:"000000" },
        paragraph:{ spacing:{ before:400, after:220 }, outlineLevel:1 } }
    ]
  },
  sections:[{
    properties:{ page:{
      size:{ width:11906, height:16838 },
      margin:{ top:1440, right:1260, bottom:1440, left:1800 }
    }},
    footers:{ default: new Footer({ children:[new Paragraph({
      alignment:AlignmentType.CENTER,
      children:[new TextRun({ children:[PageNumber.CURRENT], size:20, font:"Times New Roman" })]
    })]}) },
    children: [ ...ALL_CONTENT ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('${c.title.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30)}_FINAL.docx', buf);
  console.log('SUCCESS');
});

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 9: EXACT DATA VALUES TO USE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PLATFORMS   : WhatsApp 84.1%, Facebook 61.3%, YouTube 38.7%, Twitter/X 22.1%
DEMOGRAPHICS: Male 57.7%, Female 42.3%; Age 26-35 most common (34.5%)
              Farmer 34.5%, Trader 28.3%, Civil Servant 16.7%
PEACE USE   : 56.3% shared peace messages; 43.8% in peacebuilding WhatsApp groups
              31.7% follow peace accounts; 78.4% own smartphones
CONTENT EFF : Video testimonials mean=4.21 SD=0.73 (highest)
              Audio from leaders mean=4.07; Stories cooperation mean=3.89
              Political content mean=2.41 SD=1.23 (lowest)
CHALLENGES  : Connectivity 72.8%, Digital literacy 67.4%, Misinformation 64.1%
              Govt distrust 58.7%, No strategy 52.3%
COHESION    : Inter-group trust mean=2.96; Joint activity mean=3.24
              Active DM peace mean=3.79; No DM peace mean=2.93
              High hate speech mean=2.47; Low hate speech mean=3.62
HYPOTHESES  : H1: r=0.63, r²=0.40, p=0.000, df=369 → ACCEPT
              H2: χ²=47.82, df=4, V=0.36, p=0.000 → ACCEPT
              H3: χ²=52.41, df=4, V=0.38, p=0.000 → ACCEPT

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 10: REFERENCES — MINIMUM ${c.refCount}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CITATION STYLE: ${c.citation}
FORMAT: Hanging indent, alphabetical order

MANDATORY SOURCES:
Nigerian/African: Adibe (2021), Aliyu & Musa (2022), ACLED (2022), 
  Adesoji (2010), UNDP (2020), Human Rights Watch (2018), ICG (2018),
  NCC (2022), DataReportal (2023), Uzochukwu & Ikechukwu (2021)
Theory: Galtung (1969), Kempf (2003), Tajfel & Turner (1979, 1986),
  Allport (1954), Lederach (2005), Berger-Schmitt (2000), Manoff (1998)
Methodology: Creswell (2014), Yamane (1967), Braun & Clarke (2006),
  Lochner et al. (1999), Tashakkori & Teddlie (2010)
Media/Tech: Moyo (2019), Brosché & Höglund (2016), Howard (2011),
  Wardle & Derakhshan (2017), Müller & Schwarz (2023), Bail et al. (2018)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 11: APPENDICES (PRODUCE ALL IN FULL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Appendix A: RESEARCH QUESTIONNAIRE (30 items across 4 sections)
  Section A: 8 demographic items
  Section B: 5 digital media access/usage items
  Section C: 7 peace communication items (with 10-item effectiveness scale 1-5)
  Section D: 12 social cohesion Likert items (SA/A/U/D/SD)
  Plus 2 open-ended questions

Appendix B: KEY INFORMANT INTERVIEW GUIDE (14 questions, 5 themed sections)
Appendix C: FOCUS GROUP DISCUSSION GUIDE (13 prompts, 5 sections with timing)
Appendix D: LIST OF ABBREVIATIONS (all acronyms in document)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 12: QUALITY CONTROL CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before completing, verify ALL of the following:
  ☑ Total page count: ${c.pageTarget}
  ☑ All 5 chapters fully written (not summarised)
  ☑ All preliminary pages complete
  ☑ Abstract: ONE blocked paragraph, ≤400 words, single-spaced
  ☑ All 14 figures embedded with numbered captions
  ☑ All 9 tables formatted: blue headers, alternating rows
  ☑ All 3 hypotheses explicitly tested with exact statistics
  ☑ ${c.refCount} in ${c.citation} with hanging indents
  ☑ All 4 appendices complete
  ☑ No WidthType.PERCENTAGE in any table
  ☑ No ShadingType.SOLID in any table
  ☑ No unicode bullet characters (use LevelFormat.BULLET)
  ☑ No standalone PageBreak (always inside Paragraph)
  ☑ All ImageRun include type:"png" parameter
  ☑ Column widths sum exactly to 9160 DXA
  ☑ Page footer with page numbers throughout

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BEGIN GENERATING THE COMPLETE PROJECT NOW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generated by ProjectAssistantAI.com.ng
Version 2.0 | ${c.citation} | ${c.pageTarget}`;
}
