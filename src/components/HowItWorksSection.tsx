"use client";

import { useState, useEffect } from "react";
import { UploadCloud, Wand2, Download, ArrowRight, CheckCircle2, Target, Bot, Edit, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
    {
        id: "step-1",
        title: "Enter Your Project Details",
        description: "Input your topic, academic level, and department. Watch suggestions auto-fill as you type, helping our AI tailor the content perfectly.",
        icon: Target,
        color: "bg-blue-500",
        shadow: "shadow-blue-500/30",
        lightBg: "bg-blue-50",
        stats: [
            { label: "Setup Time", value: "< 30 seconds" }
        ],
        visual: (
            <div className="relative w-full h-full flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 overflow-hidden group">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-blue-200 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] opacity-50" />

                <div className="w-full max-w-[240px] bg-white rounded-xl shadow-xl border border-blue-100/50 p-4 relative z-10 animate-in zoom-in-95 slide-in-from-bottom-5 duration-700">
                    <div className="text-xs font-bold text-gray-800 mb-3 border-b border-gray-100 pb-2">Start Project</div>

                    <div className="space-y-3 relative">
                        {/* Mock Input 1 */}
                        <div>
                            <div className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-1">Topic</div>
                            <div className="h-6 w-full rounded-md bg-gray-50 border border-gray-100 flex items-center px-2 relative overflow-hidden">
                                <span className="text-[10px] text-gray-700 font-medium">Impact of AI in...</span>
                                <div className="w-0.5 h-3 bg-blue-500 animate-pulse ml-0.5" />
                                <div className="absolute inset-0 bg-blue-100/30 animate-[slide_3s_ease-out_infinite] -translate-x-full" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.2), transparent)' }} />
                            </div>
                        </div>

                        {/* Mock Selects */}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <div className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-1">Level</div>
                                <div className="h-5 w-full rounded-md bg-gray-50 border border-gray-100 flex items-center px-2"><span className="text-[9px] text-gray-600">Bachelors</span></div>
                            </div>
                            <div>
                                <div className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-1">Dept</div>
                                <div className="h-5 w-full rounded-md bg-gray-50 border border-gray-100 flex items-center px-2"><span className="text-[9px] text-gray-600">Computer Sci</span></div>
                            </div>
                        </div>

                        {/* Start Button */}
                        <div className="h-8 w-full mt-2 rounded-lg bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:bg-blue-600 transition-colors cursor-pointer relative overflow-hidden">
                            <span className="text-xs font-bold text-white relative z-10">Start Project</span>
                            <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] -translate-x-full" />
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "step-2",
        title: "Chapters Auto-Generated",
        description: "Our system auto-writes all 12 chapters, from Title Page to Bibliography, following academic standards automatically.",
        icon: Bot,
        color: "bg-indigo-500",
        shadow: "shadow-indigo-500/30",
        lightBg: "bg-indigo-50",
        stats: [
            { label: "Chapters", value: "12/12 Output" },
            { label: "Quality", value: "Academic Standard" }
        ],
        visual: (
            <div className="relative w-full h-full flex items-center justify-center p-6 bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#818cf81a_1px,transparent_1px),linear-gradient(to_bottom,#818cf81a_1px,transparent_1px)] bg-[size:14px_24px] animate-[pulse_4s_ease-in-out_infinite]" />
                <div className="w-full max-w-[240px] bg-white rounded-xl shadow-xl border border-indigo-100 p-4 relative z-10 animate-in fade-in zoom-in-95 duration-700">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Generating...</span>
                        <div className="text-xs font-black text-indigo-600">12/12</div>
                    </div>

                    {/* Progress Bar overall */}
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-4 relative">
                        <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full animate-[width_3s_ease-out_forwards]" style={{ width: '0%' }} ref={(el) => { if (el) setTimeout(() => el.style.width = '100%', 200) }} />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="aspect-square bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden transition-all duration-300">
                                <span className="text-[10px] font-bold text-gray-400 relative z-20">Ch {i + 1}</span>
                                <div
                                    className="absolute inset-0 bg-indigo-500 opacity-0 transition-opacity duration-300 z-10"
                                    style={{ animationDelay: `${(i * 0.2) + 0.5}s` }}
                                    ref={(el) => {
                                        if (el) {
                                            setTimeout(() => {
                                                el.classList.remove('opacity-0');
                                                el.classList.add('opacity-100');
                                                el.parentElement!.querySelector('span')!.classList.add('text-white');
                                            }, (i * 200) + 500);
                                        }
                                    }}
                                />
                                {/* Highlight flare when completed */}
                                <div className="absolute inset-0 bg-white/40 scale-0 transition-transform duration-300 z-20"
                                    ref={(el) => {
                                        if (el) {
                                            setTimeout(() => {
                                                el.classList.remove('scale-0');
                                                el.classList.add('scale-150', 'opacity-0');
                                            }, (i * 200) + 600);
                                        }
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "step-3",
        title: "Review & Customize",
        description: "Once your draft is ready, refine it by adding personal inputs, inserting images, or adjusting wording — just like editing a Word document.",
        icon: Edit,
        color: "bg-amber-500",
        shadow: "shadow-amber-500/30",
        lightBg: "bg-amber-50",
        stats: [
            { label: "Controls", value: "Rich Text Editor" }
        ],
        visual: (
            <div className="relative w-full h-full flex items-center justify-center p-6 bg-gradient-to-br from-amber-50 to-white rounded-2xl border border-amber-100 overflow-hidden">
                <div className="w-full max-w-[260px] bg-white rounded-xl shadow-xl border border-amber-100 p-3 relative z-10 flex flex-col gap-2 animate-in fade-in slide-in-from-right-8 duration-700">
                    <div className="flex items-center gap-1 mb-1 border-b border-gray-100 pb-2">
                        <div className="h-3 w-3 bg-gray-200 rounded-sm" />
                        <div className="h-3 w-3 bg-gray-200 rounded-sm" />
                        <div className="h-3 w-3 bg-gray-200 rounded-sm mx-2" />
                        <div className="h-3 w-8 bg-amber-100 rounded-sm ml-auto" />
                    </div>

                    <div className="text-sm font-bold text-gray-800">2.1 Theoretical Framework</div>
                    <div className="text-[9px] text-gray-500 leading-relaxed font-medium transition-all relative">
                        This section explores the fundamental concepts...
                        <span className="bg-amber-100 text-amber-900 rounded px-0.5 mx-0.5 inline-block opacity-0 animate-[fade-in_0.5s_ease-out_forwards]" style={{ animationDelay: '1s' }}>
                            including constructivist theories
                        </span>
                        which form the basis of our application.
                        <div className="w-0.5 h-3 bg-gray-900 inline-block animate-[pulse_0.8s_infinite] ml-1 align-middle" />
                    </div>

                    {/* Drag and drop mock or image insertion mock */}
                    <div className="h-16 w-full mt-2 border-2 border-dashed border-gray-200 bg-gray-50 rounded-lg flex items-center justify-center relative overflow-hidden group/edit">
                        <div className="text-[10px] font-bold text-gray-400 absolute transition-opacity duration-300 opacity-100 group-hover/edit:opacity-0" style={{ animationDelay: '2s' }} ref={(el) => { if (el) setTimeout(() => el.style.opacity = '0', 2500) }}>Drag image here</div>
                        <div className="absolute inset-2 bg-amber-200/50 rounded flex items-center justify-center opacity-0 transition-opacity duration-500 scale-90" ref={(el) => { if (el) setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'scale(1)' }, 2800) }}>
                            <span className="text-[8px] font-bold text-amber-700">Diagram_1.png</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: "step-4",
        title: "Export or Share",
        description: "Export your project into professional formats like PDF or Word instantly, ready to submit to your supervisor.",
        icon: Download,
        color: "bg-purple-500",
        shadow: "shadow-purple-500/30",
        lightBg: "bg-purple-50",
        stats: [
            { label: "Formats", value: "PDF, Word DOCX" }
        ],
        visual: (
            <div className="relative w-full h-full flex items-center justify-center p-6 bg-gradient-to-br from-purple-50 to-white rounded-2xl border border-purple-100 overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-b from-purple-200/40 to-transparent transform rotate-45 translate-x-10 -translate-y-10 group-hover:translate-x-12 transition-transform duration-700" />
                <div className="w-full max-w-[240px] bg-white rounded-xl shadow-2xl border border-purple-100 p-6 relative z-10 flex flex-col items-center text-center animate-in zoom-in-90 fade-in duration-700">
                    <div className="relative mb-4">
                        <div className="absolute inset-0 bg-purple-400 rounded-2xl blur-xl opacity-30 animate-pulse" />
                        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/40 relative overflow-hidden group-hover:-translate-y-2 transition-transform duration-500">
                            <CheckCircle2 className="w-8 h-8 relative z-10" />
                            {/* Slide out document animation simulated by background translation */}
                            <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-white/30 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                        </div>
                    </div>
                    <div className="text-sm font-bold text-gray-900 mb-1">Project Complete!</div>

                    <button className="w-full py-2.5 mt-3 bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_0_0_2px_rgba(168,85,247,0.1)_inset] hover:shadow-lg hover:shadow-purple-200 hover:-translate-y-1 group/btn overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]" />
                        <Download className="w-3.5 h-3.5 group-hover/btn:animate-bounce" />
                        Export PDF
                    </button>
                </div>
            </div>
        )
    },
    {
        id: "step-5",
        title: "Improve With Research (Optional)",
        description: "Upload your research files and let the AI intelligently integrate new knowledge into your chapters with smart diff highlighting.",
        icon: RefreshCw,
        color: "bg-teal-500",
        shadow: "shadow-teal-500/30",
        lightBg: "bg-teal-50",
        stats: [
            { label: "Sync", value: "Smart Diff Updates" }
        ],
        visual: (
            <div className="relative w-full h-full flex items-center justify-center p-6 bg-gradient-to-br from-teal-50 to-white rounded-2xl border border-teal-100 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-teal-100/50 rounded-full blur-3xl animate-[pulse_4s_infinite]" />
                <div className="w-full max-w-[240px] bg-white rounded-xl shadow-xl border border-teal-100 p-4 relative z-10 flex flex-col gap-3 animate-in fade-in slide-in-from-right-8 duration-700">
                    <div className="flex items-center gap-2 mb-2 border-b border-gray-100 pb-2">
                        <UploadCloud className="w-4 h-4 text-teal-600 animate-bounce" />
                        <span className="text-xs font-bold text-gray-800">Processing Upload</span>
                    </div>

                    {/* Original Text */}
                    <div className="bg-gray-50 rounded-lg p-2 text-[9px] text-gray-500 relative border border-gray-100 opacity-60">
                        Initial findings suggest AI improves retention rates...
                    </div>

                    {/* Arrow down */}
                    <div className="flex justify-center -my-1 relative z-10">
                        <div className="bg-teal-100 rounded-full p-1 text-teal-600 animate-[spin_3s_linear_infinite]" style={{ animationIterationCount: 1 }}>
                            <RefreshCw className="w-3 h-3" />
                        </div>
                    </div>

                    {/* Updated Text with Diff Highlight */}
                    <div className="bg-white border border-teal-200 rounded-lg p-2 text-[9px] text-gray-800 shadow-[0_2px_10px_rgba(20,184,166,0.1)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-teal-500" />
                        Initial findings suggest AI improves retention rates <span className="bg-green-100 text-green-800 px-0.5 rounded transition-all duration-700 opacity-0" ref={(el) => { if (el) setTimeout(() => el.style.opacity = '1', 1500) }}>by up to 45% based on Smith et al. (2024)</span>.
                    </div>
                </div>
            </div>
        )
    }
];

export function HowItWorksSection() {
    const [activeStep, setActiveStep] = useState(0);
    const [isHovering, setIsHovering] = useState(false);
    const [progress, setProgress] = useState(0);

    // Auto-advance logic with a progress timer

    useEffect(() => {
        if (isHovering) return;

        const duration = 5000; // 5 seconds per step
        const interval = 50; // Update progress every 50ms
        const stepAmount = (interval / duration) * 100;

        const timer = setInterval(() => {
            setProgress(prev => {
                const navValue = prev + stepAmount;
                if (navValue >= 100) {
                    setActiveStep(current => (current + 1) % steps.length);
                    return 0;
                }
                return navValue;
            });
        }, interval);

        return () => clearInterval(timer);
    }, [isHovering, activeStep]);

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
                                    onClick={() => { setActiveStep(index); setProgress(0); }}
                                    onMouseEnter={() => setIsHovering(true)}
                                    onMouseLeave={() => setIsHovering(false)}
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

                                    {isActive && (
                                        <div className="absolute bottom-0 left-0 h-1 bg-gray-100 w-full overflow-hidden">
                                            <div
                                                className={`h-full ${step.color} transition-all duration-[50ms]`}
                                                style={{ width: `${progress}%` }}
                                            />
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
