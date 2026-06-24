'use client';

import { Card } from '@/components/ui/card';
import { AlertTriangle, Clock } from 'lucide-react';
import type { Task } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

interface DeadlineAlertProps {
  tasks: Task[];
}

export default function DeadlineAlert({ tasks }: DeadlineAlertProps) {
  const now = new Date();
  
  // Find tasks with deadlines in next 24 hours
  const urgentTasks = tasks.filter(task => {
    if (!task.deadline || task.status === 'completed') return false;
    
    const hoursUntilDeadline = (task.deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilDeadline > 0 && hoursUntilDeadline <= 24;
  });

  // Find overdue tasks
  const overdueTasks = tasks.filter(task => {
    if (!task.deadline || task.status === 'completed') return false;
    return task.deadline.getTime() < now.getTime();
  });

  if (urgentTasks.length === 0 && overdueTasks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Overdue Tasks */}
      {overdueTasks.length > 0 && (
        <Card className="p-4 bg-red-50 border-2 border-red-300">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-red-900">
                ⚠️ {overdueTasks.length} Overdue Task{overdueTasks.length > 1 ? 's' : ''}
              </h4>
              <ul className="mt-2 space-y-1">
                {overdueTasks.map(task => (
                  <li key={task.id} className="text-sm text-red-700">
                    • {task.title} - Overdue by {formatDistanceToNow(task.deadline!)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Urgent Tasks */}
      {urgentTasks.length > 0 && (
        <Card className="p-4 bg-orange-50 border-2 border-orange-300">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-orange-600 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-orange-900">
                🔥 {urgentTasks.length} Task{urgentTasks.length > 1 ? 's' : ''} Due Soon (24h)
              </h4>
              <ul className="mt-2 space-y-1">
                {urgentTasks.map(task => (
                  <li key={task.id} className="text-sm text-orange-700">
                    • {task.title} - Due in {formatDistanceToNow(task.deadline!)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}