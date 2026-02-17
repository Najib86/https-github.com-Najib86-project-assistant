
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProjectAssistantAI | AI for Final Year Projects and Academic Research",
  description: "AI-powered platform for university project writing and supervision.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

import { AuthProvider } from "@/components/providers/AuthProvider";
import { Footer } from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased font-sans`}
      >
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <div className="flex-1">
              {children}
            </div>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
