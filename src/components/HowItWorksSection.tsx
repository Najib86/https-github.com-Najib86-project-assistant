"use client";

import { useState } from "react";
import { UploadCloud, Wand2, Users, Download, ArrowRight, CheckCircle2, FileText, Sparkles, Target } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
    {
        id: "step-1",
        title: "Define & Contextualize",
        description: "Start by entering your research topic and uploading any existing proposals, literature, or syllabus requirements. Our system instantly parses your unique context.",
        icon: UploadCloud,
        color: "bg-blue-500",
        shadow: "shadow-blue-500/30",
        lightBg: "bg-blue-50",
        stats: [
            { label: "File Support", value: "PDF, DOCX, TXT" },
            { label: "Context Parsing", value: "< 2 seconds" }
        ],
        visual: (
            <div className="relative w-full h-full flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 overflow-hidden">
                <div className="absolute top-4 right-4 text-blue-200">
                    <FileText className="w-24 h-24 opacity-20 transform rotate-12" />
                </div>
                <div className="w-full max-w-[240px] bg-white rounded-xl shadow-xl border border-blue-100/50 p-4 relative z-10 animate-in slide-in-from-bottom-5 duration-700">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <Target className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Research Topic</div>
                            <div className="h-2 w-24 bg-gray-200 rounded-full mt-1" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-12 w-full border-2 border-dashed border-blue-200 rounded-lg bg-blue-50/50 flex flex-col items-center justify-center">
                            <UploadCloud className="w-4 h-4 text-blue-400 mb-1" />
                            <span className="text-[8px] font-bold text-blue-400 uppercase tracking-widest">+ Upload Proposal</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "step-2",
        title: "AI Knowledge Synthesis",
        description: "The core engine activates. We generate perfectly structured, academically sound chapters complete with methodologies, objectives, and citations.",
        icon: Wand2,
        color: "bg-indigo-500",
        shadow: "shadow-indigo-500/30",
        lightBg: "bg-indigo-50",
        stats: [
            { label: "Structure", value: "Chapters 1-5" },
            { label: "Format", value: "APA, MLA..." }
        ],
        visual: (
            <div className="relative w-full h-full flex items-center justify-center p-6 bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#818cf81a_1px,transparent_1px),linear-gradient(to_bottom,#818cf81a_1px,transparent_1px)] bg-[size:14px_24px]" />
                <div className="w-full max-w-[240px] bg-white rounded-xl shadow-xl border border-indigo-100 p-4 relative z-10">
                    <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                        <span className="text-xs font-bold text-gray-800">Chapter 2: Literature</span>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                            <Sparkles className="w-3 h-3" />
                            Generating
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full w-3/4 bg-indigo-500 rounded-full animate-pulse" />
                        </div>
                        <div className="h-2 w-5/6 bg-gray-100 rounded-full" />
                        <div className="h-2 w-full bg-gray-100 rounded-full" />
                        <div className="h-2 w-4/6 bg-gray-100 rounded-full" />
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "step-3",
        title: "Collaboration & Discussions",
        description: "Engage in real-time project discussions with your teammates and supervisor. Share insights, resolve complex sections together, and keep everyone synced in a dedicated workspace.",
        icon: Users,
        color: "bg-teal-500",
        shadow: "shadow-teal-500/30",
        lightBg: "bg-teal-50",
        stats: [
            { label: "Channel", value: "Group Discussion" },
            { label: "Collab", value: "Team & Supervisor" }
        ],
        visual: (
            <div className="relative w-full h-full flex items-center justify-center p-6 bg-gradient-to-br from-teal-50 to-white rounded-2xl border border-teal-100 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-teal-100/50 rounded-full blur-3xl" />
                <div className="w-full max-w-[260px] bg-white rounded-xl shadow-xl border border-teal-100 p-4 relative z-10 flex flex-col gap-3">
                    <div className="flex items-center gap-2 mb-1">
                        <Users className="w-3.5 h-3.5 text-teal-600" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Project Discussion</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2.5 text-[10px] text-gray-600 relative ml-8 border border-gray-100">
                        &quot;Have we checked the recent literature for Section 3.2?&quot;
                        <div className="absolute -left-7 top-0 w-6 h-6 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-white text-[8px]">SA</div>
                    </div>
                    <div className="bg-teal-50 border border-teal-100 rounded-lg p-2.5 text-[10px] text-teal-800 self-end mr-8 relative">
                        &quot;Yes! I just uploaded the PDF. Let&apos;s discuss the findings.&quot;
                        <div className="absolute -right-7 top-0 w-6 h-6 rounded-lg bg-teal-600 flex items-center justify-center font-bold text-white text-[8px]">JD</div>
                    </div>
                    <div className="bg-gray-100/50 border border-gray-100 rounded-lg p-2 text-[10px] text-gray-400 italic text-center py-1">
                        Admin added Supervisor to the workspace
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "step-4",
        title: "Export & Finalize",
        description: "Once approved, export your complete masterpieace with a single click. Formats are perfectly preserved for University submission.",
        icon: Download,
        color: "bg-purple-500",
        shadow: "shadow-purple-500/30",
        lightBg: "bg-purple-50",
        stats: [
            { label: "Formats", value: "PDF, Word DOCX" },
            { label: "Plagiarism", value: "100% Original" }
        ],
        visual: (
            <div className="relative w-full h-full flex items-center justify-center p-6 bg-gradient-to-br from-purple-50 to-white rounded-2xl border border-purple-100 overflow-hidden">
                <div className="w-full max-w-[240px] bg-white rounded-xl shadow-xl border border-purple-100 p-4 relative z-10 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/40 mb-4 animate-bounce">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div className="text-sm font-bold text-gray-900 mb-1">Project Complete!</div>
                    <div className="text-[10px] text-gray-500 mb-4">Ready for submission.</div>
                    <button className="w-full py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition-colors">
                        <Download className="w-3 h-3" />
                        Download PDF
                    </button>
                </div>
            </div>
        )
    }
];

export function HowItWorksSection() {
    const [activeStep, setActiveStep] = useState(0);

    return (
        <section className="py-24 md:py-32 bg-white relative overflow-hidden" id="how-it-works">
            {/* Background Details */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
            <div className="absolute -left-40 top-40 w-96 h-96 bg-indigo-50 rounded-full blur-[100px] opacity-70 pointer-events-none" />

            <div className="container px-4 md:px-6 mx-auto relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24 space-y-4">
                    <div className="hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        Workflow Breakdown
                    </div>
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.1]">
                        How the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">magic</span> happens.
                    </h2>
                    <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto">
                        We&apos;ve engineered a frictionless, four-step pipeline that takes you from a blank page to a perfectly formatted academic defense.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 max-w-6xl mx-auto items-stretch">

                    {/* Interactive Steps List */}
                    <div className="lg:w-5/12 flex flex-col justify-center space-y-4">
                        {steps.map((step, index) => {
                            const isActive = activeStep === index;
                            const Icon = step.icon;

                            return (
                                <button
                                    key={step.id}
                                    onClick={() => setActiveStep(index)}
                                    className={cn(
                                        "group w-full text-left p-5 md:p-6 rounded-2xl md:rounded-[2rem] transition-all duration-300 border-2 items-start relative overflow-hidden",
                                        isActive
                                            ? `bg-white border-transparent shadow-xl ${step.shadow} scale-[1.02] md:scale-105 z-10`
                                            : "bg-gray-50/50 border-gray-100 hover:bg-gray-50 hover:border-gray-200 opacity-60 hover:opacity-100"
                                    )}
                                >
                                    {isActive && (
                                        <div className={cn("absolute inset-0 opacity-[0.03]", step.lightBg)} />
                                    )}
                                    <div className="relative flex gap-4 md:gap-5">
                                        <div className={cn(
                                            "shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all duration-500",
                                            isActive ? `${step.color} text-white shadow-lg` : "bg-gray-200 text-gray-500 group-hover:bg-gray-300"
                                        )}>
                                            <Icon className="w-6 h-6 md:w-7 md:h-7" />
                                        </div>
                                        <div>
                                            <h3 className={cn(
                                                "text-xl md:text-2xl font-black mb-2 transition-colors",
                                                isActive ? "text-gray-900" : "text-gray-600"
                                            )}>
                                                {step.title}
                                            </h3>

                                            <div className={cn(
                                                "grid transition-all duration-500 ease-in-out",
                                                isActive ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0"
                                            )}>
                                                <div className="overflow-hidden">
                                                    <p className="text-gray-500 font-medium text-sm md:text-base leading-relaxed mb-4">
                                                        {step.description}
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {step.stats.map((stat, i) => (
                                                            <div key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-600">
                                                                <span className="opacity-60">{stat.label}:</span>
                                                                <span className="text-gray-900">{stat.value}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {isActive && (
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                                            <ArrowRight className="w-6 h-6 text-gray-300" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Infographic Visual Window */}
                    <div className="lg:w-7/12 mt-8 lg:mt-0">
                        <div className="sticky top-24 w-full aspect-square md:aspect-[4/3] rounded-[2rem] md:rounded-[3rem] bg-gray-50 border border-gray-100 shadow-2xl overflow-hidden p-2 md:p-4 transition-all duration-500">
                            {/* Inner Screen */}
                            <div className="w-full h-full bg-white rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-inner relative flex flex-col border border-gray-100">
                                {/* Mock Browser Chrome */}
                                <div className="h-10 md:h-12 bg-gray-50/80 border-b border-gray-100 flex items-center px-4 gap-2 backdrop-blur-sm z-20">
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                                    </div>
                                    <div className="mx-auto bg-white/60 border border-gray-200 rounded-md px-3 py-1 flex items-center gap-2">
                                        <div className="w-3 h-3 text-gray-400"><Wand2 size={12} /></div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden md:inline-block">Project System</span>
                                    </div>
                                </div>

                                {/* Dynamic Content Area */}
                                <div className="flex-1 relative overflow-hidden bg-gray-50/30">
                                    {steps.map((step, index) => (
                                        <div
                                            key={step.id}
                                            className={cn(
                                                "absolute inset-0 transition-all duration-700 ease-in-out flex items-center justify-center",
                                                activeStep === index
                                                    ? "opacity-100 translate-y-0"
                                                    : "opacity-0 translate-y-8 pointer-events-none"
                                            )}
                                        >
                                            {step.visual}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
