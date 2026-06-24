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
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex gap-4 items-center">
        <div className="flex-1">
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
            className="text-lg h-12"
          />
        </div>

        <VoiceInput onTranscript={handleVoiceTranscript} disabled={loading} />

        <Button
          onClick={() => handleSubmit(input)}
          disabled={loading || !input.trim()}
          size="lg"
          className="h-12 px-6"
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

      <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
        <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        <span>Powered by Google Gemini AI</span>
      </div>
    </div>
  );
}
