export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: {
    score: number;
    level: 'critical' | 'high' | 'medium' | 'low';
    reasoning: string;
  };
  deadline: Date | null;
  estimatedDuration: number; // in minutes
  actualDuration?: number;
  category: 'work' | 'personal' | 'health' | 'finance' | 'other';
  subtasks: Subtask[];
  aiSuggestions?: AISuggestions;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  order: number;
}

export interface AISuggestions {
  scheduledTime?: Date;
  breakdownSteps?: string[];
  recommendedDuration?: number;
  relatedTasks?: string[];
  tips?: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
  reasoning: string;
  conflictLevel: 'none' | 'low' | 'medium' | 'high';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  taskContext?: string; // Task ID this message relates to
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  activeTaskId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskProgress {
  taskId: string;
  startedAt: Date;
  timeSpent: number; // in seconds
  completedSubtasks: number;
  totalSubtasks: number;
  status: 'not-started' | 'in-progress' | 'paused' | 'completed';
}
