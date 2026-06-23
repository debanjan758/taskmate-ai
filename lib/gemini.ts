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
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
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
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }
    
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Error calculating priority:", error);
    // Return default priority
    return {
      priorityScore: 50,
      level: "medium",
      reasoning: "Default priority assigned"
    };
  }
}

/**
 * Test connection to Gemini API
 */
export async function testGeminiConnection() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Say hello!");
    return {
      success: true,
      message: result.response.text()
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}