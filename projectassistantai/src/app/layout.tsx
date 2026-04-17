// src/app/layout.tsx
import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, JetBrains_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Providers from "@/components/providers/Providers";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["700", "900"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600"],
  axes: ["opsz"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "ProjectAssistantAI — Nigeria's Premier Academic AI Platform",
    template: "%s | ProjectAssistantAI",
  },
  description:
    "Generate complete NOUN-compliant research projects with AI. 90–120 pages with charts, tables, references, and appendices — exported as Word documents.",
  keywords: [
    "NOUN project writing", "Nigerian academic AI", "research project generator",
    "thesis writing Nigeria", "academic AI assistant", "BSc MSc project Nigeria",
  ],
  authors: [{ name: "ProjectAssistantAI", url: "https://www.projectassistantai.com.ng" }],
  openGraph: {
    type: "website",
    url: "https://www.projectassistantai.com.ng",
    title: "ProjectAssistantAI — Nigeria's Premier Academic AI Platform",
    description: "Generate complete research projects with AI for Nigerian universities.",
    siteName: "ProjectAssistantAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "ProjectAssistantAI",
    description: "AI-powered academic project generator for Nigerian universities",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-[#0a0d12] text-[#e8edf5] font-sans antialiased">
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#111620",
                color: "#e8edf5",
                border: "1px solid #1e2a3a",
                borderRadius: "10px",
                fontSize: "13px",
                fontFamily: "var(--font-body)",
              },
              success: {
                iconTheme: { primary: "#2ecc8f", secondary: "#0a0d12" },
              },
              error: {
                iconTheme: { primary: "#e05252", secondary: "#0a0d12" },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
