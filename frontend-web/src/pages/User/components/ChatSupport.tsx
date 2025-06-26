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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Client } from "@stomp/stompjs"
import SockJS from "sockjs-client"
import axios from "axios"

// Interfaces for API integration
interface UserEntity {
  id: number
  username: string
  role?: string
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
  id?: string
}

interface MessageEntity {
  sender: UserEntity
  receiver: UserEntity
  content: string
}

interface MessageDTO {
  id: number | string
  senderId: number
  receiverId: number
  content: string
  timestamp: string
  read: boolean
  senderUsername?: string
  receiverUsername?: string
  clientId?: string
}

// Set up axios instance with base URL
const api = axios.create({
  baseURL: "https://it342-g5-collaboraid.onrender.com/api",
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

export const ChatSupport = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hello! I'm your AI assistant. How can I help you today?",
      sender: "ai",
      timestamp: new Date(),
      id: "initial-ai-message",
    },
  ])
  const [newMessage, setNewMessage] = useState("")
  const [activeTab, setActiveTab] = useState("ai")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showAdminRequest, setShowAdminRequest] = useState(false)
  const [adminEmail, setAdminEmail] = useState("")
  const [showVerificationAlert, setShowVerificationAlert] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Add a new state for alert message type
  const [alertType, setAlertType] = useState<"success" | "error" | null>(null)
  const [alertMessage, setAlertMessage] = useState<string>("")
  const [adminRequestCooldown, setAdminRequestCooldown] = useState(false)
  const [cooldownTimeRemaining, setCooldownTimeRemaining] = useState(0)
  // Add state for admin users
  const [adminUsers, setAdminUsers] = useState<UserEntity[]>([])
  const [selectedAdmin, setSelectedAdmin] = useState<UserEntity | null>(null)
  // WebSocket client
  const [stompClient, setStompClient] = useState<Client | null>(null)
  // Loading conversation history
  const [loadingHistory, setLoadingHistory] = useState(false)
  // Add state for received and sent messages
  const [receivedMessages, setReceivedMessages] = useState<MessageDTO[]>([])
  const [sentMessages, setSentMessages] = useState<MessageDTO[]>([])
  const [conversationMessages, setConversationMessages] = useState<MessageDTO[]>([])
  // Add state for WebSocket connection
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false)
  // Add ref for selected admin to use in WebSocket callback
  const selectedAdminRef = useRef<UserEntity | null>(null)
  // Add ref for previous messages length to track new messages
  const prevMessagesLengthRef = useRef(0)

  // Update the ref when selectedAdmin changes
  useEffect(() => {
    selectedAdminRef.current = selectedAdmin
  }, [selectedAdmin])

  // Mock user for API requests - in a real app, this would come from authentication
  const currentUser: UserEntity = {
    id: 1,
    username: "currentUser",
  }

  // Initialize WebSocket connection
  useEffect(() => {
    if (!currentUser.id) return

    const socket = new SockJS("https://it342-g5-collaboraid.onrender.com/ws")
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log("Connected to WebSocket for messages")

        // Subscribe to receive messages for the current user
        stompClient.subscribe(`/topic/messages/${currentUser.id}`, (message) => {
          if (message.body) {
            const messageData = JSON.parse(message.body)
            console.log("Received message via WebSocket:", messageData)

            // Format the message data
            const formattedMessage = {
              id: messageData.messageId || messageData.id,
              senderId: messageData.senderId,
              senderUsername: messageData.senderUsername || "",
              receiverId: messageData.receiverId,
              receiverUsername: messageData.receiverUsername || "",
              content: messageData.content,
              timestamp: messageData.timestamp,
              read: false,
              clientId: messageData.clientId, // Track clientId if available
            }

            // Update conversation if it's from the selected admin
            if (
              selectedAdminRef.current &&
              (formattedMessage.senderId === selectedAdminRef.current.id ||
                formattedMessage.receiverId === selectedAdminRef.current.id)
            ) {
              // Add to conversationMessages
              setConversationMessages((prev) => {
                // Check if message already exists to avoid duplicates
                // Check by id or by clientId if available
                const messageExists = prev.some(
                  (m) =>
                    m.id === formattedMessage.id ||
                    (formattedMessage.clientId && m.id === formattedMessage.clientId) ||
                    (m.content === formattedMessage.content &&
                      m.senderId === formattedMessage.senderId &&
                      m.receiverId === formattedMessage.receiverId),
                )
                if (messageExists) {
                  return prev
                }
                return [...prev, formattedMessage]
              })

              // Also add to messages for display
              const newMessage: Message = {
                id: formattedMessage.id,
                text: formattedMessage.content,
                sender: (formattedMessage.senderId === currentUser.id ? "user" : "support") as
                  | "user"
                  | "support"
                  | "ai",
                timestamp: new Date(formattedMessage.timestamp),
              }

              setMessages((prev) => {
                // Check if message already exists to avoid duplicates
                // Check by id, clientId, or content+sender combination
                const messageExists = prev.some(
                  (m) =>
                    m.id === newMessage.id ||
                    (formattedMessage.clientId && m.id === formattedMessage.clientId) ||
                    (m.text === newMessage.text &&
                      m.sender === newMessage.sender &&
                      Math.abs(m.timestamp.getTime() - newMessage.timestamp.getTime()) < 5000),
                )
                if (messageExists) {
                  return prev
                }
                return [...prev, newMessage]
              })

              // Force scroll to bottom for new messages
              setTimeout(() => scrollToBottom(true), 100)
            }

            // Update received messages but don't trigger a full refresh
            // which could cause duplicates
            if (formattedMessage.senderId !== currentUser.id) {
              setReceivedMessages((prev) => {
                const exists = prev.some((m) => m.id === formattedMessage.id)
                if (exists) return prev
                return [...prev, formattedMessage]
              })
            }
          }
        })

        setStompClient(stompClient)
        setIsWebSocketConnected(true)
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame)
        setIsWebSocketConnected(false)
      },
      onDisconnect: () => {
        console.log("Disconnected from WebSocket for messages")
        setIsWebSocketConnected(false)
      },
    })

    stompClient.activate()
    setStompClient(stompClient)

    return () => {
      if (stompClient.connected) {
        stompClient.deactivate()
      }
    }
  }, [currentUser.id])

  // Fetch admin users
  useEffect(() => {
    if (activeTab === "support") {
      fetchAdminUsers().catch((err) => {
        console.error("Error fetching admin users in useEffect:", err)
        // Don't set error state here to avoid showing error message when switching tabs
      })
    }
  }, [activeTab])

  const fetchAdminUsers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("https://it342-g5-collaboraid.onrender.com/api/auth/admins")
      if (response.ok) {
        const data: UserEntity[] = await response.json()
        setAdminUsers(data)
        setError(null) // Clear any errors on successful fetch
      } else {
        console.error("Failed to fetch admin users")
        setError("Failed to load staff members. Please try again later.")
      }
    } catch (error) {
      console.error("Error fetching admin users:", error)
      setError("Failed to load staff members. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch received messages
  const fetchReceivedMessages = async () => {
    try {
      const response = await api.get("/messages/received")
      // Update without causing duplicates
      setReceivedMessages((prev) => {
        const newMessages = response.data.filter(
          (newMsg: MessageDTO) => !prev.some((oldMsg) => oldMsg.id === newMsg.id),
        )
        return [...prev, ...newMessages]
      })
      return response.data
    } catch (err) {
      console.error("Error fetching received messages:", err)
      setError("Failed to load received messages. Please try again.")
      return []
    }
  }

  // Fetch sent messages
  const fetchSentMessages = async () => {
    try {
      const response = await api.get("/messages/sent")
      // Update without causing duplicates
      setSentMessages((prev) => {
        const newMessages = response.data.filter(
          (newMsg: MessageDTO) => !prev.some((oldMsg) => oldMsg.id === newMsg.id),
        )
        return [...prev, ...newMessages]
      })
      return response.data
    } catch (err) {
      console.error("Error fetching sent messages:", err)
      setError("Failed to load sent messages. Please try again.")
      return []
    }
  }

  // Fetch conversation with a specific user
  const fetchConversation = async (receiverId: number) => {
    try {
      setIsLoading(true)

      // First, get the conversation from the API
      const response = await api.get(`/messages/conversation/user-authenticated/${receiverId}`)

      // Sort messages by timestamp to ensure chronological order
      const sortedMessages = response.data.sort((a: MessageDTO, b: MessageDTO) => {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      })

      // Store the conversation messages
      setConversationMessages(sortedMessages)

      // Also fetch sent and received messages to ensure we have everything
      const [receivedMsgs, sentMsgs] = await Promise.all([fetchReceivedMessages(), fetchSentMessages()])

      // Combine all messages related to this admin
      const allMessages = [
        ...sortedMessages,
        ...sentMsgs.filter((msg: MessageDTO) => msg.receiverId === receiverId),
        ...receivedMsgs.filter((msg: MessageDTO) => msg.senderId === receiverId),
      ]

      // Remove duplicates by message ID
      const uniqueMessages = Array.from(new Map(allMessages.map((msg) => [msg.id, msg])).values()).sort(
        (a: MessageDTO, b: MessageDTO) => {
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        },
      )

      setConversationMessages(uniqueMessages)

      // Convert to display format
      const formattedMessages = uniqueMessages.map((msg: MessageDTO) => ({
        id: msg.id.toString(),
        text: msg.content,
        sender: (msg.senderId === currentUser.id ? "user" : "support") as "user" | "support" | "ai",
        timestamp: new Date(msg.timestamp),
      }))

      setMessages(formattedMessages)
      setIsLoading(false)
      return uniqueMessages
    } catch (err) {
      console.error("Error fetching conversation:", err)
      setError("Failed to load conversation. Please try again.")
      setIsLoading(false)
      return []
    }
  }

  // Start conversation with selected admin and fetch history
  const startConversationWithAdmin = async (admin: UserEntity) => {
    setSelectedAdmin(admin)
    setLoadingHistory(true)

    try {
      // Fetch conversation history using the fetchConversation function
      const sortedMessages = await fetchConversation(admin.id)

      if (sortedMessages && sortedMessages.length > 0) {
        // Convert the message DTOs to our Message format
        const formattedMessages = sortedMessages.map((msg: MessageDTO) => ({
          id: msg.id.toString(),
          text: msg.content,
          sender: (msg.senderId === currentUser.id ? "user" : "support") as "user" | "support" | "ai",
          timestamp: new Date(msg.timestamp),
        }))

        setMessages(formattedMessages)
      } else {
        // If no history, just show a welcome message
        setMessages([
          {
            text: `You are now chatting with ${admin.username}. How can they help you today?`,
            sender: "support",
            timestamp: new Date(),
            id: "no-history-message",
          },
        ])
      }
    } catch (error) {
      console.error("Error fetching conversation history:", error)
      setMessages([
        {
          text: `You are now chatting with ${admin.username}. How can they help you today?`,
          sender: "support",
          timestamp: new Date(),
          id: "error-fetching-history-1",
        },
        {
          text: "Failed to load previous messages. You can continue your conversation.",
          sender: "support",
          timestamp: new Date(),
          id: "error-fetching-history-2",
        },
      ])
    } finally {
      setLoadingHistory(false)
      // Scroll to bottom after loading history
      setTimeout(() => {
        scrollToBottom()
      }, 100)
    }
  }

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle auto-scrolling when new messages arrive
  useEffect(() => {
    // Auto-scroll if messages length increased (new message arrived)
    if (messages.length > prevMessagesLengthRef.current) {
      scrollToBottom(true) // Force scroll to bottom when new messages arrive
    }

    prevMessagesLengthRef.current = messages.length
  }, [messages.length])

  const scrollToBottom = (force = false) => {
    if (force) {
      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      })
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleSendMessage = async () => {
    if (newMessage.trim() !== "") {
      // Store the message content before clearing the input
      const messageToSend = newMessage
      setNewMessage("")

      if (activeTab === "ai") {
        // Add user message to display
        const userMessage: Message = {
          text: messageToSend,
          sender: "user",
          timestamp: new Date(),
          id: `user-${Date.now()}`,
        }
        setMessages((prev) => [...prev, userMessage])
        setIsLoading(true)

        try {
          // Prepare request for backend
          const request: AIMessageRequest = {
            user: currentUser,
            message: messageToSend,
          }

          // Call backend API
          const response = await fetch("https://it342-g5-collaboraid.onrender.com/api/livechat/ask-ai", {
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
              id: `ai-${Date.now()}`,
            }
            setMessages((prev) => [...prev, aiMessage])
          } else {
            // Handle error
            const aiMessage: Message = {
              text: "Sorry, I encountered an error. Please try again later.",
              sender: "ai",
              timestamp: new Date(),
              id: `ai-error-${Date.now()}`,
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
            id: `ai-fallback-${Date.now()}`,
          }
          setMessages((prev) => [...prev, aiMessage])
        } finally {
          setIsLoading(false)
        }
      } else if (selectedAdmin) {
        // Generate a unique client ID for this message to track it
        const clientId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        // Add user message to display immediately
        const userMessage: Message = {
          text: messageToSend,
          sender: "user",
          timestamp: new Date(),
          // Use the clientId as a temporary ID
          id: clientId,
        }
        setMessages((prev) => [...prev, userMessage])

        // Create a temporary message for the conversation
        const tempMessage: MessageDTO = {
          id: clientId, // Temporary ID with clientId
          senderId: currentUser.id,
          receiverId: selectedAdmin.id,
          content: messageToSend,
          timestamp: new Date().toISOString(),
          read: true,
          clientId: clientId,
        }

        // Add to conversation messages for immediate display
        setConversationMessages((prev) => [...prev, tempMessage])

        setIsLoading(true)

        try {
          if (stompClient && isWebSocketConnected) {
            // Send message via WebSocket
            const messagePayload = {
              sender: {
                id: currentUser.id,
                username: currentUser.username || "",
              },
              receiver: {
                id: selectedAdmin.id,
                username: selectedAdmin.username || "",
              },
              content: messageToSend,
              clientId: clientId, // Add clientId to track this message
            }

            stompClient.publish({
              destination: "/app/sendMessage",
              body: JSON.stringify(messagePayload),
            })

            // Also send via REST API to ensure persistence
            const messageData = {
              receiverId: selectedAdmin.id,
              content: messageToSend,
              clientId: clientId, // Add clientId to track this message
            }

            await api.post("/messages/send-authenticated", messageData)

            // Add auto-reply message with a different clientId
            setTimeout(() => {
              const autoReplyClientId = `auto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
              const autoReplyMessage: Message = {
                text: `Thank you for your message. ${selectedAdmin.username} will respond as soon as possible. Please check your Messages section to view any replies.`,
                sender: "support",
                timestamp: new Date(),
                id: autoReplyClientId,
              }
              setMessages((prev) => [...prev, autoReplyMessage])

              // Force scroll to bottom after auto-reply
              setTimeout(() => scrollToBottom(true), 100)
            }, 1000)
          } else {
            // Fallback to REST API if WebSocket is not available
            const messageData = {
              receiverId: selectedAdmin.id,
              content: messageToSend,
              clientId: clientId, // Add clientId to track this message
            }

            await api.post("/messages/send-authenticated", messageData)

            // Add auto-reply message with a different clientId
            setTimeout(() => {
              const autoReplyClientId = `auto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
              const autoReplyMessage: Message = {
                text: `Thank you for your message. ${selectedAdmin.username} will respond as soon as possible. Please check your Messages section to view any replies.`,
                sender: "support",
                timestamp: new Date(),
                id: autoReplyClientId,
              }
              setMessages((prev) => [...prev, autoReplyMessage])

              // Force scroll to bottom after auto-reply
              setTimeout(() => scrollToBottom(true), 100)
            }, 1000)
          }

          // Don't immediately refresh sent messages to avoid duplicates
          // Instead, wait a moment to ensure the server has processed the message
          setTimeout(async () => {
            await fetchSentMessages()
          }, 2000)

          // Force scroll to bottom
          setTimeout(() => scrollToBottom(true), 100)
        } catch (error) {
          console.error("Error sending message:", error)

          // Show error message
          const errorMessage: Message = {
            text: "Failed to send message. Please try again.",
            sender: "support",
            timestamp: new Date(),
            id: `error-${Date.now()}`,
          }
          setMessages((prev) => [...prev, errorMessage])

          // Remove the temporary message if sending failed
          setMessages((prev) => prev.filter((msg) => msg.id !== clientId))
          setConversationMessages((prev) => prev.filter((msg) => msg.id !== clientId))
        } finally {
          setIsLoading(false)
        }
      }
    }
  }

  // Update the handleAdminRequest function to store user-specific cooldown
  const handleAdminRequest = async () => {
    try {
      setError(null)
      setIsLoading(true) // Add loading state

      // Get the JWT token from localStorage
      const token = localStorage.getItem("jwtToken")
      if (!token) {
        setAlertType("error")
        setAlertMessage("Authentication token not found. Please log in again.")
        setShowVerificationAlert(true)
        setIsLoading(false)
        return
      }

      // Make the API request to request admin role
      const response = await fetch("https://it342-g5-collaboraid.onrender.com/api/auth/request-admin-role", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        // Show success message
        setAlertType("success")
        setAlertMessage("Your admin request has been submitted successfully. We'll review it soon.")
        setShowVerificationAlert(true)

        // Set cooldown timer (5 minutes = 300 seconds)
        setAdminRequestCooldown(true)
        setCooldownTimeRemaining(300)

        // Store the cooldown end time in localStorage with user ID to make it user-specific
        const cooldownEndTime = Date.now() + 300000 // 5 minutes in milliseconds
        localStorage.setItem(`adminRequestCooldownUntil_${currentUser.id}`, cooldownEndTime.toString())

        // Close the dialog after a delay
        setTimeout(() => {
          setShowVerificationAlert(false)
          setShowAdminRequest(false)
        }, 3000)
      } else {
        // Handle different error responses
        const errorText = await response.text()

        if (errorText.includes("User not found") || response.status === 404) {
          setAlertType("error")
          setAlertMessage("Email not found. Please ensure you're logged in with a valid account.")
        } else {
          setAlertType("error")
          setAlertMessage("Request unsuccessful. Please try again.")
        }

        setShowVerificationAlert(true)
      }
    } catch (error) {
      console.error("Error requesting admin role:", error)
      // Show generic error message
      setAlertType("error")
      setAlertMessage("Request unsuccessful. Please try again.")
      setShowVerificationAlert(true)
    } finally {
      setIsLoading(false) // Clear loading state
    }
  }

  const formatTime = (date: Date) => {
    return format(date, "h:mm a")
  }

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null

    if (adminRequestCooldown && cooldownTimeRemaining > 0) {
      timer = setInterval(() => {
        setCooldownTimeRemaining((prev) => {
          if (prev <= 1) {
            setAdminRequestCooldown(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [adminRequestCooldown, cooldownTimeRemaining])

  // Update the useEffect that checks for existing cooldown to be user-specific
  useEffect(() => {
    // Check if there's an existing cooldown in localStorage for this specific user
    const cooldownUntil = localStorage.getItem(`adminRequestCooldownUntil_${currentUser.id}`)
    if (cooldownUntil) {
      const cooldownEndTime = Number.parseInt(cooldownUntil)
      const currentTime = Date.now()

      if (cooldownEndTime > currentTime) {
        // Cooldown is still active for this user
        const remainingTime = Math.ceil((cooldownEndTime - currentTime) / 1000)
        setAdminRequestCooldown(true)
        setCooldownTimeRemaining(remainingTime)
      } else {
        // Cooldown has expired, clear it
        localStorage.removeItem(`adminRequestCooldownUntil_${currentUser.id}`)
      }
    } else {
      // No cooldown for this user, ensure cooldown state is reset
      setAdminRequestCooldown(false)
      setCooldownTimeRemaining(0)
    }
  }, [currentUser.id])

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] h-[600px] flex flex-col overflow-hidden p-0 gap-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              <span>Help & Support</span>
            </div>
          </DialogTitle>
          <DialogDescription>Get assistance with your questions</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="ai" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center px-4 pt-2">
            <TabsList className="grid grid-cols-2 flex-1">
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                AI Assistant
              </TabsTrigger>
              <TabsTrigger value="support" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Staff Support
              </TabsTrigger>
            </TabsList>
            <Button
              variant="outline"
              size="sm"
              className={`ml-2 ${
                adminRequestCooldown ? "bg-gray-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
              } text-white`}
              onClick={() => !adminRequestCooldown && setShowAdminRequest(true)}
              disabled={adminRequestCooldown}
              title={adminRequestCooldown ? `Available in ${cooldownTimeRemaining} seconds` : "Request Admin Access"}
            >
              <Shield className="h-4 w-4 mr-1" />
              {adminRequestCooldown
                ? `Wait ${Math.floor(cooldownTimeRemaining / 60)}:${(cooldownTimeRemaining % 60).toString().padStart(2, "0")}`
                : "Request Admin"}
            </Button>
          </div>

          <TabsContent value="ai" className="flex-1 flex flex-col min-h-0 p-0 m-0 data-[state=active]:flex">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
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
                          {message.sender === "ai" ? (
                            <Avatar className="h-6 w-6">
                           <img src="/collaborbot.png" alt="CollaborBot" className="h-full w-full object-cover rounded-full" />
                            <AvatarFallback>AI</AvatarFallback>
                          </Avatar>
                          
                          ) : (
                            <Avatar className="h-6 w-6">
                              <div className="h-full w-full flex items-center justify-center bg-purple-100 text-purple-600 rounded-full">
                                <User className="h-3.5 w-3.5" />
                              </div>
                              <AvatarFallback>S</AvatarFallback>
                            </Avatar>
                          )}
                          <span className="text-xs font-medium">
                            {message.sender === "ai"
                              ? "CollaborBot"
                              : selectedAdmin
                                ? selectedAdmin.username
                                : "Staff Team"}
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
                      {activeTab === "ai" ? (
                        <Avatar className="h-6 w-6">
                          <div className="h-full w-full flex items-center justify-center bg-blue-100 text-blue-600 rounded-full">
                            <Bot className="h-3.5 w-3.5" />
                          </div>
                          <AvatarFallback>AI</AvatarFallback>
                        </Avatar>
                      ) : (
                        <Avatar className="h-6 w-6">
                          <div className="h-full w-full flex items-center justify-center bg-purple-100 text-purple-600 rounded-full">
                            <User className="h-3.5 w-3.5" />
                          </div>
                          <AvatarFallback>S</AvatarFallback>
                        </Avatar>
                      )}
                      <span className="text-xs font-medium">{activeTab === "ai" ? "AI Assistant" : "Staff Team"}</span>
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
                  placeholder={`Ask the ${activeTab === "ai" ? "AI assistant" : "staff team"}...`}
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
              <p className="text-xs text-muted-foreground mt-2">Press Enter to send</p>
            </div>
          </TabsContent>

          <TabsContent
            value="support"
            className="flex-1 flex flex-col p-0 m-0 data-[state=active]:flex overflow-hidden"
          >
            {!selectedAdmin ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                <h3 className="text-lg font-medium p-4 pb-2">Available Staff Members</h3>

                {/* Scrollable admin list */}
                <div className="flex-1 overflow-y-auto px-4 pb-4">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="flex space-x-2">
                        <div
                          className="h-3 w-3 bg-primary rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="h-3 w-3 bg-primary rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                        <div
                          className="h-3 w-3 bg-primary rounded-full animate-bounce"
                          style={{ animationDelay: "600ms" }}
                        ></div>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="text-center py-8 text-red-500">
                      <p>{error}</p>
                      <Button variant="outline" size="sm" className="mt-4" onClick={fetchAdminUsers}>
                        Try Again
                      </Button>
                    </div>
                  ) : adminUsers.length > 0 ? (
                    <div className="space-y-2">
                      {adminUsers.map((admin) => (
                        <div
                          key={admin.id}
                          className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => startConversationWithAdmin(admin)}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <div className="h-full w-full flex items-center justify-center bg-purple-100 text-purple-600 rounded-full">
                                <User className="h-4 w-4" />
                              </div>
                              <AvatarFallback>{admin.username.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{admin.username}</p>
                              <p className="text-xs text-muted-foreground">Staff Support</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No staff members are currently available.</p>
                      <p className="text-sm mt-2">Please check back later or use the AI Assistant.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full overflow-hidden">
                {/* Chat header */}
                <div className="flex items-center justify-between p-3 border-b">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <div className="h-full w-full flex items-center justify-center bg-purple-100 text-purple-600 rounded-full">
                        <User className="h-4 w-4" />
                      </div>
                      <AvatarFallback>{selectedAdmin.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedAdmin.username}</p>
                      <p className="text-xs text-muted-foreground">Staff Support</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setError(null) // Clear any existing errors
                      setSelectedAdmin(null)
                      setMessages([])
                      // Ensure admin list is refreshed when going back
                      fetchAdminUsers().catch((err) => {
                        console.error("Error fetching admin users:", err)
                        // Don't show error message here to avoid the "Failed to load conversation" error
                      })
                    }}
                  >
                    Back to Staff List
                  </Button>
                </div>

                {/* Chat messages - scrollable */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {loadingHistory ? (
                    <div className="flex justify-center items-center h-16">
                      <div className="flex space-x-2">
                        <div
                          className="h-3 w-3 bg-primary rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="h-3 w-3 bg-primary rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                        <div
                          className="h-3 w-3 bg-primary rounded-full animate-bounce"
                          style={{ animationDelay: "600ms" }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    messages
                      .filter((msg) => {
                        // Ensure that you only show the relevant messages based on the selected tab
                        if (activeTab === "ai") {
                          return msg.sender !== "support" // Show AI messages only for the "ai" tab
                        } else {
                          return msg.sender !== "ai" // Show support messages only for the "support" tab
                        }
                      })
                      .map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
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
                                {message.sender === "ai" ? (
                                  <Avatar className="h-6 w-6">
                                    <div className="h-full w-full flex items-center justify-center bg-blue-100 text-blue-600 rounded-full">
                                      <Bot className="h-3.5 w-3.5" />
                                    </div>
                                    <AvatarFallback>AI</AvatarFallback>
                                  </Avatar>
                                ) : (
                                  <Avatar className="h-6 w-6">
                                    <div className="h-full w-full flex items-center justify-center bg-purple-100 text-purple-600 rounded-full">
                                      <User className="h-3.5 w-3.5" />
                                    </div>
                                    <AvatarFallback>S</AvatarFallback>
                                  </Avatar>
                                )}
                                <span className="text-xs font-medium">
                                  {message.sender === "ai"
                                    ? "AI Assistant"
                                    : selectedAdmin
                                      ? selectedAdmin.username
                                      : "Staff Team"}
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
                      ))
                  )}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-lg p-3 bg-secondary">
                        <div className="flex items-center gap-2 mb-1">
                          <Avatar className="h-6 w-6">
                            <div className="h-full w-full flex items-center justify-center bg-purple-100 text-purple-600 rounded-full">
                              <User className="h-3.5 w-3.5" />
                            </div>
                            <AvatarFallback>S</AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium">
                            {selectedAdmin ? selectedAdmin.username : "Staff Team"}
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

                {/* Message input */}
                <div className="p-4 border-t mt-auto">
                  <div className="flex items-center space-x-2">
                    <Input
                      type="text"
                      placeholder={`Message ${selectedAdmin.username}...`}
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
                  <p className="text-xs text-muted-foreground mt-2">Staff members typically respond within 2 hours</p>
                </div>
              </div>
            )}
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
              Submit your request for administrator privileges. Our team will review your request.
            </DialogDescription>
          </DialogHeader>

          {showVerificationAlert && (
            <Alert
              className={`${alertType === "success" ? "bg-green-100 border-green-200" : "bg-red-100 border-red-200"}`}
            >
              <AlertDescription className={`${alertType === "success" ? "text-green-800" : "text-red-800"}`}>
                {alertMessage}
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
