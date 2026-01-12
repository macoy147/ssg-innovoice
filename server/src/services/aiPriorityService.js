import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Analyzes suggestion content and determines priority level
 * @param {string} title - Suggestion title
 * @param {string} content - Suggestion content/description
 * @param {string} category - Suggestion category
 * @returns {Promise<{priority: string, reason: string}>}
 */
export async function analyzePriority(title, content, category) {
  // If no API key, return default priority
  if (!process.env.GEMINI_API_KEY) {
    console.log('No Gemini API key found, using default priority');
    return { priority: 'medium', reason: 'Default priority (AI not configured)' };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an AI assistant for a university student suggestion system at CTU Daanbantayan Campus. 
Analyze the following student suggestion and determine its priority level.

PRIORITY LEVELS:
- "urgent": Safety issues, security concerns, immediate health risks, critical system failures, harassment/discrimination reports
- "high": Significant impact on many students, time-sensitive issues, major facility problems, academic concerns affecting grades
- "medium": General improvements, moderate impact, quality of life enhancements, non-urgent facility requests
- "low": Minor suggestions, cosmetic changes, nice-to-have features, long-term ideas

SUGGESTION DETAILS:
Category: ${category}
Title: ${title}
Content: ${content}

Respond with ONLY a JSON object in this exact format (no markdown, no code blocks):
{"priority": "low|medium|high|urgent", "reason": "brief 1-sentence explanation"}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    // Parse the JSON response
    // Remove any markdown code blocks if present
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    try {
      const parsed = JSON.parse(cleanText);
      
      // Validate priority value
      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      if (validPriorities.includes(parsed.priority)) {
        return {
          priority: parsed.priority,
          reason: parsed.reason || 'AI-determined priority'
        };
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
    }

    // Default fallback
    return { priority: 'medium', reason: 'Could not determine priority' };

  } catch (error) {
    console.error('AI Priority Analysis Error:', error.message);
    // Return default priority on error - don't block submission
    return { priority: 'medium', reason: 'AI analysis unavailable' };
  }
}

export default { analyzePriority };
