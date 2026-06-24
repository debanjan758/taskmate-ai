'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Battery, Brain, Coffee, Palette, Zap } from 'lucide-react';
import { suggestTaskByMood } from '@/lib/uniqueAI';
import type { Task } from '@/lib/types';
import toast from 'react-hot-toast';

interface MoodSelectorProps {
  tasks: Task[];
  onTaskSelected?: (task: Task) => void;
}

type MoodType = 'energetic' | 'focused' | 'tired' | 'creative' | 'stressed';

export default function MoodSelector({ tasks, onTaskSelected }: MoodSelectorProps) {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<any>(null);

  const moods: { type: MoodType; label: string; icon: any; color: string; emoji: string }[] = [
    { type: 'energetic', label: 'Energetic', icon: Zap, color: 'bg-yellow-500', emoji: '⚡' },
    { type: 'focused', label: 'Focused', icon: Brain, color: 'bg-blue-500', emoji: '🎯' },
    { type: 'tired', label: 'Tired', icon: Battery, color: 'bg-gray-500', emoji: '😴' },
    { type: 'creative', label: 'Creative', icon: Palette, color: 'bg-purple-500', emoji: '🎨' },
    { type: 'stressed', label: 'Stressed', icon: Coffee, color: 'bg-red-500', emoji: '😰' }
  ];

  const handleMoodSelect = async (mood: MoodType) => {
    setSelectedMood(mood);
    setLoading(true);

    try {
      const result = await suggestTaskByMood(mood, tasks);
      setRecommendation(result);
      
      if (result.recommendedTask) {
        toast.success(`Found the perfect task for your ${mood} mood!`);
      } else {
        toast.error('No tasks available right now');
      }
    } catch (error) {
      toast.error('Failed to get recommendation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h3 className="font-bold text-lg">How are you feeling right now?</h3>
      </div>

      {/* Mood Selection */}
      {!recommendation && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {moods.map((mood) => {
            const Icon = mood.icon;
            return (
              <Button
                key={mood.type}
                onClick={() => handleMoodSelect(mood.type)}
                disabled={loading}
                variant={selectedMood === mood.type ? 'default' : 'outline'}
                className={`h-auto py-4 flex flex-col gap-2 ${
                  selectedMood === mood.type ? mood.color + ' text-white' : ''
                }`}
              >
                <span className="text-2xl">{mood.emoji}</span>
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{mood.label}</span>
              </Button>
            );
          })}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin text-4xl mb-2">🤔</div>
          <p className="text-gray-600">Finding the perfect task for you...</p>
        </div>
      )}

      {/* Recommendation */}
      {recommendation && recommendation.recommendedTask && !loading && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-lg border-2 border-purple-300">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="text-sm text-purple-600 font-medium mb-1">
                  Perfect for your {selectedMood} mood:
                </div>
                <h4 className="text-lg font-bold mb-2">
                  {recommendation.recommendedTask.title}
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  {recommendation.reasoning}
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => onTaskSelected?.(recommendation.recommendedTask)}
                    className="gap-2"
                  >
                    Start This Task
                  </Button>
                  <Button
                    onClick={() => setRecommendation(null)}
                    variant="outline"
                  >
                    Choose Different Mood
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Alternatives */}
          {recommendation.alternatives && recommendation.alternatives.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Or try these alternatives:</p>
              <div className="space-y-2">
                {recommendation.alternatives.map((task: Task) => (
                  <button
                    key={task.id}
                    onClick={() => onTaskSelected?.(task)}
                    className="w-full text-left p-3 bg-white rounded-lg border hover:border-purple-300 transition-colors"
                  >
                    <div className="font-medium">{task.title}</div>
                    <div className="text-xs text-gray-500">
                      {task.estimatedDuration} min • {task.priority.level} priority
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}