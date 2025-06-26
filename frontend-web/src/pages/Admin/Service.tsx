"use client"


import { useEffect, useState, useRef, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Send, Search, Phone, Video, MoreVertical, ArrowDown, PaperclipIcon as PaperClip, X } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { useUsers, fetchConversation } from "./MockData"
import { decodeToken } from "../JWTDecode/JWTDecode"
import { Client } from "@stomp/stompjs"
import SockJS from "sockjs-client"

interface Message {
  id: number
  senderId: number
  receiverId: number
  content: string
  timestamp: Date
  attachment?: string
  attachmentType?: string
}

export default function Service() {
  const [userRefreshKey, setUserRefreshKey] = useState(0)

  const users = useUsers(userRefreshKey)
  const navigate = useNavigate()
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [messageInput, setMessageInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [client, setClient] = useState<Client | null>(null)
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [attachment, setAttachment] = useState<File | null>(null)
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const token = localStorage.getItem("jwtToken")

  // Use useMemo to decode the token only when the token changes
  const decodedToken = useMemo(() => (token ? decodeToken(token) : null), [token])
  const currentUserId = decodedToken?.id
  const isAdmin = decodedToken?.role === "ADMIN"

  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const chatContainerRef = useRef<HTMLDivElement | null>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const prevMessagesLengthRef = useRef(0)

  useEffect(() => {
    if (!isAdmin) {
      navigate("/")
    }
  }, [isAdmin, navigate])

  // Fetch chat history (this is now only used to load the initial chat history)
  const fetchChatHistory = async () => {
    if (!selectedUser || !decodedToken) return
    try {
      const data = await fetchConversation(Number(decodedToken.id), selectedUser.id)
      setMessages(data)
    } catch (error) {
      console.error("Failed to fetch chat history:", error)
    }
  }

  useEffect(() => {
    fetchChatHistory()
  }, [selectedUser, decodedToken]) // Ensures it's only fetched when selectedUser or decodedToken changes

  // In the WebSocket connection useEffect, add more detailed logging
  useEffect(() => {
    if (isAdmin && currentUserId) {
      console.log("Attempting to connect to WebSocket...")
      const socket = new SockJS("https://it342-g5-collaboraid.onrender.com/ws")
      const stompClient = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        debug: (str) => {
          console.log("STOMP Debug:", str)
        },
        onConnect: () => {
          console.log("Connected to WebSocket for messages")
          console.log("Subscribing to topic:", `/topic/messages/${currentUserId}`)

          stompClient.subscribe(`/topic/messages/${currentUserId}`, (message) => {
            console.log("WebSocket message received:", message)
            if (message.body) {
              const messageData = JSON.parse(message.body)
              console.log("Parsed message data:", messageData)

              // Map received message to match your Message interface
              const formattedMessage = {
                id: Number(messageData.messageId || messageData.id),
                senderId: Number(messageData.senderId),
                receiverId: Number(messageData.receiverId),
                content: messageData.content,
                timestamp: new Date(messageData.timestamp),
                attachment: messageData.attachment,
                attachmentType: messageData.attachmentType,
              }

              console.log("Formatted message:", formattedMessage)

              // Add the new message to the state if it's not already present
              setMessages((prevMessages) => {
                // Check if message already exists to avoid duplicates
                if (
                  !prevMessages.some(
                    (msg) =>
                      msg.id === formattedMessage.id ||
                      (msg.senderId === formattedMessage.senderId &&
                        msg.content === formattedMessage.content &&
                        Math.abs(new Date(msg.timestamp).getTime() - new Date(formattedMessage.timestamp).getTime()) <
                          5000),
                  )
                ) {
                  console.log("Adding new message to state")
                  return [...prevMessages, formattedMessage]
                }
                console.log("Message already exists in state")
                return prevMessages
              })
            }
          })

          // Also subscribe to a broader topic in case the server is publishing to a different channel
          stompClient.subscribe(`/topic/public`, (message) => {
            console.log("Public message received:", message)
            // Process public messages if needed
          })

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
      setClient(stompClient)

      // Set up a ping interval to keep the connection alive
      const pingInterval = setInterval(() => {
        if (stompClient.connected) {
          console.log("Sending ping to keep WebSocket alive")
          stompClient.publish({ destination: "/app/ping", body: JSON.stringify({ userId: currentUserId }) })
        }
      }, 30000) // Every 30 seconds

      return () => {
        clearInterval(pingInterval)
        if (stompClient.connected) {
          console.log("Deactivating WebSocket connection")
          stompClient.deactivate()
        }
      }
    }
  }, [isAdmin, currentUserId, decodedToken])

  // Improve the handleSendMessage function to better handle WebSocket sending
  const handleSendMessage = async () => {
    if ((messageInput.trim() === "" && !attachment) || !selectedUser || !decodedToken) return

    try {
      const adminUser = {
        id: Number(decodedToken.id),
        username: decodedToken.username,
        email: decodedToken.email,
        role: decodedToken.role,
      }

      let attachmentData = null
      let attachmentType = null

      // Handle attachment if present
      if (attachment) {
        const reader = new FileReader()
        attachmentData = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.readAsDataURL(attachment)
        })
        attachmentType = attachment.type
      }

      // Generate a unique message ID for tracking
      const tempMessageId = Date.now()

      const messagePayload = {
        sender: adminUser,
        receiver: {
          id: Number(selectedUser.id),
          username: selectedUser.username,
          email: selectedUser.email,
          role: selectedUser.role,
        },
        content: messageInput,
        attachment: attachmentData,
        attachmentType: attachmentType,
        clientId: tempMessageId.toString(), // Add a client ID for tracking
      }

      // Add message to local state for immediate display
      const newMessage: Message = {
        id: tempMessageId,
        senderId: Number(decodedToken.id),
        receiverId: Number(selectedUser.id),
        content: messageInput,
        timestamp: new Date(),
        attachment: attachmentData,
        attachmentType: attachmentType,
      }

      setMessages((prev) => [...prev, newMessage])
      setMessageInput("")
      setAttachment(null)
      setAttachmentPreview(null)

      if (client && isWebSocketConnected) {
        console.log("Sending message via WebSocket:", messagePayload)
        // Send via WebSocket
        client.publish({
          destination: "/app/sendMessage",
          body: JSON.stringify(messagePayload),
        })

        // Also try sending to a more specific destination
        client.publish({
          destination: `/app/chat/${selectedUser.id}`,
          body: JSON.stringify(messagePayload),
        })

        console.log("Message sent via WebSocket")
      } else {
        console.error("WebSocket is not connected! Falling back to REST API")
        // Fallback to REST API if WebSocket is not available
        try {
          const response = await fetch("https://it342-g5-collaboraid.onrender.com/api/messages/send-authenticated", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              receiverId: Number(selectedUser.id),
              content: messageInput,
              attachment: attachmentData,
              attachmentType: attachmentType,
              clientId: tempMessageId.toString(),
            }),
          })

          if (!response.ok) {
            console.error("Failed to send message via REST API", await response.text())
          } else {
            console.log("Message sent via REST API")
          }
        } catch (error) {
          console.error("Error sending message via REST API:", error)
        }
      }

      // Force scroll to bottom after sending
      setTimeout(() => {
        scrollToBottom(true)
      }, 100)
    } catch (error) {
      console.error("Error in handleSendMessage:", error)
    }
  }

  const formatTime = (date: Date) =>
    new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })

  // Filter users only by the search query, not by role
  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Improved scroll handling
  const handleScroll = () => {
    if (!chatContainerRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current
    const bottomThreshold = 50 // pixels from bottom to consider "at bottom"
    const atBottom = scrollHeight - scrollTop - clientHeight <= bottomThreshold

    setIsAtBottom(atBottom)
    setShowScrollButton(!atBottom)
  }

  // Scroll to bottom function
  const scrollToBottom = (force = false) => {
    if (!chatContainerRef.current) return

    if (force || isAtBottom) {
      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
        }
      })
    }
  }

  // Handle auto-scrolling when new messages arrive
  useEffect(() => {
    // Only auto-scroll if messages length increased (new message arrived)
    if (messages.length > prevMessagesLengthRef.current) {
      scrollToBottom()
    }

    prevMessagesLengthRef.current = messages.length
  }, [messages])

  // Add this useEffect after your other useEffect hooks
  useEffect(() => {
    // Save the original overflow style
    const originalStyle = document.body.style.overflow

    // Prevent scrolling on the body
    document.body.style.overflow = "hidden"

    // Restore original style on cleanup
    return () => {
      document.body.style.overflow = originalStyle
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAttachment(file)

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setAttachmentPreview(e.target?.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setAttachmentPreview(null)
      }
    }
  }

  const handleRemoveAttachment = () => {
    setAttachment(null)
    setAttachmentPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-6 isolate h-screen overflow-hidden">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Service Chat</h1>
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${isWebSocketConnected ? "bg-green-500" : "bg-red-500"}`}></div>
          <Badge variant="outline" className="bg-primary text-primary-foreground">
            {isWebSocketConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
        {/* User List */}
        <Card className="md:col-span-1 overflow-hidden">
          <div className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <h3 className="text-sm font-medium mb-2">All Users ({filteredUsers.length})</h3>
          </div>
          <ScrollArea className="h-[calc(100vh-320px)]">
            <div className="px-2">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors ${
                    selectedUser?.id === user.id ? "bg-muted" : "hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedUser(user)}
                >
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarFallback className={user.role === "ADMIN" ? "bg-primary text-primary-foreground" : ""}>
                      {user.username
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">{user.username}</p>
                      <span className="text-xs text-muted-foreground">{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                      {user.role === "ADMIN" && (
                        <Badge variant="outline" className="bg-primary text-primary-foreground text-xs">
                          Admin
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Chat Section */}
        <Card className="md:col-span-2 flex flex-col">
          {selectedUser ? (
            <>
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback
                      className={selectedUser.role === "ADMIN" ? "bg-primary text-primary-foreground" : ""}
                    >
                      {selectedUser.username
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedUser.username}</p>
                    <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-muted-foreground cursor-pointer" />
                  <Video className="h-5 w-5 text-muted-foreground cursor-pointer" />
                  <MoreVertical className="h-5 w-5 text-muted-foreground cursor-pointer" />
                </div>
              </div>
              <div className="relative flex-1 flex flex-col">
                <div
                  ref={chatContainerRef}
                  className="chat-messages flex-1 overflow-y-auto px-4 py-6 space-y-4 max-h-[calc(100vh-320px)] overscroll-contain"
                  onScroll={handleScroll}
                >
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === decodedToken?.id ? "justify-end" : "justify-start"}`}
                      onClick={(e) => {
                        // Prevent default behavior for clicks on messages
                        e.stopPropagation()
                      }}
                    >
                      <div className="max-w-[75%] text-sm p-3 rounded-lg bg-muted text-black dark:bg-gray-830 dark:text-white">
                        {message.content}

                        {message.attachment && message.attachmentType?.startsWith("image/") && (
                          <div className="mt-2">
                            <img
                              src={message.attachment || "/placeholder.svg"}
                              alt="Attachment"
                              className="max-w-full rounded-md"
                            />
                          </div>
                        )}

                        {message.attachment && !message.attachmentType?.startsWith("image/") && (
                          <div className="mt-2">
                            <a
                              href={message.attachment}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary underline flex items-center"
                            >
                              <PaperClip className="h-3 w-3 mr-1" />
                              Attachment
                            </a>
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground dark:text-gray-400 mt-1 text-right">
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Scroll to bottom button */}
                {showScrollButton && (
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-4 right-4 rounded-full shadow-md"
                    onClick={() => scrollToBottom(true)}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t">
                {attachmentPreview && (
                  <div className="mb-2 relative inline-block">
                    <img
                      src={attachmentPreview || "/placeholder.svg"}
                      alt="Attachment preview"
                      className="h-20 rounded-md object-cover"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
                      onClick={handleRemoveAttachment}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                {attachment && !attachmentPreview && (
                  <div className="mb-2 relative inline-block bg-muted p-2 rounded-md">
                    <span className="text-xs">{attachment.name}</span>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
                      onClick={handleRemoveAttachment}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <PaperClip className="h-5 w-5" />
                  </Button>
                  <Input
                    placeholder="Type your message"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                  />
                  <Button
                    variant="secondary"
                    onClick={handleSendMessage}
                    disabled={messageInput.trim() === "" && !attachment}
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <p className="p-4 text-center text-muted-foreground">Select a user to start chatting</p>
          )}
        </Card>
      </div>
    </div>
  )
}
