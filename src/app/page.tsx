
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GraduationCap, ArrowRight, Sparkles, Brain, Shield, Upload } from "lucide-react";
import { HeroCarousel } from "@/components/HeroCarousel";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#fafbfc] overflow-x-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-purple-200/20 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="px-6 md:px-12 h-20 flex items-center justify-between sticky top-0 bg-white/70 backdrop-blur-xl z-50 border-b border-gray-100">
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
              Proj<span className="text-indigo-600">Asst</span>
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

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 md:pt-32 md:pb-52 px-6 overflow-hidden">
          <HeroCarousel />

          <div className="container mx-auto relative z-10">
            <div className="max-w-4xl text-left space-y-10 animate-in fade-in slide-in-from-left-8 duration-1000">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50/80 backdrop-blur-md border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest shadow-sm">
                <Sparkles className="h-3 w-3" />
                Your AI Research Architect
              </div>

              <h1 className="text-6xl md:text-8xl font-black tracking-tight text-gray-900 leading-[0.9]">
                Generate complete <br />
                academic projects <br />
                <span className="text-indigo-600">instantly.</span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 max-w-2xl font-medium leading-relaxed">
                Transform your research topic into a structured, university-grade project in minutes. From abstract to conclusion, we handle the heavy lifting.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button size="lg" asChild className="w-full sm:w-auto rounded-2xl px-10 py-8 text-xl font-black shadow-2xl shadow-indigo-200 group">
                  <Link href="/signup" className="flex items-center gap-2">
                    Get Started Free
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="w-full sm:w-auto rounded-2xl px-10 py-8 text-xl font-bold border-gray-200 bg-white/50 backdrop-blur-md shadow-sm hover:bg-white text-gray-700">
                  <Link href="/upload" className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Past Project
                  </Link>
                </Button>
              </div>

              <div className="flex items-center gap-6 pt-12 border-t border-gray-200/50">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-12 w-12 rounded-full border-2 border-white bg-gray-100 overflow-hidden shadow-md">
                      <Image
                        src={`https://i.pravatar.cc/100?u=${i + 10}`}
                        alt="User"
                        width={48}
                        height={48}
                        className="grayscale hover:grayscale-0 transition-all duration-300"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900 leading-none">Joined by 2,000+ students</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Across Nigerian Universities</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 bg-white relative">
          <div className="container px-6 mx-auto">
            <div className="text-center mb-20 space-y-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">The Powerhouse</h2>
              <p className="text-4xl md:text-5xl font-black text-gray-900">Everything you need to <br className="hidden md:block" /> finish your degree.</p>
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
                <div key={i} className="flex flex-col p-10 rounded-[2.5rem] bg-gray-50/50 border border-gray-100 hover:border-indigo-200 hover:bg-white hover:shadow-2xl transition-all duration-500 group">
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
      </main>

      {/* Footer */}
      <footer className="py-12 bg-gray-50 border-t border-gray-100 relative z-10">
        <div className="container mx-auto px-6 text-center space-y-6">
          <div className="flex items-center justify-center gap-2 opacity-80 hover:opacity-100 transition-all cursor-default group">
            <Image
              src="/logo.png"
              alt="Logo"
              width={24}
              height={24}
              className="rounded-md"
            />
            <span className="font-bold text-sm">ProjectAssistant</span>
          </div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
            © 2026 ProjectAssistant. Built for the modern researcher.
          </p>
        </div>
      </footer>
    </div >
  );
}
