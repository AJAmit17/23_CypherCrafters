"use client";

import { createContext, useContext, useState } from 'react';

interface GeneratedContent {
  refinedTitle?: string;
  description?: string;
}

interface CourseGeneratorContextType {
  generatedContent: GeneratedContent;
  updateGeneratedContent: (content: GeneratedContent) => void;
}

const CourseGeneratorContext = createContext<CourseGeneratorContextType | undefined>(undefined);

export function CourseGeneratorProvider({ children }: { children: React.ReactNode }) {
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent>({});

  const updateGeneratedContent = (content: GeneratedContent) => {
    setGeneratedContent(content);
  };

  return (
    <CourseGeneratorContext.Provider value={{ generatedContent, updateGeneratedContent }}>
      {children}
    </CourseGeneratorContext.Provider>
  );
}

export const useGeneratedContent = () => {
  const context = useContext(CourseGeneratorContext);
  if (!context) {
    throw new Error('useGeneratedContent must be used within CourseGeneratorProvider');
  }
  return context;
};
