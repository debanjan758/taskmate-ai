import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PriorityBadge from './PriorityBadge';
import { Clock, Calendar, CheckCircle2, Trash2, Play } from 'lucide-react';
import { format } from 'date-fns';
import type { Task } from '@/lib/types';

interface TaskCardProps {
  task: Task;
  onStatusChange?: (taskId: string, status: Task['status']) => void;
  onDelete?: (taskId: string) => void;
}

export default function TaskCard({ task, onStatusChange, onDelete }: TaskCardProps) {
  const isCompleted = task.status === 'completed';

  return (
    <Card className={`p-4 hover:shadow-md transition-shadow ${
      isCompleted ? 'opacity-60 bg-gray-50' : ''
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <PriorityBadge 
              level={task.priority.level} 
              score={task.priority.score}
            />
            <span className="text-xs text-gray-500 capitalize">
              {task.category}
            </span>
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
          <div className="flex flex-wrap gap-3 text-sm text-gray-500">
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
          </div>

          {/* Subtasks */}
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="mt-3 space-y-1">
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