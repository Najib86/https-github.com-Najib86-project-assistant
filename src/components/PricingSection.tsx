"use client";

import { Check, Lock } from "lucide-react";

export default function PricingSection() {
  return (
    <section id="pricing" className="w-full py-20 bg-white relative overflow-hidden">
      {/* Background Aesthetic */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[30%] h-[40%] bg-blue-50/50 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[40%] bg-indigo-50/50 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-6xl mx-auto px-6 text-center relative z-10">

        {/* Header */}
        <h2 className="text-4xl font-bold mb-3">
          ProjectAssistantAI Pricing
        </h2>
        <p className="text-gray-500 mb-12">
          Affordable AI-powered academic collaboration for Nigerian students
        </p>

        {/* Cards */}
        <div className="grid md:grid-cols-4 gap-8">

          {/* FREE PLAN */}
          <div className="relative bg-white rounded-3xl shadow-lg p-8 border transition-all duration-500 hover:-translate-y-4 hover:shadow-2xl hover:shadow-purple-200/50 group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-200 rounded-bl-[100px] transition-transform duration-700 group-hover:scale-150 group-hover:rotate-12 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Freemium</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <h4 className="text-5xl font-black tracking-tight">₦0</h4>
            </div>

            <ul className="space-y-4 text-left mb-10">
              <Feature text="AI-assisted Chapter One" />
              <Feature text="Structured 5-Chapter Template" />
              <Feature text="5 AI Follow-up Messages" />
              <LockedFeature text="Chapters 2–5 Access" />
              <LockedFeature text="PDF Literature Review" />
            </ul>

            <button className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-indigo-100">
              Get Started Free
            </button>
          </div>

          {/* UNDERGRADUATE GOLD */}
          <div className="relative bg-white rounded-3xl shadow-xl p-8 border-2 border-indigo-50 transition-all duration-500 hover:-translate-y-4 hover:shadow-2xl hover:shadow-indigo-200/50 group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-100 rounded-bl-[100px] transition-transform duration-700 group-hover:scale-150 group-hover:-rotate-12 opacity-50" />
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg z-20">
              Most Popular
            </div>

            <h3 className="text-lg font-semibold mb-2 mt-4">Undergraduate Gold</h3>
            <div className="flex items-baseline gap-1 mb-1">
              <h4 className="text-5xl font-black tracking-tight text-gray-900">₦5,000</h4>
            </div>
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-6">One-time payment</p>

            <ul className="space-y-4 text-left my-8">
              <Feature text="Full Chapters 1–5 Access" />
              <Feature text="Literature Review (10 PDFs)" />
              <Feature text="Methodology Guidance" />
              <Feature text="Basic Plagiarism Check" />
              <Feature text="APA / MLA / Harvard References" />
              <Feature text="DOCX Export" />
            </ul>

            <button className="w-full py-4 rounded-2xl bg-white border-2 border-indigo-600 text-indigo-600 font-bold hover:bg-indigo-50 hover:scale-[1.02] active:scale-[0.98] transition-all">
              Unlock Full Project
            </button>
          </div>

          {/* POSTGRADUATE PLATINUM */}
          <div className="relative bg-white rounded-3xl shadow-lg p-8 border transition-all duration-500 hover:-translate-y-4 hover:shadow-2xl hover:shadow-blue-200/50 group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-bl-[100px] transition-transform duration-700 group-hover:scale-150 group-hover:rotate-45 opacity-50" />

            <h3 className="text-lg font-semibold mb-2">
              Postgraduate Platinum
            </h3>
            <div className="flex items-baseline gap-1 mb-1">
              <h4 className="text-5xl font-black tracking-tight text-gray-900">₦10,000</h4>
            </div>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-6">One-time payment</p>

            <ul className="space-y-4 text-left my-8">
              <Feature text="Everything in Gold" />
              <Feature text="Unlimited PDF Analysis" />
              <Feature text="Advanced Data Interpretation" />
              <Feature text="Research Gap Identification" />
              <Feature text="Journal Scoping Assistance" />
              <Feature text="Priority Support" />
            </ul>

            <button className="w-full py-4 rounded-2xl bg-white border-2 border-blue-600 text-blue-600 font-bold hover:bg-blue-50 hover:scale-[1.02] active:scale-[0.98] transition-all">
              Upgrade to Platinum
            </button>
          </div>

          {/* RESELLER PACKAGE */}
          <div className="relative bg-white rounded-3xl shadow-lg p-8 border transition-all duration-500 hover:-translate-y-4 hover:shadow-2xl hover:shadow-orange-200/50 group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-100 rounded-bl-[100px] transition-transform duration-700 group-hover:scale-150 group-hover:-rotate-45 opacity-50" />

            <h3 className="text-lg font-semibold mb-2">
              Partner & Reseller
            </h3>
            <div className="flex items-baseline gap-1 mb-1">
              <h4 className="text-4xl font-black tracking-tight text-gray-900">₦35,000</h4>
            </div>
            <p className="text-[10px] xl:text-xs font-bold text-orange-600 uppercase tracking-wider mb-4 leading-tight">
              10 Undergraduate
              <br className="hidden xl:block" /> OR 5 Postgraduate
            </p>

            <ul className="space-y-4 text-left my-8">
              <Feature text="Flexible UG/PG Selection" />
              <Feature text="Sell at Retail Price" />
              <Feature text="Admin Dashboard Access" />
              <Feature text="Unique Activation Codes" />
              <Feature text="High Profit Margin" />
              <Feature text="Recurring Semester Revenue" />
            </ul>

            <button className="w-full py-4 rounded-2xl bg-white border-2 border-orange-600 text-orange-600 font-bold hover:bg-orange-50 hover:scale-[1.02] active:scale-[0.98] transition-all">
              Become a Partner
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3 text-gray-700">
      <Check size={18} className="text-black" />
      {text}
    </li>
  );
}

function LockedFeature({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3 text-gray-400">
      <Lock size={16} />
      {text}
    </li>
  );
}
