"use client"

import React from "react";
import { useChat } from "ai/react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useUser } from "@clerk/nextjs";
import { Card } from "./ui/card";

const predefinedPrompts = [
  "list all courses",
  "show top 5 courses",
  "show recent courses",
  "suggest courses for beginners",
];

const CourseCard = ({ course }: { course: any }) => {
  return (
    <Card className="p-4 mb-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold text-blue-700">{course.title}</h3>
      <p className="text-gray-600 mt-2">{course.description}</p>
      <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">💰</span>
          <span className="font-medium">${course.price?.toFixed(2) || 'Free'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">🏷️</span>
          <span className="font-medium">{course.category}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">📝</span>
          <span className="font-medium">{course.chaptersLength} Chapters</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">👥</span>
          <span className="font-medium">{course.studentsEnrolled} Students</span>
        </div>
      </div>
    </Card>
  );
};

const formatMessage = (message: any) => {
  if (message.role === 'assistant' && message.courses) {
    return (
      <div className="text-sm">
        <p className="font-medium mb-4">{message.content}</p>
        {message.courses.map((course: any, index: number) => (
          <div key={index} className="mb-4 p-3 border rounded-lg">
            <h4 className="font-bold">{course.title}</h4>
            <p className="text-gray-600 my-1">{course.description}</p>
            <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
              <p>💰 Price: ${course.price}</p>
              <p>🏷️ Category: {course.category}</p>
              <p>📚 Chapters: {course.chaptersLength}</p>
              <p>👥 Students: {course.studentsEnrolled}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  return <p>{message.content}</p>;
};

const CourseChatbot = () => {
  const { user } = useUser();
  const { messages, input, setInput, handleSubmit } = useChat({
    api: '/api/chat',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="min-h-[90vh] w-full flex flex-col items-center justify-center p-4 bg-gray-50">
      <h1 className="text-center text-3xl font-bold mb-6 text-blue-800">
        Course Assistant
      </h1>
      
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {predefinedPrompts.map((prompt, index) => (
          <Button
            key={index}
            variant="outline"
            onClick={() => handlePromptClick(prompt)}
            className="bg-white hover:bg-blue-50"
          >
            {prompt}
          </Button>
        ))}
      </div>

      <div className="mx-auto w-full max-w-4xl bg-white rounded-lg shadow-lg">
        <ScrollArea className="mb-4 h-[600px] rounded-t-lg p-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              👋 Hi! Ask me about our courses or click one of the suggestions above.
            </div>
          )}
          
          {messages.map((message) => (
            <div key={message.id} className="mb-6">
              {message.role === "user" && (
                <div className="flex gap-3">
                  <Avatar>
                    <AvatarImage src={user?.imageUrl || ""} />
                    <AvatarFallback className="text-sm">You</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-700">{user?.fullName || 'User'}</p>
                    <p className="text-gray-600 mt-1">{message.content}</p>
                  </div>
                </div>
              )}

              {message.role === "assistant" && (
                <div className="flex gap-3 mt-4">
                  <Avatar>
                    <AvatarFallback className="bg-blue-600 text-white">
                      AI
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-700">Course Assistant</p>
                    <div className="mt-2">
                      {formatMessage(message)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </ScrollArea>
        
        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <Input
              value={input}
              placeholder="Ask about courses or get recommendations..."
              onChange={handleInputChange}
              className="flex-1"
            />
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
              Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CourseChatbot;