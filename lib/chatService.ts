import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Task, ChatMessage } from './types';

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;

if (!apiKey) {
  throw new Error("NEXT_PUBLIC_GOOGLE_AI_API_KEY is not defined");
}

const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Generate AI response for chat
 */
export async function getChatResponse(
  userMessage: string,
  conversationHistory: ChatMessage[] = [],
  currentTask?: Task,
  allTasks: Task[] = []
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Build context
  let context = `You are TaskMate AI, a helpful productivity assistant. You help users manage and complete their tasks efficiently.

Current Date/Time: ${new Date().toISOString()}

`;

  // Add current task context if available
  if (currentTask) {
    context += `User is currently working on:
- Task: ${currentTask.title}
- Description: ${currentTask.description || 'None'}
- Priority: ${currentTask.priority.level} (${currentTask.priority.score}/100)
- Estimated Duration: ${currentTask.estimatedDuration} minutes
- Deadline: ${currentTask.deadline ? currentTask.deadline.toISOString() : 'No deadline'}
- Status: ${currentTask.status}

`;
  }

  // Add tasks overview
  if (allTasks.length > 0) {
    const pendingCount = allTasks.filter(t => t.status === 'pending').length;
    const inProgressCount = allTasks.filter(t => t.status === 'in-progress').length;
    const completedCount = allTasks.filter(t => t.status === 'completed').length;

    context += `User's Task Overview:
- Total Tasks: ${allTasks.length}
- Pending: ${pendingCount}
- In Progress: ${inProgressCount}
- Completed: ${completedCount}

`;
  }

  // Build conversation history
  const conversationContext = conversationHistory
    .slice(-5) // Last 5 messages for context
    .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n');

  if (conversationContext) {
    context += `Recent Conversation:\n${conversationContext}\n\n`;
  }

  const prompt = `${context}

User Question: ${userMessage}

Provide a helpful, concise response. Be encouraging and actionable. If suggesting steps, number them clearly.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error getting chat response:", error);
    return "I'm having trouble processing that right now. Could you try rephrasing your question?";
  }
}

/**
 * Get task-specific guidance
 */
export async function getTaskGuidance(
  task: Task,
  question: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `You are helping a user complete this task:

Task: ${task.title}
Description: ${task.description || 'No description'}
Estimated Time: ${task.estimatedDuration} minutes
Priority: ${task.priority.level}

User's Question: ${question}

Provide specific, actionable guidance to help them complete this task. Be concise but thorough.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error getting task guidance:", error);
    return "I couldn't generate guidance right now. Try breaking the task into smaller steps.";
  }
}

/**
 * Suggest next action for a task
 */
export async function suggestNextAction(
  task: Task,
  completedSubtasks: string[] = []
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `User is working on this task:

Task: ${task.title}
Description: ${task.description || 'None'}
Estimated Time: ${task.estimatedDuration} minutes

Completed steps so far:
${completedSubtasks.length > 0 ? completedSubtasks.map((s, i) => `${i + 1}. ${s}`).join('\n') : 'None yet'}

What should they do next? Provide ONE specific, actionable next step (1-2 sentences max).`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error suggesting next action:", error);
    return "Continue working on the next logical step of your task.";
  }
}

/**
 * Motivational message generator
 */
export async function getMotivation(
  completedToday: number,
  timeOfDay: 'morning' | 'afternoon' | 'evening'
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Generate a short, motivational message for a user who has completed ${completedToday} tasks today. 
It's currently ${timeOfDay}. 
Keep it to 1-2 sentences. Be positive and energizing.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    return "Great work! Keep the momentum going! 💪";
  }
}

/**
 * Analyze if user is stuck and provide help
 */
export async function analyzeStuckStatus(
  task: Task,
  timeSpent: number // in minutes
): Promise<{
  isStuck: boolean;
  suggestion: string;
}> {
  const expectedTime = task.estimatedDuration;
  const percentageSpent = (timeSpent / expectedTime) * 100;

  if (percentageSpent > 150) { // Spent 50% more time than estimated
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `A user has been working on this task for ${timeSpent} minutes, but it was estimated to take ${expectedTime} minutes.

Task: ${task.title}
Description: ${task.description || 'None'}

They might be stuck. Provide a helpful suggestion to get unstuck (2-3 sentences).`;

    try {
      const result = await model.generateContent(prompt);
      return {
        isStuck: true,
        suggestion: result.response.text()
      };
    } catch (error) {
      return {
        isStuck: true,
        suggestion: "You've been on this for a while. Consider taking a 5-minute break or breaking it into smaller steps."
      };
    }
  }

  return {
    isStuck: false,
    suggestion: ""
  };
}