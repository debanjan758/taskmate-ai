"use client";

import MoodSelector from "@/components/MoodSelector";
import ProcrastinationAlert from "@/components/ProcrastinationAlert";
import DifficultyBadge from "@/components/DifficultyBadge";
import BreakReminder from "@/components/BreakReminder";
import FocusMusicPlayer from "@/components/FocusMusicPlayer";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import TaskExecutionTracker from "@/components/TaskExecutionTracker";
import ChatAssistant from "@/components/ChatAssistant";
import PriorityBadge from "@/components/PriorityBadge";
import { getAllTasks, updateTaskStatus } from "@/lib/taskService";
import type { Task } from "@/lib/types";
import { format } from "date-fns";

export default function TaskFocusPage() {
  const [viewCount, setViewCount] = useState(0);
  const [minutesWorked, setMinutesWorked] = useState(26);

  useEffect(() => {
    // Track page views
    setViewCount((prev) => prev + 1);
  }, []);
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;

  const [task, setTask] = useState<Task | null>(null);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTask();
  }, [taskId]);

  const loadTask = async () => {
    try {
      const tasks = await getAllTasks();
      setAllTasks(tasks);

      const foundTask = tasks.find((t) => t.id === taskId);
      if (foundTask) {
        setTask(foundTask);

        // Auto-set to in-progress if pending
        if (foundTask.status === "pending") {
          await updateTaskStatus(taskId, "in-progress");
          setTask({ ...foundTask, status: "in-progress" });
        }
      } else {
        toast.error("Task not found");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error loading task:", error);
      toast.error("Failed to load task");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!task) return;

    try {
      await updateTaskStatus(taskId, "completed");
      toast.success("🎉 Task completed! Great job!");
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error) {
      toast.error("Failed to complete task");
    }
  };

  const handlePause = async () => {
    if (!task) return;

    try {
      await updateTaskStatus(taskId, "pending");
      toast("Task paused. You can resume later.");
    } catch (error) {
      toast.error("Failed to pause task");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading task...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Task not found</p>
          <Button onClick={() => router.push("/dashboard")} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Toaster position="top-right" />

      <div className="max-w-5xl mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            onClick={() => router.push("/dashboard")}
            variant="ghost"
            className="gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <PriorityBadge
                    level={task.priority.level}
                    score={task.priority.score}
                  />
                  <span className="text-sm text-gray-500 capitalize">
                    {task.category}
                  </span>
                  <span
                    className={`text-sm px-2 py-0.5 rounded ${
                      task.status === "in-progress"
                        ? "bg-blue-100 text-blue-700"
                        : task.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {task.status}
                  </span>
                </div>

                <h1 className="text-3xl font-bold mb-3">{task.title}</h1>

                {task.description && (
                  <p className="text-gray-600 mb-4">{task.description}</p>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  {task.deadline && (
                    <div>
                      <span className="font-medium">Deadline:</span>{" "}
                      {format(task.deadline, "MMM dd, yyyy h:mm a")}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Estimated:</span>{" "}
                    {task.estimatedDuration} minutes
                  </div>
                </div>
              </div>
            </div>

            {task.priority.reasoning && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">💡 Why this matters:</span>{" "}
                  {task.priority.reasoning}
                </p>
              </div>
            )}
          </div>
        </div>

        <DifficultyBadge task={task} showDetails={false} />

        <div className="mb-6">
          <MoodSelector
            tasks={allTasks.filter((t) => t.status !== "completed")}
            onTaskSelected={(selectedTask) => {
              router.push(`/task/${selectedTask.id}`);
            }}
          />
        </div>

        {/* 🌟 UNIQUE: Procrastination Detection */}
        {viewCount >= 3 && (
          <div className="mb-6">
            <p>Debug: View count = {viewCount}</p>
            {viewCount >= 3 ? (
              <ProcrastinationAlert
                task={task}
                viewCount={viewCount}
                onTakeTechnique={(technique) => {
                  toast.success(`Using ${technique}! Let's go! 🚀`);
                }}
              />
            ) : (
              <p className="text-gray-500 text-sm">
                Refresh {3 - viewCount} more times to trigger procrastination
                alert
              </p>
            )}
          </div>
        )}

        {/* 🌟 UNIQUE: Smart Break Reminder */}
        <div className="mb-6">
          <BreakReminder
            minutesWorked={minutesWorked}
            tasksCompleted={0}
            onBreakTaken={() => {
              toast("Enjoy your break! 😊");
            }}
          />
        </div>

        {/* 🌟 UNIQUE: Focus Music */}
        <div className="mb-6">
          <FocusMusicPlayer task={task} />
        </div>

        {/* 🧪 TEST: Break Reminder */}
        <div className="mb-6">
          <div className="p-4 bg-gray-100 rounded-lg border">
            <h4 className="font-bold mb-2">🧪 Break Reminder Test Panel</h4>
            <p className="text-sm text-gray-600 mb-3">
              Current minutes worked:{" "}
              <span className="font-bold">{minutesWorked}</span>
            </p>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setMinutesWorked(0)}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
              >
                Reset to 0
              </button>
              <button
                onClick={() => setMinutesWorked(25)}
                className="px-3 py-1 bg-orange-500 text-white rounded text-sm"
              >
                Set to 25 min
              </button>
              <button
                onClick={() => setMinutesWorked(50)}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm"
              >
                Set to 50 min
              </button>
            </div>

            <BreakReminder
              minutesWorked={minutesWorked}
              tasksCompleted={0}
              onBreakTaken={() => {
                toast("Enjoy your break! 😊");
              }}
            />
          </div>
        </div>

        {/* Task Execution Tracker */}
        <div className="mb-6">
          <TaskExecutionTracker
            task={task}
            onComplete={handleComplete}
            onPause={handlePause}
          />
        </div>

        {/* AI Tips */}
        {task.aiSuggestions?.tips && task.aiSuggestions.tips.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              💡 AI Tips for Success
            </h3>
            <ul className="space-y-2">
              {task.aiSuggestions.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-purple-500 font-bold">•</span>
                  <span className="text-gray-700">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Floating Chat Assistant */}
      <ChatAssistant currentTask={task} allTasks={allTasks} />
    </div>
  );
}
