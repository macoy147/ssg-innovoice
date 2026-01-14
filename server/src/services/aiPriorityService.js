import Groq from 'groq-sdk';

// Lazy initialization - will be set on first use
let groq = null;
let geminiApiKey = null;
let initialized = false;

function initializeAI() {
  if (initialized) return;
  initialized = true;
  
  const groqKey = process.env.GROQ_API_KEY;
  geminiApiKey = process.env.GEMINI_API_KEY;
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('🤖 AI PRIORITY SERVICE INITIALIZATION');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`   Groq API Key: ${groqKey ? `${groqKey.substring(0, 10)}...*** (CONFIGURED ✅)` : 'NOT CONFIGURED ❌'}`);
  console.log(`   Gemini API Key: ${geminiApiKey ? `${geminiApiKey.substring(0, 10)}...*** (CONFIGURED ✅)` : 'NOT CONFIGURED ❌'}`);
  console.log('═══════════════════════════════════════════════════════');
  
  if (groqKey) {
    groq = new Groq({ apiKey: groqKey });
  }
}

// Gemini API call function
async function callGemini(prompt) {
  if (!geminiApiKey) {
    throw new Error('Gemini API key not configured');
  }
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 200,
        }
      })
    }
  );
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${error}`);
  }
  
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

/**
 * Analyzes suggestion content and determines priority level using AI
 * Primary: Groq, Fallback: Google Gemini
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
  console.log('║          🤖 AI PRIORITY ANALYSIS STARTED              ║');
  console.log('╠═══════════════════════════════════════════════════════╣');
  console.log(`║ Category: ${category.padEnd(43)}║`);
  console.log(`║ Title: ${title.substring(0, 45).padEnd(46)}║`);
  console.log(`║ Content: ${content.substring(0, 43).padEnd(44)}...║`);
  console.log('╚═══════════════════════════════════════════════════════╝');
  
  // If no AI configured at all, return default
  if (!groq && !geminiApiKey) {
    console.log('⚠️  AI NOT AVAILABLE - No API keys configured');
    return { priority: 'medium', reason: 'Default priority (AI not configured)', aiAnalyzed: false };
  }

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

  // Helper to parse AI response
  const parseResponse = (text) => {
    let cleanText = text;
    cleanText = cleanText.replace(/```json\s*/gi, '').replace(/```\s*/g, '');
    cleanText = cleanText.trim();
    
    const parsed = JSON.parse(cleanText);
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    
    if (parsed.priority && validPriorities.includes(parsed.priority.toLowerCase())) {
      return {
        priority: parsed.priority.toLowerCase(),
        reason: parsed.reason || 'AI-determined priority',
        aiAnalyzed: true
      };
    }
    throw new Error('Invalid priority value');
  };

  // Try Groq first (primary)
  if (groq) {
    try {
      console.log('📤 Trying Groq AI (primary)...');
      const startTime = Date.now();

      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        max_tokens: 200,
      });

      const text = completion.choices[0]?.message?.content?.trim() || '';
      const elapsed = Date.now() - startTime;
      
      console.log(`📥 Groq Response (${elapsed}ms): ${text.substring(0, 100)}...`);
      
      const result = parseResponse(text);
      console.log(`✅ Groq SUCCESS - Priority: ${result.priority.toUpperCase()}`);
      return result;

    } catch (error) {
      console.error(`❌ Groq failed: ${error.message}`);
      
      // Check if rate limited - try Gemini fallback
      const isRateLimited = error.message.includes('429') || 
                           error.message.includes('rate limit') ||
                           error.message.includes('quota');
      
      if (isRateLimited) {
        console.log('⚠️  Groq rate limited - switching to Gemini fallback...');
      }
    }
  }

  // Try Gemini as fallback
  if (geminiApiKey) {
    try {
      console.log('📤 Trying Google Gemini (fallback)...');
      const startTime = Date.now();

      const text = await callGemini(prompt);
      const elapsed = Date.now() - startTime;
      
      console.log(`📥 Gemini Response (${elapsed}ms): ${text.substring(0, 100)}...`);
      
      const result = parseResponse(text);
      console.log(`✅ Gemini SUCCESS - Priority: ${result.priority.toUpperCase()}`);
      return result;

    } catch (error) {
      console.error(`❌ Gemini failed: ${error.message}`);
    }
  }

  // All AI services failed
  console.error('');
  console.error('╔═══════════════════════════════════════════════════════╗');
  console.error('║          ❌ ALL AI SERVICES FAILED                    ║');
  console.error('║          Returning default medium priority            ║');
  console.error('╚═══════════════════════════════════════════════════════╝');
  console.error('');
  
  return { 
    priority: 'medium', 
    reason: 'AI services temporarily unavailable. Default priority assigned - admin will review manually.', 
    aiAnalyzed: false 
  };
}

export default { analyzePriority };
