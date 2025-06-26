"use client"


import { useState, useRef, useEffect } from "react"
import { MessageSquare, Send, X } from "lucide-react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

// Base URL for API requests
const API_BASE_URL = "https://it342-g5-collaboraid.onrender.com/api"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
}

interface AIMessageRequest {
  message: string
}

// This matches your Spring Boot AIMessageResponse class
interface AIMessageResponse {
  user: null
  userMessage: string
  aiResponse: string // Note: it's aiResponse, not aiMessage
  timestamp: string
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isFloating, setIsFloating] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Floating animation effect
  useEffect(() => {
    const floatInterval = setInterval(() => {
      setIsFloating((prev) => !prev)
    }, 2000)

    return () => clearInterval(floatInterval)
  }, [])

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Focus input when chat is opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Initialize with a welcome message
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        content: "Welcome to CollaborAid! How can I help you today?",
        sender: "ai",
        timestamp: new Date(),
      },
    ])
  }, [])

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTimestamp = (date: Date) => {
    return format(date, "h:mm a")
  }

  const sendMessage = async () => {
    if (inputValue.trim() === "" || isLoading) return

    const userMessage = inputValue.trim()
    setInputValue("")

    // Add user message to chat
    const newUserMessage: Message = {
      id: Date.now().toString(),
      content: userMessage,
      sender: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newUserMessage])
    setIsLoading(true)

    try {
      // Send message to API using axios
      const response = await axios.post(
        `${API_BASE_URL}/livechat/ask-ai/public`,
        { message: userMessage } as AIMessageRequest,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      // Log the full response for debugging
      console.log("API Response:", response)

      let aiResponseContent = "No response received"
      let responseTimestamp = new Date()

      // Extract the AI response from the response
      if (response.data) {
        // Check if the response is a direct AIMessageResponse
        if (response.data.aiResponse) {
          aiResponseContent = response.data.aiResponse
          if (response.data.timestamp) {
            responseTimestamp = new Date(response.data.timestamp)
          }
          console.log("Found aiResponse in response.data:", aiResponseContent)
        }
        // Check if the response is a Spring Boot ResponseEntity structure
        else if (response.data.body && response.data.body.aiResponse) {
          aiResponseContent = response.data.body.aiResponse
          if (response.data.body.timestamp) {
            responseTimestamp = new Date(response.data.body.timestamp)
          }
          console.log("Found aiResponse in response.data.body:", aiResponseContent)
        }
        // Log the response structure for debugging
        else {
          console.log("Response structure:", JSON.stringify(response.data, null, 2))
          aiResponseContent = "Received response in unexpected format"
        }
      }

      const newAIMessage: Message = {
        id: Date.now().toString(),
        content: aiResponseContent,
        sender: "ai",
        timestamp: responseTimestamp,
      }
      setMessages((prev) => [...prev, newAIMessage])
    } catch (error) {
      console.error("Error sending message:", error)

      let errorMessage = "Sorry, I couldn't process your request. Please try again later."

      // More specific error messages based on the error
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error("Error response:", error.response.data)
          console.error("Error status:", error.response.status)

          if (error.response.status === 403) {
            errorMessage = "Access forbidden. The server denied access to this resource."
          } else if (error.response.status === 404) {
            errorMessage = "API endpoint not found. Please check the API configuration."
          } else if (error.response.status === 500) {
            errorMessage = "Server error. The server encountered an internal error."
          }
        } else if (error.request) {
          console.error("No response received:", error.request)
          errorMessage = "No response from server. Please check your connection."
        } else {
          console.error("Error message:", error.message)
        }
      }

      // Add error message to chat
      const errorMessageObj: Message = {
        id: Date.now().toString(),
        content: errorMessage,
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessageObj])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Chat button with floating animation */}
      <Button
        onClick={toggleChat}
        size="icon"
        className={cn(
          "fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg z-50 transition-all duration-1000 ease-in-out",
          isFloating ? "translate-y-[-4px]" : "translate-y-[0px]",
          "animate-pulse hover:animate-none hover:scale-110",
          "bg-primary hover:bg-primary/90",
          "shadow-[0_0_15px_rgba(0,0,0,0.2)]",
          "hover:shadow-[0_0_20px_rgba(0,0,0,0.3)]",
        )}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <X className="h-7 w-7" /> : <MessageSquare className="h-7 w-7" />}
      </Button>

      {/* Chat window */}
      <Card
        className={cn(
          "fixed bottom-28 right-8 w-[350px] md:w-[420px] shadow-2xl z-50 flex flex-col transition-all duration-300 ease-in-out",
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none",
          "shadow-[0_10px_30px_rgba(0,0,0,0.25)]",
          "border-primary/20",
        )}
        style={{ height: "550px", maxHeight: "75vh" }}
      >
        {/* Chat header */}
        <div className="p-4 border-b bg-primary text-primary-foreground rounded-t-lg flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-primary-foreground/20">
              <img src="/collaborbot.png" alt="CollaborBot" className="h-full w-full object-cover" />
            </div>
            <div>
              <h3 className="font-medium text-lg">CollaborBot</h3>
              <p className="text-xs text-primary-foreground/70">Always here to help</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-primary-foreground/10"
            onClick={toggleChat}
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/95 backdrop-blur-sm">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center text-muted-foreground p-4">
              <div>
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50 mb-2" />
                <p>How can I help you today?</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex flex-col max-w-[85%] rounded-lg p-3 shadow-sm",
                  message.sender === "user"
                    ? "ml-auto bg-primary text-primary-foreground rounded-br-none"
                    : "mr-auto bg-muted rounded-bl-none",
                )}
              >
                <div className="flex items-start gap-2">
                  {message.sender === "ai" && (
                    <div className="h-6 w-6 rounded-full overflow-hidden flex-shrink-0 mt-1">
                      <img src="/collaborbot.png" alt="CollaborAid Bot" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p
                      className={cn(
                        "text-[10px] mt-1",
                        message.sender === "user" ? "text-primary-foreground/70 text-right" : "text-muted-foreground",
                      )}
                    >
                      {formatTimestamp(message.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex max-w-[80%] rounded-lg p-3 mr-auto bg-muted rounded-bl-none shadow-sm">
              <div className="flex items-start gap-2">
                <div className="h-6 w-6 rounded-full overflow-hidden flex-shrink-0 mt-1">
                  <img src="/collaborbot.png" alt="CollaborAid Bot" className="h-full w-full object-cover" />
                </div>
                <div className="flex space-x-1">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat input */}
        <div className="p-4 border-t bg-background/80">
          <div className="flex gap-2">
            <Textarea
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="min-h-10 resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              size="icon"
              disabled={inputValue.trim() === "" || isLoading}
              aria-label="Send message"
              className="bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-xs text-center mt-2 text-muted-foreground">Powered by CollaborAid AI</div>
        </div>
      </Card>
    </>
  )
}
