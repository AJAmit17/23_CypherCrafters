"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Pencil, Wand2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useGeneratedContent } from "@/context/course-generator-context";
import { AIFormModal } from "@/components/ai-form-modal";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface TitleFormProps {
  initialData: {
    title: string;
  };
  courseId: string;
};

const formSchema = z.object({
  title: z.string().min(1, {
    message: "Title is required",
  }),
});

export const TitleForm = ({
  initialData,
  courseId
}: TitleFormProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const { isSubmitting, isValid } = form.formState;

  const { updateGeneratedContent } = useGeneratedContent();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/courses/${courseId}`, values);
      toast.success("Course updated");
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  }

  const generateAIContent = async () => {
    try {
      const titleVal = form.getValues('title');
      if (!titleVal) {
        return toast.error("Please enter a title first");
      }

      toast.loading("Generating course content...");
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: titleVal }]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      let fullText = '';
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += new TextDecoder().decode(value);
      }

      try {
        const parsed = JSON.parse(fullText);
        form.setValue('title', parsed.refinedTitle);
        updateGeneratedContent({
          description: parsed.description,
          // chapters: parsed.chapters
        });
        toast.success("Content generated successfully!");
      } catch (e) {
        console.error('Parse error:', e);
        toast.error("Failed to parse AI response");
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error("Failed to generate content");
    } finally {
      toast.dismiss();
    }
  };

  const t = useTranslations("Course-teacher")

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        {t("course_title")}
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? (
            <>{t("cancel")}</>
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              {t("edit_title")}
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
                      placeholder="e.g. 'Advanced web development'"
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
                {t("save")}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={generateAIContent}
              >
                <Wand2 className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </Form>
      )}
      <div className="flex items-center gap-x-2 mt-4">
        <AIFormModal 
          initialTitle={initialData.title} 
          courseId={courseId}
        />
      </div>
    </div>
  )
}