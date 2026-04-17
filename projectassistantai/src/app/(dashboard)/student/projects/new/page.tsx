// src/app/(dashboard)/student/projects/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Sparkles, FolderPlus } from "lucide-react";
import toast from "react-hot-toast";

export default function NewProjectPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    topic: "",
    level: "BSc",
    department: "",
    faculty: "",
    institution: "National Open University of Nigeria",
    studyLocation: "",
    theory1: "Peace Communication Theory (Kempf, 2003)",
    theory2: "Social Identity Theory (Tajfel & Turner, 1979)",
    researchDesign: "Mixed Methods (Quantitative + Qualitative)",
    sampleSize: "385 (Yamane formula, e=0.05)",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  const upd = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.topic.trim()) {
      toast.error("Title and topic are required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create project");
      toast.success("Project created!");
      router.push(`/student/projects/${data.project.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    { key: "title",          label: "Project Title *",     placeholder: "The Role of Digital Media in Promoting Peace...", span: 2 },
    { key: "topic",          label: "Research Topic *",    placeholder: "Digital media and peacebuilding", span: 2 },
    { key: "description",    label: "Brief Description",   placeholder: "Short description of your research focus...", span: 2, textarea: true },
    { key: "department",     label: "Department",          placeholder: "Mass Communication" },
    { key: "faculty",        label: "Faculty",             placeholder: "Social Sciences" },
    { key: "institution",    label: "Institution",         placeholder: "National Open University of Nigeria" },
    { key: "studyLocation",  label: "Study Location",      placeholder: "Plateau State, Nigeria" },
    { key: "sampleSize",     label: "Sample Size",         placeholder: "385 (Yamane formula)" },
  ];

  const selectFields = [
    { key: "level", label: "Degree Level", options: ["BSc", "MSc", "PhD"] },
    { key: "researchDesign", label: "Research Design", options: [
      "Mixed Methods (Quantitative + Qualitative)",
      "Quantitative Survey Design",
      "Qualitative Research",
      "Content Analysis",
      "Case Study",
    ]},
    { key: "theory1", label: "Primary Theory", options: [
      "Peace Communication Theory (Kempf, 2003)",
      "Social Identity Theory (Tajfel & Turner, 1979)",
      "Agenda-Setting Theory (McCombs & Shaw, 1972)",
      "Uses and Gratifications Theory",
      "Framing Theory (Goffman, 1974)",
    ]},
    { key: "theory2", label: "Secondary Theory", options: [
      "Social Identity Theory (Tajfel & Turner, 1979)",
      "Peace Communication Theory (Kempf, 2003)",
      "Framing Theory",
      "Agenda-Setting Theory",
      "None",
    ]},
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-7">
        <Link href="/student/projects" className="text-[#4a5a72] hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white font-display">New Research Project</h1>
          <p className="text-sm text-[#4a5a72]">Set up your project and AI will help write each chapter</p>
        </div>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleCreate}
      >
        <div className="bg-[#111620] border border-[#1e2a3a] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1e2a3a] bg-gradient-to-r from-[rgba(201,168,76,.06)] to-transparent">
            <div className="flex items-center gap-2.5">
              <FolderPlus className="w-5 h-5 text-[#c9a84c]" />
              <span className="font-bold text-white">Project Details</span>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            {fields.map(f => (
              <div key={f.key} className={f.span === 2 ? "md:col-span-2" : ""}>
                <label className="text-xs font-semibold text-[#8a9bb5] uppercase tracking-wider mb-1.5 block">{f.label}</label>
                {f.textarea ? (
                  <textarea
                    value={(form as Record<string, string>)[f.key]}
                    onChange={e => upd(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    rows={3}
                    className="w-full px-3.5 py-2.5 bg-[#0d1117] border border-[#1e2a3a] rounded-xl text-sm text-white placeholder:text-[#2a3a52] focus:outline-none focus:border-[#8a6f32] resize-none transition-all"
                  />
                ) : (
                  <input
                    value={(form as Record<string, string>)[f.key]}
                    onChange={e => upd(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full px-3.5 py-2.5 bg-[#0d1117] border border-[#1e2a3a] rounded-xl text-sm text-white placeholder:text-[#2a3a52] focus:outline-none focus:border-[#8a6f32] transition-all"
                  />
                )}
              </div>
            ))}

            {selectFields.map(f => (
              <div key={f.key}>
                <label className="text-xs font-semibold text-[#8a9bb5] uppercase tracking-wider mb-1.5 block">{f.label}</label>
                <select
                  value={(form as Record<string, string>)[f.key]}
                  onChange={e => upd(f.key, e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0d1117] border border-[#1e2a3a] rounded-xl text-sm text-white focus:outline-none focus:border-[#8a6f32] transition-all appearance-none cursor-pointer"
                >
                  {f.options.map(o => <option key={o} value={o} className="bg-[#0d1117]">{o}</option>)}
                </select>
              </div>
            ))}
          </div>

          <div className="px-6 py-4 border-t border-[#1e2a3a] bg-[#0d1117] flex items-center justify-between gap-4">
            <p className="text-xs text-[#4a5a72]">
              All 5 chapters will be created automatically. You can generate each with AI.
            </p>
            <div className="flex gap-3">
              <Link href="/student/projects" className="px-4 py-2 border border-[#1e2a3a] text-[#8a9bb5] hover:text-white hover:border-[#2a3a52] rounded-xl text-sm font-medium transition-all">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#c9a84c] to-[#8a6f32] text-[#0a0d12] font-bold text-sm rounded-xl hover:shadow-[0_8px_30px_rgba(201,168,76,.3)] hover:-translate-y-0.5 transition-all disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderPlus className="w-4 h-4" />}
                {loading ? "Creating..." : "Create Project"}
              </button>
            </div>
          </div>
        </div>
      </motion.form>

      {/* Tip */}
      <div className="mt-4 p-4 bg-[rgba(201,168,76,.05)] border border-[rgba(201,168,76,.15)] rounded-xl flex gap-3">
        <Sparkles className="w-4 h-4 text-[#c9a84c] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-[#c9a84c] mb-1">Pro Tip</p>
          <p className="text-xs text-[#4a5a72]">
            After creating your project, use the <strong className="text-[#8a9bb5]">Generate Prompt</strong> page to create a master prompt 
            that produces your complete 90–120 page NOUN-compliant project with all charts, tables, and references in a single export.
          </p>
        </div>
      </div>
    </div>
  );
}
