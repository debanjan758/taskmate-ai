'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, Clock, Sparkles, Loader2 } from 'lucide-react';
import { suggestTimeSlots } from '@/lib/gemini';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface SmartSchedulerProps {
  task: any;
  onSchedule?: (startTime: Date) => void;
}

export default function SmartScheduler({ task, onSchedule }: SmartSchedulerProps) {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSlots, setShowSlots] = useState(false);

  const generateSlots = async () => {
    setLoading(true);
    try {
      const suggestions = await suggestTimeSlots(task);
      setSlots(suggestions);
      setShowSlots(true);
      toast.success('Found optimal time slots!');
    } catch (error) {
      toast.error('Failed to generate schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSlot = (slot: any) => {
    const startTime = new Date(slot.startTime);
    onSchedule?.(startTime);
    toast.success('Task scheduled!');
    setShowSlots(false);
  };

  if (!showSlots) {
    return (
      <Button
        onClick={generateSlots}
        disabled={loading}
        variant="outline"
        className="gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Finding best time...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            AI Schedule
          </>
        )}
      </Button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          Suggested Time Slots
        </h4>
        <Button
          onClick={() => setShowSlots(false)}
          variant="ghost"
          size="sm"
        >
          Cancel
        </Button>
      </div>

      <div className="space-y-2">
        {slots.map((slot, index) => (
          <Card key={index} className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => handleSelectSlot(slot)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-sm">
                    {format(new Date(slot.startTime), 'MMM dd, yyyy')}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {format(new Date(slot.startTime), 'h:mm a')} - {format(new Date(slot.endTime), 'h:mm a')}
                  </span>
                </div>

                <p className="text-xs text-gray-500">{slot.reasoning}</p>
              </div>

              <div className={`text-xs px-2 py-1 rounded ${
                slot.conflictLevel === 'none' ? 'bg-green-100 text-green-700' :
                slot.conflictLevel === 'low' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {slot.conflictLevel}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}