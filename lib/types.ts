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
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}