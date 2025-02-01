import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API!);

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const { prompt } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const scriptPrompt = `Create a detailed educational video script for: ${prompt}

    Format the response in Markdown:

    # [Title of the Lesson]

    ## Overview
    - Target Audience: [specify]
    - Duration: [length in minutes]
    - Learning Objectives: [bullet points]

    ## Script Structure

    ### 1. Introduction (0:00-0:30)
    - Hook: [attention-grabbing opening]
    - Overview: [what will be covered]
    
    ### 2. Main Content
    #### Section 1: [Name] (Timing)
    - Key Points:
      * [point 1]
      * [point 2]
    - Visuals: [what to show]
    - Script:
      "[exact dialogue]"
    - Examples:
      * [example 1]
      * [example 2]

    ### 3. Conclusion
    - Summary
    - Call to Action
    - Next Steps

    ## Production Notes
    ### Visual Requirements
    - [list of needed visuals]

    ### Engagement Tips
    - [specific tips]

    Make it educational, engaging, and following best practices for video-based learning.`;

    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{ text: scriptPrompt }]
      }],
      generationConfig: {
        maxOutputTokens: 4096,
        temperature: 0.7,
        topP: 0.8,
        topK: 40
      },
    });

    const response = await result.response;
    const scriptData = response.text();

    return NextResponse.json({
      success: true,
      script: scriptData,
      timestamp: new Date().toISOString(),
      prompt: prompt
    });

  } catch (error) {
    console.error("GEMINI_ERROR", error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Error generating video script",
        details: error instanceof Error ? error.message : "Unknown error"
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
