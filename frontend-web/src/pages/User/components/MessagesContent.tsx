"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, AlertCircle, Search, Phone, Video, MoreVertical, ArrowDown } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getToken, decodeToken } from "../../JWTDecode/JWTDecode"
import { Client } from "@stomp/stompjs"
import SockJS from "sockjs-client"

// Define interfaces for API responses
interface MessageDTO {
  id: number
  senderId: number
  senderUsername: string
  senderAvatar?: string
  receiverId: number
  receiverUsername: string
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
  email?: string
  lastMessage?: string
  lastMessageTime?: Date
  hasUnreadMessages?: boolean
}

export function MessagesContent() {
  // State for messages data
  const [receivedMessages, setReceivedMessages] = useState<MessageDTO[]>([])
  const [sentMessages, setSentMessages] = useState<MessageDTO[]>([])
  const [conversationMessages, setConversationMessages] = useState<MessageDTO[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [client, setClient] = useState<Client | null>(null)
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [usersWithChats, setUsersWithChats] = useState<User[]>([])
  const [isAtBottom, setIsAtBottom] = useState(true)

  const chatContainerRef = useRef<HTMLDivElement | null>(null)
  const prevMessagesLengthRef = useRef(0)
  const selectedUserRef = useRef<User | null>(null)

  // Update the ref when selectedUser changes
  useEffect(() => {
    selectedUserRef.current = selectedUser
  }, [selectedUser])

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

  // Get current user from token
  useEffect(() => {
    const token = getToken()
    if (token) {
      const decodedToken = decodeToken(token)
      if (decodedToken && decodedToken.id) {
        // Convert id to number to ensure type compatibility
        const userId = typeof decodedToken.id === "string" ? Number.parseInt(decodedToken.id, 10) : decodedToken.id

        setCurrentUser({
          id: userId,
          name: decodedToken.username || "You",
          email: decodedToken.email,
        })
      }
    }
  }, [])

  // Fetch received messages
  const fetchReceivedMessages = async () => {
    try {
      const response = await api.get("/messages/received")
      setReceivedMessages(response.data)
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
      setSentMessages(response.data)
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
      const response = await api.get(`/messages/conversation/user-authenticated/${receiverId}`)

      // Sort messages by timestamp to ensure chronological order
      const sortedMessages = response.data.sort((a: MessageDTO, b: MessageDTO) => {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      })

      setConversationMessages(sortedMessages)
      return sortedMessages
    } catch (err) {
      console.error("Error fetching conversation:", err)
      setError("Failed to load conversation. Please try again.")
      return []
    }
  }

  // Fetch users with existing chats
  const fetchUsersWithChats = async () => {
    if (!currentUser?.id) return

    setIsLoading(true)
    try {
      // Combine received and sent messages to get all users we've chatted with
      const allUsers = new Map<number, User>()

      // Process received messages
      receivedMessages.forEach((message) => {
        if (!allUsers.has(message.senderId)) {
          allUsers.set(message.senderId, {
            id: message.senderId,
            name: message.senderUsername,
            avatar: message.senderAvatar,
            lastMessage: message.content,
            lastMessageTime: new Date(message.timestamp),
            hasUnreadMessages: !message.read,
          })
        } else {
          const existingUser = allUsers.get(message.senderId)!
          const messageTime = new Date(message.timestamp)
          if (existingUser.lastMessageTime && messageTime > existingUser.lastMessageTime) {
            existingUser.lastMessage = message.content
            existingUser.lastMessageTime = messageTime
            existingUser.hasUnreadMessages = !message.read || existingUser.hasUnreadMessages
          }
        }
      })

      // Process sent messages
      sentMessages.forEach((message) => {
        if (!allUsers.has(message.receiverId)) {
          allUsers.set(message.receiverId, {
            id: message.receiverId,
            name: message.receiverUsername,
            avatar: message.receiverAvatar,
            lastMessage: message.content,
            lastMessageTime: new Date(message.timestamp),
            hasUnreadMessages: false,
          })
        } else {
          const existingUser = allUsers.get(message.receiverId)!
          const messageTime = new Date(message.timestamp)
          if (existingUser.lastMessageTime && messageTime > existingUser.lastMessageTime) {
            existingUser.lastMessage = message.content
            existingUser.lastMessageTime = messageTime
          }
        }
      })

      // Convert map to array and sort by most recent message
      const usersArray = Array.from(allUsers.values())
      usersArray.sort((a, b) => {
        if (!a.lastMessageTime || !b.lastMessageTime) return 0
        return b.lastMessageTime.getTime() - a.lastMessageTime.getTime()
      })

      setUsersWithChats(usersArray)
      
      // If there are users but none is selected, select the first one
      if (usersArray.length > 0 && !selectedUser) {
        setSelectedUser(usersArray[0])
        fetchConversation(usersArray[0].id)
      }
    } catch (error) {
      console.error("Failed to process users with chats:", error)
      setError("Failed to load conversations. Please try again.")
    } finally {
      setIsLoading(false)
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

      // // Create a temporary message object to immediately show in the UI
      // const tempMessage: MessageDTO = {
      //   id: Date.now(), // Temporary ID, will be replaced with actual ID from API
      //   senderId: currentUser?.id || 0,
      //   senderUsername: currentUser?.name || "",
      //   senderAvatar: currentUser?.avatar,
      //   receiverId: selectedUser.id,
      //   receiverUsername: selectedUser.name,
      //   receiverAvatar: selectedUser.avatar,
      //   content: newMessage,
      //   timestamp: new Date().toISOString(),
      //   read: true,
      // }

      // // Add message to conversation immediately for a responsive UI
      // setConversationMessages(prev => [...prev, tempMessage])

      if (client && isWebSocketConnected) {
        // Send via WebSocket if connected
        client.publish({
          destination: "/app/sendMessage",
          body: JSON.stringify({
            sender: {
              id: currentUser?.id,
              username: currentUser?.name || "",
            },
            receiver: {
              id: selectedUser.id,
              username: selectedUser.name || "",
            },
            content: newMessage,
          }),
        })
      } else {
        // Fallback to REST API
        await api.post("/messages/send-authenticated", messageData)
      }

      // Clear input
      setNewMessage("")

      // Force scroll to bottom
      setTimeout(() => {
        scrollToBottom(true)
      }, 100)

      // Refresh message lists
      await fetchSentMessages()
      
      // If we're using REST API, we need to refresh the conversation too
      if (!isWebSocketConnected && selectedUser) {
        fetchConversation(selectedUser.id)
      }
    } catch (err) {
      console.error("Error sending message:", err)
      setError("Failed to send message. Please try again.")
      
      // Remove the temporary message if sending failed
      setConversationMessages(prev => 
        prev.filter(msg => typeof msg.id === 'number' && msg.id !== Date.now())
      )
    }
  }

  // Format time for display
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Format date for display in user list
  const formatDate = (date: Date | string) => {
    const messageDate = typeof date === "string" ? new Date(date) : date
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (messageDate >= today) {
      return formatTime(messageDate.toISOString())
    } else if (messageDate >= yesterday) {
      return "Yesterday"
    } else {
      return messageDate.toLocaleDateString()
    }
  }

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

  // Filter users by the search query
  const filteredUsers = usersWithChats.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  // Fetch messages on component mount
  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true)
      setError(null)

      try {
        await Promise.all([fetchReceivedMessages(), fetchSentMessages()])
        
        // After fetching messages, we need to process them
        // This will be handled by the other useEffect that watches receivedMessages and sentMessages
      } catch (err) {
        console.error("Error fetching messages:", err)
        setError("Failed to load messages. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()
  }, [])

  // Update users with chats when messages change
  useEffect(() => {
    if (receivedMessages.length > 0 || sentMessages.length > 0) {
      fetchUsersWithChats()
      
      // If no user is selected but we have messages, select the first user in the list
      if (!selectedUser && receivedMessages.length > 0) {
        const firstSenderId = receivedMessages[0].senderId
        const firstSender = {
          id: firstSenderId,
          name: receivedMessages[0].senderUsername,
          avatar: receivedMessages[0].senderAvatar
        }
        setSelectedUser(firstSender)
        fetchConversation(firstSenderId)
      }
    }
  }, [receivedMessages, sentMessages, currentUser?.id, selectedUser])

  // When selectedUser changes, fetch the conversation
  useEffect(() => {
    if (selectedUser) {
      fetchConversation(selectedUser.id)
    }
  }, [selectedUser])

  // Set up WebSocket connection
  useEffect(() => {
    if (currentUser?.id) {
      const socket = new SockJS("https://it342-g5-collaboraid.onrender.com/ws")
      const stompClient = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          console.log("Connected to WebSocket for messages")
          stompClient.subscribe(`/topic/messages/${currentUser.id}`, (message) => {
            if (message.body) {
              const messageData = JSON.parse(message.body)
              const formattedMessage = {
                id: messageData.messageId || messageData.id,
                senderId: messageData.senderId,
                senderUsername: messageData.senderUsername || "",
                senderAvatar: messageData.senderAvatar,
                receiverId: messageData.receiverId,
                receiverUsername: messageData.receiverUsername || "",
                receiverAvatar: messageData.receiverAvatar,
                content: messageData.content,
                timestamp: messageData.timestamp,
                read: false,
                taskId: messageData.taskId,
                taskTitle: messageData.taskTitle,
              }

              // Update conversation if it's the current one
              if (
                selectedUserRef.current &&
                (formattedMessage.senderId === selectedUserRef.current.id || 
                 formattedMessage.receiverId === selectedUserRef.current.id)
              ) {
                setConversationMessages((prev) => {
                  // Check if message is already in the conversation (avoid duplicates)
                  const messageExists = prev.some(m => m.id === formattedMessage.id)
                  if (messageExists) {
                    return prev
                  }
                  return [...prev, formattedMessage]
                })
                
                // Force scroll to bottom for new messages
                setTimeout(() => scrollToBottom(true), 100)
              }

              // Refresh message lists regardless of which conversation it is
              fetchReceivedMessages()
              fetchSentMessages()
            }
          })

          setIsWebSocketConnected(true)
        },
        onStompError: (frame) => {
          console.error("STOMP error:", frame)
        },
        onDisconnect: () => {
          console.log("Disconnected from WebSocket for messages")
          setIsWebSocketConnected(false)
        },
      })

      stompClient.activate()
      setClient(stompClient)

      return () => {
        stompClient.deactivate()
      }
    }
  }, [currentUser?.id])

  // Handle auto-scrolling when new messages arrive or conversation changes
  useEffect(() => {
    // Auto-scroll if messages length increased (new message arrived) or when conversation changes
    if (conversationMessages.length > prevMessagesLengthRef.current || 
        (conversationMessages.length > 0 && prevMessagesLengthRef.current === 0)) {
      scrollToBottom(true) // Force scroll to bottom when conversation changes
    }

    prevMessagesLengthRef.current = conversationMessages.length
  }, [conversationMessages])

  // Mark messages as read when selecting a user
  useEffect(() => {
    if (selectedUser) {
      setUsersWithChats((prevUsers) => {
        return prevUsers.map((user) => {
          if (user.id === selectedUser.id) {
            return {
              ...user,
              hasUnreadMessages: false,
            }
          }
          return user
        })
      })
      
      // Make an API call to mark messages as read if needed
      // This would be implemented if your backend supports it
    }
  }, [selectedUser])

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <Badge variant="outline" className="bg-primary text-primary-foreground">
          Conversations
        </Badge>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ minHeight: "600px", height: "calc(100vh - 200px)" }}>
        {/* User List */}
        <Card className="md:col-span-1 overflow-hidden">
          <div className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search conversations..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <h3 className="text-sm font-medium mb-2">Conversations ({filteredUsers.length})</h3>
          </div>
          <ScrollArea className="h-[calc(100%-100px)]">
            <div className="px-2">
              {isLoading ? (
                <div className="p-4 text-center text-muted-foreground">Loading conversations...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  {searchQuery ? "No matching conversations found" : "No conversations yet"}
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors ${
                      selectedUser?.id === user.id ? "bg-muted" : "hover:bg-muted/50"
                    }`}
                    onClick={() => {
                      setSelectedUser(user)
                    }}
                  >
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback>
                        {user.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`font-medium truncate ${user.hasUnreadMessages ? "text-primary" : ""}`}>
                          {user.name}
                          {user.hasUnreadMessages && (
                            <span className="ml-2 inline-block h-2 w-2 rounded-full bg-primary"></span>
                          )}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {user.lastMessageTime ? formatDate(user.lastMessageTime) : ""}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {user.lastMessage || "Start a conversation"}
                      </p>
                    </div>
                  </div>
                ))
              )}
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
                    <AvatarImage src={selectedUser.avatar || "/placeholder.svg"} alt={selectedUser.name} />
                    <AvatarFallback>
                      {selectedUser.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedUser.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedUser.email || ""}</p>
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
                  className="chat-messages flex-1 overflow-y-auto px-4 py-6 space-y-4 max-h-[calc(100vh-350px)] overscroll-contain"
                  onScroll={handleScroll}
                >
                  {conversationMessages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    conversationMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.senderId === currentUser?.id ? "justify-end" : "justify-start"}`}
                      >
                        <div className="max-w-[75%] text-sm p-3 rounded-lg bg-muted text-black dark:bg-gray-830 dark:text-white">
                          {message.content}
                          <div className="text-xs text-muted-foreground dark:text-gray-400 mt-1 text-right">
                            {formatTime(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
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
              <div className="p-4 border-t flex items-center gap-4">
                <Input
                  placeholder="Type your message"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                />
                <Button variant="secondary" onClick={sendMessage}>
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </>
          ) : (
            <div className="p-4 text-center text-muted-foreground flex items-center justify-center h-full">
              <div>
                <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                <p>Choose a contact from the list to start chatting</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}