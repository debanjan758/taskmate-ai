import Link from "next/link";

import { Button } from "@/components/ui/button";

import DeadlineAlert from '@/components/DeadlineAlert';

import { ArrowRight, CheckCircle2, Brain, Calendar, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <nav className="flex justify-between items-center mb-16">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            TaskMate AI
          </h1>
          <Link href="/dashboard">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Get Started
            </button>
          </Link>
        </nav>

        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-medium">
            🚀 Powered by Google Gemini AI
          </div>

          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Stop Missing Deadlines.
            <br />
            Start Getting Things Done.
          </h2>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your AI-powered productivity companion that doesn't just remind you—
            it actively helps you plan, prioritize, and complete your tasks.
          </p>

          <div className="flex gap-4 justify-center">
            <Link href="/dashboard">
              <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Try Now <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              AI-Powered Intelligence
            </h3>
            <p className="text-gray-600">
              Understands your tasks in natural language and breaks them down
              into actionable steps.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Scheduling</h3>
            <p className="text-gray-600">
              Automatically finds the best time slots based on your deadlines
              and workload.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Proactive Assistance</h3>
            <p className="text-gray-600">
              Get real-time guidance and suggestions as you work on your tasks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
