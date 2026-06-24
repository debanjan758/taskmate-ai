'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';
import PriorityBadge from './PriorityBadge';
import type { Task } from '@/lib/types';
import { format } from 'date-fns';

interface NextTaskSuggestionProps {
  tasks: Task[];
  onStartTask?: (taskId: string) => void;
}

export default function NextTaskSuggestion({ tasks, onStartTask }: NextTaskSuggestionProps) {
  // Find highest priority pending task
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  
  if (pendingTasks.length === 0) {
    return null;
  }

  // Sort by priority score
  const sortedTasks = [...pendingTasks].sort((a, b) => {
    return (b.priority?.score || 0) - (a.priority?.score || 0);
  });

  const nextTask = sortedTasks[0];

  // Don't show if priority is low and no deadline
  if (nextTask.priority.level === 'low' && !nextTask.deadline) {
    return null;
  }

  return (
    <Card className="p-6 bg-gradient-to-r from-purple-50 via-blue-50 to-purple-50 border-2 border-purple-200 shadow-lg">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-lg">AI Recommends: Do This Next</h3>
            <PriorityBadge level={nextTask.priority.level} score={nextTask.priority.score} />
          </div>

          <h4 className="text-xl font-semibold text-gray-800 mb-2">
            {nextTask.title}
          </h4>

          {nextTask.description && (
            <p className="text-gray-600 mb-3">
              {nextTask.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            {nextTask.deadline && (
              <span>⏰ Due: {format(nextTask.deadline, 'MMM dd, h:mm a')}</span>
            )}
            <span>⏱️ {nextTask.estimatedDuration} min</span>
          </div>

          {nextTask.priority.reasoning && (
            <div className="p-3 bg-white rounded-lg mb-4">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Why now: </span>
                {nextTask.priority.reasoning}
              </p>
            </div>
          )}

          <Button
            onClick={() => onStartTask?.(nextTask.id)}
            size="lg"
            className="gap-2 bg-purple-600 hover:bg-purple-700"
          >
            Start Now <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}