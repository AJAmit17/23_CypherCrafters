import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenerativeAIStream, Message, StreamingTextResponse } from 'ai';
import { db } from "@/lib/db";
import { redirect } from 'next/navigation';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API || '');

const formatCourseResponse = (courses: any[]) => {
  console.log('[formatCourseResponse] Full course details:', JSON.stringify(courses, null, 2));
  console.log('[formatCourseResponse] Formatting courses:', courses.length);
  return courses.map(course => ({
    role: 'assistant',
    content: [
      `📚 ${course.title}`,
      `📖 ${course.description?.substring(0, 100)}${course.description?.length > 100 ? '...' : ''}`,
      `💰 Price: ${course.price ? `$${course.price.toFixed(2)}` : 'Free'}`,
      `🏷️ Category: ${course.category?.name || 'Uncategorized'}`,
      `📝 Chapters: ${course.chapters.length}`,
      `👥 Students Enrolled: ${course.purchases.length}`,
      ''  // Empty line for spacing
    ].join('\n')
  }));
};

const handleCourseQuery = async (limit?: number, sortBy: 'recent' | 'popular' = 'recent') => {
  console.log('[handleCourseQuery] Fetching courses with params:', { limit, sortBy });
  try {
    const courses = await db.course.findMany({
      where: { 
        isPublished: true 
      },
      select: {
        title: true,
        description: true,
        price: true,
        category: {
          select: { name: true }
        },
        chapters: {
          select: { id: true }
        },
        purchases: true,
        createdAt: true
      },
      orderBy: sortBy === 'recent' 
        ? { createdAt: 'desc' }
        : {
            purchases: {
              _count: 'desc'
            }
          },
      take: limit
    });
    console.log('[handleCourseQuery] Detailed course results:', JSON.stringify({
      totalCourses: courses.length,
      courseDetails: courses.map(course => ({
        title: course.title,
        price: course.price,
        category: course.category?.name,
        studentsCount: course.purchases.length,
        chaptersCount: course.chapters.length,
        createdAt: course.createdAt
      }))
    }, null, 2));
    console.log(`[handleCourseQuery] Successfully fetched ${courses.length} courses`);
    return courses;
  } catch (error) {
    console.error('[handleCourseQuery] Database error:', error);
    throw error;
  }
};

export async function POST(req: Request) {
  console.log('[POST] Received chat request');
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1].content.toLowerCase();
    console.log('[POST] Processing message:', lastMessage);

    // Handle different course listing scenarios
    if (lastMessage.includes('course') || lastMessage.includes('courses')) {
      console.log('[POST] Detected course-related query');
      
      // If user specifically asks to see all courses, redirect to browse page
      if (lastMessage.includes('show all') || lastMessage.includes('view all') || lastMessage.includes('browse')) {
        return new Response(JSON.stringify({
          role: 'assistant',
          content: "Redirecting you to the course browse page...",
          redirect: '/browse'
        }));
      }
      
      // For other course queries, show summary and provide link
      const limit = lastMessage.includes('all') ? undefined : 5;
      const sortBy = lastMessage.includes('popular') ? 'popular' : 'recent';
      
      try {
        const courses = await handleCourseQuery(limit, sortBy);
        const responseMessage = `Here are the ${sortBy} courses. To see all courses, say "show all courses" or click here: /browse\n\n`;
        
        if (courses.length > 0) {
          const formattedResponse = {
            role: 'assistant',
            content: responseMessage + formatCourseResponse(courses).map(c => c.content).join('\n'),
            actionLink: '/browse'  // Add an action link that the frontend can use
          };

          return new Response(JSON.stringify(formattedResponse));
        }
      } catch (error) {
        console.error('[POST] Error fetching courses:', error);
        throw error;
      }
    }

    // For all other queries, use Gemini AI
    console.log('[POST] Delegating to Gemini AI');
    const geminiStream = await genAI
      .getGenerativeModel({ model: 'gemini-pro' })
      .generateContentStream({
        contents: messages.map((message: { role: string; content: any; }) => ({
          role: message.role === 'user' ? 'user' : 'model',
          parts: [{ text: message.content }],
        }))
      });

    console.log('[POST] Successfully generated Gemini AI response');
    return new StreamingTextResponse(GoogleGenerativeAIStream(geminiStream));

  } catch (error) {
    console.error('[POST] Error in chat API:', error);
    if (error instanceof Error) {
      console.error('[POST] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    return new Response(
      JSON.stringify({
        role: 'assistant',
        content: "An error occurred while processing your request. Please try again."
      }),
      { status: 500 }
    );
  }
}