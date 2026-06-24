"use client";

import MoodSelector from "@/components/MoodSelector";
import ProductivityInsights from "@/components/ProductivityInsights";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import TaskInput from "@/components/TaskInput";
import TaskList from "@/components/TaskList";
import ChatAssistant from "@/components/ChatAssistant"; // 👈 ADD THIS IMPORT
import MotivationalBanner from "@/components/MotivationalBanner";
import {
  getAllTasks,
  updateTaskStatus,
  deleteTask,
  updateTask,
} from "@/lib/taskService";
import type { Task } from "@/lib/types";

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    try {
      const fetchedTasks = await getAllTasks();
      setTasks(fetchedTasks);
    } catch (error) {
      console.error("Error loading tasks:", error);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleStatusChange = async (taskId: string, status: Task["status"]) => {
    try {
      await updateTaskStatus(taskId, status);
      toast.success("Task updated!");
      await loadTasks();
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      await deleteTask(taskId);
      toast.success("Task deleted");
      await loadTasks();
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  const handleUpdate = async (taskId: string, updates: Partial<Task>) => {
    try {
      await updateTask(taskId, updates);
      toast.success("Task updated!");
      await loadTasks();
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const highPriorityCount = tasks.filter(
    (t) =>
      t.status !== "completed" &&
      (t.priority.level === "critical" || t.priority.level === "high"),
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto p-6 md:p-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            TaskMate AI
          </h1>
          <p className="text-gray-600">
            Your AI-powered productivity companion
          </p>
        </header>

        {/* Motivational Banner */}
        {!loading && tasks.length > 0 && (
          <div className="mb-6">
            <MotivationalBanner tasks={tasks} />
          </div>
        )}

        {/* Task Input */}
        <div className="mb-8">
          <TaskInput onTaskCreated={loadTasks} />
        </div>

        {/* 🌟 UNIQUE: Mood-Based Task Selector */}
        <div className="mb-8">
          <MoodSelector
            tasks={tasks}
            onTaskSelected={(task) => {
              window.location.href = `/task/${task.id}`;
            }}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-blue-600">
              {tasks.filter((t) => t.status === "pending").length}
            </div>
            <div className="text-sm text-gray-600">Pending Tasks</div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-purple-600">
              {tasks.filter((t) => t.status === "in-progress").length}
            </div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-green-600">
              {tasks.filter((t) => t.status === "completed").length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-4 shadow-sm border border-red-100">
            <div className="text-2xl font-bold text-red-600">
              {highPriorityCount}
            </div>
            <div className="text-sm text-red-700 font-medium">
              High Priority
            </div>
          </div>
        </div>

        {/* 🌟 UNIQUE: Productivity Insights */}
        {!loading && tasks.length > 0 && (
          <div className="mb-8">
            <ProductivityInsights tasks={tasks} />
          </div>
        )}

        {/* Task List */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin text-4xl mb-4">⏳</div>
              <p className="text-gray-500">Loading your tasks...</p>
            </div>
          ) : (
            <TaskList
              tasks={tasks}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          )}
        </div>
      </div>

      {/* 👇 FLOATING CHAT ASSISTANT - ADDED HERE 👇 */}
      <ChatAssistant allTasks={tasks} />
    </div>
  );
}
