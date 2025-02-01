"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Wand2 } from "lucide-react";
import { useGeneratedContent } from "@/context/course-generator-context";
import toast from "react-hot-toast";
import { UseFormSetValue } from "react-hook-form";
import axios from "axios";

interface AIFormModalProps {
  initialTitle?: string;
  courseId: string;  // Add courseId prop
  setFormValue?: (field: string, value: string) => void;
}

export const AIFormModal = ({ initialTitle, courseId, setFormValue }: AIFormModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState(initialTitle || "");
  const [requirements, setRequirements] = useState("");
  const { updateGeneratedContent } = useGeneratedContent();
  const [open, setOpen] = useState(false);

  const cleanJsonString = (text: string) => {
    try {
      const cleanedText = text
        .split('\n')
        .map(line => {
          return line.replace(/^\d+:"/, '').replace(/"$/, '');
        })
        .join('')
        .replace(/\\n/g, '')
        .replace(/\\\"/g, '"');

      console.log('Cleaned text:', cleanedText);
      const parsed = JSON.parse(cleanedText);

      if (!parsed.refinedTitle || !parsed.description) {
        throw new Error('Missing required fields in response');
      }

      return {
        refinedTitle: parsed.refinedTitle,
        description: parsed.description
      };
    } catch (e) {
      console.error('JSON parsing error:', e);
      console.log('Raw text received:', text);
      return null;
    }
  };


  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      // Show loading toast
      const loadingToast = toast.loading('Generating content...');

      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Course Title: ${title}\nAdditional Requirements: ${requirements}`
          }]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      let fullText = '';
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      // Collect the complete response
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = new TextDecoder().decode(value);
        fullText += chunk;
      }

      console.log('fullText:', fullText);

      const parsedContent = cleanJsonString(fullText);
      if (!parsedContent) {
        toast.dismiss(loadingToast);
        throw new Error('Failed to parse AI response');
      }

      // Update the course
      await axios.patch(`/api/courses/${courseId}`, {
        title: parsedContent.refinedTitle,
        description: parsedContent.description
      });

      // Update the context
      updateGeneratedContent(parsedContent);

      toast.dismiss(loadingToast);
      toast.success("Content generated successfully!");
      setOpen(false);
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Failed to generate content");
      console.error('Generation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Wand2 className="h-4 w-4 mr-2" />
          Generate with AI
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Course Content</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label>Course Title</label>
            <Input
              placeholder="Enter course title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label>Additional Requirements</label>
            <Textarea
              placeholder="Enter any specific requirements, target audience, or course goals..."
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading || !title}>
              {isLoading ? "Generating..." : "Generate Content"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
