"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Pencil, Wand2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface ChapterTitleFormProps {
  initialData: {
    title: string;
  };
  courseId: string;
  chapterId: string;
};

const formSchema = z.object({
  title: z.string().min(1),
});

export const ChapterTitleForm = ({
  initialData,
  courseId,
  chapterId,
}: ChapterTitleFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");

  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}`, values);
      toast.success("Chapter updated");
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  }

  const cleanJsonString = (text: string) => {
    try {
      console.log('Raw AI response:', text);
      
      const cleanedText = text
        .split('\n')
        .map(line => line.replace(/^\d+:"/, '').replace(/"$/, ''))
        .join('')
        .replace(/\\n/g, '')
        .replace(/\\\"/g, '"');
      
      console.log('Cleaned text:', cleanedText);
      
      const parsed = JSON.parse(cleanedText);
      console.log('Parsed JSON:', parsed);

      return {
        chapterTitle: parsed.refinedTitle || parsed.title,
        chapterDescription: parsed.description
      };
    } catch (e) {
      console.error('JSON parsing error:', e);
      return null;
    }
  };

  const generateWithAI = async () => {
    try {
      setIsGenerating(true);
      const loadingToast = toast.loading('Generating chapter content...');

      console.log('Sending prompt:', aiPrompt);

      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Generate a chapter title and description for a course chapter about: ${aiPrompt}. 
            Return in JSON format with fields: refinedTitle and description`
          }]
        })
      });

      if (!response.ok) {
        console.error('API response not OK:', response.status);
        throw new Error('Failed to generate content');
      }

      let fullText = '';
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = new TextDecoder().decode(value);
        fullText += chunk;
      }

      console.log('Full response text:', fullText);

      const parsedContent = cleanJsonString(fullText);
      if (!parsedContent) {
        throw new Error('Failed to parse AI response');
      }

      console.log('Updating chapter with:', parsedContent);

      form.setValue('title', parsedContent.chapterTitle);

      await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}`, {
        title: parsedContent.chapterTitle,
        description: parsedContent.chapterDescription
      });

      toast.dismiss(loadingToast);
      toast.success("Generated and updated successfully");
      setShowAIModal(false);
      toggleEdit();
      router.refresh();
    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          Chapter title
          <Dialog open={showAIModal} onOpenChange={setShowAIModal}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Wand2 className="h-4 w-4 mr-2" />
                Generate with AI
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Chapter Content</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  placeholder="Describe what this chapter should be about..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                />
                <Button 
                  onClick={generateWithAI} 
                  disabled={isGenerating || !aiPrompt}
                  className="w-full"
                >
                  {isGenerating ? "Generating..." : "Generate"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit title
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <p className="text-sm mt-2">
          {initialData.title}
        </p>
      )}
      {isEditing && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="e.g. 'Introduction to the course'"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-x-2">
              <Button
                disabled={!isValid || isSubmitting}
                type="submit"
              >
                Save
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  )
}