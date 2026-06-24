'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, BarChart3, Clock, Target, Loader2 } from 'lucide-react';
import { analyzeProductivityPattern } from '@/lib/uniqueAI';
import type { Task } from '@/lib/types';

interface ProductivityInsightsProps {
  tasks: Task[];
}

export default function ProductivityInsights({ tasks }: ProductivityInsightsProps) {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const result = await analyzeProductivityPattern(tasks);
      setInsights(result);
      setExpanded(true);
    } catch (error) {
      console.error('Failed to load insights');
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
        className="w-full gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyzing your patterns...
          </>
        ) : (
          <>
            <BarChart3 className="w-4 h-4" />
            View Productivity Insights
          </>
        )}
      </Button>
    );
  }

  if (!insights) return null;

  const timeOfDayEmoji: { [key: string]: string } = {
    'morning': '🌅',
    'afternoon': '☀️',
    'evening': '🌙'
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          Your Productivity Insights
        </h3>
        <Button
          onClick={() => setExpanded(false)}
          variant="ghost"
          size="sm"
        >
          Hide
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-4">
        {/* Best Time */}
        <div className="p-4 bg-white rounded-lg">
          <div className="text-2xl mb-1">
            {timeOfDayEmoji[insights.bestTimeOfDay] || '⏰'}
          </div>
          <div className="text-xs text-gray-600 mb-1">Most Productive</div>
          <div className="font-bold capitalize">{insights.bestTimeOfDay}</div>
        </div>

        {/* Best Category */}
        <div className="p-4 bg-white rounded-lg">
          <div className="text-2xl mb-1">🎯</div>
          <div className="text-xs text-gray-600 mb-1">Strongest In</div>
          <div className="font-bold capitalize">{insights.mostProductiveCategory}</div>
        </div>

        {/* Avg Time */}
        <div className="p-4 bg-white rounded-lg">
          <Clock className="w-6 h-6 text-indigo-600 mb-1" />
          <div className="text-xs text-gray-600 mb-1">Avg Completion</div>
          <div className="font-bold">{insights.averageCompletionTime} min</div>
        </div>
      </div>

      {/* Insights */}
      {insights.insights && insights.insights.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
            💡 Patterns Discovered:
          </h4>
          <ul className="space-y-2">
            {insights.insights.map((insight: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-indigo-500">•</span>
                <span className="text-gray-700">{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {insights.recommendations && insights.recommendations.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
            <Target className="w-4 h-4 text-green-600" />
            AI Recommendations:
          </h4>
          <ul className="space-y-1.5">
            {insights.recommendations.map((rec: string, i: number) => (
              <li key={i} className="text-sm text-gray-700">
                {i + 1}. {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}