import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;

if (!apiKey) {
  throw new Error("NEXT_PUBLIC_GOOGLE_AI_API_KEY is not defined");
}

const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Extract structured task information from natural language input
 */
export async function extractTaskFromInput(userInput: string) {
  console.log("🤖 AI Processing: extractTaskFromInput");

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
You are a task management AI assistant. Extract structured task information from user input.

User input: "${userInput}"

Current date and time: ${new Date().toISOString()}

Extract and return ONLY valid JSON (no markdown, no code blocks):
{
  "tasks": [
    {
      "title": "concise task title",
      "description": "detailed description",
      "deadline": "ISO 8601 datetime or null if not mentioned",
      "priority": "high/medium/low",
      "estimatedDuration": 60,
      "category": "work/personal/health/finance/other"
    }
  ]
}

Rules:
- If deadline is relative (e.g., "tomorrow", "next Monday"), calculate the actual date
- Estimate duration in minutes based on task complexity
- Infer priority from urgency words or deadline proximity
- If multiple tasks mentioned, create separate task objects
`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Remove markdown code blocks if present
    let cleaned = response.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    }

    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (error) {
    console.error("Error extracting task:", error);
    throw new Error("Failed to process task input");
  }
}

/**
 * Calculate priority score for a task
 */
export async function calculatePriority(task: any, context?: any) {
  console.log("🤖 AI Processing: calculatePriority");

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
Analyze this task and calculate a priority score.

Task: ${JSON.stringify(task)}
Current time: ${new Date().toISOString()}

Return ONLY valid JSON:
{
  "priorityScore": 75,
  "level": "high",
  "reasoning": "Deadline is in 4 hours, requires immediate attention"
}

Priority levels: critical (90-100), high (70-89), medium (40-69), low (0-39)
`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    let cleaned = response.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    }

    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Error calculating priority:", error);
    // Return default priority
    return {
      priorityScore: 50,
      level: "medium",
      reasoning: "Default priority assigned",
    };
  }
}

/**
 * Test connection to Gemini API
 */
export async function testGeminiConnection() {
  console.log("🤖 AI Processing: testGeminiConnection");

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });
    const result = await model.generateContent("Say hello!");
    return {
      success: true,
      message: result.response.text(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
/**
 * Break down a task into actionable subtasks
 */
export async function breakdownTask(task: {
  title: string;
  description: string;
  estimatedDuration: number;
}): Promise<string[]> {
  console.log("🤖 AI Processing: breakdownTask");

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
Break down this task into 3-5 specific, actionable subtasks.

Task: ${task.title}
Description: ${task.description}
Estimated Duration: ${task.estimatedDuration} minutes

Return ONLY a JSON array of subtask titles:
["Subtask 1", "Subtask 2", "Subtask 3"]

Make subtasks:
- Specific and actionable
- In logical order
- Small enough to complete in reasonable time
`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    let cleaned = response.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    }

    const subtasks = JSON.parse(cleaned);
    return Array.isArray(subtasks) ? subtasks : [];
  } catch (error) {
    console.error("Error breaking down task:", error);
    return [
      "Review task requirements",
      "Complete main work",
      "Review and finalize",
    ];
  }
}

/**
 * Calculate enhanced priority with context
 */
export async function calculateEnhancedPriority(
  task: any,
  allTasks: any[] = [],
): Promise<{
  priorityScore: number;
  level: "critical" | "high" | "medium" | "low";
  reasoning: string;
  urgencyFactors: string[];
}> {
  console.log("🤖 AI Processing: calculateEnhancedPriority");
  console.log("⏳ Analyzing urgency...");
  console.log("✅ Priority analysis complete");
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const now = new Date();
  const deadline = task.deadline ? new Date(task.deadline) : null;
  const hoursUntilDeadline = deadline
    ? Math.round((deadline.getTime() - now.getTime()) / (1000 * 60 * 60))
    : null;

  const prompt = `
Analyze this task and calculate a priority score (0-100).

Task Details:
- Title: ${task.title}
- Description: ${task.description || "None"}
- Category: ${task.category}
- Estimated Duration: ${task.estimatedDuration} minutes
- Deadline: ${deadline ? deadline.toISOString() : "No deadline"}
- Hours Until Deadline: ${hoursUntilDeadline || "N/A"}

Current Context:
- Current Time: ${now.toISOString()}
- Total Pending Tasks: ${allTasks.length}

Priority Factors to Consider:
1. Time until deadline (if any)
2. Task duration vs time available
3. Task category importance
4. Potential consequences of delay

Return ONLY valid JSON:
{
  "priorityScore": 85,
  "level": "high",
  "reasoning": "Clear, concise explanation",
  "urgencyFactors": ["Factor 1", "Factor 2"]
}

Priority levels:
- critical: 90-100 (immediate action required)
- high: 70-89 (should start soon)
- medium: 40-69 (can be scheduled)
- low: 0-39 (flexible timing)
`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    let cleaned = response.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    }

    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Error calculating priority:", error);

    // Fallback calculation
    let score = 50;
    let level: "critical" | "high" | "medium" | "low" = "medium";

    if (hoursUntilDeadline !== null) {
      if (hoursUntilDeadline < 4) {
        score = 95;
        level = "critical";
      } else if (hoursUntilDeadline < 24) {
        score = 80;
        level = "high";
      } else if (hoursUntilDeadline < 72) {
        score = 60;
        level = "medium";
      } else {
        score = 40;
        level = "low";
      }
    }

    return {
      priorityScore: score,
      level,
      reasoning: "Default priority based on deadline proximity",
      urgencyFactors: ["Deadline-based calculation"],
    };
  }
}

/**
 * Suggest optimal time slots for a task
 */
export async function suggestTimeSlots(
  task: any,
  workHours: { start: string; end: string } = { start: "09:00", end: "17:00" },
): Promise<
  {
    startTime: string;
    endTime: string;
    reasoning: string;
    conflictLevel: "none" | "low" | "medium" | "high";
  }[]
> {
  console.log("🤖 AI Processing: suggestTimeSlots");
  console.log("⏳ Finding optimal schedule...");
  console.log("✅ Time slots generated");

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const now = new Date();
  const deadline = task.deadline ? new Date(task.deadline) : null;

  const prompt = `
Suggest 3 optimal time slots for completing this task.

Task:
- Title: ${task.title}
- Duration: ${task.estimatedDuration} minutes
- Deadline: ${deadline ? deadline.toISOString() : "Flexible"}
- Priority: ${task.priority?.level || "medium"}

Context:
- Current Time: ${now.toISOString()}
- Work Hours: ${workHours.start} - ${workHours.end}
- Today's Date: ${now.toLocaleDateString()}

Return ONLY valid JSON array with 3 suggestions:
[
  {
    "startTime": "2024-01-15T14:00:00",
    "endTime": "2024-01-15T16:00:00",
    "reasoning": "Why this slot is good",
    "conflictLevel": "none"
  }
]

Consider:
- Avoid suggesting past times
- Stay within work hours
- Leave buffer before deadline
- Suggest different day options if beneficial
`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    let cleaned = response.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    }

    const slots = JSON.parse(cleaned);
    return Array.isArray(slots) ? slots.slice(0, 3) : [];
  } catch (error) {
    console.error("Error suggesting time slots:", error);

    // Fallback: suggest next available slots
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    const duration = task.estimatedDuration || 60;

    return [
      {
        startTime: tomorrow.toISOString(),
        endTime: new Date(tomorrow.getTime() + duration * 60000).toISOString(),
        reasoning: "Tomorrow morning - fresh start",
        conflictLevel: "none" as const,
      },
    ];
  }
}

/**
 * Get AI tips for completing a task
 */
export async function getTaskTips(task: any): Promise<string[]> {
  console.log("🤖 AI Processing: getTaskTips");
  console.log("⏳ Generating productivity tips...");
  console.log("✅ Tips generated");

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
Provide 3 helpful tips for completing this task efficiently.

Task: ${task.title}
Description: ${task.description || "None"}
Category: ${task.category}
Duration: ${task.estimatedDuration} minutes

Return ONLY a JSON array of 3 concise, actionable tips:
["Tip 1", "Tip 2", "Tip 3"]

Tips should be:
- Specific to this task
- Actionable
- Help avoid common pitfalls
`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    let cleaned = response.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    }

    const tips = JSON.parse(cleaned);
    return Array.isArray(tips) ? tips : [];
  } catch (error) {
    console.error("Error getting tips:", error);
    return [
      "Break the task into smaller steps",
      "Eliminate distractions before starting",
      "Set a timer to maintain focus",
    ];
  }
}
