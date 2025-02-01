import ChatTest from '@/components/chatbot'
import React from 'react'
import { Metadata } from 'next';

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: 'Chatbot',
  description: 'Interact with our chatbot for assistance and information.',
  openGraph: {
    title: 'Chatbot',
    description: 'Interact with our chatbot for assistance and information.',
  },
  twitter: {
    title: 'Chatbot',
    description: 'Interact with our chatbot for assistance and information.',
  },
  keywords: 'chatbot, assistance, information, help',
  robots: 'index, follow',
};

const Chat = () => {
  return (
    <div>
      <ChatTest />
    </div>
  )
}

export default Chat
