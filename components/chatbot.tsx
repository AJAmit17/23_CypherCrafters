"use client"

import React from "react";
import { useChat } from "@ai-sdk/react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Markdown from "react-markdown";
import { useUser } from "@clerk/nextjs";
import { Card } from "./ui/card";

const predefinedPrompts = [
  "list all courses",
  "show top 5 courses",
  "show recent courses",
  "suggest courses for beginners",
  "roadmap for frontend developer",
];

const formatCourseContent = (content: string) => {
  // Check if content contains course listing (indicated by emoji)
  if (content.includes('📚')) {
    // Split content by double newlines to separate courses
    const parts = content.split('\n\n');
    const formattedParts = parts.map(part => {
      if (part.trim().startsWith('📚')) {
        // Wrap each course in a styled div
        return `<div class="p-4 mb-4 rounded-lg bg-gray-50 dark:bg-gray-800">
          ${part.split('\n').join('<br/>')}
        </div>`;
      }
      return part;
    });
    return formattedParts.join('\n');
  }
  return content;
};

const ChatTest = () => {
  const { user } = useUser();
  const { messages, input, setInput, handleInputChange, handleSubmit } = useChat();

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <>
      <div className="min-h-[90vh] w-full flex flex-col items-center justify-center p-4">
        <h1 className="text-center text-3xl font-bold mb-6">
          AI Course Assistant
        </h1>
        
        <div className="mb-3 flex flex-wrap justify-center gap-2">
          {predefinedPrompts.map((prompt, index) => (
            <Card
              key={index}
              onClick={() => handlePromptClick(prompt)}
              className="shadow-md rounded-lg p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <p className="text-sm">{prompt}</p>
            </Card>
          ))}
        </div>

        <div className="mx-auto w-full max-w-4xl">
          <ScrollArea className="mb-4 h-[600px] rounded-md border p-4">
            {messages.map((m) => (
              <div key={m.id} className="mr-6 whitespace-pre-wrap md:mr-12">
                {m.role === "user" && (
                  <div className="mb-6 flex gap-3">
                    <Avatar>
                      <AvatarImage src={user?.imageUrl || ""} />
                      <AvatarFallback className="text-sm">You</AvatarFallback>
                    </Avatar>
                    <div className="mt-1.5">
                      <p className="text-zinc-500 font-semibold">
                        {user?.fullName || 'User'}
                      </p>
                      <div className="mt-1.5 text-sm">
                        <p>{m.content}</p>
                      </div>
                    </div>
                  </div>
                )}

                {m.role === "assistant" && (
                  <div className="mb-6 flex gap-3">
                    <Avatar>
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-emerald-500 text-white">
                        AI
                      </AvatarFallback>
                    </Avatar>
                    <div className="mt-1.5 w-full">
                      <div className="flex justify-between">
                        <p className="text-zinc-500 font-semibold">Course Assistant</p>
                      </div>
                      <div className="mt-2 text-sm prose dark:prose-invert max-w-none">
                        <div 
                          dangerouslySetInnerHTML={{ 
                            __html: formatCourseContent(m.content)
                          }} 
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </ScrollArea>
          
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <Input
              value={input}
              placeholder="Ask about courses or get recommendations..."
              onChange={handleInputChange}
              className="flex-1"
            />
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Send
            </Button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ChatTest;