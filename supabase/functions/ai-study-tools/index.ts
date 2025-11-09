import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  text: string;
  action: 'qa' | 'lesson' | 'flashcards' | 'summarize' | 'quiz';
  question?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, action, question }: RequestBody = await req.json();
    
    if (!text) {
      throw new Error('Text is required');
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';

    switch (action) {
      case 'qa':
        if (!question) {
          throw new Error('Question is required for Q&A action');
        }
        systemPrompt = `You are an expert Q&A assistant. Answer the user's question ONLY using the provided text. If the answer is not in the text, state clearly that the information cannot be found in the document.

--- PROVIDED DOCUMENT TEXT ---
${text}
--- END OF DOCUMENT TEXT ---`;
        userPrompt = question;
        break;

      case 'lesson':
        systemPrompt = 'You are an expert educator. Create a structured, comprehensive lesson from the provided text.';
        userPrompt = `Create a detailed lesson plan from this text. Include:
1. Learning Objectives (3-5 key points)
2. Main Concepts (organized by topics)
3. Key Terminology (definitions)
4. Summary
5. Practice Questions (3-5 questions)

Text:
${text}`;
        break;

      case 'flashcards':
        systemPrompt = 'You are an expert at creating educational flashcards. Extract key concepts and create clear, concise flashcards.';
        userPrompt = `Create 8-12 flashcards from this text. Format each as:
FRONT: [Question or term]
BACK: [Answer or definition]

Make them concise and focused on key concepts.

Text:
${text}`;
        break;

      case 'summarize':
        systemPrompt = 'You are an expert at creating clear, concise summaries while preserving key information.';
        userPrompt = `Create a comprehensive summary of this text. Include:
1. Main Ideas (3-5 bullet points)
2. Key Details
3. Important Conclusions

Keep it clear and organized.

Text:
${text}`;
        break;

      case 'quiz':
        systemPrompt = 'You are an expert at creating engaging educational quizzes.';
        userPrompt = `Create a 10-question quiz from this text. Format each question as:

Q[number]: [Question]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
Correct Answer: [A/B/C/D]
Explanation: [Brief explanation]

Mix question types: factual recall, comprehension, and application.

Text:
${text}`;
        break;

      default:
        throw new Error('Invalid action');
    }

    console.log(`Processing ${action} request`);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt },
                { text: userPrompt }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!result) {
      throw new Error('No response from Gemini API');
    }

    return new Response(
      JSON.stringify({ result }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in ai-study-tools function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
