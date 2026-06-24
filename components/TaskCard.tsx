'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PriorityBadge from './PriorityBadge';
import SmartScheduler from './SmartScheduler';
import AIInsights from './AIInsights';
import PriorityAnalyzer from './PriorityAnalyzer';
import { 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Trash2, 
  Play,
  ChevronDown,
  ChevronUp 
} from 'lucide-react';
import { format } from 'date-fns';
import type { Task } from '@/lib/types';

interface TaskCardProps {
  task: Task;
  allTasks?: Task[];
  onStatusChange?: (taskId: string, status: Task['status']) => void;
  onDelete?: (taskId: string) => void;
  onUpdate?: (taskId: string, updates: Partial<Task>) => void;
}

export default function TaskCard({ 
  task, 
  allTasks = [],
  onStatusChange, 
  onDelete,
  onUpdate 
}: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isCompleted = task.status === 'completed';

  const handleSchedule = (startTime: Date) => {
    if (onUpdate) {
      onUpdate(task.id, {
        aiSuggestions: {
          ...task.aiSuggestions,
          scheduledTime: startTime
        }
      });
    }
  };

  const handlePriorityUpdate = (priority: any) => {
    if (onUpdate) {
      onUpdate(task.id, { priority });
    }
  };

  return (
    <Card className={`p-4 hover:shadow-md transition-all ${
      isCompleted ? 'opacity-60 bg-gray-50' : ''
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <PriorityBadge 
              level={task.priority.level} 
              score={task.priority.score}
            />
            <span className="text-xs text-gray-500 capitalize">
              {task.category}
            </span>
            {task.aiSuggestions?.scheduledTime && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                🤖 AI Scheduled
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className={`text-lg font-semibold mb-2 ${
            isCompleted ? 'line-through text-gray-500' : ''
          }`}>
            {task.title}
          </h3>

          {/* Description */}
          {task.description && (
            <p className="text-sm text-gray-600 mb-3">
              {task.description}
            </p>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-3">
            {task.deadline && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{format(task.deadline, 'MMM dd, h:mm a')}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{task.estimatedDuration} min</span>
            </div>

            {task.aiSuggestions?.scheduledTime && (
              <div className="flex items-center gap-1 text-purple-600">
                <Calendar className="w-4 h-4" />
                <span>
                  Scheduled: {format(task.aiSuggestions.scheduledTime, 'MMM dd, h:mm a')}
                </span>
              </div>
            )}
          </div>

          {/* Priority Reasoning */}
          {task.priority.reasoning && (
            <div className="mb-3 p-2 bg-blue-50 rounded text-sm text-blue-700">
              💡 {task.priority.reasoning}
            </div>
          )}

          {/* Subtasks */}
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="mb-3 space-y-1">
              {task.subtasks.map((subtask) => (
                <div key={subtask.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={subtask.completed}
                    className="rounded"
                    readOnly
                  />
                  <span className={subtask.completed ? 'line-through text-gray-500' : ''}>
                    {subtask.title}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Expand/Collapse Button */}
          {!isCompleted && (
            <Button
              onClick={() => setExpanded(!expanded)}
              variant="ghost"
              size="sm"
              className="gap-2 mb-2"
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Hide AI Tools
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Show AI Tools
                </>
              )}
            </Button>
          )}

          {/* AI Tools - Expanded Section */}
          {expanded && !isCompleted && (
            <div className="mt-4 space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <SmartScheduler task={task} onSchedule={handleSchedule} />
              <PriorityAnalyzer 
                task={task} 
                allTasks={allTasks}
                onPriorityUpdate={handlePriorityUpdate}
              />
              <AIInsights task={task} />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {!isCompleted ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onStatusChange?.(task.id, 'in-progress')}
              >
                <Play className="w-4 h-4 mr-1" />
                Start
              </Button>
              
              <Button
                size="sm"
                variant="default"
                onClick={() => onStatusChange?.(task.id, 'completed')}
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Done
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusChange?.(task.id, 'pending')}
            >
              Undo
            </Button>
          )}

          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete?.(task.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}