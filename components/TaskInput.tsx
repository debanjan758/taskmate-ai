"use client";

import { extractTaskFromInput, calculateEnhancedPriority } from "@/lib/gemini";
import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import VoiceInput from "./VoiceInput";
import toast from "react-hot-toast";
import { createTask } from "@/lib/taskService";

interface TaskInputProps {
  onTaskCreated?: () => void;
}

export default function TaskInput({ onTaskCreated }: TaskInputProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (text: string) => {
    if (!text.trim()) {
      toast.error("Please enter a task");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("AI is analyzing your task...");

    try {
      // Extract task using Gemini AI
      const extracted = await extractTaskFromInput(text);

      if (!extracted.tasks || extracted.tasks.length === 0) {
        throw new Error("Could not understand the task");
      }

      // Import at top of file
      // import { calculateEnhancedPriority } from '@/lib/gemini';

      // Create tasks in Firestore with AI-calculated priority
      for (const task of extracted.tasks) {
        // Calculate priority with AI
        const priorityResult = await calculateEnhancedPriority({
          title: task.title,
          description: task.description || "",
          deadline: task.deadline ? new Date(task.deadline) : null,
          estimatedDuration: task.estimatedDuration || 60,
          category: task.category || "other",
        });

        await createTask({
          title: task.title,
          description: task.description || "",
          deadline: task.deadline ? new Date(task.deadline) : null,
          estimatedDuration: task.estimatedDuration || 60,
          category: task.category || "other",
          priority: {
            score: priorityResult.priorityScore,
            level: priorityResult.level,
            reasoning: priorityResult.reasoning,
          },
        });
      }

      toast.success(
        `Created ${extracted.tasks.length} task(s) with AI priority!`,
        {
          id: loadingToast,
        },
      );

      setInput("");
      onTaskCreated?.();
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task. Please try again.", {
        id: loadingToast,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    setInput(transcript);
    toast.success("Voice input captured!");
  };

  return (
    <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 rounded-2xl shadow-2xl shadow-red-500/30 p-6 border border-red-900/40 relative overflow-hidden">
      {/* Energy glow effect */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
        background: 'radial-gradient(circle at top right, rgba(255,215,0,0.2) 0%, transparent 70%)'
      }}></div>
      <div className="relative z-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="w-full flex-1">
          <Input
            type="text"
            value={input}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setInput(e.target.value)
            }
            onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter" && !loading) {
                handleSubmit(input);
              }
            }}
            placeholder="Tell me what you need to do... (e.g., 'Finish project report by Friday')"
            disabled={loading}
            className="h-12 text-base sm:text-lg"
          />
        </div>

        <div className="flex w-full items-center gap-3 sm:w-auto">
          <VoiceInput onTranscript={handleVoiceTranscript} disabled={loading} />

          <Button
            onClick={() => handleSubmit(input)}
            disabled={loading || !input.trim()}
            size="lg"
            className="h-12 flex-1 px-5 sm:flex-none sm:px-6"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Add Task
              </span>
            )}
          </Button>
        </div>
      </div>

      </div>
      <div className="mt-4 flex items-center gap-2 text-sm text-amber-400 font-semibold tracking-wider">
        <span className="inline-block w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
        <span>⚡ Powered by Avengers AI</span>
      </div>
    </div>
  );
}
