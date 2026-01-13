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

      const prompt = `You are a SAFETY-FIRST AI for CTU Daanbantayan Campus student suggestions. Students write in English, Tagalog, or Bisaya.

PRIORITY CLASSIFICATION STANDARDS:

🔴 URGENT - Immediate action required (safety/emergency):
Examples that ARE urgent:
- "Broken railing on stairs" → URGENT (fall hazard, could cause death/injury)
- "Sira ang hagdan" (broken stairs) → URGENT
- "Guba ang railing" (broken railing) → URGENT  
- "Exposed electrical wires in classroom" → URGENT
- "Ceiling is about to collapse" → URGENT
- "Someone is being bullied/harassed" → URGENT
- "No fire extinguisher in building" → URGENT
- "Broken glass on the floor" → URGENT
- "Flooded hallway, slippery" → URGENT
- "Broken door lock in CR" → URGENT (security)
- "No lights in parking area at night" → URGENT (security)
- "Student threatening violence" → URGENT
- "Mold in classroom causing sickness" → URGENT

🟠 HIGH - Needs quick attention (affects many/time-sensitive):
Examples that ARE high:
- "Library closes too early during exam week" → HIGH
- "All computers in lab are broken" → HIGH
- "No water in entire building" → HIGH
- "AC broken during summer, too hot to study" → HIGH
- "Enrollment system is down" → HIGH
- "Professor hasn't shown up for 3 weeks" → HIGH
- "Grades not posted before deadline" → HIGH

🟡 MEDIUM - General improvements (quality of life):
Examples that ARE medium:
- "Add more electric fans" → MEDIUM
- "Need more chairs in classroom" → MEDIUM
- "WiFi is slow" → MEDIUM
- "Add soap in CR" → MEDIUM
- "Water dispenser needed" → MEDIUM
- "Extend library hours" → MEDIUM
- "More outlets for charging" → MEDIUM
- "Better food options in canteen" → MEDIUM

🟢 LOW - Nice to have (cosmetic/minor):
Examples that ARE low:
- "Add plants for decoration" → LOW
- "Paint the walls a different color" → LOW
- "Add motivational posters" → LOW
- "New curtains for classroom" → LOW
- "Add a bulletin board" → LOW
- "More trash bins" → LOW
- "Benches in the garden" → LOW

CRITICAL RULES:
1. ANY broken infrastructure (railings, stairs, floors, ceilings, doors, windows) = URGENT
2. ANY safety hazard that could cause injury = URGENT
3. ANY harassment, bullying, abuse, threats = URGENT
4. When unsure between two levels, ALWAYS pick the higher one
5. "Sira", "guba", "broken", "damaged" + infrastructure = URGENT

ANALYZE THIS SUGGESTION:
Category: ${category}
Title: ${title}
Description: ${content}

Respond ONLY with this JSON:
{"priority":"medium","reason":"Brief explanation of what student wants and why this priority."}`;

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
