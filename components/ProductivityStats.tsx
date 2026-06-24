'use client';

import { Card } from '@/components/ui/card';
import { TrendingUp, CheckCircle, Clock, Zap } from 'lucide-react';
import type { Task } from '@/lib/types';

interface ProductivityStatsProps {
  tasks: Task[];
}

export default function ProductivityStats({ tasks }: ProductivityStatsProps) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const totalEstimatedTime = tasks
    .filter(t => t.status !== 'completed')
    .reduce((sum, task) => sum + (task.estimatedDuration || 0), 0);
  
  const highPriorityPending = tasks.filter(
    t => t.status !== 'completed' && 
    (t.priority.level === 'critical' || t.priority.level === 'high')
  ).length;

  const stats = [
    {
      label: 'Completion Rate',
      value: `${completionRate}%`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Tasks Completed',
      value: completedTasks,
      icon: CheckCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Time Remaining',
      value: `${Math.round(totalEstimatedTime / 60)}h`,
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      label: 'High Priority',
      value: highPriorityPending,
      icon: Zap,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-xs text-gray-600">
                  {stat.label}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}