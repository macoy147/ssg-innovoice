import Groq from 'groq-sdk';

// Lazy initialization - will be set on first use
let groq = null;
let initialized = false;

function initializeAI() {
  if (initialized) return;
  initialized = true;
  
  const apiKey = process.env.GROQ_API_KEY;
  console.log('═══════════════════════════════════════════════════════');
  console.log('🤖 AI PRIORITY SERVICE INITIALIZATION (Groq)');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`   API Key: ${apiKey ? `${apiKey.substring(0, 10)}...*** (CONFIGURED ✅)` : 'NOT CONFIGURED ❌'}`);
  console.log('═══════════════════════════════════════════════════════');
  
  if (apiKey) {
    groq = new Groq({ apiKey });
  }
}

/**
 * Analyzes suggestion content and determines priority level using Groq AI
 * @param {string} title - Suggestion title
 * @param {string} content - Suggestion content/description
 * @param {string} category - Suggestion category
 * @returns {Promise<{priority: string, reason: string, aiAnalyzed: boolean}>}
 */
export async function analyzePriority(title, content, category) {
  // Initialize on first call (after dotenv has loaded)
  initializeAI();
  
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║          🤖 AI PRIORITY ANALYSIS STARTED (Groq)       ║');
  console.log('╠═══════════════════════════════════════════════════════╣');
  console.log(`║ Category: ${category.padEnd(43)}║`);
  console.log(`║ Title: ${title.substring(0, 45).padEnd(46)}║`);
  console.log(`║ Content: ${content.substring(0, 43).padEnd(44)}...║`);
  console.log('╚═══════════════════════════════════════════════════════╝');
  
  // If no API key, return default priority
  if (!groq) {
    console.log('⚠️  AI NOT AVAILABLE - No Groq API key configured');
    console.log('   Returning default priority: medium');
    return { priority: 'medium', reason: 'Default priority (AI not configured)', aiAnalyzed: false };
  }

  const maxRetries = 3;
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📤 Sending to Groq AI... (Attempt ${attempt}/${maxRetries})`);
      const startTime = Date.now();

      const prompt = `You are a SAFETY-FIRST AI assistant for a university student suggestion system (CTU Daanbantayan Campus, Cebu, Philippines).

CRITICAL RULE: When in doubt about safety, ALWAYS choose the higher priority level. Student safety is the TOP priority.

Students may write in English, Tagalog, Bisaya/Cebuano, or mixed languages. You MUST understand all.

PRIORITY LEVELS - Read carefully:

🔴 "urgent" - USE THIS FOR ANY OF THESE:
   - Broken/damaged infrastructure (railings, stairs, floors, ceilings, walls, doors)
   - Safety hazards (exposed wires, broken glass, slippery floors, flooding)
   - Health risks (mold, pests, contaminated water, no ventilation)
   - Security threats (broken locks, no lighting, unsafe areas)
   - Harassment, bullying, abuse, discrimination, violence
   - Medical emergencies, injuries
   - Fire hazards, blocked exits
   - Keywords: broken, sira, guba, dangerous, delikado, unsafe, hazard, injury, hurt, accident, emergency

🟠 "high" - USE THIS FOR:
   - Issues affecting many students academically
   - Time-sensitive problems (exam week issues, deadline-related)
   - Major facility problems (no water, no electricity, broken AC in hot weather)
   - Important requests needing quick action

🟡 "medium" - USE THIS FOR:
   - General improvements and suggestions
   - Quality of life enhancements
   - Standard facility requests (more chairs, better WiFi)
   - Comfort improvements

🟢 "low" - USE THIS FOR:
   - Cosmetic changes (paint, decorations)
   - Nice-to-have features
   - Plants, aesthetic improvements
   - Minor additions

SUGGESTION TO ANALYZE:
Category: ${category}
Title: ${title}
Description: ${content}

IMPORTANT: A broken railing IS urgent because someone could fall and get seriously injured or die. Any structural damage that could cause injury is URGENT.

RESPOND WITH ONLY THIS JSON (no other text):
{"priority":"medium","reason":"Explain what the student wants and why you chose this priority level."}`;

      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        max_tokens: 200,
      });

      const text = completion.choices[0]?.message?.content?.trim() || '';
      const elapsed = Date.now() - startTime;
      
      console.log(`📥 Groq Response (${elapsed}ms):`);
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
                          error.message.includes('rate limit') ||
                          error.message.includes('timeout');
      
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
  return { 
    priority: 'medium', 
    reason: 'AI service temporarily unavailable. Default priority assigned - admin will review manually.', 
    aiAnalyzed: false 
  };
}

export default { analyzePriority };
