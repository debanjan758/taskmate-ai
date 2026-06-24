'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingDown, Lightbulb } from 'lucide-react';
import { detectProcrastination } from '@/lib/uniqueAI';
import type { Task } from '@/lib/types';

interface ProcrastinationAlertProps {
  task: Task;
  viewCount: number;
  onTakeTechnique?: (technique: string) => void;
}

export default function ProcrastinationAlert({ 
  task, 
  viewCount,
  onTakeTechnique 
}: ProcrastinationAlertProps) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (viewCount >= 3) {
      analyzeNow();
    }
  }, [viewCount]);

  const analyzeNow = async () => {
    const result = await detectProcrastination(task, viewCount, 5);
    if (result.isProcrastinating && result.confidence > 60) {
      setAnalysis(result);
    }
  };

  if (!analysis || dismissed || analysis.confidence < 60) {
    return null;
  }

  const techniques: { [key: string]: { icon: string; description: string } } = {
    'Pomodoro': { 
      icon: '🍅', 
      description: 'Work for 25 min, break for 5 min' 
    },
    '2-min rule': { 
      icon: '⏱️', 
      description: 'Just start for 2 minutes, then decide' 
    },
    'Task breakdown': { 
      icon: '🔨', 
      description: 'Break into tiny, manageable steps' 
    },
    'Accountability buddy': { 
      icon: '👥', 
      description: 'Tell someone you\'ll do it' 
    }
  };

  const technique = techniques[analysis.technique] || techniques['2-min rule'];

  return (
    <Card className="p-4 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 animate-pulse">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5 text-red-600" />
            <h4 className="font-bold text-red-900">
              Procrastination Detected! ({analysis.confidence}% confident)
            </h4>
          </div>

          <p className="text-sm text-orange-800 mb-3">
            You've viewed this task {viewCount} times without starting.
          </p>

          <div className="p-3 bg-white rounded-lg mb-3">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-yellow-600" />
              <span className="font-semibold text-sm">AI Suggestion:</span>
            </div>
            <p className="text-sm text-gray-700 mb-2">{analysis.suggestion}</p>
          </div>

          <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg mb-3">
            <div className="font-semibold text-sm mb-1">
              {technique.icon} Try: {analysis.technique}
            </div>
            <p className="text-xs text-gray-600">{technique.description}</p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => {
                onTakeTechnique?.(analysis.technique);
                setDismissed(true);
              }}
              size="sm"
              className="bg-orange-600 hover:bg-orange-700"
            >
              Let's Do This!
            </Button>
            <Button
              onClick={() => setDismissed(true)}
              size="sm"
              variant="outline"
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}