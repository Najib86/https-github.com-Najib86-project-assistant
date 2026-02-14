
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GraduationCap, ArrowRight, Sparkles, Brain, Shield, FileCheck } from "lucide-react";
import { HeroCarousel } from "@/components/HeroCarousel";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#fafbfc] overflow-x-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-200/40 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/30 rounded-full blur-[100px]" />
        {/* Added a subtle center glow to reduce blank feel */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-blue-50/50 rounded-full blur-[140px]" />
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: `radial-gradient(#4f46e5 0.5px, transparent 0.5px)`, backgroundSize: '24px 24px' }} />
      </div>

      {/* Header */}
      <header className="px-6 md:px-12 h-16 md:h-18 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-xl z-50 border-b border-gray-100/50">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/logo.png"
              alt="Logo"
              width={32}
              height={32}
              className="rounded-lg transition-transform group-hover:scale-110"
            />
            <span className="font-black text-xl tracking-tighter text-gray-900">
              ProjectAssistantAI
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors hidden md:block">
            Sign In
          </Link>
          <Button asChild className="rounded-xl px-6 font-bold shadow-lg shadow-indigo-100 h-11">
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 relative z-10 w-full">
        {/* Hero Section */}
        <section className="relative pt-12 pb-20 md:pt-24 md:pb-32 px-6 overflow-hidden min-h-[85vh] flex items-center">
          <HeroCarousel />

          <div className="max-w-[1440px] mx-auto w-full relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20 items-center">
              <div className="lg:col-span-7 space-y-8 md:space-y-10 animate-in fade-in slide-in-from-left-12 duration-1000">
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-md border border-indigo-100 text-indigo-600 text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-50/20">
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                  AI for Final Year Projects and Academic Research
                </div>

                <h1 className="text-6xl md:text-7xl xl:text-8xl font-black tracking-tighter text-gray-900 leading-[0.85]">
                  Academic projects <br />
                  <span className="text-indigo-600">reimagined.</span>
                </h1>

                <p className="text-xl md:text-2xl text-gray-600 max-w-2xl font-medium leading-relaxed">
                  Transform complex research topics into structured, university-grade documents in minutes. Smart outlines, citations, and full chapters generated instantly.
                </p>

                <div className="flex flex-col sm:flex-row gap-5 pt-8">
                  <Button size="lg" asChild className="w-full sm:w-auto rounded-2xl px-12 py-10 text-xl font-black shadow-2xl shadow-indigo-300 transition-all hover:-translate-y-1 hover:shadow-indigo-400 group h-auto">
                    <Link href="/signup" className="flex items-center gap-3">
                      Start Your Project Free
                      <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-2" />
                    </Link>
                  </Button>
                </div>

                <div className="flex items-center gap-6 pt-12 border-t border-gray-200/60 max-w-md">
                  <div className="flex -space-x-4">
                    {[10, 15, 20, 25].map((u) => (
                      <div key={u} className="h-14 w-14 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-xl">
                        <Image
                          src={`https://i.pravatar.cc/100?u=${u}`}
                          alt="User"
                          width={56}
                          height={56}
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
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nigeria&apos;s #1 AI Tool</p>
                  </div>
                </div>
              </div>

              {/* Desktop Desktop Visual Column */}
              <div className="hidden lg:block lg:col-span-5 relative animate-in zoom-in-95 fade-in duration-1000 delay-300">
                <div className="relative">
                  {/* Floating Notification */}
                  <div className="absolute -top-12 -left-8 z-20 animate-bounce transition-all duration-[3000ms]">
                    <div className="bg-white p-4 rounded-2xl shadow-2xl border border-gray-100 flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Status</p>
                        <p className="text-xs font-bold text-gray-900 mt-1">Chapter 1 Complete</p>
                      </div>
                    </div>
                  </div>

                  {/* Main Preview Card */}
                  <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] border border-white shadow-2xl shadow-indigo-100/50 p-8 transform rotate-2 hover:rotate-0 transition-all duration-700">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-100 rounded-lg" />
                          <div className="w-24 h-3 bg-gray-100 rounded-full" />
                        </div>
                        <div className="flex gap-2">
                          <div className="w-4 h-4 rounded-full bg-red-100" />
                          <div className="w-4 h-4 rounded-full bg-amber-100" />
                          <div className="w-4 h-4 rounded-full bg-green-100" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="w-full h-4 bg-indigo-50 rounded-full" />
                        <div className="w-3/4 h-4 bg-gray-50 rounded-full" />
                        <div className="grid grid-cols-3 gap-3">
                          <div className="h-20 bg-gray-50 rounded-2xl" />
                          <div className="h-20 bg-gray-50 rounded-2xl" />
                          <div className="h-20 bg-indigo-50/50 border border-indigo-100 rounded-2xl p-3 flex flex-col justify-end">
                            <div className="w-full h-2 bg-indigo-200 rounded-full" />
                          </div>
                        </div>
                        <div className="w-full h-32 bg-gray-50 rounded-3xl" />
                      </div>
                      <div className="pt-4 flex justify-end">
                        <div className="px-6 py-3 bg-indigo-600 rounded-xl text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-200">
                          Finalizing Thesis
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Glass Card Underneath */}
                  <div className="absolute -bottom-16 -right-8 w-64 h-64 bg-white/40 backdrop-blur-md rounded-[3rem] -z-10 border border-white/50" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-28 bg-[#fafbfc]/80 backdrop-blur-sm relative border-y border-gray-100/50">
          <div className="container px-6 mx-auto">
            <div className="text-center mb-16 space-y-3">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 opacity-80">The Powerhouse</h2>
              <p className="text-3xl md:text-5xl font-black text-gray-900 leading-tight">Everything you need to <br className="hidden md:block" /> finish your degree.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {[
                {
                  icon: GraduationCap,
                  title: "Academic Fidelity",
                  desc: "Drafts generated follow strict university standards for Chapters 1-5, ensuring your project structure is always perfect.",
                  color: "bg-indigo-50",
                  textColor: "text-indigo-600"
                },
                {
                  icon: Brain,
                  title: "Smart Synthesis",
                  desc: "Our AI doesn't just write; it synthesizes complex information to provide logical arguments and literature connections.",
                  color: "bg-purple-50",
                  textColor: "text-purple-600"
                },
                {
                  icon: Shield,
                  title: "Supervisor Ready",
                  desc: "Build credibility with your supervisor using our review interface for inline comments and direct feedback.",
                  color: "bg-green-50",
                  textColor: "text-green-600"
                }
              ].map((feature, i) => (
                <div key={i} className="flex flex-col p-8 rounded-[2rem] bg-white border border-gray-100 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-100/40 transition-all duration-500 group">
                  <div className={cn(feature.color, "p-5 rounded-2xl w-fit mb-8 transition-transform group-hover:scale-110 shadow-sm")}>
                    <feature.icon className={cn(feature.textColor, "h-8 w-8")} />
                  </div>
                  <h3 className="text-2xl font-black mb-4 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-500 font-medium leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* CTA Section */}
        <section className="py-20 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-indigo-600 -z-10" />
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-800 -z-10 opacity-90" />
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-white/10 rounded-full blur-[100px]" />
          </div>

          <div className="max-w-4xl mx-auto text-center space-y-8 py-10">
            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
              Ready to graduate with <br className="hidden md:block" /> a world-class project?
            </h2>
            <p className="text-indigo-100 text-lg md:text-xl font-medium max-w-2xl mx-auto opacity-90">
              Join thousands of students across Nigeria who are using PROJECTASSISTANTAI to streamline their research and writing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild className="bg-white text-indigo-600 hover:bg-gray-50 rounded-2xl px-10 h-16 text-lg font-black shadow-2xl">
                <Link href="/signup">Get Started Now</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-indigo-200 text-white hover:bg-white/10 rounded-2xl px-10 h-16 text-lg font-black">
                <Link href="/login">View Demo</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-gray-100 relative z-10">
        <div className="container mx-auto px-6 text-center space-y-8">
          <div className="flex flex-col items-center gap-8">
            <div className="flex items-center justify-center gap-2 opacity-80 hover:opacity-100 transition-all cursor-default group">
              <Image
                src="/logo.png"
                alt="Logo"
                width={28}
                height={28}
                className="rounded-lg shadow-sm"
              />
              <span className="font-black text-lg tracking-tighter">PROJECTASSISTANTAI</span>
            </div>

            <div className="space-y-4">
              <p className="text-indigo-900/40 text-[10px] font-black uppercase tracking-[0.3em]">
                Powered by Synapse Engineering and supplies
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                <a href="tel:08028110448" className="flex items-center gap-2 hover:text-indigo-600 transition-colors group">
                  <span className="w-1 h-1 rounded-full bg-indigo-200 group-hover:bg-indigo-600 transition-colors" />
                  08028110448
                </a>
                <a href="https://www.synapseengineering.com.ng/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-indigo-600 transition-colors group">
                  <span className="w-1 h-1 rounded-full bg-indigo-200 group-hover:bg-indigo-600 transition-colors" />
                  synapseengineering.com.ng
                </a>
              </div>
            </div>
          </div>

          <div className="pt-10 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6 max-w-6xl mx-auto">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">
              © 2026 PROJECTASSISTANTAI Platform. All Rights Reserved.
            </p>
            <div className="flex items-center gap-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div >
  );
}
