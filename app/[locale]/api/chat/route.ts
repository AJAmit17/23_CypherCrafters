import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenerativeAIStream, Message, StreamingTextResponse } from 'ai';
import { db } from "@/lib/db";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API || '');

const handleCourseQuery = async (limit?: number, sortBy: 'recent' | 'popular' = 'recent') => {
  console.log(`[handleCourseQuery] Starting query with limit: ${limit}, sortBy: ${sortBy}`);
  
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

    console.log(`[handleCourseQuery] Found ${courses.length} courses`);
    console.log('[handleCourseQuery] First course sample:', courses[0]);
    
    return courses;
  } catch (error) {
    console.error('[handleCourseQuery] Error fetching courses:', error);
    throw error;
  }
};

export async function POST(req: Request) {
  console.log('[POST] Starting request handling');
  
  try {
    const { messages } = await req.json();
    console.log('[POST] Received messages:', messages);
    
    const lastMessage = messages[messages.length - 1].content.toLowerCase();
    console.log('[POST] Last message:', lastMessage);

    // Handle different course listing scenarios
    if (lastMessage.includes('course') || lastMessage.includes('courses')) {
      console.log('[POST] Detected course-related query');
      
      let courses: any[] = [];
      let responseMessage = '';

      if (lastMessage.includes('top 5') || lastMessage.includes('top five')) {
        console.log('[POST] Handling top 5 courses query');
        courses = await handleCourseQuery(5, 'popular');
        responseMessage = 'Here are our top 5 most popular courses:\n\n';
      } 
      else if (lastMessage.includes('recent')) {
        console.log('[POST] Handling recent courses query');
        courses = await handleCourseQuery(5, 'recent');
        responseMessage = 'Here are our 5 most recent courses:\n\n';
      }
      else if (lastMessage.includes('list')) {
        console.log('[POST] Handling list all courses query');
        courses = await handleCourseQuery();
        responseMessage = 'Here are all our available courses:\n\n';
      }

      if (courses.length > 0) {
        console.log(`[POST] Processing ${courses.length} courses for response`);
        
        const response = {
          role: 'assistant',
          content: responseMessage,
          courses: courses.map(course => ({
            title: course.title,
            description: course.description,
            price: course.price,
            category: course.category?.name,
            chaptersLength: course.chapters.length,
            studentsEnrolled: course.purchases.length
          }))
        };

        console.log('[POST] Final response:', response);
        
        return new Response(JSON.stringify(response), {
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } else {
        console.log('[POST] No courses found');
        return new Response(
          JSON.stringify({
            role: 'assistant',
            content: "No courses found matching your criteria."
          }),
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }
    }

    console.log('[POST] Using Gemini AI for non-course query');
    const geminiStream = await genAI
      .getGenerativeModel({ model: 'gemini-pro' })
      .generateContentStream({
        contents: messages.map((message: { role: string; content: any; }) => ({
          role: message.role === 'user' ? 'user' : 'model',
          parts: [{ text: message.content }],
        }))
      });

    console.log('[POST] Streaming Gemini response');
    return new StreamingTextResponse(GoogleGenerativeAIStream(geminiStream));

  } catch (error) {
    console.error('[POST] Error in request handling:', error);
    return new Response(
      JSON.stringify({
        role: 'assistant',
        content: "An error occurred while processing your request. Please try again."
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}