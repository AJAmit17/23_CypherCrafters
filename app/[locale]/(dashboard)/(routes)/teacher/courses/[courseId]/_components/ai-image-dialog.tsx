"use client";

import { useState } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Download } from "lucide-react";
import Image from "next/image";

interface AIImageDialogProps {
  onImageSelect: (url: string) => void;
}

export const AIImageDialog = ({ onImageSelect }: AIImageDialogProps) => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const generateImage = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post("/api/generate-image", { prompt });
      setGeneratedImage(response.data.imageUrl);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (generatedImage) {
      // Create a link element
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `generated-image-${Date.now()}.webp`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Generate with AI</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Image with AI</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Describe the image you want..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <Button 
            onClick={generateImage} 
            disabled={isLoading || !prompt}
            className="w-full"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Generate
          </Button>
          {generatedImage && (
            <div className="space-y-4">
              <div className="relative aspect-video">
                <Image
                  src={generatedImage}
                  alt="Generated image"
                  fill
                  className="object-cover rounded-md"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleDownload}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Image
                </Button>
                {/* <Button 
                  onClick={() => onImageSelect(generatedImage)}
                  className="w-full"
                >
                  Use this image
                </Button> */}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
