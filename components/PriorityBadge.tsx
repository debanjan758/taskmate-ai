import { Badge } from '@/components/ui/badge';
import { AlertCircle, ArrowUp, Minus, ArrowDown } from 'lucide-react';

interface PriorityBadgeProps {
  level: 'critical' | 'high' | 'medium' | 'low';
  score?: number;
}

export default function PriorityBadge({ level, score }: PriorityBadgeProps) {
  const config = {
    critical: {
      label: 'Critical',
      className: 'bg-red-100 text-red-700 border-red-300',
      icon: AlertCircle
    },
    high: {
      label: 'High',
      className: 'bg-orange-100 text-orange-700 border-orange-300',
      icon: ArrowUp
    },
    medium: {
      label: 'Medium',
      className: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      icon: Minus
    },
    low: {
      label: 'Low',
      className: 'bg-green-100 text-green-700 border-green-300',
      icon: ArrowDown
    }
  };

  const { label, className, icon: Icon } = config[level];

  return (
    <Badge variant="outline" className={`${className} gap-1`}>
      <Icon className="w-3 h-3" />
      {label}
      {score && <span className="ml-1 opacity-70">({score})</span>}
    </Badge>
  );
}