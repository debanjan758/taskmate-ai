'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Pause, 
  Square, 
  Timer, 
  CheckCircle2,
  AlertCircle,
  TrendingUp 
} from 'lucide-react';
import type { Task } from '@/lib/types';
import { format } from 'date-fns';
import { analyzeStuckStatus, suggestNextAction } from '@/lib/chatService';
import toast from 'react-hot-toast';

interface TaskExecutionTrackerProps {
  task: Task;
  onComplete?: () => void;
  onPause?: () => void;
}

export default function TaskExecutionTracker({ 
  task, 
  onComplete, 
  onPause 
}: TaskExecutionTrackerProps) {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [completedSubtasks, setCompletedSubtasks] = useState<number[]>([]);
  const [nextActionSuggestion, setNextActionSuggestion] = useState<string>('');
  const [showStuckWarning, setShowStuckWarning] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer logic
  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused]);

  // Check if user is stuck every 5 minutes
  useEffect(() => {
    if (isActive && seconds > 0 && seconds % 300 === 0) { // Every 5 minutes
      checkIfStuck();
    }
  }, [seconds, isActive]);

  const checkIfStuck = async () => {
    const minutesSpent = Math.floor(seconds / 60);
    const result = await analyzeStuckStatus(task, minutesSpent);
    
    if (result.isStuck) {
      setShowStuckWarning(true);
      toast.error(`You might be stuck! ${result.suggestion}`, {
        duration: 8000
      });
    }
  };

  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
    toast.success('Task started! You got this! 💪');
  };

  const handlePause = () => {
    setIsPaused(true);
    onPause?.();
    toast('Task paused. Take a breather!');
  };

  const handleResume = () => {
    setIsPaused(false);
    toast.success('Back to work! 🚀');
  };

  const handleStop = () => {
    setIsActive(false);
    setIsPaused(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    toast('Task stopped.');
  };

  const handleComplete = () => {
    handleStop();
    onComplete?.();
    toast.success('🎉 Great job! Task completed!');
  };

  const toggleSubtask = async (index: number) => {
    if (completedSubtasks.includes(index)) {
      setCompletedSubtasks(prev => prev.filter(i => i !== index));
    } else {
      setCompletedSubtasks(prev => [...prev, index]);
      
      // Get next action suggestion
      if (task.subtasks) {
        const completed = task.subtasks
          .filter((_, i) => completedSubtasks.includes(i) || i === index)
          .map(st => st.title);
        
        const suggestion = await suggestNextAction(task, completed);
        setNextActionSuggestion(suggestion);
        toast.success('Step completed! 👍');
      }
    }
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = task.subtasks 
    ? (completedSubtasks.length / task.subtasks.length) * 100 
    : 0;

  const estimatedSeconds = task.estimatedDuration * 60;
  const timeProgress = Math.min((seconds / estimatedSeconds) * 100, 100);

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Timer className="w-5 h-5 text-blue-600" />
          Task Execution
        </h3>
        <div className={`text-2xl font-mono ${
          isPaused ? 'text-yellow-600' : 'text-blue-600'
        }`}>
          {formatTime(seconds)}
        </div>
      </div>

      {/* Time Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Time Progress</span>
          <span className="text-gray-600">
            {Math.floor(seconds / 60)} / {task.estimatedDuration} min
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-blue-500 h-full transition-all duration-300" 
            style={{ width: `${Math.min(timeProgress, 100)}%` }}
          />
        </div>
        {timeProgress > 100 && (
          <p className="text-xs text-orange-600 mt-1">
            ⚠️ Taking longer than estimated
          </p>
        )}
      </div>

      {/* Subtasks Progress */}
      {task.subtasks && task.subtasks.length > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Steps Progress</span>
            <span className="text-gray-600">
              {completedSubtasks.length} / {task.subtasks.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mb-3">
            <div 
              className="bg-green-500 h-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="space-y-2">
            {task.subtasks.map((subtask, index) => (
              <label
                key={subtask.id}
                className="flex items-center gap-3 p-2 rounded hover:bg-white/50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={completedSubtasks.includes(index)}
                  onChange={() => toggleSubtask(index)}
                  className="w-4 h-4 rounded"
                />
                <span className={`text-sm flex-1 ${
                  completedSubtasks.includes(index) ? 'line-through text-gray-500' : ''
                }`}>
                  {subtask.title}
                </span>
                {completedSubtasks.includes(index) && (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                )}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Next Action Suggestion */}
      {nextActionSuggestion && isActive && (
        <div className="mb-4 p-3 bg-purple-100 border border-purple-300 rounded-lg">
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-purple-900 mb-1">Next Action:</p>
              <p className="text-sm text-purple-800">{nextActionSuggestion}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stuck Warning */}
      {showStuckWarning && (
        <div className="mb-4 p-3 bg-orange-100 border border-orange-300 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-orange-900 mb-1">
                Taking longer than expected?
              </p>
              <p className="text-xs text-orange-800 mb-2">
                Consider breaking this into smaller steps or asking for help.
              </p>
              <Button
                onClick={() => setShowStuckWarning(false)}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-2">
        {!isActive ? (
          <Button onClick={handleStart} className="flex-1 gap-2">
            <Play className="w-4 h-4" />
            Start Task
          </Button>
        ) : (
          <>
            {isPaused ? (
              <Button onClick={handleResume} variant="default" className="flex-1 gap-2">
                <Play className="w-4 h-4" />
                Resume
              </Button>
            ) : (
              <Button onClick={handlePause} variant="outline" className="flex-1 gap-2">
                <Pause className="w-4 h-4" />
                Pause
              </Button>
            )}
            
            <Button onClick={handleStop} variant="outline" className="gap-2">
              <Square className="w-4 h-4" />
              Stop
            </Button>
            
            <Button onClick={handleComplete} variant="default" className="gap-2 bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="w-4 h-4" />
              Complete
            </Button>
          </>
        )}
      </div>

      {/* Stats */}
      {isActive && (
        <div className="mt-4 grid grid-cols-2 gap-3 text-center">
          <div className="p-2 bg-white rounded">
            <div className="text-xs text-gray-600">Focus Time</div>
            <div className="text-lg font-bold text-blue-600">
              {formatTime(seconds)}
            </div>
          </div>
          <div className="p-2 bg-white rounded">
            <div className="text-xs text-gray-600">Completion</div>
            <div className="text-lg font-bold text-green-600">
              {Math.round(progress)}%
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
