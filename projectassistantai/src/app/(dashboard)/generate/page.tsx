"use client";
// src/app/(dashboard)/generate/page.tsx
// The full Prompt Generator UI

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Copy, Download, CheckCircle, ChevronRight, 
  BookOpen, Cpu, FileText, BarChart3, Loader2, History,
  AlertCircle, Settings2, Layers, Database
} from "lucide-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

// ── Types ──────────────────────────────────────────────────────────────────
interface PromptConfig {
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
  saveToHistory: boolean;
}

const DEFAULT_CONFIG: PromptConfig = {
  title: "The Role of Digital Media in Promoting Peace and Social Cohesion in Plateau State Conflict-Prone Communities",
  studentName: "",
  matric: "",
  university: "National Open University of Nigeria",
  faculty: "Faculty of Social Sciences — Mass Communication",
  degree: "B.Sc. Mass Communication",
  location: "Plateau State, Nigeria",
  year: new Date().getFullYear().toString(),
  theory1: "Peace Communication Theory (Kempf, 2003)",
  theory2: "Social Identity Theory (Tajfel & Turner, 1979)",
  researchDesign: "Mixed Methods (Quantitative + Qualitative)",
  population: "Adult residents (18+) of conflict-prone communities in Barkin Ladi, Riyom, and Mangu LGAs, Plateau State",
  sampleSize: "385 respondents (Yamane formula, e=0.05)",
  dataMethod: "Structured Questionnaire + In-Depth Interviews + Focus Group Discussions",
  objectives: "1. To identify digital media platforms used for peacebuilding in conflict-prone communities of Plateau State\n2. To assess the extent to which digital media content promotes peaceful attitudes and inter-group dialogue\n3. To examine the relationship between digital media exposure and social cohesion outcomes\n4. To identify challenges limiting effective digital media peacebuilding\n5. To propose a contextually grounded digital peacebuilding framework for Plateau State",
  pageTarget: "90–120 pages (Masters standard)",
  fontSpec: "Times New Roman 12pt, Double-spaced (NOUN standard)",
  citation: "APA 7th Edition",
  refCount: "50+ scholarly references",
  exportFormat: "Microsoft Word (.docx) via Node.js docx library",
  statsTool: "SPSS v26 (Pearson Chi-Square + Correlation)",
  charts: ["bar", "pie", "hbar", "grouped", "radar", "scatter", "line", "stacked", "framework", "proposal"],
  tables: ["demo", "dm-use", "effectiveness", "freq", "likert", "crosstab", "hypothesis", "themes", "recs"],
  chapters: ["Preliminary Pages", "Chapter 1: Introduction", "Chapter 2: Literature Review", "Chapter 3: Methodology", "Chapter 4: Data & Analysis", "Chapter 5: Summary & Conclusion", "References", "Appendices"],
  saveToHistory: true,
};

const TABS = [
  { id: "basic",   label: "Project Info",   icon: BookOpen },
  { id: "content", label: "Theory & Design", icon: Layers },
  { id: "format",  label: "Format & Pages",  icon: FileText },
  { id: "data",    label: "Charts & Tables", icon: BarChart3 },
] as const;

type TabId = typeof TABS[number]["id"];

// ── Main Component ─────────────────────────────────────────────────────────
export default function GeneratePage() {
  const { data: session } = useSession();
  const [config, setConfig] = useState<PromptConfig>(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState<TabId>("basic");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{
    promptText: string;
    wordCount: number;
    savedId?: string;
    provider?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(<K extends keyof PromptConfig>(key: K, value: PromptConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  const toggleArray = useCallback((key: "charts" | "tables" | "chapters", value: string) => {
    setConfig(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value],
    }));
  }, []);

  // ── Generate ─────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!config.title.trim()) {
      toast.error("Please enter a project title");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/prompts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Generation failed");
      }

      setResult({
        promptText: data.promptText,
        wordCount: data.wordCount,
        savedId: data.savedId,
      });

      toast.success("Prompt generated successfully!");
      // Scroll to output
      setTimeout(() => {
        document.getElementById("output-section")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Generation failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Copy ──────────────────────────────────────────────────────────────────
  const handleCopy = async () => {
    if (!result?.promptText) return;
    await navigator.clipboard.writeText(result.promptText);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Download ──────────────────────────────────────────────────────────────
  const handleDownload = () => {
    if (!result?.promptText) return;
    const filename = config.title
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "_")
      .slice(0, 40);
    const blob = new Blob([result.promptText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ProjectPrompt_${filename}_${config.year}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded!");
  };

  return (
    <div className="min-h-screen bg-[#0a0d12]">
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#c9a84c] to-[#8a6f32] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#0a0d12]" />
            </div>
            <span className="text-xs font-bold tracking-widest text-[#c9a84c] uppercase">
              Prompt Generator
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white font-serif mb-2">
            Generate Your Research Prompt
          </h1>
          <p className="text-[#8a9bb5] text-sm">
            Configure your project parameters and generate a precision-engineered prompt 
            that produces a complete 90–120 page NOUN-compliant research project.
          </p>
        </motion.div>

        {/* Main Generator Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#111620] border border-[#1e2a3a] rounded-xl overflow-hidden shadow-2xl"
          style={{ boxShadow: "0 0 40px rgba(201,168,76,.08)" }}
        >
          {/* Card Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-[rgba(201,168,76,.08)] to-transparent border-b border-[#1e2a3a] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings2 className="w-5 h-5 text-[#c9a84c]" />
              <span className="font-bold text-white">Project Configuration</span>
            </div>
            {session?.user && (
              <div className="flex items-center gap-2 text-xs text-[#4a5a72]">
                <Database className="w-3 h-3" />
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.saveToHistory}
                    onChange={e => update("saveToHistory", e.target.checked)}
                    className="accent-[#c9a84c] w-3 h-3"
                  />
                  Save to history
                </label>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-3 bg-[#0d1117] border-b border-[#1e2a3a] flex-wrap">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === tab.id
                      ? "bg-[#c9a84c] text-[#0a0d12]"
                      : "text-[#4a5a72] hover:text-[#8a9bb5] hover:bg-[#1e2a3a]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
              >
                {activeTab === "basic" && <BasicTab config={config} update={update} />}
                {activeTab === "content" && <ContentTab config={config} update={update} />}
                {activeTab === "format" && <FormatTab config={config} update={update} toggleArray={toggleArray} />}
                {activeTab === "data" && <DataTab config={config} update={update} toggleArray={toggleArray} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Generate Button */}
          <div className="px-6 py-5 border-t border-[#1e2a3a] bg-[#0d1117] flex items-center justify-between gap-4 flex-wrap">
            <p className="text-xs text-[#4a5a72]">
              💡 Fill all tabs for maximum prompt accuracy and detail
            </p>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-[#c9a84c] to-[#a8762a] text-[#0a0d12] font-bold text-sm rounded-lg shadow-lg hover:shadow-[0_8px_30px_rgba(201,168,76,.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Building prompt...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Research Prompt
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 flex items-start gap-3 bg-[#c00000]/10 border border-[#c00000]/30 rounded-xl p-4"
            >
              <AlertCircle className="w-5 h-5 text-[#e05252] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#e05252]">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Output */}
        <AnimatePresence>
          {result && (
            <motion.div
              id="output-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-[#111620] border border-[#1e2a3a] rounded-xl overflow-hidden"
            >
              {/* Output Header */}
              <div className="px-5 py-3.5 bg-[rgba(46,204,143,.06)] border-b border-[#1e2a3a] flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 text-[#2ecc8f] text-xs font-bold uppercase tracking-wider">
                  <CheckCircle className="w-4 h-4" />
                  Prompt Generated — {result.wordCount.toLocaleString()} words
                  {result.savedId && (
                    <span className="ml-2 text-[#4a5a72]">• Saved to history</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      copied
                        ? "border-[#2ecc8f] bg-[rgba(46,204,143,.1)] text-[#2ecc8f]"
                        : "border-[#1e2a3a] text-[#8a9bb5] hover:border-[#2ecc8f] hover:text-[#2ecc8f]"
                    }`}
                  >
                    {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? "Copied!" : "Copy Prompt"}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-[#c9a84c] to-[#8a6f32] text-[#0a0d12] hover:opacity-90 transition-opacity"
                  >
                    <Download className="w-3 h-3" />
                    Download .txt
                  </button>
                </div>
              </div>

              {/* Prompt Text */}
              <pre className="p-6 text-xs font-mono leading-relaxed text-[#8a9bb5] overflow-y-auto max-h-[500px] whitespace-pre-wrap break-words scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#1e2a3a]">
                {result.promptText}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Tab Components ─────────────────────────────────────────────────────────

function Field({
  label, hint, children
}: {
  label: string; hint?: string; children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-[#8a9bb5] uppercase tracking-wider">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-[#4a5a72]">{hint}</p>}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text" }: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 bg-[#0d1117] border border-[#1e2a3a] rounded-lg text-sm text-[#e8edf5] placeholder:text-[#2a3a52] focus:outline-none focus:border-[#8a6f32] focus:ring-1 focus:ring-[#c9a84c]/20 transition-all"
    />
  );
}

function Select({ value, onChange, options }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[] | string[];
}) {
  const opts = typeof options[0] === "string"
    ? (options as string[]).map(o => ({ value: o, label: o }))
    : options as { value: string; label: string }[];

  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2.5 bg-[#0d1117] border border-[#1e2a3a] rounded-lg text-sm text-[#e8edf5] focus:outline-none focus:border-[#8a6f32] transition-all appearance-none cursor-pointer"
    >
      {opts.map(o => (
        <option key={o.value} value={o.value} className="bg-[#0d1117]">{o.label}</option>
      ))}
    </select>
  );
}

function Textarea({ value, onChange, placeholder, rows = 4 }: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2.5 bg-[#0d1117] border border-[#1e2a3a] rounded-lg text-sm text-[#e8edf5] placeholder:text-[#2a3a52] focus:outline-none focus:border-[#8a6f32] resize-y transition-all leading-relaxed"
    />
  );
}

function CheckChip({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-all select-none ${
        checked
          ? "border-[#8a6f32] bg-[rgba(201,168,76,.08)] text-[#c9a84c]"
          : "border-[#1e2a3a] text-[#4a5a72] hover:border-[#2a3a52] hover:text-[#8a9bb5]"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="sr-only"
      />
      <span className={`w-3 h-3 rounded border flex-shrink-0 flex items-center justify-center ${
        checked ? "bg-[#c9a84c] border-[#c9a84c]" : "border-[#2a3a52]"
      }`}>
        {checked && (
          <svg className="w-2 h-2 text-[#0a0d12]" fill="none" viewBox="0 0 12 12">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        )}
      </span>
      {label}
    </label>
  );
}

// ── Tab: Basic Info ────────────────────────────────────────────────────────
function BasicTab({ config, update }: {
  config: PromptConfig;
  update: <K extends keyof PromptConfig>(k: K, v: PromptConfig[K]) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="md:col-span-2">
        <Field label="Research Project Title *">
          <Input value={config.title} onChange={v => update("title", v)} placeholder="Enter your full project title..." />
        </Field>
      </div>
      <Field label="Student Full Name">
        <Input value={config.studentName} onChange={v => update("studentName", v)} placeholder="SURNAME, Firstname Middlename" />
      </Field>
      <Field label="Matriculation Number">
        <Input value={config.matric} onChange={v => update("matric", v)} placeholder="NOU/XXXX/XXXXX" />
      </Field>
      <Field label="University *">
        <Select value={config.university} onChange={v => update("university", v)} options={[
          "National Open University of Nigeria",
          "University of Jos", "Ahmadu Bello University, Zaria",
          "University of Nigeria, Nsukka", "University of Lagos",
          "University of Ibadan", "Other Nigerian University",
        ]} />
      </Field>
      <Field label="Faculty / Department *">
        <Select value={config.faculty} onChange={v => update("faculty", v)} options={[
          "Faculty of Social Sciences — Mass Communication",
          "Faculty of Social Sciences — Sociology",
          "Faculty of Humanities — Political Science",
          "Faculty of Arts — Linguistics & Communication",
          "Faculty of Education — Educational Administration",
          "Faculty of Management Sciences",
          "Faculty of Law — International Relations",
        ]} />
      </Field>
      <Field label="Degree Programme *">
        <Select value={config.degree} onChange={v => update("degree", v)} options={[
          "B.Sc. Mass Communication", "M.Sc. Mass Communication",
          "Ph.D. Mass Communication", "B.Sc. Sociology",
          "B.A. Political Science", "B.Ed. Adult Education",
        ]} />
      </Field>
      <Field label="Study Location / State *">
        <Input value={config.location} onChange={v => update("location", v)} placeholder="e.g. Plateau State, Nigeria" />
      </Field>
      <Field label="Submission Year">
        <Input value={config.year} onChange={v => update("year", v)} placeholder="2024" />
      </Field>
    </div>
  );
}

// ── Tab: Content & Theory ──────────────────────────────────────────────────
function ContentTab({ config, update }: {
  config: PromptConfig;
  update: <K extends keyof PromptConfig>(k: K, v: PromptConfig[K]) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <Field label="Primary Theoretical Framework *">
        <Select value={config.theory1} onChange={v => update("theory1", v)} options={[
          "Peace Communication Theory (Kempf, 2003)",
          "Social Identity Theory (Tajfel & Turner, 1979)",
          "Agenda-Setting Theory (McCombs & Shaw, 1972)",
          "Uses and Gratifications Theory (Katz et al., 1973)",
          "Framing Theory (Goffman, 1974)",
          "Diffusion of Innovations (Rogers, 1962)",
          "Cultivation Theory (Gerbner, 1969)",
          "Dependency Theory (Ball-Rokeach & DeFleur, 1976)",
        ]} />
      </Field>
      <Field label="Secondary Theoretical Framework">
        <Select value={config.theory2} onChange={v => update("theory2", v)} options={[
          "Social Identity Theory (Tajfel & Turner, 1979)",
          "Peace Communication Theory (Kempf, 2003)",
          "Framing Theory (Goffman, 1974)",
          "Uses and Gratifications Theory (Katz et al., 1973)",
          "Agenda-Setting Theory (McCombs & Shaw, 1972)",
          "None — Single Framework",
        ]} />
      </Field>
      <Field label="Research Design *">
        <Select value={config.researchDesign} onChange={v => update("researchDesign", v)} options={[
          "Mixed Methods (Quantitative + Qualitative)",
          "Quantitative Survey Design",
          "Qualitative (Interviews + FGDs only)",
          "Content Analysis",
          "Case Study Design",
          "Historical/Descriptive Design",
          "Experimental Design",
        ]} />
      </Field>
      <Field label="Data Collection Method *">
        <Select value={config.dataMethod} onChange={v => update("dataMethod", v)} options={[
          "Structured Questionnaire + In-Depth Interviews + FGDs",
          "Structured Questionnaire only",
          "In-Depth Interviews only",
          "Content Analysis + Questionnaire",
          "Observation + Interview",
          "Survey + Document Analysis",
        ]} />
      </Field>
      <Field label="Target Population *">
        <Input value={config.population} onChange={v => update("population", v)} placeholder="Describe your study population..." />
      </Field>
      <Field label="Sample Size">
        <Input value={config.sampleSize} onChange={v => update("sampleSize", v)} placeholder="e.g. 385 (Yamane formula)" />
      </Field>
      <div className="md:col-span-2">
        <Field label="Research Objectives (one per line)">
          <Textarea value={config.objectives} onChange={v => update("objectives", v)}
            placeholder="1. To identify...&#10;2. To assess...&#10;3. To examine...&#10;4. To identify...&#10;5. To propose..." rows={6} />
        </Field>
      </div>
    </div>
  );
}

// ── Tab: Format & Output ───────────────────────────────────────────────────
function FormatTab({ config, update, toggleArray }: {
  config: PromptConfig;
  update: <K extends keyof PromptConfig>(k: K, v: PromptConfig[K]) => void;
  toggleArray: (key: "charts" | "tables" | "chapters", value: string) => void;
}) {
  const allChapters = [
    "Preliminary Pages", "Chapter 1: Introduction", "Chapter 2: Literature Review",
    "Chapter 3: Methodology", "Chapter 4: Data & Analysis",
    "Chapter 5: Summary & Conclusion", "References", "Appendices",
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Target Page Count">
          <Select value={config.pageTarget} onChange={v => update("pageTarget", v)} options={[
            "40–60 pages (First Degree / BSc)",
            "90–120 pages (Masters standard)",
            "120–160 pages (Extended Masters)",
            "250+ pages (PhD)",
          ]} />
        </Field>
        <Field label="Font & Spacing">
          <Select value={config.fontSpec} onChange={v => update("fontSpec", v)} options={[
            "Times New Roman 12pt, Double-spaced (NOUN standard)",
            "Times New Roman 12pt, 1.5-spaced",
            "Arial 12pt, Double-spaced",
            "Calibri 11pt, Double-spaced",
          ]} />
        </Field>
        <Field label="Citation Style">
          <Select value={config.citation} onChange={v => update("citation", v)} options={[
            "APA 7th Edition", "APA 6th Edition",
            "Harvard Referencing", "Chicago Author-Date", "MLA 9th Edition",
          ]} />
        </Field>
        <Field label="Minimum References">
          <Select value={config.refCount} onChange={v => update("refCount", v)} options={[
            "30–49 references (BSc minimum)",
            "50+ scholarly references (MSc standard)",
            "70+ references (Advanced MSc)",
            "100+ references (PhD level)",
          ]} />
        </Field>
        <Field label="Export File Format">
          <Select value={config.exportFormat} onChange={v => update("exportFormat", v)} options={[
            "Microsoft Word (.docx) via Node.js docx library",
            "PDF via LibreOffice conversion",
            "Both DOCX and PDF",
          ]} />
        </Field>
        <Field label="Statistical Analysis Tool">
          <Select value={config.statsTool} onChange={v => update("statsTool", v)} options={[
            "SPSS v26 (Pearson Chi-Square + Correlation)",
            "R Statistical Software",
            "Python (scipy + pandas)",
            "Excel Data Analysis ToolPak",
          ]} />
        </Field>
      </div>
      <Field label="Chapters to Include">
        <div className="flex flex-wrap gap-2 mt-1">
          {allChapters.map(ch => (
            <CheckChip key={ch} label={ch}
              checked={config.chapters.includes(ch)}
              onChange={() => toggleArray("chapters", ch)} />
          ))}
        </div>
      </Field>
    </div>
  );
}

// ── Tab: Data & Charts ─────────────────────────────────────────────────────
function DataTab({ config, toggleArray }: {
  config: PromptConfig;
  update: <K extends keyof PromptConfig>(k: K, v: PromptConfig[K]) => void;
  toggleArray: (key: "charts" | "tables" | "chapters", value: string) => void;
}) {
  const chartOptions = [
    { value: "bar",       label: "Bar Chart (Platform Usage)" },
    { value: "pie",       label: "Pie Chart (Demographics)" },
    { value: "hbar",      label: "Horizontal Bar (Effectiveness)" },
    { value: "grouped",   label: "Grouped Bar (Cohesion Scores)" },
    { value: "radar",     label: "Radar Chart (Social Cohesion)" },
    { value: "scatter",   label: "Scatter Plot (Correlation)" },
    { value: "line",      label: "Trend Line Chart (2016–2024)" },
    { value: "stacked",   label: "Stacked Bar (WhatsApp Groups)" },
    { value: "framework", label: "Conceptual Framework Diagram" },
    { value: "proposal",  label: "Recommendations Framework" },
  ];

  const tableOptions = [
    { value: "demo",        label: "Demographics Table" },
    { value: "dm-use",      label: "Digital Media Use Table" },
    { value: "effectiveness", label: "Content Effectiveness (with SD)" },
    { value: "freq",        label: "Activity Frequency Table" },
    { value: "likert",      label: "Social Cohesion Likert Table" },
    { value: "crosstab",    label: "Cross-Tabulation Table" },
    { value: "hypothesis",  label: "Hypothesis Results Summary" },
    { value: "themes",      label: "Qualitative Theme Matrix" },
    { value: "recs",        label: "Recommendations Framework" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-[#8a9bb5] uppercase tracking-wider">
            Charts & Figures to Include
          </span>
          <span className="text-xs text-[#4a5a72]">{config.charts.length}/{chartOptions.length} selected</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {chartOptions.map(opt => (
            <CheckChip key={opt.value} label={opt.label}
              checked={config.charts.includes(opt.value)}
              onChange={() => toggleArray("charts", opt.value)} />
          ))}
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-[#8a9bb5] uppercase tracking-wider">
            Data Tables to Include
          </span>
          <span className="text-xs text-[#4a5a72]">{config.tables.length}/{tableOptions.length} selected</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {tableOptions.map(opt => (
            <CheckChip key={opt.value} label={opt.label}
              checked={config.tables.includes(opt.value)}
              onChange={() => toggleArray("tables", opt.value)} />
          ))}
        </div>
      </div>
      <div className="bg-[#0d1117] border border-[#1e2a3a] rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Cpu className="w-4 h-4 text-[#c9a84c] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-[#c9a84c] mb-1">DOCX Generation Notes</p>
            <ul className="text-xs text-[#4a5a72] space-y-1">
              <li>• Charts generated as Python matplotlib PNGs (150 DPI)</li>
              <li>• Tables use WidthType.DXA (9160 DXA total width)</li>
              <li>• All cells use ShadingType.CLEAR (never SOLID)</li>
              <li>• Headers: #1F4E79 blue background, white bold text</li>
              <li>• Alternate rows: #DEEAF1 fill</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
