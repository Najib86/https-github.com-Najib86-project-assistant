import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, MessageSquare, CheckCircle } from "lucide-react";
import { HeroCarousel } from "@/components/HeroCarousel";
import { Navbar } from "@/components/Navbar";
// import PricingSection from "@/components/PricingSection";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-100/40 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-purple-100/30 rounded-full blur-[100px]" />
        {/* Added a subtle center glow to reduce blank feel */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-blue-50/30 rounded-full blur-[140px]" />
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: `radial-gradient(#4f46e5 0.5px, transparent 0.5px)`, backgroundSize: '24px 24px' }} />
      </div>

      {/* Header / Navbar */}
      <Navbar />

      <main className="flex-1 relative z-10 w-full">
        {/* Hero Section */}
        <section className="relative py-12 md:py-24 px-4 md:px-6 overflow-hidden min-h-[85vh] flex items-center">
          <HeroCarousel />

          <div className="w-full max-w-7xl mx-auto relative z-10">
            {/* Mobile: Stacked (flex-col), Desktop: Grid */}
            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">

              {/* Text Content */}
              <div className="w-full lg:col-span-7 space-y-6 md:space-y-8 animate-in fade-in slide-in-from-left-6 duration-1000">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-indigo-100 text-indigo-600 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-50/20">
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                  AI for Final Year Projects
                </div>

                <h1 className="text-[2rem] md:text-[3rem] lg:text-[4rem] font-black tracking-tighter text-gray-900 leading-[1.1] md:leading-tight">
                  Academic projects <br />
                  <span className="text-indigo-600">reimagined.</span>
                </h1>

                <p className="text-base md:text-xl text-gray-600 max-w-xl font-medium leading-relaxed">
                  Transform complex research topics into structured, university-grade documents in minutes. Smart outlines, citations, and full chapters generated instantly.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button size="lg" asChild className="w-full sm:w-auto rounded-xl md:rounded-2xl px-6 py-4 text-lg font-bold shadow-xl shadow-indigo-300 transition-all hover:-translate-y-1 hover:shadow-indigo-400 group h-auto">
                    <Link href="/signup" className="flex items-center justify-center gap-3">
                      Start Your Project Free
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-2" />
                    </Link>
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-10 border-t border-gray-200/60 max-w-md">
                  <div className="flex -space-x-4">
                    {[10, 15, 20, 25].map((u) => (
                      <div key={u} className="h-12 w-12 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-lg">
                        <Image
                          src={`https://i.pravatar.cc/100?u=${u}`}
                          alt="User"
                          width={48}
                          height={48}
                          className="grayscale hover:grayscale-0 transition-all duration-500"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Sparkles key={s} className="w-3 h-3 text-amber-500 fill-amber-500" />
                      ))}
                    </div>
                    <p className="text-sm font-black text-gray-900">2,000+ Students</p>
                  </div>
                </div>
              </div>

              {/* Visual Content - Stacked on Mobile, Col-span-5 on Desktop */}
              {/* Simplified for mobile: visible but adjusted scaling/padding */}
              <div className="w-full lg:col-span-5 relative animate-in zoom-in-95 fade-in duration-1000 delay-300">
                <div className="relative transform scale-95 md:scale-100">
                  {/* Floating Notification - Hidden on very small screens to simplify */}
                  <div className="hidden sm:block absolute -top-8 -left-4 md:-top-12 md:-left-8 z-20 animate-bounce transition-all duration-[3000ms]">
                    <div className="bg-white p-3 md:p-4 rounded-2xl shadow-2xl border border-gray-100 flex items-center gap-4">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white relative">
                        <MessageSquare className="w-4 h-4 md:w-5 md:h-5" />
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">New Comment</p>
                        <p className="text-xs font-bold text-gray-900 mt-1">Supervisor: &quot;Great progress!&quot;</p>
                      </div>
                    </div>
                  </div>

                  {/* Main Dashboard Card */}
                  <div className="bg-white/90 backdrop-blur-2xl rounded-3xl md:rounded-[2.5rem] border border-white shadow-2xl shadow-indigo-100/50 p-4 md:p-6 lg:transform lg:rotate-1 lg:hover:rotate-0 transition-all duration-700">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-100/80 pb-4 mb-4 md:pb-6 md:mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-xs">AI</div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Project</p>
                          <p className="text-sm font-bold text-gray-900 line-clamp-1">Thesis: AI in Healthcare</p>
                        </div>
                      </div>
                      <div className="px-2 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Live
                      </div>
                    </div>

                    {/* Dashboard Grid Simulation */}
                    <div className="grid grid-cols-1 gap-4">
                      {/* Progress Bar */}
                      <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-gray-50/50 border border-gray-100 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">Methodology</span>
                          <span className="text-[10px] font-bold text-indigo-600">85%</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full w-[85%] bg-indigo-500 rounded-full" />
                        </div>
                      </div>

                      {/* Active Task */}
                      <div className="flex gap-3">
                        <div className="flex-1 p-4 rounded-xl md:rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 relative overflow-hidden">
                          <div className="relative z-10">
                            <p className="text-[10px] font-medium opacity-80 uppercase tracking-widest mb-1">Current Task</p>
                            <p className="text-sm font-bold truncate">Reviewing Citations</p>
                          </div>
                        </div>
                        <div className="w-1/3 p-4 rounded-xl md:rounded-2xl border border-gray-100 flex flex-col items-center justify-center gap-1">
                          <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                            <CheckCircle className="w-3 h-3" />
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase text-center">Done</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-28 bg-gray-50/80 backdrop-blur-sm relative border-y border-gray-100/50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 opacity-80">The Powerhouse</h2>
              <p className="text-2xl md:text-3xl lg:text-5xl font-black text-gray-900 leading-tight">Everything you need to <br className="hidden md:block" /> finish your research project.</p>
            </div>

            {/* Grid: 1 col (mobile) -> 2 cols (tablet) -> 3 cols (desktop) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
              {[
                {
                  title: "AI Research Assistant",
                  desc: "Instantly generate structured outlines and full drafts for Chapters 1-5, tailored specifically to your research topic and academic level.",
                },
                {
                  title: "Academic Compliance",
                  desc: "Built-in guidelines ensure strict adherence to university standards for formatting, structure, and content flow automatically.",
                },
                {
                  title: "Smart Synthesis",
                  desc: "Our AI synthesizes complex information to construct logical arguments, integrating relevant literature for a robust theoretical framework.",
                },
                {
                  title: "Collaboration Hub",
                  desc: "Invite supervisors to review your work directly. Receive inline comments and approvals in real-time to fast-track your progress.",
                },
                {
                  title: "Progress Tracking",
                  desc: "Visual dashboards for both students and supervisors to monitor milestones, chapter status, and overall project completion rates.",
                },
                {
                  title: "Plagiarism Awareness",
                  desc: "Integrated tools to highlight potential originality issues and manage citations managed in APA, MLA, or Harvard styles.",
                }
              ].map((feature, i) => (
                <div key={i} className="flex flex-col p-6 md:p-8 rounded-2xl md:rounded-[2rem] bg-white border border-gray-100 hover:border-indigo-200 hover:shadow-xl transition-all duration-500 group">
                  <div className="mb-4 w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                    <span className="font-bold text-lg">{i + 1}</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black mb-3 md:mb-4 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-500 font-medium leading-relaxed text-sm md:text-base">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* <PricingSection /> */}
      </main>
    </div >
  );
}
