import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenerativeAIStream, Message, StreamingTextResponse } from 'ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API || '');

const buildGoogleGenAIPrompt = (messages: Message[]) => {
  const message = messages[0]?.content || '';
  return {
    contents: [{
      role: 'user',
      parts: [{
        text: `Generate a refined course title and description based on: ${message}

IMPORTANT: Respond ONLY with a valid JSON object in exactly this format, with no additional text:
{
  "refinedTitle": "Your refined course title here",
  "description": "Your course description here"
}

RULES:
- Must be valid JSON
- No text before or after the JSON object
- No formatting or markdown
- No explanations or comments
- Fields must be exactly as shown above`
      }]
    }]
  };
};

export async function POST(req: Request) {
  try {
    if (!process.env.GOOGLE_GEMINI_API) {
      throw new Error('GOOGLE_GEMINI_API is not configured');
    }

    const { messages } = await req.json();
    if (!messages?.length) {
      throw new Error('No messages provided');
    }

    console.log('Generating content with prompt:', messages[0].content);

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const geminiStream = await model.generateContentStream(
      buildGoogleGenAIPrompt(messages)
    );

    if (!geminiStream) {
      throw new Error('Failed to get response from Gemini');
    }

    const stream = GoogleGenerativeAIStream(geminiStream);
    return new StreamingTextResponse(stream);
  } catch (error: any) {
    console.error('[CONTENT_ERROR]', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal Server Error',
        details: error.stack
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}