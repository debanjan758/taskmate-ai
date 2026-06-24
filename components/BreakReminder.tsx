'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coffee, X, CheckCircle } from 'lucide-react';
import { suggestBreak } from '@/lib/uniqueAI';
import toast from 'react-hot-toast';

interface BreakReminderProps {
  minutesWorked: number;
  tasksCompleted: number;
  onBreakTaken?: () => void;
}

export default function BreakReminder({ 
  minutesWorked, 
  tasksCompleted,
  onBreakTaken 
}: BreakReminderProps) {
  const [breakSuggestion, setBreakSuggestion] = useState<any>(null);
  const [dismissed, setDismissed] = useState(false);
  const [onBreak, setOnBreak] = useState(false);
  const [breakTimer, setBreakTimer] = useState(0);

  useEffect(() => {
    if (minutesWorked > 0 && minutesWorked % 25 === 0) {
      checkBreakNeeded();
    }
  }, [minutesWorked]);

  useEffect(() => {
    if (onBreak && breakTimer > 0) {
      const interval = setInterval(() => {
        setBreakTimer(prev => {
          if (prev <= 1) {
            setOnBreak(false);
            toast.success('Break time over! Back to work! 🚀');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [onBreak, breakTimer]);

  const checkBreakNeeded = async () => {
    const suggestion = await suggestBreak(minutesWorked, tasksCompleted, 'moderate');
    
    if (suggestion.shouldBreak) {
      setBreakSuggestion(suggestion);
      toast('Time for a break! 🎉', { icon: '☕' });
    }
  };

  const takeBreak = () => {
    if (!breakSuggestion) return;
    
    setOnBreak(true);
    setBreakTimer(breakSuggestion.duration * 60); // Convert to seconds
    setDismissed(true);
    onBreakTaken?.();
    toast.success(`Enjoy your ${breakSuggestion.duration}-minute break!`);
  };

  if (dismissed && !onBreak) return null;

  if (onBreak) {
    const minutes = Math.floor(breakTimer / 60);
    const seconds = breakTimer % 60;

    return (
      <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300">
        <div className="text-center">
          <Coffee className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <h4 className="font-bold text-lg mb-1">On Break</h4>
          <div className="text-3xl font-mono font-bold text-green-600 mb-2">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </div>
          <p className="text-sm text-gray-600 mb-3">
            {breakSuggestion?.activity}
          </p>
          <Button
            onClick={() => {
              setOnBreak(false);
              setBreakTimer(0);
              toast.success('Back to work mode! 💪');
            }}
            variant="outline"
            size="sm"
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            End Break Early
          </Button>
        </div>
      </Card>
    );
  }

  if (!breakSuggestion) return null;

  const breakIcons: { [key: string]: string } = {
    'micro': '💧',
    'short': '☕',
    'long': '🍽️'
  };

  return (
    <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300">
      <div className="flex items-start gap-3">
        <div className="text-3xl">{breakIcons[breakSuggestion.breakType]}</div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold">Time for a Break!</h4>
            <Button
              onClick={() => setDismissed(true)}
              variant="ghost"
              size="sm"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <p className="text-sm text-gray-700 mb-2">
            {breakSuggestion.reasoning}
          </p>

          <div className="p-2 bg-white rounded mb-3">
            <div className="font-semibold text-sm mb-1">
              Suggested: {breakSuggestion.duration}-min {breakSuggestion.breakType} break
            </div>
            <p className="text-xs text-gray-600">{breakSuggestion.activity}</p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={takeBreak}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 gap-1"
            >
              <Coffee className="w-4 h-4" />
              Take Break
            </Button>
            <Button
              onClick={() => setDismissed(true)}
              size="sm"
              variant="outline"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}