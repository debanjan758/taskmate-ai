'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music, Volume2, VolumeX, ExternalLink } from 'lucide-react';
import { suggestFocusSound } from '@/lib/uniqueAI';
import type { Task } from '@/lib/types';

interface FocusMusicPlayerProps {
  task: Task;
}

export default function FocusMusicPlayer({ task }: FocusMusicPlayerProps) {
  const [suggestion, setSuggestion] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const getSuggestion = async () => {
    setLoading(true);
    try {
      const result = await suggestFocusSound(task);
      setSuggestion(result);
      setExpanded(true);
    } catch (error) {
      console.error('Failed to get music suggestion');
    } finally {
      setLoading(false);
    }
  };

  if (!expanded) {
    return (
      <Button
        onClick={getSuggestion}
        disabled={loading}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Music className="w-4 h-4" />
        {loading ? 'Finding perfect sounds...' : 'Get Focus Music'}
      </Button>
    );
  }

  if (!suggestion) return null;

  const typeEmojis: { [key: string]: string } = {
    'lofi': '🎵',
    'classical': '🎻',
    'nature': '🌿',
    'ambient': '🌌',
    'white-noise': '🌊'
  };

  return (
    <Card className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200">
      <div className="flex items-start gap-3">
        <div className="text-3xl">{typeEmojis[suggestion.type] || '🎵'}</div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold">Focus Sounds</h4>
            <Button
              onClick={() => setExpanded(false)}
              variant="ghost"
              size="sm"
            >
              <VolumeX className="w-4 h-4" />
            </Button>
          </div>

          <div className="mb-2">
            <div className="font-bold text-sm">{suggestion.name}</div>
            <p className="text-xs text-gray-600">{suggestion.reason}</p>
          </div>

          <Button
            onClick={() => {
              window.open(
                `https://www.youtube.com/results?search_query=${encodeURIComponent(suggestion.youtubeQuery)}`,
                '_blank'
              );
            }}
            size="sm"
            className="gap-2 bg-pink-600 hover:bg-pink-700"
          >
            <ExternalLink className="w-3 h-3" />
            Play on YouTube
          </Button>
        </div>
      </div>
    </Card>
  );
}