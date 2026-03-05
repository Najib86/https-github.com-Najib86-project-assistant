import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, MessageSquare, CheckCircle } from "lucide-react";
import { HeroCarousel } from "@/components/HeroCarousel";
import { Navbar } from "@/components/Navbar";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { AICapabilities } from "@/components/AICapabilities";
import PricingSection from "@/components/PricingSection";

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

                <h1 className="text-[2.5rem] md:text-[3.5rem] lg:text-[4rem] font-black tracking-tighter text-gray-900 leading-[1.1] md:leading-tight">
                  {/* <span className="inline-block mb-2 text-3xl md:text-4xl lg:text-5xl">🎓</span><br /> */}
                  Generate Your Complete <br />
                  Academic Project in <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Minutes</span> — <br />
                  <span className="text-[1.8rem] md:text-[2.5rem] lg:text-[3rem] text-gray-800">12 Chapters Fully Written, Structured & Ready to Export!</span>
                </h1>

                <p className="text-base md:text-xl text-gray-600 max-w-2xl font-medium leading-relaxed">
                  AI-powered project generator for students — no writer's block, no confusion.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button size="lg" asChild className="w-full sm:w-auto rounded-xl md:rounded-2xl px-8 py-6 text-lg font-bold shadow-xl shadow-indigo-300 transition-all hover:-translate-y-1 hover:shadow-indigo-400 group h-auto">
                    <Link href="/signup" className="flex items-center justify-center gap-3">
                      Get Started Now
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-2" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="w-full sm:w-auto rounded-xl md:rounded-2xl px-8 py-6 text-lg font-bold border-2 border-indigo-100 text-indigo-700 hover:bg-indigo-50 transition-all hover:-translate-y-1 h-auto bg-white">
                    <Link href="#how-it-works" className="flex items-center justify-center gap-3">
                      See How It Works
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
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-md">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">Generating Project</p>
                          <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            Topic: Impact of AI in Education
                            <span className="inline-block w-1.5 h-3 bg-indigo-500 animate-[pulse_1s_infinite]" />
                          </div>
                        </div>
                      </div>
                      <div className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold flex items-center gap-2 border border-indigo-100 shadow-sm">
                        <div className="w-4 h-4 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
                        12/12 Chapters
                      </div>
                    </div>

                    {/* Dashboard Grid Simulation */}
                    <div className="grid grid-cols-1 gap-4">
                      {/* Active Tasks Simulation */}
                      <div className="flex flex-col gap-3">
                        {/* Task 1 */}
                        <div className="flex gap-3 animate-in slide-in-from-bottom-2 fade-in duration-500 delay-300 fill-mode-both">
                          <div className="w-1/4 p-3 rounded-xl bg-green-50 border border-green-100 flex flex-col items-center justify-center gap-1">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="text-[10px] font-bold text-green-600 uppercase text-center">Done</span>
                          </div>
                          <div className="flex-1 p-3 rounded-xl bg-gray-50 border border-gray-100 flex flex-col justify-center relative overflow-hidden">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Chapter 1-11</p>
                            <p className="text-sm font-bold text-gray-700 truncate">Written & Formatted</p>
                            <div className="absolute top-0 right-0 h-full w-1 bg-green-400" />
                          </div>
                        </div>

                        {/* Task 2 Active */}
                        <div className="flex gap-3 animate-in slide-in-from-bottom-2 fade-in duration-500 delay-700 fill-mode-both">
                          <div className="w-1/4 p-3 rounded-xl bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center gap-1">
                            <div className="w-5 h-5 rounded-full border-2 border-indigo-300 border-t-indigo-600 animate-spin" />
                            <span className="text-[10px] font-bold text-indigo-600 uppercase text-center animate-pulse">Working</span>
                          </div>
                          <div className="flex-1 p-3 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 relative overflow-hidden">
                            <div className="relative z-10">
                              <p className="text-[10px] font-medium opacity-80 uppercase tracking-widest mb-0.5">Chapter 12</p>
                              <p className="text-sm font-bold truncate">Bibliography & Appendices</p>
                            </div>
                            {/* Scanning line animation */}
                            <div className="absolute top-0 left-0 w-full h-[2px] bg-white shadow-[0_0_8px_2px_rgba(255,255,255,0.8)] animate-[bounce_2s_infinite]" />
                          </div>
                        </div>

                        {/* Task 3 Export */}
                        <div className="flex gap-3 animate-in slide-in-from-bottom-2 fade-in duration-500 delay-1000 fill-mode-both opacity-50">
                          <div className="w-1/4 p-3 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center gap-1">
                            <div className="w-5 h-5 rounded-md bg-gray-200 flex items-center justify-center"><ArrowRight className="w-3 h-3 text-gray-400" /></div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase text-center">Export</span>
                          </div>
                          <div className="flex-1 p-3 rounded-xl bg-gray-50 border border-gray-100 flex flex-col justify-center">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Final Step</p>
                            <p className="text-sm font-bold text-gray-500 truncate">Generate PDF/DOCX</p>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <HowItWorksSection />

        {/* AI Capabilities Section */}
        <AICapabilities />

        {/* Features / Pro Benefits Section */}
        <section id="benefits" className="py-16 md:py-24 bg-white relative border-y border-gray-100/50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 opacity-80">Pro Benefits</h2>
              <p className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 leading-tight">Why students choose <br className="hidden md:block" /> Project Assistant.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                "Fully structured 12-chapter output",
                "Academic formatting & references",
                "Zero writer’s block",
                "Continuous update integration",
                "Export to professional PDF/DOCX",
                "Contextual research synthesis"
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100 hover:border-indigo-100 hover:shadow-lg transition-all duration-300 group">
                  <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-colors duration-300 shrink-0">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <p className="text-sm md:text-base font-bold text-gray-700">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Student Testimonials Section */}
        {/* <section className="py-20 md:py-32 bg-indigo-950 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />
          <div className="container px-4 md:px-6 mx-auto relative z-10">
            <div className="text-center mb-16 space-y-3">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300">Testimonials</h2>
              <p className="text-2xl md:text-4xl font-black text-white leading-tight">Trusted by 2,000+ students globally.</p>
            </div>

            <div className="max-w-5xl mx-auto relative">
              <style dangerouslySetInnerHTML={{
                __html: `
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
              `}} />
              <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar">
                {[
                  {
                    quote: "I finished my final year project in a week! The AI structured everything perfectly according to my university guidelines.",
                    author: "Joy",
                    course: "Computer Science",
                    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d"
                  },
                  {
                    quote: "Writer's block was killing me. This instantly generated a 12-chapter thesis that my supervisor almost approved immediately.",
                    author: "David",
                    course: "Business Admin",
                    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d"
                  },
                  {
                    quote: "The ability to upload my own literature and have it synthesized with APA citations saved me months of reading.",
                    author: "Sarah",
                    course: "Psychology",
                    avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d"
                  }
                ].map((testimonial, i) => (
                  <div key={i} className="min-w-[85vw] md:min-w-[400px] lg:min-w-[450px] bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl snap-center hover:bg-white/15 transition-colors">
                    <div className="flex gap-1 mb-6">
                      {[1, 2, 3, 4, 5].map(star => <Sparkles key={star} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                    </div>
                    <p className="text-lg md:text-xl text-white font-medium leading-relaxed mb-8">&quot;{testimonial.quote}&quot;</p>
                    <div className="flex items-center gap-4">
                      <Image src={testimonial.avatar} alt={testimonial.author} width={48} height={48} className="rounded-full border-2 border-indigo-500" />
                      <div>
                        <p className="text-white font-bold">{testimonial.author}</p>
                        <p className="text-indigo-300 text-sm">{testimonial.course}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section> */}
        <PricingSection />
      </main>
    </div >
  );
}
