"use client";

import * as z from "zod";
import axios from "axios";
import MuxPlayer from "@mux/mux-player-react";
import { Pencil, PlusCircle, Video, Download, Loader2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Chapter, MuxData } from "@prisma/client";
import ReactMarkdown from 'react-markdown';

import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

// Add these styles to properly render markdown
const markdownStyles = {
  p: 'mb-4',
  h1: 'text-2xl font-bold mb-4',
  h2: 'text-xl font-bold mb-3',
  h3: 'text-lg font-bold mb-2',
  ul: 'list-disc pl-4 mb-4',
  li: 'mb-1',
  pre: 'bg-slate-100 p-2 rounded mb-4',
};

interface ChapterVideoFormProps {
  initialData: Chapter & { muxData?: MuxData | null };
  courseId: string;
  chapterId: string;
};

const formSchema = z.object({
  videoUrl: z.string().min(1),
});

export const ChapterVideoForm = ({
  initialData,
  courseId,
  chapterId,
}: ChapterVideoFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const toggleEdit = () => setIsEditing((current) => !current);

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

  const downloadVideo = () => {
    if (initialData.videoUrl) {
      const link = document.createElement("a");
      link.href = initialData.videoUrl;
      link.download = "chapter-video.mp4";
      link.click();
    }
  };

  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [scriptPrompt, setScriptPrompt] = useState("");
  const [generatedScript, setGeneratedScript] = useState("");

  const generateScript = async () => {
    try {
      setIsGeneratingScript(true);
      const response = await axios.post("/api/gemini", {
        prompt: `Create an educational video script for: ${scriptPrompt}`
      });
      
      if (response.data?.script) {
        setGeneratedScript(response.data.script);
        toast.success("Script generated successfully!");
      }
    } catch (error) {
      toast.error("Failed to generate script");
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const downloadScript = () => {
    if (generatedScript) {
      // Create markdown file name based on chapter title
      const fileName = `${initialData.title.toLowerCase().replace(/\s+/g, '-')}-script.md`;
      
      // Create blob with markdown content
      const blob = new Blob([generatedScript], { type: 'text/markdown' });
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Chapter video
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing && (
            <>Cancel</>
          )}
          {!isEditing && !initialData.videoUrl && (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add a video
            </>
          )}
          {!isEditing && initialData.videoUrl && (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit video
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        !initialData.videoUrl ? (
          <div className="flex items-center justify-center h-60 bg-slate-200 rounded-md">
            <Video className="h-10 w-10 text-slate-500" />
          </div>
        ) : (
          <div className="relative aspect-video mt-2">
            <MuxPlayer
              playbackId={initialData?.muxData?.playbackId || ""}
            />
          </div>
        )
      )}
      {isEditing && (
        <div className="space-y-4">
          <Card className="p-4">
            <FileUpload
              endpoint="chapterVideo"
              onChange={(url) => {
                if (url) {
                  onSubmit({ videoUrl: url });
                }
              }}
            />
          </Card>
        </div>
      )}
      {initialData.videoUrl && !isEditing && (
        <>
          <div className="text-xs text-muted-foreground mt-2">
            Videos can take a few minutes to process. Refresh the page if video does not appear.
          </div>
          <Button onClick={downloadVideo} variant="outline" size="sm" className="mt-2">
            <Download className="h-4 w-4 mr-2" />
            Download Video
          </Button>
        </>
      )}
      <div className="mt-6 border-t pt-6">
        <h3 className="font-medium mb-2">Generate Video Script</h3>
        <div className="space-y-4">
          <Textarea
            placeholder="Describe your video content and learning objectives..."
            value={scriptPrompt}
            onChange={(e) => setScriptPrompt(e.target.value)}
            rows={4}
            className="w-full"
          />
          <div className="flex items-center gap-x-2">
            <Button
              onClick={generateScript}
              disabled={!scriptPrompt || isGeneratingScript}
              variant="secondary"
              className="w-auto"
            >
              {isGeneratingScript && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isGeneratingScript ? "Generating..." : "Generate Script"}
            </Button>
            {generatedScript && (
              <Button 
                onClick={downloadScript} 
                variant="outline"
                className="flex items-center gap-x-2"
              >
                <Download className="h-4 w-4" />
                Download as Markdown
              </Button>
            )}
          </div>
        </div>

        {generatedScript && (
          <Card className="mt-4 p-4">
            <ScrollArea className="h-[500px] overflow-auto">
              <div className="prose prose-sm max-w-none dark:prose-invert px-4">
                <ReactMarkdown
                  components={{
                    // Apply custom styles to markdown elements
                    p: ({node, ...props}) => <p className={markdownStyles.p} {...props} />,
                    h1: ({node, ...props}) => <h1 className={markdownStyles.h1} {...props} />,
                    h2: ({node, ...props}) => <h2 className={markdownStyles.h2} {...props} />,
                    h3: ({node, ...props}) => <h3 className={markdownStyles.h3} {...props} />,
                    ul: ({node, ...props}) => <ul className={markdownStyles.ul} {...props} />,
                    li: ({node, ...props}) => <li className={markdownStyles.li} {...props} />,
                    pre: ({node, ...props}) => <pre className={markdownStyles.pre} {...props} />,
                  }}
                >
                  {generatedScript}
                </ReactMarkdown>
              </div>
            </ScrollArea>
          </Card>
        )}
      </div>
    </div>
  );
};