"use client";

import { Brain, Search, ShieldCheck, Quote, BarChart3, Zap } from "lucide-react";
import Image from "next/image";

const capabilities = [
    {
        title: "Semantic Context Engine",
        description: "Beyond simple keyword matching. Our AI understands the nuances of your research domain, whether it's Engineering, Social Sciences, or Medicine.",
        icon: Brain,
        color: "text-blue-600",
        bg: "bg-blue-50"
    },
    {
        title: "Literature Discovery",
        description: "Connects directly to global research databases to find relevant papers that support your thesis automatically.",
        icon: Search,
        color: "text-indigo-600",
        bg: "bg-indigo-50"
    },
    {
        title: "Automated Referencing",
        description: "Generates faultless citations in APA 7th, MLA, or Harvard styles as you write. No more manual bibliography stress.",
        icon: Quote,
        color: "text-purple-600",
        bg: "bg-purple-50"
    },
    {
        title: "Integrity Verification",
        description: "Real-time plagiarism awareness and originality checks to ensure your project meets strict institutional guidelines.",
        icon: ShieldCheck,
        color: "text-green-600",
        bg: "bg-green-50"
    }
];

export function AICapabilities() {
    return (
        <section className="py-24 md:py-32 bg-gray-900 text-white relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="container px-4 md:px-6 mx-auto relative z-10">
                <div className="flex flex-col lg:grid lg:grid-cols-2 gap-16 items-center">

                    {/* Visual Side */}
                    <div className="order-2 lg:order-1 relative">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <div className="aspect-[4/5] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl transform hover:scale-[1.02] transition-transform">
                                    <Image
                                        src="/nigerian_students_research_1771008711650.png"
                                        alt="Students researching"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="aspect-square rounded-[2rem] bg-indigo-600 flex flex-col items-center justify-center p-8 text-center shadow-2xl">
                                    <Zap className="w-12 h-12 mb-4" />
                                    <div className="text-3xl font-black mb-1">98%</div>
                                    <div className="text-[10px] uppercase font-bold tracking-widest opacity-80">Speed Improvement</div>
                                </div>
                            </div>
                            <div className="space-y-4 pt-12">
                                <div className="aspect-square rounded-[2rem] bg-white text-gray-900 flex flex-col items-center justify-center p-8 text-center shadow-2xl">
                                    <BarChart3 className="w-12 h-12 mb-4 text-indigo-600" />
                                    <div className="text-3xl font-black mb-1">A+</div>
                                    <div className="text-[10px] uppercase font-bold tracking-widest opacity-40">Average Grade</div>
                                </div>
                                <div className="aspect-[4/5] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl transform hover:scale-[1.02] transition-transform">
                                    <Image
                                        src="/nigerian_students_collaborating_1771014595962.png"
                                        alt="Collaborating"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Text Side */}
                    <div className="order-1 lg:order-2 space-y-12">
                        <div className="space-y-4 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                Advanced Architecture
                            </div>
                            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
                                Engineered for <br />
                                <span className="text-indigo-400">Excellence.</span>
                            </h2>
                            <p className="text-lg text-gray-400 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                                We combine state-of-the-art Large Language Models with deep academic datasets to provide a researcher-first experience.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {capabilities.map((cap, i) => (
                                <div key={i} className="group p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-white/20 transition-all duration-300">
                                    <div className={`w-12 h-12 rounded-2xl ${cap.bg} ${cap.color} flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-all`}>
                                        <cap.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">{cap.title}</h3>
                                    <p className="text-sm text-gray-400 leading-relaxed">
                                        {cap.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
