import { 
  breakdownTask, 
  calculateEnhancedPriority, 
  suggestTimeSlots,
  getTaskTips 
} from './gemini';
import type { Task, AISuggestions } from './types';

/**
 * Generate comprehensive AI suggestions for a task
 */
export async function generateAISuggestions(
  task: Partial<Task>,
  allTasks: Task[] = []
): Promise<AISuggestions> {
  try {
    // Run AI functions in parallel for speed
    const [breakdown, timeSlots, tips] = await Promise.all([
      breakdownTask({
        title: task.title || '',
        description: task.description || '',
        estimatedDuration: task.estimatedDuration || 60
      }),
      suggestTimeSlots(task),
      getTaskTips(task)
    ]);

    const suggestions: AISuggestions = {
      breakdownSteps: breakdown,
      tips: tips,
    };

    // Add scheduled time from first suggestion
    if (timeSlots.length > 0) {
      suggestions.scheduledTime = new Date(timeSlots[0].startTime);
      suggestions.recommendedDuration = task.estimatedDuration;
    }

    return suggestions;
  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    return {
      breakdownSteps: [],
      tips: []
    };
  }
}

/**
 * Update task priority with AI
 */
export async function updateTaskPriority(
  task: Task,
  allTasks: Task[] = []
): Promise<{
  score: number;
  level: 'critical' | 'high' | 'medium' | 'low';
  reasoning: string;
}> {
  try {
    const result = await calculateEnhancedPriority(task, allTasks);
    
    return {
      score: result.priorityScore,
      level: result.level,
      reasoning: result.reasoning
    };
  } catch (error) {
    console.error('Error updating priority:', error);
    return task.priority;
  }
}

/**
 * Analyze all tasks and suggest which to do next
 */
export async function suggestNextTask(tasks: Task[]): Promise<Task | null> {
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  
  if (pendingTasks.length === 0) return null;

  // Sort by priority score
  const sorted = [...pendingTasks].sort((a, b) => {
    return (b.priority?.score || 0) - (a.priority?.score || 0);
  });

  return sorted[0];
}
