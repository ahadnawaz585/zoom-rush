"use client"

import { useState } from "react"
import { Calendar, MessageSquare, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import MeetingAssistant from "./meeting-assistant"
import MeetingChatbot from "./meeting-chatbot"

export default function FloatingButtons() {
  const [isMeetingAssistantOpen, setIsMeetingAssistantOpen] = useState(false)
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)

  return (
    <>
      <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-50">
        <Button
          onClick={() => setIsChatbotOpen(true)}
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
        <Button
          onClick={() => setIsMeetingAssistantOpen(true)}
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg"
        >
          <Calendar className="h-6 w-6" />
        </Button>
      </div>

      <Dialog open={isMeetingAssistantOpen} onOpenChange={setIsMeetingAssistantOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Meeting Assistant
            </DialogTitle>
            <DialogDescription>Plan and optimize your meetings with AI-powered guidance</DialogDescription>
          </DialogHeader>
          <MeetingAssistant inModal={true} />
        </DialogContent>
      </Dialog>

      <Dialog open={isChatbotOpen} onOpenChange={setIsChatbotOpen}>
        <DialogContent className="max-w-md h-[80vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Meeting Chatbot
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <MeetingChatbot inModal={true} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
