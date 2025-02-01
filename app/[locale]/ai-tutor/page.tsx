import React from 'react'
import { Card, CardContent } from "@/components/ui/card"

const Page = () => {
  return (
    <div className="w-screen h-screen bg-primary flex items-center justify-center p-4">
      <Card className="w-full max-w-[1200px] h-[80vh] overflow-hidden shadow-lg bg-background rounded-lg">
        <CardContent className="p-0 h-full relative">
          <div className="w-full h-full overflow-hidden">
            <iframe
              src = "https://agent.theten.ai/"
              className="w-full h-[calc(100%+64px)] border-none -mt-16"
              title="The Ten AI Agent"
              loading="lazy"
              sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-downloads allow-modals allow-top-navigation"
              allow="microphone; camera; display-capture; autoplay; clipboard-write; encrypted-media; picture-in-picture"
              allowFullScreen
              style={{ clipPath: 'inset(64px 0 0 0)' }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Page
