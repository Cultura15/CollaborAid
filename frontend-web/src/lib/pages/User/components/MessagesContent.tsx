"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getToken, decodeToken } from "../../JWTDecode/JWTDecode"

// Define interfaces for API responses
interface MessageDTO {
  id: number
  senderId: number
  senderName: string
  senderAvatar?: string
  receiverId: number
  receiverName: string
  receiverAvatar?: string
  content: string
  timestamp: string
  read: boolean
  taskId?: number
  taskTitle?: string
}

interface User {
  id: number
  name: string
  avatar?: string
}

export function MessagesContent() {
  // State for messages data
  const [receivedMessages, setReceivedMessages] = useState<MessageDTO[]>([])
  const [sentMessages, setSentMessages] = useState<MessageDTO[]>([])
  const [conversationMessages, setConversationMessages] = useState<MessageDTO[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [selectedTab, setSelectedTab] = useState("received")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConversationOpen, setIsConversationOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Set up axios instance with base URL
  const api = axios.create({
    baseURL: "http://localhost:8080/api",
  })

  // Add request interceptor to include auth token
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("jwtToken")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    },
  )

  // Get current user from token
  useEffect(() => {
    const token = getToken()
    if (token) {
      const decodedToken = decodeToken(token)
      if (decodedToken && decodedToken.id) {
        setCurrentUser({
          id: decodedToken.id,
          name: decodedToken.username || "You",
          avatar: "/mystical-forest-spirit.png", // Default avatar
        })
      }
    }
  }, [])

  // Fetch received messages
  const fetchReceivedMessages = async () => {
    try {
      const response = await api.get("/messages/received")
      setReceivedMessages(response.data)
    } catch (err) {
      console.error("Error fetching received messages:", err)
      setError("Failed to load received messages. Please try again.")
    }
  }

  // Fetch sent messages
  const fetchSentMessages = async () => {
    try {
      const response = await api.get("/messages/sent")
      setSentMessages(response.data)
    } catch (err) {
      console.error("Error fetching sent messages:", err)
      setError("Failed to load sent messages. Please try again.")
    }
  }

  // Fetch conversation with a specific user
  const fetchConversation = async (receiverId: number) => {
    try {
      const response = await api.get(`/messages/conversation/user-authenticated/${receiverId}`)
      setConversationMessages(response.data)
    } catch (err) {
      console.error("Error fetching conversation:", err)
      setError("Failed to load conversation. Please try again.")
    }
  }

  // Send a new message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return

    try {
      const messageData = {
        receiverId: selectedUser.id,
        content: newMessage,
      }

      await api.post("/messages/send-authenticated", messageData)

      // Refresh conversation
      fetchConversation(selectedUser.id)

      // Clear input
      setNewMessage("")

      // Refresh message lists
      fetchSentMessages()
    } catch (err) {
      console.error("Error sending message:", err)
      setError("Failed to send message. Please try again.")
    }
  }

  // Open conversation with a user
  const openConversation = (user: User) => {
    setSelectedUser(user)
    fetchConversation(user.id)
    setIsConversationOpen(true)
  }

  // Format time ago for display
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffMinutes = Math.floor(diffTime / (1000 * 60))
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffMinutes < 60) {
      return `${diffMinutes} min ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  // Fetch messages on component mount
  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true)
      setError(null)

      try {
        await Promise.all([fetchReceivedMessages(), fetchSentMessages()])
      } catch (err) {
        console.error("Error fetching messages:", err)
        setError("Failed to load messages. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground mt-2">Your conversations with other students</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <Tabs defaultValue="received" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="received">Received</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted"></div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="h-4 w-24 bg-muted rounded"></div>
                          <div className="h-3 w-16 bg-muted rounded"></div>
                        </div>
                        <div className="h-4 w-full bg-muted rounded"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : receivedMessages.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No messages received</h3>
              <p className="text-muted-foreground mt-2">You haven't received any messages yet.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {receivedMessages.map((message) => (
                <Card
                  key={message.id}
                  className="hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() =>
                    openConversation({
                      id: message.senderId,
                      name: message.senderName,
                      avatar: message.senderAvatar,
                    })
                  }
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarImage src={message.senderAvatar || "/placeholder.svg"} alt={message.senderName} />
                        <AvatarFallback>{message.senderName ? message.senderName.charAt(0) : "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{message.senderName}</p>
                            {!message.read && <div className="h-2 w-2 rounded-full bg-primary"></div>}
                          </div>
                          <span className="text-xs text-muted-foreground">{formatTimeAgo(message.timestamp)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{message.content}</p>
                        {message.taskTitle && (
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {message.taskTitle}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sent" className="mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted"></div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="h-4 w-24 bg-muted rounded"></div>
                          <div className="h-3 w-16 bg-muted rounded"></div>
                        </div>
                        <div className="h-4 w-full bg-muted rounded"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : sentMessages.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No messages sent</h3>
              <p className="text-muted-foreground mt-2">You haven't sent any messages yet.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {sentMessages.map((message) => (
                <Card
                  key={message.id}
                  className="hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() =>
                    openConversation({
                      id: message.receiverId,
                      name: message.receiverName,
                      avatar: message.receiverAvatar,
                    })
                  }
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarImage src={message.receiverAvatar || "/placeholder.svg"} alt={message.receiverName} />
                        <AvatarFallback>{message.receiverName ? message.receiverName.charAt(0) : "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">To: {message.receiverName}</p>
                          <span className="text-xs text-muted-foreground">{formatTimeAgo(message.timestamp)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{message.content}</p>
                        {message.taskTitle && (
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {message.taskTitle}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Conversation Dialog */}
      <Dialog open={isConversationOpen} onOpenChange={setIsConversationOpen}>
        <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={selectedUser?.avatar || "/placeholder.svg"} alt={selectedUser?.name || ""} />
                <AvatarFallback>{selectedUser?.name?.charAt(0) || "?"}</AvatarFallback>
              </Avatar>
              <span>{selectedUser?.name}</span>
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {conversationMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === currentUser?.id ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.senderId === currentUser?.id ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <DialogFooter className="p-4 border-t mt-auto">
            <div className="flex items-center w-full gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
                className="flex-1"
              />
              <Button size="icon" onClick={sendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
