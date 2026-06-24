import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Task } from './types';

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey!);

/**
 * 🌟 UNIQUE: Mood-Based Task Matching
 * Suggests tasks based on user's current energy/mood
 */
export async function suggestTaskByMood(
  mood: 'energetic' | 'focused' | 'tired' | 'creative' | 'stressed',
  tasks: Task[]
): Promise<{
  recommendedTask: Task | null;
  reasoning: string;
  alternatives: Task[];
}> {
  if (tasks.length === 0) {
    return { recommendedTask: null, reasoning: '', alternatives: [] };
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const tasksInfo = tasks
    .filter(t => t.status === 'pending')
    .map((t, i) => `${i + 1}. ${t.title} (${t.category}, ${t.estimatedDuration}min, ${t.priority.level} priority)`)
    .join('\n');

  const prompt = `User is feeling ${mood} right now.

Available tasks:
${tasksInfo}

Based on their mood, which task should they work on? Consider:
- Energetic: Complex, challenging tasks
- Focused: Deep work, important tasks
- Tired: Simple, mechanical tasks
- Creative: Open-ended, brainstorming tasks
- Stressed: Easy wins, calming tasks

Return ONLY valid JSON:
{
  "taskIndex": 0,
  "reasoning": "Why this task matches their mood",
  "alternativeIndexes": [1, 2]
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    let cleaned = response.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }
    
    const parsed = JSON.parse(cleaned);
    const pendingTasks = tasks.filter(t => t.status === 'pending');
    
    return {
      recommendedTask: pendingTasks[parsed.taskIndex] || pendingTasks[0],
      reasoning: parsed.reasoning,
      alternatives: parsed.alternativeIndexes
        .map((idx: number) => pendingTasks[idx])
        .filter(Boolean)
    };
  } catch (error) {
    console.error("Error in mood matching:", error);
    return {
      recommendedTask: tasks.filter(t => t.status === 'pending')[0] || null,
      reasoning: "Start with the highest priority task",
      alternatives: []
    };
  }
}

/**
 * 🌟 UNIQUE: Procrastination Detector
 * Detects patterns of task avoidance
 */
export async function detectProcrastination(
  task: Task,
  viewCount: number,
  lastViewedMinutesAgo: number
): Promise<{
  isProcrastinating: boolean;
  confidence: number;
  suggestion: string;
  technique: string;
}> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Analyze if user is procrastinating on this task:

Task: ${task.title}
Priority: ${task.priority.level}
Times viewed without starting: ${viewCount}
Last viewed: ${lastViewedMinutesAgo} minutes ago
Deadline: ${task.deadline ? new Date(task.deadline).toISOString() : 'None'}

Return ONLY valid JSON:
{
  "isProcrastinating": true/false,
  "confidence": 0-100,
  "suggestion": "Specific actionable advice",
  "technique": "Pomodoro/2-min rule/Task breakdown/Accountability buddy"
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    let cleaned = response.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }
    
    return JSON.parse(cleaned);
  } catch (error) {
    return {
      isProcrastinating: viewCount > 3,
      confidence: 50,
      suggestion: "Try the 2-minute rule: just start for 2 minutes",
      technique: "2-min rule"
    };
  }
}

/**
 * 🌟 UNIQUE: Task Difficulty Estimator
 * Predicts how challenging a task will be
 */
export async function estimateTaskDifficulty(
  task: Task
): Promise<{
  difficulty: 'trivial' | 'easy' | 'moderate' | 'hard' | 'very-hard';
  score: number;
  factors: string[];
  tips: string[];
}> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Estimate the difficulty of this task:

Task: ${task.title}
Description: ${task.description || 'None'}
Category: ${task.category}
Estimated Duration: ${task.estimatedDuration} minutes

Return ONLY valid JSON:
{
  "difficulty": "trivial/easy/moderate/hard/very-hard",
  "score": 0-100,
  "factors": ["Factor 1", "Factor 2"],
  "tips": ["Tip 1", "Tip 2"]
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    let cleaned = response.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }
    
    return JSON.parse(cleaned);
  } catch (error) {
    return {
      difficulty: 'moderate',
      score: 50,
      factors: ["Unknown complexity"],
      tips: ["Break into smaller steps"]
    };
  }
}

/**
 * 🌟 UNIQUE: Smart Break Suggester
 * Tells user when and how to take breaks
 */
export async function suggestBreak(
  minutesWorked: number,
  tasksCompleted: number,
  currentTaskDifficulty: string
): Promise<{
  shouldBreak: boolean;
  breakType: 'micro' | 'short' | 'long';
  duration: number;
  activity: string;
  reasoning: string;
}> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `User has been working for ${minutesWorked} minutes, completed ${tasksCompleted} tasks.
Current task difficulty: ${currentTaskDifficulty}

Should they take a break? What kind?

Break types:
- micro: 2-5 min (stretch, water)
- short: 10-15 min (walk, snack)
- long: 30-60 min (meal, exercise)

Return ONLY valid JSON:
{
  "shouldBreak": true/false,
  "breakType": "micro/short/long",
  "duration": 5,
  "activity": "Specific suggestion",
  "reasoning": "Why take this break now"
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    let cleaned = response.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }
    
    return JSON.parse(cleaned);
  } catch (error) {
    // Simple fallback logic
    const shouldBreak = minutesWorked >= 50;
    return {
      shouldBreak,
      breakType: minutesWorked >= 90 ? 'long' : 'short',
      duration: minutesWorked >= 90 ? 30 : 10,
      activity: "Take a short walk and hydrate",
      reasoning: "You've been focused for a while"
    };
  }
}

/**
 * 🌟 UNIQUE: Productivity Pattern Analyzer
 * Analyzes user's productivity patterns
 */
export async function analyzeProductivityPattern(
  tasks: Task[]
): Promise<{
  bestTimeOfDay: string;
  mostProductiveCategory: string;
  averageCompletionTime: number;
  insights: string[];
  recommendations: string[];
}> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const completedTasks = tasks.filter(t => t.status === 'completed');
  
  const tasksInfo = completedTasks.map(t => ({
    category: t.category,
    completedAt: t.completedAt ? new Date(t.completedAt).getHours() : null,
    duration: t.actualDuration || t.estimatedDuration
  }));

  const prompt = `Analyze this user's productivity patterns:

Completed tasks data:
${JSON.stringify(tasksInfo, null, 2)}

Identify patterns and provide insights.

Return ONLY valid JSON:
{
  "bestTimeOfDay": "morning/afternoon/evening",
  "mostProductiveCategory": "work/personal/etc",
  "averageCompletionTime": 45,
  "insights": ["Pattern 1", "Pattern 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    let cleaned = response.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }
    
    return JSON.parse(cleaned);
  } catch (error) {
    return {
      bestTimeOfDay: "morning",
      mostProductiveCategory: "work",
      averageCompletionTime: 45,
      insights: ["You're building good habits!"],
      recommendations: ["Keep up the momentum"]
    };
  }
}

/**
 * 🌟 UNIQUE: AI Focus Music Suggester
 * Suggests music/sounds based on task
 */
export async function suggestFocusSound(
  task: Task,
  userPreference?: 'music' | 'nature' | 'ambient' | 'silence'
): Promise<{
  type: string;
  name: string;
  reason: string;
  youtubeQuery: string;
}> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Suggest focus sound for this task:

Task: ${task.title}
Category: ${task.category}
Difficulty: ${task.priority.level}
User prefers: ${userPreference || 'any'}

Return ONLY valid JSON:
{
  "type": "lofi/classical/nature/ambient/white-noise",
  "name": "Specific playlist name",
  "reason": "Why this helps",
  "youtubeQuery": "search term"
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    let cleaned = response.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }
    
    return JSON.parse(cleaned);
  } catch (error) {
    return {
      type: "lofi",
      name: "Lofi Hip Hop Study Mix",
      reason: "Helps maintain focus without distraction",
      youtubeQuery: "lofi study music"
    };
  }
}