import { GoogleGenerativeAI } from '@google/generative-ai';

// Lazy initialization - will be set on first use
let genAI = null;
let initialized = false;

function initializeAI() {
  if (initialized) return;
  initialized = true;
  
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('═══════════════════════════════════════════════════════');
  console.log('🤖 AI PRIORITY SERVICE INITIALIZATION');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`   API Key: ${apiKey ? `${apiKey.substring(0, 10)}...*** (CONFIGURED ✅)` : 'NOT CONFIGURED ❌'}`);
  console.log('═══════════════════════════════════════════════════════');
  
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
  
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║          🤖 AI PRIORITY ANALYSIS STARTED              ║');
  console.log('╠═══════════════════════════════════════════════════════╣');
  console.log(`║ Category: ${category.padEnd(43)}║`);
  console.log(`║ Title: ${title.substring(0, 45).padEnd(46)}║`);
  console.log(`║ Content: ${content.substring(0, 43).padEnd(44)}...║`);
  console.log('╚═══════════════════════════════════════════════════════╝');
  
  // If no API key, return default priority
  if (!genAI) {
    console.log('⚠️  AI NOT AVAILABLE - No Gemini API key configured');
    console.log('   Returning default priority: medium');
    return { priority: 'medium', reason: 'Default priority (AI not configured)', aiAnalyzed: false };
  }

  const maxRetries = 3;
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📤 Sending to Google Gemini AI... (Attempt ${attempt}/${maxRetries})`);
      const startTime = Date.now();
      
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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
      const elapsed = Date.now() - startTime;
      
      console.log(`📥 Gemini Response (${elapsed}ms):`);
      console.log(`   Raw: ${text}`);
      
      // Parse the JSON response - handle various formats
      let cleanText = text;
      // Remove markdown code blocks
      cleanText = cleanText.replace(/```json\s*/gi, '').replace(/```\s*/g, '');
      // Remove any leading/trailing whitespace
      cleanText = cleanText.trim();
      
      try {
        const parsed = JSON.parse(cleanText);
        
        // Validate priority value
        const validPriorities = ['low', 'medium', 'high', 'urgent'];
        if (parsed.priority && validPriorities.includes(parsed.priority.toLowerCase())) {
          const finalPriority = parsed.priority.toLowerCase();
          console.log('');
          console.log('╔═══════════════════════════════════════════════════════╗');
          console.log('║          ✅ AI ANALYSIS COMPLETE                      ║');
          console.log('╠═══════════════════════════════════════════════════════╣');
          console.log(`║ Priority: ${finalPriority.toUpperCase().padEnd(42)}║`);
          console.log(`║ Reason: ${(parsed.reason || 'N/A').substring(0, 44).padEnd(45)}║`);
          console.log('╚═══════════════════════════════════════════════════════╝');
          console.log('');
          return {
            priority: finalPriority,
            reason: parsed.reason || 'AI-determined priority',
            aiAnalyzed: true
          };
        } else {
          console.log('⚠️  Invalid priority value from AI:', parsed.priority);
        }
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError.message);
        console.error('   Raw text was:', cleanText);
      }

      // If we got here, parsing failed but no network error
      console.log('⚠️  Falling back to medium priority');
      return { priority: 'medium', reason: 'Could not parse AI response', aiAnalyzed: false };

    } catch (error) {
      lastError = error;
      console.error(`❌ Attempt ${attempt} failed:`, error.message);
      
      // Check if it's a retryable error (503, 429, etc.)
      const isRetryable = error.message.includes('503') || 
                          error.message.includes('overloaded') ||
                          error.message.includes('429') ||
                          error.message.includes('rate limit');
      
      if (isRetryable && attempt < maxRetries) {
        const waitTime = attempt * 2000; // 2s, 4s, 6s
        console.log(`⏳ Retrying in ${waitTime/1000}s...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else if (!isRetryable) {
        // Non-retryable error, break immediately
        break;
      }
    }
  }

  // All retries failed
  console.error('');
  console.error('╔═══════════════════════════════════════════════════════╗');
  console.error('║          ❌ AI ANALYSIS FAILED                        ║');
  console.error('╠═══════════════════════════════════════════════════════╣');
  console.error(`║ Error: ${(lastError?.message || 'Unknown').substring(0, 45).padEnd(46)}║`);
  console.error('╚═══════════════════════════════════════════════════════╝');
  console.error('');
  return { priority: 'medium', reason: 'AI analysis error: ' + (lastError?.message || 'Unknown error'), aiAnalyzed: false };
}

export default { analyzePriority };
