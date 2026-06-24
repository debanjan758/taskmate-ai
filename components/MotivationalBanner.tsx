'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { getMotivation } from '@/lib/chatService';
import type { Task } from '@/lib/types';

interface MotivationalBannerProps {
  tasks: Task[];
}

export default function MotivationalBanner({ tasks }: MotivationalBannerProps) {
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    loadMotivation();
  }, [tasks]);

  const loadMotivation = async () => {
    const completedToday = tasks.filter(t => {
      if (t.status !== 'completed' || !t.completedAt) return false;
      const today = new Date();
      const completedDate = new Date(t.completedAt);
      return completedDate.toDateString() === today.toDateString();
    }).length;

    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';

    const motivationalMessage = await getMotivation(completedToday, timeOfDay);
    setMessage(motivationalMessage);
  };

  if (!message) return null;

  return (
    <Card className="p-4 bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 border-2 border-purple-200">
      <div className="flex items-center gap-3">
        <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0" />
        <p className="text-gray-800 font-medium">{message}</p>
      </div>
    </Card>
  );
}