import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenerativeAIStream, StreamingTextResponse } from 'ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API || '');

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const geminiStream = await genAI
      .getGenerativeModel({ model: 'gemini-pro' })
      .generateContentStream({
        contents: messages.map((message: { role: string; content: any; }) => ({
          role: message.role === 'user' ? 'user' : 'model',
          parts: [{ text: message.content }],
        }))
      });

    return new StreamingTextResponse(GoogleGenerativeAIStream(geminiStream));
  } catch (error) {
    console.error('[POST] Error:', error);
    return new Response(
      JSON.stringify({
        role: 'assistant',
        content: "Sorry, an error occurred. Please try again."
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}