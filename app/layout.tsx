import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster } from "react-hot-toast";
import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TaskMate AI - Your AI Productivity Companion",
  description: "AI-powered task management that helps you get things done",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-red-950 relative overflow-hidden">
          {/* Avengers Energy Grid Background */}
          <div className="fixed inset-0 opacity-10 pointer-events-none" style={{
            backgroundImage: 'linear-gradient(90deg, transparent 1px, rgba(255,215,0,0.3) 1px), linear-gradient(rgba(255,215,0,0.3) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
          {children}
        </div>

        <Toaster position="top-right" />
      </body>
    </html>
  );
}
