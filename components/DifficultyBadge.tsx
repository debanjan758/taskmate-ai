'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Mountain, Loader2 } from 'lucide-react';
import { estimateTaskDifficulty } from '@/lib/uniqueAI';
import type { Task } from '@/lib/types';

interface DifficultyBadgeProps {
  task: Task;
  showDetails?: boolean;
}

export default function DifficultyBadge({ task, showDetails }: DifficultyBadgeProps) {
  const [difficulty, setDifficulty] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showDetails && !difficulty) {
      loadDifficulty();
    }
  }, [showDetails]);

  const loadDifficulty = async () => {
    setLoading(true);
    try {
      const result = await estimateTaskDifficulty(task);
      setDifficulty(result);
    } catch (error) {
      console.error('Failed to estimate difficulty');
    } finally {
      setLoading(false);
    }
  };

  const config: { [key: string]: { color: string; label: string; emoji: string } } = {
    'trivial': { color: 'bg-gray-100 text-gray-700', label: 'Trivial', emoji: '😊' },
    'easy': { color: 'bg-green-100 text-green-700', label: 'Easy', emoji: '✅' },
    'moderate': { color: 'bg-blue-100 text-blue-700', label: 'Moderate', emoji: '🎯' },
    'hard': { color: 'bg-orange-100 text-orange-700', label: 'Hard', emoji: '💪' },
    'very-hard': { color: 'bg-red-100 text-red-700', label: 'Very Hard', emoji: '🔥' }
  };

  if (loading) {
    return (
      <Badge variant="outline" className="gap-1">
        <Loader2 className="w-3 h-3 animate-spin" />
        Analyzing...
      </Badge>
    );
  }

  if (!difficulty) {
    return (
      <Badge 
        variant="outline" 
        className="gap-1 cursor-pointer hover:bg-gray-50"
        onClick={loadDifficulty}
      >
        <Mountain className="w-3 h-3" />
        Check Difficulty
      </Badge>
    );
  }

  const style = config[difficulty.difficulty] || config['moderate'];

  return (
    <div className="inline-block">
      <Badge className={`${style.color} gap-1`}>
        <span>{style.emoji}</span>
        {style.label}
        {difficulty.score && <span className="opacity-70">({difficulty.score})</span>}
      </Badge>
      
      {showDetails && difficulty.factors && (
        <div className="mt-2 text-xs text-gray-600">
          <div className="font-semibold mb-1">Difficulty factors:</div>
          <ul className="space-y-0.5">
            {difficulty.factors.map((factor: string, i: number) => (
              <li key={i}>• {factor}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}