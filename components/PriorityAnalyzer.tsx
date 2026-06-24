'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Target, TrendingUp, Loader2 } from 'lucide-react';
import { calculateEnhancedPriority } from '@/lib/gemini';
import PriorityBadge from './PriorityBadge';
import toast from 'react-hot-toast';

interface PriorityAnalyzerProps {
  task: any;
  allTasks?: any[];
  onPriorityUpdate?: (priority: any) => void;
}

export default function PriorityAnalyzer({ 
  task, 
  allTasks = [], 
  onPriorityUpdate 
}: PriorityAnalyzerProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const analyzePriority = async () => {
    setAnalyzing(true);
    try {
      const priority = await calculateEnhancedPriority(task, allTasks);
      setResult(priority);
      
      // Update parent component
      onPriorityUpdate?.({
        score: priority.priorityScore,
        level: priority.level,
        reasoning: priority.reasoning
      });

      toast.success('Priority updated!');
    } catch (error) {
      toast.error('Failed to analyze priority');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={analyzePriority}
        disabled={analyzing}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        {analyzing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Target className="w-4 h-4" />
            Recalculate Priority
          </>
        )}
      </Button>

      {result && (
        <Card className="p-3 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <PriorityBadge level={result.level} score={result.priorityScore} />
              </div>
              <p className="text-sm text-gray-700 mb-2">{result.reasoning}</p>
              
              {result.urgencyFactors && result.urgencyFactors.length > 0 && (
                <div className="text-xs text-gray-600">
                  <span className="font-medium">Key factors:</span>
                  <ul className="mt-1 space-y-0.5">
                    {result.urgencyFactors.map((factor: string, i: number) => (
                      <li key={i}>• {factor}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}