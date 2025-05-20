"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { type ChatbotQuery, generateChatbotResponse } from "@/lib/bot"
import { Send, Loader2, MessageSquare } from "lucide-react"

type Message = {
  role: "user" | "assistant"
  content: string
  suggestedFollowUps?: string[]
  timestamp: Date
}

interface MeetingChatbotProps {
  inModal?: boolean
}

export default function MeetingChatbot({ inModal = false }: MeetingChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your meeting assistant. How can I help you today?",
      suggestedFollowUps: [
        "How can I prepare for my upcoming meeting?",
        "What are best practices for running efficient meetings?",
        "Help me create an agenda for my team meeting",
      ],
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSend = async () => {
    if (input.trim() === "") return

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const query: ChatbotQuery = {
        userQuery: input,
        previousMessages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        preferredResponseStyle: "concise",
      }

      const response = await generateChatbotResponse(query)

      const assistantMessage: Message = {
        role: "assistant",
        content: response.answer,
        suggestedFollowUps: response.suggestedFollowUps,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error generating response:", error)

      const errorMessage: Message = {
        role: "assistant",
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSuggestedQuestion = (question: string) => {
    setInput(question)
    setTimeout(() => {
      handleSend()
    }, 100)
  }

  return (
    <Card className={`w-full ${inModal ? "h-full" : "max-w-md mx-auto h-[600px]"} flex flex-col border border-border`}>
      {!inModal && (
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Meeting Assistant
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted border border-border"
                  }`}
                >
                  <p>{message.content}</p>
                  {message.suggestedFollowUps && message.suggestedFollowUps.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.suggestedFollowUps.map((question, qIndex) => (
                        <Button
                          key={qIndex}
                          variant="secondary"
                          size="sm"
                          className="text-xs w-full justify-start text-foreground"
                          onClick={() => handleSuggestedQuestion(question)}
                        >
                          {question}
                        </Button>
                      ))}
                    </div>
                  )}
                  <div className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t p-3">
        <div className="flex w-full items-center space-x-2">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            className="flex-1"
          />
          <Button size="icon" onClick={handleSend} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
