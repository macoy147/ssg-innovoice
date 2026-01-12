import { GoogleGenerativeAI } from '@google/generative-ai';

// Lazy initialization - will be set on first use
let genAI = null;
let initialized = false;

function initializeAI() {
  if (initialized) return;
  initialized = true;
  
  const apiKey = process.env.GEMINI_API_KEY;
  console.log(`🤖 AI Service: API Key ${apiKey ? 'CONFIGURED ✅' : 'NOT CONFIGURED ❌'}`);
  
  if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
  }
}

/**
 * Analyzes suggestion content and determines priority level
 * @param {string} title - Suggestion title
 * @param {string} content - Suggestion content/description
 * @param {string} category - Suggestion category
 * @returns {Promise<{priority: string, reason: string}>}
 */
export async function analyzePriority(title, content, category) {
  // Initialize on first call (after dotenv has loaded)
  initializeAI();
  
  console.log('🤖 AI Priority: Function called');
  console.log(`   Title: ${title}`);
  console.log(`   Category: ${category}`);
  console.log(`   Content length: ${content?.length || 0} chars`);
  
  // If no API key, return default priority
  if (!genAI) {
    console.log('⚠️ AI Priority: No Gemini API key configured, using default priority');
    return { priority: 'medium', reason: 'Default priority (AI not configured)' };
  }

  try {
    console.log('🤖 AI Priority: Sending to Gemini...');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    const prompt = `You are an AI assistant helping categorize student suggestions for a university (CTU Daanbantayan Campus).

Your task: Analyze the suggestion and assign a priority level.

PRIORITY LEVELS (choose ONE):
- "urgent" = Safety issues, harassment, abuse, bullying, health emergencies, security threats, broken critical equipment, discrimination
- "high" = Affects many students, time-sensitive, major facility problems, academic issues affecting grades, important requests
- "medium" = General improvements, moderate impact, quality of life suggestions, standard facility requests
- "low" = Minor cosmetic changes, nice-to-have features, long-term ideas, simple additions like trash bins or decorations

SUGGESTION TO ANALYZE:
Category: ${category}
Title: ${title}
Description: ${content}

RESPOND WITH ONLY THIS JSON FORMAT (no other text):
{"priority":"low","reason":"one sentence explanation"}

Remember: "low" is for minor things like adding trash bins, plants, decorations. "medium" is for moderate improvements. "high" is for important issues. "urgent" is ONLY for safety/emergency situations.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    console.log('🤖 AI Priority: Raw response:', text);
    
    // Parse the JSON response - handle various formats
    let cleanText = text;
    // Remove markdown code blocks
    cleanText = cleanText.replace(/```json\s*/gi, '').replace(/```\s*/g, '');
    // Remove any leading/trailing whitespace
    cleanText = cleanText.trim();
    
    console.log('🤖 AI Priority: Cleaned response:', cleanText);
    
    try {
      const parsed = JSON.parse(cleanText);
      
      // Validate priority value
      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      if (parsed.priority && validPriorities.includes(parsed.priority.toLowerCase())) {
        const finalPriority = parsed.priority.toLowerCase();
        console.log(`✅ AI Priority: Set to "${finalPriority}" - ${parsed.reason}`);
        return {
          priority: finalPriority,
          reason: parsed.reason || 'AI-determined priority'
        };
      } else {
        console.log('⚠️ AI Priority: Invalid priority value:', parsed.priority);
      }
    } catch (parseError) {
      console.error('❌ AI Priority: JSON parse error:', parseError.message);
      console.error('   Raw text was:', cleanText);
    }

    // Default fallback
    console.log('⚠️ AI Priority: Falling back to medium');
    return { priority: 'medium', reason: 'Could not determine priority' };

  } catch (error) {
    console.error('❌ AI Priority Error:', error.message);
    return { priority: 'medium', reason: 'AI analysis unavailable' };
  }
}

export default { analyzePriority };
