"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, HelpCircle, Bot, User, Clock, Shield, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Interfaces for API integration
interface UserEntity {
  id: number
  username: string
}

interface AIMessageRequest {
  user: UserEntity
  message: string
}

interface AIMessageResponse {
  user: UserEntity
  userMessage: string
  aiResponse: string
  timestamp: string
}

interface Message {
  text: string
  sender: "user" | "ai" | "support"
  timestamp: Date
}

export const ChatSupport = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hello! I'm your AI assistant. How can I help you today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [newMessage, setNewMessage] = useState("")
  const [activeTab, setActiveTab] = useState("ai")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showAdminRequest, setShowAdminRequest] = useState(false)
  const [adminEmail, setAdminEmail] = useState("")
  const [showVerificationAlert, setShowVerificationAlert] = useState(false)

  // Mock user for API requests
  const currentUser: UserEntity = {
    id: 1,
    username: "currentUser",
  }

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (newMessage.trim() !== "") {
      // Add user message
      const userMessage: Message = {
        text: newMessage,
        sender: "user",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMessage])
      const messageToSend = newMessage
      setNewMessage("")
      setIsLoading(true)

      if (activeTab === "ai") {
        try {
          // Prepare request for backend
          const request: AIMessageRequest = {
            user: currentUser,
            message: messageToSend,
          }

          // Call backend API
          const response = await fetch("http://localhost:8080/api/livechat/ask-ai", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
          })

          if (response.ok) {
            const data: AIMessageResponse = await response.json()

            // Add AI response
            const aiMessage: Message = {
              text: data.aiResponse,
              sender: "ai",
              timestamp: new Date(data.timestamp),
            }
            setMessages((prev) => [...prev, aiMessage])
          } else {
            // Handle error
            const aiMessage: Message = {
              text: "Sorry, I encountered an error. Please try again later.",
              sender: "ai",
              timestamp: new Date(),
            }
            setMessages((prev) => [...prev, aiMessage])
          }
        } catch (error) {
          console.error("Error calling AI API:", error)

          // Fallback response in case of error
          const aiMessage: Message = {
            text: "Sorry, I encountered an error. Please try again later.",
            sender: "ai",
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, aiMessage])
        } finally {
          setIsLoading(false)
        }
      } else {
        // Support chat logic (simulated)
        setTimeout(() => {
          const supportMessage: Message = {
            text: "Thank you for your message. A support agent will respond shortly. Typical response time is within 2 hours.",
            sender: "support",
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, supportMessage])
          setIsLoading(false)
        }, 1000)
      }
    }
  }

  const handleAdminRequest = () => {
    if (adminEmail.trim() !== "") {
      // Here you would normally send the request to the backend
      // Since the backend isn't implemented yet, we'll just show the verification alert
      setShowVerificationAlert(true)
      setTimeout(() => {
        setShowVerificationAlert(false)
        setShowAdminRequest(false)
        setAdminEmail("")
      }, 3000)
    }
  }

  const formatTime = (date: Date) => {
    return format(date, "h:mm a")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] h-[600px] flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              <span>Help & Support</span>
            </div>
          </DialogTitle>
          <DialogDescription>Get assistance with your questions</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="ai" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="flex items-center px-4 pt-2">
            <TabsList className="grid grid-cols-2 flex-1">
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                AI Assistant
              </TabsTrigger>
              <TabsTrigger value="support" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Live Support
              </TabsTrigger>
            </TabsList>
            <Button
              variant="outline"
              size="sm"
              className="ml-2 bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => setShowAdminRequest(true)}
            >
              <Shield className="h-4 w-4 mr-1" />
              Request Admin
            </Button>
          </div>

          <TabsContent value="ai" className="flex-1 flex flex-col p-0 m-0 data-[state=active]:flex">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages
                .filter((msg) => (activeTab === "ai" ? msg.sender !== "support" : msg.sender !== "ai"))
                .map((message, index) => (
                  <div key={index} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground"
                          : message.sender === "ai"
                            ? "bg-muted"
                            : "bg-secondary"
                      }`}
                    >
                      {message.sender !== "user" && (
                        <div className="flex items-center gap-2 mb-1">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={
                                message.sender === "ai" ? "/placeholder.svg?query=ai" : "/placeholder.svg?query=support"
                              }
                              alt={message.sender === "ai" ? "AI" : "Support"}
                            />
                            <AvatarFallback>{message.sender === "ai" ? "AI" : "S"}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium">
                            {message.sender === "ai" ? "AI Assistant" : "Support Team"}
                          </span>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      <div className="flex justify-end items-center mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                    <div className="flex items-center gap-2 mb-1">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={activeTab === "ai" ? "/placeholder.svg?query=ai" : "/placeholder.svg?query=support"}
                          alt={activeTab === "ai" ? "AI" : "Support"}
                        />
                        <AvatarFallback>{activeTab === "ai" ? "AI" : "S"}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium">
                        {activeTab === "ai" ? "AI Assistant" : "Support Team"}
                      </span>
                    </div>
                    <div className="flex space-x-1 items-center">
                      <div
                        className="h-2 w-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="h-2 w-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                      <div
                        className="h-2 w-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "600ms" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t mt-auto">
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  placeholder={`Ask the ${activeTab === "ai" ? "AI assistant" : "support team"}...`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  className="flex-1"
                  disabled={isLoading}
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="icon" onClick={handleSendMessage} disabled={isLoading}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Send message</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Press Enter to send, Shift+Enter for a new line</p>
            </div>
          </TabsContent>

          <TabsContent value="support" className="flex-1 flex flex-col p-0 m-0 data-[state=active]:flex">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages
                .filter((msg) => (activeTab === "ai" ? msg.sender !== "support" : msg.sender !== "ai"))
                .map((message, index) => (
                  <div key={index} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground"
                          : message.sender === "ai"
                            ? "bg-muted"
                            : "bg-secondary"
                      }`}
                    >
                      {message.sender !== "user" && (
                        <div className="flex items-center gap-2 mb-1">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={
                                message.sender === "ai" ? "/placeholder.svg?query=ai" : "/placeholder.svg?query=support"
                              }
                              alt={message.sender === "ai" ? "AI" : "Support"}
                            />
                            <AvatarFallback>{message.sender === "ai" ? "AI" : "S"}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium">
                            {message.sender === "ai" ? "AI Assistant" : "Support Team"}
                          </span>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      <div className="flex justify-end items-center mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg p-3 bg-secondary">
                    <div className="flex items-center gap-2 mb-1">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src="/diverse-hands-supporting.png" alt="Support" />
                        <AvatarFallback>S</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium">Support Team</span>
                    </div>
                    <div className="flex space-x-1 items-center">
                      <div
                        className="h-2 w-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="h-2 w-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                      <div
                        className="h-2 w-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "600ms" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t mt-auto">
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  placeholder="Message support team..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  className="flex-1"
                  disabled={isLoading}
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="icon" onClick={handleSendMessage} disabled={isLoading}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Send message</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Support agents typically respond within 2 hours</p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogClose asChild className="absolute top-2 right-2">
          <Button variant="ghost" size="icon">
            <span className="sr-only">Close</span>
            <X className="h-4 w-4" />
          </Button>
        </DialogClose>
      </DialogContent>

      {/* Admin Request Dialog */}
      <Dialog open={showAdminRequest} onOpenChange={setShowAdminRequest}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              Request Admin Access
            </DialogTitle>
            <DialogDescription>
              Submit your email to request administrator privileges. Our team will review your request.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="admin-email" className="text-right">
                Email
              </Label>
              <Input
                id="admin-email"
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="col-span-3"
              />
            </div>
          </div>

          {showVerificationAlert && (
            <Alert className="bg-purple-100 border-purple-200">
              <AlertDescription className="text-purple-800">
                Your admin request is pending verification. We'll contact you soon.
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdminRequest(false)}>
              Cancel
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={handleAdminRequest}>
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
