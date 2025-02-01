"use client"

import React from "react";
import { useChat } from "ai/react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback } from "./ui/avatar";

const Chatbot = () => {
  const { messages, input, setInput, handleSubmit } = useChat({
    api: '/api/chat',
  });

  return (
    <div className="min-h-[90vh] w-full flex flex-col items-center justify-center p-4 bg-gray-50">
      <h1 className="text-center text-3xl font-bold mb-6">
         Text Agent
      </h1>

      <div className="mx-auto w-full max-w-4xl bg-white rounded-lg shadow-lg">
        <ScrollArea className="mb-4 h-[600px] rounded-t-lg p-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              👋 Hi! How can I help you today?
            </div>
          )}
          
          {messages.map((message) => (
            <div key={message.id} className="mb-6">
              {message.role === "user" && (
                <div className="flex gap-3">
                  <Avatar>
                    <AvatarFallback>You</AvatarFallback>
                  </Avatar>
                  <p className="text-gray-600">{message.content}</p>
                </div>
              )}

              {message.role === "assistant" && (
                <div className="flex gap-3 mt-4">
                  <Avatar>
                    <AvatarFallback className="bg-blue-600 text-white">AI</AvatarFallback>
                  </Avatar>
                  <p className="text-gray-600">{message.content}</p>
                </div>
              )}
            </div>
          ))}
        </ScrollArea>
        
        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <Input
              value={input}
              placeholder="Type your message..."
              onChange={(e) => setInput(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">Send</Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;