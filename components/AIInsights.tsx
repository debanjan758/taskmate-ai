'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Lightbulb, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { getTaskTips, breakdownTask } from '@/lib/gemini';
import toast from 'react-hot-toast';

interface AIInsightsProps {
  task: any;
}

export default function AIInsights({ task }: AIInsightsProps) {
  const [tips, setTips] = useState<string[]>([]);
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const [taskTips, taskBreakdown] = await Promise.all([
        getTaskTips(task),
        breakdownTask({
          title: task.title,
          description: task.description || '',
          estimatedDuration: task.estimatedDuration || 60
        })
      ]);

      setTips(taskTips);
      setSubtasks(taskBreakdown);
      setExpanded(true);
    } catch (error) {
      toast.error('Failed to load AI insights');
    } finally {
      setLoading(false);
    }
  };

  if (!expanded) {
    return (
      <Button
        onClick={loadInsights}
        disabled={loading}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Brain className="w-4 h-4" />
            Get AI Insights
          </>
        )}
      </Button>
    );
  }

  return (
    <Card className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-600" />
          AI Insights
        </h4>
        <Button
          onClick={() => setExpanded(false)}
          variant="ghost"
          size="sm"
        >
          <ChevronUp className="w-4 h-4" />
        </Button>
      </div>

      {/* Subtasks */}
      {subtasks.length > 0 && (
        <div className="mb-4">
          <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
            📋 Suggested Steps
          </h5>
          <ol className="space-y-1.5 ml-4">
            {subtasks.map((subtask, index) => (
              <li key={index} className="text-sm text-gray-700 list-decimal">
                {subtask}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Tips */}
      {tips.length > 0 && (
        <div>
          <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            Pro Tips
          </h5>
          <ul className="space-y-1.5">
            {tips.map((tip, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-purple-500">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}