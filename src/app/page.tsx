
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, GraduationCap, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-6 h-16 flex items-center justify-between border-b bg-white">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-indigo-600" />
          <span className="font-bold text-lg">ProjectAssistant</span>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-gray-50">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 max-w-3xl mb-6">
          Your AI-Powered <span className="text-indigo-600">Research Partner</span> for University Projects
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-8">
          ProjectAssistant guides you through every chapter, from Introduction to Conclusion. Get structured drafts, avoid writer's block, and collaborate seamlessly with your supervisor.
        </p>
        <div className="flex gap-4">
          <Button size="lg" asChild>
            <Link href="/signup">Start Writing Free</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#features">Learn More</Link>
          </Button>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="container px-6 mx-auto">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-indigo-100 p-4 rounded-full mb-4">
                <GraduationCap className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Academic Structure</h3>
              <p className="text-gray-600">
                Automatically generate outlines and drafts for Chapter 1-5 following university standards.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-green-100 p-4 rounded-full mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Supervisor Review</h3>
              <p className="text-gray-600">
                Submit drafts directly to your supervisor for inline comments and approval.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-purple-100 p-4 rounded-full mb-4">
                <BookOpen className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Literature AI</h3>
              <p className="text-gray-600">
                Find relevant studies and format citations correctly with our intelligent search.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-500 text-sm border-t bg-gray-50">
        © 2026 ProjectAssistant. All rights reserved.
      </footer>
    </div>
  );
}
