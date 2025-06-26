"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckSquare, MessageSquare, Bell, Clock, Calendar, Award, BookOpen, ArrowRight } from "lucide-react"
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Add these imports at the top of the file
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

// Define interfaces for API responses
interface Task {
  id: number
  title: string
  description: string
  status: string
  dueDate: string
  points: number
  responses?: number
  progress?: number
  userId: number
  helperUserId?: number
  timestamp?: string // Add this line
}

// Update the Message interface to match the backend DTO
interface Message {
  id: number
  messageId?: number
  senderId: number
  senderUsername: string
  senderEmail?: string
  senderRole?: string
  senderAvatar?: string
  receiverId?: number
  receiverUsername?: string
  receiverEmail?: string
  content: string
  timestamp: string
  read: boolean
  taskId: number
  taskTitle: string
}

// Update the GroupedMessage interface to use senderUsername
interface GroupedMessage {
  senderId: number
  senderUsername: string
  senderEmail?: string
  senderRole?: string
  senderAvatar?: string
  latestMessage: string
  timestamp: string
  unreadCount: number
  read: boolean
  taskId: number
  taskTitle: string
}

interface Notification {
  id: number
  userId: number
  message: string
  type: string
  createdAt: string
  read: boolean
}

interface Activity {
  id: string | number
  action: string
  detail: string
  time: string
  icon: any
}

// Define the props interface
interface DashboardContentProps {
  user: {
    id: string
    name: string
    email: string
    role: string
    avatar: string
  }
  setActiveTab: (tab: string) => void
}

export function DashboardContent({ user, setActiveTab }: DashboardContentProps) {
  // State for data from API
  const [openTasks, setOpenTasks] = useState<Task[]>([])
  const [postedTasks, setPostedTasks] = useState<Task[]>([])
  const [acceptedTasks, setAcceptedTasks] = useState<Task[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [groupedMessages, setGroupedMessages] = useState<GroupedMessage[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<Task[]>([])

  // Add these state variables after the existing state declarations
  const [selectedMessage, setSelectedMessage] = useState<GroupedMessage | null>(null)
  const [isMessageDetailsOpen, setIsMessageDetailsOpen] = useState(false)

  // Loading states
  const [isLoading, setIsLoading] = useState({
    tasks: true,
    messages: true,
    notifications: true,
  })

  // Error states
  const [error, setError] = useState({
    tasks: null,
    messages: null,
    notifications: null,
  })

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

  // Fetch open tasks
  const fetchOpenTasks = async () => {
    try {
      const response = await api.get("/task/open")
      setOpenTasks(response.data)
    } catch (err) {
      console.error("Error fetching open tasks:", err)
      setError((prev) => ({ ...prev, tasks: "Failed to load open tasks" }))
    }
  }

  // Fetch posted tasks by user
  const fetchPostedTasks = async () => {
    try {
      const response = await api.get(`/task/posted`)
      setPostedTasks(response.data)
    } catch (err) {
      console.error("Error fetching posted tasks:", err)
      setError((prev) => ({ ...prev, tasks: "Failed to load posted tasks" }))
    }
  }

  // Fetch accepted tasks by user
  const fetchAcceptedTasks = async () => {
    try {
      const response = await api.get(`/task/accepted`)
      setAcceptedTasks(response.data)
    } catch (err) {
      console.error("Error fetching accepted tasks:", err)
      setError((prev) => ({ ...prev, tasks: "Failed to load accepted tasks" }))
    }
  }

  // Update the fetchMessages function to map content to the correct field
  const fetchMessages = async () => {
    try {
      const response = await api.get("/messages/received")

      // Map the backend DTO fields to our frontend model
      const mappedMessages = response.data.map((msg: any) => ({
        id: msg.messageId,
        messageId: msg.messageId,
        senderId: msg.senderId,
        senderUsername: msg.senderUsername,
        senderEmail: msg.senderEmail,
        senderRole: msg.senderRole,
        content: msg.content,
        timestamp: msg.timestamp,
        read: false, // Assuming all fetched messages are unread initially
        taskId: msg.taskId || 0,
        taskTitle: msg.taskTitle || "General Message",
      }))

      setMessages(mappedMessages)

      // Group messages by sender
      groupMessagesBySender(mappedMessages)
    } catch (err) {
      console.error("Error fetching messages:", err)
      setError((prev) => ({ ...prev, messages: "Failed to load messages" }))
    } finally {
      setIsLoading((prev) => ({ ...prev, messages: false }))
    }
  }

  // Update the groupMessagesBySender function to use senderUsername
  const groupMessagesBySender = (messages: Message[]) => {
    // Create a map to store the latest message from each sender
    const senderMap = new Map<number, GroupedMessage>()

    // Process each message
    messages.forEach((message) => {
      const {
        senderId,
        senderUsername,
        senderEmail,
        senderRole,
        senderAvatar,
        content,
        timestamp,
        read,
        taskId,
        taskTitle,
      } = message

      // Make sure we have the sender username
      const displayUsername = senderUsername || `User ${senderId}`

      // Check if we already have a message from this sender
      if (senderMap.has(senderId)) {
        const existingMessage = senderMap.get(senderId)!

        // If this message is newer than the one we have, update it
        if (new Date(timestamp) > new Date(existingMessage.timestamp)) {
          existingMessage.latestMessage = content
          existingMessage.timestamp = timestamp
          existingMessage.taskId = taskId
          existingMessage.taskTitle = taskTitle
          // Ensure we always have the sender username
          if (displayUsername && !existingMessage.senderUsername) {
            existingMessage.senderUsername = displayUsername
          }
          // Update other sender info if available
          if (senderEmail) existingMessage.senderEmail = senderEmail
          if (senderRole) existingMessage.senderRole = senderRole
        }

        // Increment unread count if this message is unread
        if (!read) {
          existingMessage.unreadCount += 1
          existingMessage.read = false
        }
      } else {
        // First message from this sender
        senderMap.set(senderId, {
          senderId,
          senderUsername: displayUsername,
          senderEmail,
          senderRole,
          senderAvatar,
          latestMessage: content,
          timestamp,
          unreadCount: read ? 0 : 1,
          read,
          taskId,
          taskTitle,
        })
      }
    })

    // Convert map to array and sort by timestamp (newest first)
    const groupedMessagesArray = Array.from(senderMap.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )

    setGroupedMessages(groupedMessagesArray)
  }

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications/user")
      setNotifications(response.data)
    } catch (err) {
      console.error("Error fetching notifications:", err)
      setError((prev) => ({ ...prev, notifications: "Failed to load notifications" }))
    } finally {
      setIsLoading((prev) => ({ ...prev, notifications: false }))
    }
  }

  // Generate activities from tasks, messages, and notifications
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false)

  // Function to open task details
  const openTaskDetails = (task: Task) => {
    setSelectedTask(task)
    setIsTaskDetailsOpen(true)
  }

  // Function to close task details
  const closeTaskDetails = () => {
    setIsTaskDetailsOpen(false)
    setSelectedTask(null)
  }

  // Add these functions after the openTaskDetails and closeTaskDetails functions
  const openMessageDetails = (message: GroupedMessage) => {
    setSelectedMessage(message)
    setIsMessageDetailsOpen(true)
  }

  const closeMessageDetails = () => {
    setIsMessageDetailsOpen(false)
    setSelectedMessage(null)
  }

  const generateActivities = () => {
    const allActivities: Activity[] = []

    // Add activities from posted tasks
    postedTasks.slice(0, 2).forEach((task) => {
      let timeDisplay
      try {
        // Validate the date
        const date = new Date(task.dueDate)
        timeDisplay = isNaN(date.getTime()) ? "No date" : date.toLocaleString()
      } catch (error) {
        timeDisplay = "No date available"
      }

      allActivities.push({
        id: `task-${task.id}`,
        action: "Posted a new task",
        detail: task.title,
        time: timeDisplay,
        icon: CheckSquare,
      })
    })

    // Update the activities generation to use senderUsername
    // Add activities from messages - use grouped messages instead
    groupedMessages.slice(0, 2).forEach((message) => {
      let timeDisplay
      try {
        // Validate the date
        const date = new Date(message.timestamp)
        timeDisplay = isNaN(date.getTime()) ? "No date available" : date.toLocaleString()
      } catch (error) {
        timeDisplay = "No date available"
      }

      allActivities.push({
        id: `message-${message.senderId}`,
        action: "Received a message",
        detail: `From ${message.senderUsername}`,
        time: timeDisplay,
        icon: MessageSquare,
      })
    })

    // Add activities from notifications
    notifications.slice(0, 2).forEach((notification) => {
      let timeDisplay
      try {
        // Validate the date
        const date = new Date(notification.createdAt)
        timeDisplay = isNaN(date.getTime()) ? "No date available" : date.toLocaleString()
      } catch (error) {
        timeDisplay = "No date available"
      }

      allActivities.push({
        id: `notification-${notification.id}`,
        action: notification.type,
        detail: notification.message,
        time: timeDisplay,
        icon: notification.type.includes("point") ? Award : Bell,
      })
    })

    // Sort by time (newest first)
    allActivities.sort((a, b) => {
      // Handle cases where time might be "No date available"
      if (a.time === "No date available") return 1
      if (b.time === "No date available") return -1

      try {
        return new Date(b.time).getTime() - new Date(a.time).getTime()
      } catch (error) {
        return 0
      }
    })

    setActivities(allActivities.slice(0, 4))
  }

  // Generate upcoming deadlines from tasks
  const generateUpcomingDeadlines = () => {
    const allTasks = [...postedTasks, ...acceptedTasks]

    // Filter tasks with future due dates
    const futureTasks = allTasks.filter((task) => new Date(task.dueDate) > new Date())

    // Sort by due date (soonest first)
    futureTasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

    setUpcomingDeadlines(futureTasks.slice(0, 4))
  }

  // Fetch all data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading({ tasks: true, messages: true, notifications: true })

      try {
        await Promise.all([
          fetchOpenTasks(),
          fetchPostedTasks(),
          fetchAcceptedTasks(),
          fetchMessages(),
          fetchNotifications(),
        ])
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
      } finally {
        setIsLoading({ tasks: false, messages: false, notifications: false })
      }
    }

    fetchAllData()
  }, [user.id])

  // Generate activities and deadlines when data changes
  useEffect(() => {
    if (!isLoading.tasks && !isLoading.messages && !isLoading.notifications) {
      generateActivities()
      generateUpcomingDeadlines()
    }
  }, [postedTasks, acceptedTasks, groupedMessages, notifications, isLoading])

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "No date available"

    try {
      const date = new Date(dateString)

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "No date available"
      }

      const now = new Date()
      const diffTime = Math.abs(now.getTime() - date.getTime())
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 0) {
        return `Today at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
      } else if (diffDays === 1) {
        return `Tomorrow at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
      } else if (diffDays < 7) {
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        return `${days[date.getDay()]} at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
      } else {
        return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    } catch (error) {
      console.error("Error formatting date:", error)
      return "No date available"
    }
  }

  // Format time ago for display
  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return "No timestamp"

    try {
      const date = new Date(dateString)

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "No timestamp"
      }

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
    } catch (error) {
      console.error("Error formatting time ago:", error)
      return "No timestamp"
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name || "Student"}</h1>
        <p className="text-muted-foreground mt-2">Here's an overview of your tasks, messages, and recent activity.</p>
      </div>

      {/* Stats overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-blue-50 border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {isLoading.tasks ? (
                <div className="h-7 w-12 bg-muted animate-pulse rounded"></div>
              ) : (
                postedTasks.length + acceptedTasks.length
              )}
            </div>
            <p className="text-xs text-blue-600">
              {isLoading.tasks ? (
                <div className="h-4 w-32 bg-muted animate-pulse rounded mt-1"></div>
              ) : (
                `${postedTasks.length} posted, ${acceptedTasks.length} accepted`
              )}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">
              {isLoading.messages ? (
                <div className="h-7 w-12 bg-muted animate-pulse rounded"></div>
              ) : (
                messages.filter((msg) => !msg.read).length
              )}
            </div>
            <p className="text-xs text-purple-600">
              {isLoading.messages ? (
                <div className="h-4 w-32 bg-muted animate-pulse rounded mt-1"></div>
              ) : (
                `From ${groupedMessages.filter((msg) => !msg.read).length} conversations`
              )}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">
              {isLoading.notifications ? (
                <div className="h-7 w-12 bg-muted animate-pulse rounded"></div>
              ) : (
                notifications.filter((n) => !n.read).length
              )}
            </div>
            <p className="text-xs text-amber-600">
              {isLoading.notifications ? (
                <div className="h-4 w-32 bg-muted animate-pulse rounded mt-1"></div>
              ) : (
                `${notifications.filter((n) => !n.read && new Date(n.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length} new since yesterday`
              )}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collaboration Points</CardTitle>
            <Award className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">10</div>
            <p className="text-xs text-green-600">+10 for new users</p>
          </CardContent>
        </Card>
      </div>

      {/* Tasks section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
            <CardDescription>Your recently posted and accepted tasks</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading.tasks ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="h-5 w-40 bg-muted animate-pulse rounded"></div>
                        <div className="h-4 w-64 bg-muted animate-pulse rounded"></div>
                      </div>
                      <div className="text-right">
                        <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                        <div className="h-4 w-16 bg-muted animate-pulse rounded mt-2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error.tasks ? (
              <div className="p-4 text-center">
                <p className="text-red-500">{error.tasks}</p>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => {
                    setError((prev) => ({ ...prev, tasks: null }))
                    fetchPostedTasks()
                    fetchAcceptedTasks()
                  }}
                >
                  Retry
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {[...postedTasks, ...acceptedTasks]
                  .sort((a, b) => {
                    // Handle invalid dates
                    try {
                      const dateA = new Date(b.dueDate)
                      const dateB = new Date(a.dueDate)
                      if (isNaN(dateA.getTime())) return -1
                      if (isNaN(dateB.getTime())) return 1
                      return dateA.getTime() - dateB.getTime()
                    } catch (error) {
                      return 0
                    }
                  })
                  .slice(0, 3)
                  .map((task) => (
                    <div key={task.id} className="rounded-lg border p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            {task.status === "Open" ? (
                              <CheckSquare className="h-4 w-4 text-blue-500" />
                            ) : task.status === "In Progress" ? (
                              <Clock className="h-4 w-4 text-amber-500" />
                            ) : (
                              <BookOpen className="h-4 w-4 text-green-500" />
                            )}
                            <h3 className="font-semibold">{task.title}</h3>
                            <Badge
                              variant={task.status === "Open" ? "secondary" : "outline"}
                              className={
                                task.status === "Open"
                                  ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                  : task.status === "In Progress"
                                    ? "border-amber-200 text-amber-700"
                                    : "border-green-200 text-green-700"
                              }
                            >
                              {task.status === "Open" ? "Posted" : task.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="mr-1 h-3 w-3 text-slate-400" />
                            {formatDate(task.dueDate)}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1 flex items-center justify-end">
                            <Clock className="mr-1 h-3 w-3 text-slate-400" />
                            {task.timestamp ? formatTimeAgo(task.timestamp) : "No timestamp"}
                          </div>
                          <div className="text-sm font-medium mt-1 flex items-center justify-end">
                            <Award className="mr-1 h-3 w-3 text-amber-500" />
                            {task.points} points
                          </div>
                        </div>
                      </div>
                      {task.status === "Open" ? (
                        <div className="mt-4 flex items-center justify-between">
                          <div className="text-sm text-muted-foreground flex items-center">
                            <MessageSquare className="mr-1 h-3 w-3 text-slate-400" />
                            {task.responses || 0} {(task.responses || 0) === 1 ? "response" : "responses"}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => openTaskDetails(task)}
                          >
                            View Details
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progress</span>
                            {/* Set progress to 50% for "Pending Verification" status */}
                            <span>{task.status === "Pending Verification" ? 50 : task.progress || 0}%</span>
                          </div>
                          <Progress
                            value={task.status === "Pending Verification" ? 50 : task.progress || 0}
                            className="h-2 bg-slate-100"
                          >
                            <div
                              className={`h-full ${
                                task.status === "Pending Verification"
                                  ? "bg-amber-500"
                                  : task.progress && task.progress > 70
                                    ? "bg-green-500"
                                    : task.progress && task.progress > 30
                                      ? "bg-amber-500"
                                      : "bg-blue-500"
                              }`}
                            />
                          </Progress>
                          <div className="flex justify-end mt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={() => openTaskDetails(task)}
                            >
                              View Details
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => setActiveTab("tasks")}>
              View All Tasks
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Messages</CardTitle>
            <CardDescription>Your latest conversations</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading.messages ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-muted animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                        <div className="h-3 w-16 bg-muted animate-pulse rounded"></div>
                      </div>
                      <div className="h-4 w-full bg-muted animate-pulse rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error.messages ? (
              <div className="p-4 text-center">
                <p className="text-red-500">{error.messages}</p>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => {
                    setError((prev) => ({ ...prev, messages: null }))
                    fetchMessages()
                  }}
                >
                  Retry
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Use groupedMessages instead of individual messages */}
                {groupedMessages.slice(0, 3).map((message) => (
                  <div
                    key={message.senderId}
                    className="flex items-start gap-4 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => openMessageDetails(message)}
                  >
                    <Avatar>
                      <AvatarImage src={message.senderAvatar || "/placeholder.svg"} alt={message.senderUsername} />
                      <AvatarFallback className={message.read ? "bg-slate-100" : "bg-purple-100 text-purple-700"}>
                        {message.senderUsername ? message.senderUsername.charAt(0) : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium flex items-center">
                          <MessageSquare className="mr-1 h-3 w-3 text-purple-500" />
                          <span className="font-semibold">{message.senderUsername}</span>
                          {message.senderRole && (
                            <span className="ml-1 text-xs text-muted-foreground">({message.senderRole})</span>
                          )}
                        </p>
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Clock className="mr-1 h-3 w-3 text-slate-400" />
                          {formatTimeAgo(message.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{message.latestMessage}</p>
                      <p className="text-xs text-slate-500 flex items-center">
                        <CheckSquare className="mr-1 h-3 w-3 text-blue-400" />
                        Re: {message.taskTitle}
                      </p>
                      {/* Show unread count if there are unread messages */}
                      {message.unreadCount > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-purple-600 font-medium">
                            {message.unreadCount} unread {message.unreadCount === 1 ? "message" : "messages"}
                          </span>
                          <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => setActiveTab("messages")}>
              View All Messages
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Activity and upcoming */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest actions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading.tasks || isLoading.messages || isLoading.notifications ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="rounded-full bg-muted p-2 animate-pulse">
                      <div className="h-4 w-4"></div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-muted animate-pulse rounded"></div>
                      <div className="h-4 w-48 bg-muted animate-pulse rounded"></div>
                      <div className="h-3 w-24 bg-muted animate-pulse rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4">
                    <div
                      className={`rounded-full p-2 ${
                        activity.icon === CheckSquare
                          ? "bg-blue-100"
                          : activity.icon === MessageSquare
                            ? "bg-purple-100"
                            : activity.icon === Bell
                              ? "bg-amber-100"
                              : activity.icon === Award
                                ? "bg-green-100"
                                : "bg-primary/10"
                      }`}
                    >
                      <activity.icon
                        className={`h-4 w-4 ${
                          activity.icon === CheckSquare
                            ? "text-blue-600"
                            : activity.icon === MessageSquare
                              ? "text-purple-600"
                              : activity.icon === Bell
                                ? "text-amber-600"
                                : activity.icon === Award
                                  ? "text-green-600"
                                  : "text-primary"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">{activity.detail}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Distribution</CardTitle>
            <CardDescription>Overview of your tasks by status and category</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6">
            <div className="h-[200px]">
              <ChartContainer
                config={{
                  posted: {
                    label: "Posted",
                    color: "hsl(221, 83%, 53%)",
                  },
                  accepted: {
                    label: "Accepted",
                    color: "hsl(142, 76%, 36%)",
                  },
                  completed: {
                    label: "Completed",
                    color: "hsl(43, 96%, 56%)",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Posted", value: postedTasks.length, fill: "var(--color-posted)" },
                        { name: "Accepted", value: acceptedTasks.length, fill: "var(--color-accepted)" },
                        { name: "Completed", value: Math.floor(Math.random() * 5) + 1, fill: "var(--color-completed)" },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {[
                        { name: "Posted", fill: "#3b82f6" },
                        { name: "Accepted", fill: "#16a34a" },
                        { name: "Completed", fill: "#eab308" },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            <div className="h-[200px]">
              <ChartContainer
                config={{
                  points: {
                    label: "Points",
                    color: "hsl(221, 83%, 53%)",
                  },
                }}
              >
                <BarChart
                  data={[
                    { category: "Research", points: 45 },
                    { category: "Programming", points: 65 },
                    { category: "Design", points: 30 },
                    { category: "Writing", points: 50 },
                    { category: "Presentation", points: 25 },
                  ]}
                  margin={{ top: 10, right: 10, left: 10, bottom: 24 }}
                >
                  {/* Use type assertion to fix the TypeScript error */}
                  <XAxis
                    dataKey="category"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                    tickMargin={8}
                    {...({} as any)}
                  />
                  <YAxis hide {...({} as any)} />

                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="points" radius={4}>
                    {[
                      { value: 45, fill: "#3b82f6" },
                      { value: 65, fill: "#8b5cf6" },
                      { value: 30, fill: "#ec4899" },
                      { value: 50, fill: "#f97316" },
                      { value: 25, fill: "#14b8a6" },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Details Dialog */}
      {selectedTask && (
        <Dialog open={isTaskDetailsOpen} onOpenChange={setIsTaskDetailsOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedTask.status === "Open" ? (
                  <CheckSquare className="h-5 w-5 text-blue-500" />
                ) : selectedTask.status === "In Progress" ? (
                  <Clock className="h-5 w-5 text-amber-500" />
                ) : (
                  <BookOpen className="h-5 w-5 text-green-500" />
                )}
                {selectedTask.title}
              </DialogTitle>
              <DialogDescription>Task ID: {selectedTask.id}</DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="details">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 mt-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedTask.description}</p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Status</h4>
                    <Badge
                      variant={selectedTask.status === "Open" ? "secondary" : "outline"}
                      className={
                        selectedTask.status === "Open"
                          ? "bg-blue-100 text-blue-700"
                          : selectedTask.status === "In Progress"
                            ? "border-amber-200 text-amber-700"
                            : "border-green-200 text-green-700"
                      }
                    >
                      {selectedTask.status === "Open" ? "Posted" : selectedTask.status}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-1">Points</h4>
                    <p className="text-sm flex items-center">
                      <Award className="mr-1 h-4 w-4 text-amber-500" />
                      {selectedTask.points}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-1">Due Date</h4>
                    <p className="text-sm flex items-center">
                      <Calendar className="mr-1 h-4 w-4 text-slate-400" />
                      {formatDate(selectedTask.dueDate)}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-1">Created</h4>
                    <p className="text-sm flex items-center">
                      <Clock className="mr-1 h-4 w-4 text-slate-400" />
                      {selectedTask.timestamp ? formatTimeAgo(selectedTask.timestamp) : "No timestamp"}
                    </p>
                  </div>
                </div>

                {selectedTask.status !== "Open" && (
                  <>
                    <Separator />

                    <div>
                      <h4 className="text-sm font-medium mb-1">Progress</h4>
                      <Progress value={selectedTask.progress || 0} className="h-2 bg-slate-100 mt-2">
                        <div
                          className={`h-full ${selectedTask.progress && selectedTask.progress > 70 ? "bg-green-500" : selectedTask.progress && selectedTask.progress > 30 ? "bg-amber-500" : "bg-blue-500"}`}
                        />
                      </Progress>
                      <p className="text-xs text-right mt-1">{selectedTask.progress || 0}% complete</p>
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="activity" className="mt-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-blue-100 p-1.5">
                      <CheckSquare className="h-3.5 w-3.5 text-blue-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Task created</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedTask.timestamp ? formatTimeAgo(selectedTask.timestamp) : "No timestamp"}
                      </p>
                    </div>
                  </div>

                  {selectedTask.status !== "Open" && (
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-amber-100 p-1.5">
                        <Clock className="h-3.5 w-3.5 text-amber-700" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Task accepted</p>
                        <p className="text-xs text-muted-foreground">{formatTimeAgo(selectedTask.timestamp || "")}</p>
                      </div>
                    </div>
                  )}

                  {selectedTask.status === "Completed" && (
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-green-100 p-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-green-700" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Task completed</p>
                        <p className="text-xs text-muted-foreground">{formatTimeAgo(selectedTask.timestamp || "")}</p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
              <Button>
                {selectedTask.status === "Open"
                  ? "Accept Task"
                  : selectedTask.status === "In Progress"
                    ? "Mark as Complete"
                    : "View Details"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {/* Message Details Dialog */}
      {selectedMessage && (
        <Dialog open={isMessageDetailsOpen} onOpenChange={setIsMessageDetailsOpen}>
          <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-4 border-b bg-purple-50">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src={selectedMessage.senderAvatar || "/placeholder.svg"}
                      alt={selectedMessage.senderUsername}
                    />
                    <AvatarFallback className="bg-purple-100 text-purple-700">
                      {selectedMessage.senderUsername ? selectedMessage.senderUsername.charAt(0) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold flex items-center">
                      {selectedMessage.senderUsername}
                      {selectedMessage.senderRole && (
                        <span className="ml-1 text-xs text-muted-foreground">({selectedMessage.senderRole})</span>
                      )}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {selectedMessage.senderEmail || "No email available"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
                      {selectedMessage.unreadCount > 0 ? "Unread" : "Read"}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(selectedMessage.timestamp)}</p>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div className="p-4 flex-1 overflow-auto">
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-1 flex items-center">
                    <CheckSquare className="mr-1 h-4 w-4 text-blue-500" />
                    Related Task
                  </h4>
                  <div className="bg-slate-50 p-3 rounded-md">
                    <p className="text-sm font-medium">{selectedMessage.taskTitle}</p>
                    <p className="text-xs text-muted-foreground mt-1">Task ID: {selectedMessage.taskId}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-1">Latest Message</h4>
                  <div className="bg-purple-50 p-3 rounded-md">
                    <p className="text-sm">{selectedMessage.latestMessage}</p>
                    <p className="text-xs text-right text-muted-foreground mt-2">
                      {formatTimeAgo(selectedMessage.timestamp)}
                    </p>
                  </div>
                </div>

                {selectedMessage.unreadCount > 0 && (
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-xs text-purple-600 font-medium">
                      {selectedMessage.unreadCount} unread {selectedMessage.unreadCount === 1 ? "message" : "messages"}
                    </p>
                    <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t bg-slate-50 flex justify-between">
                <DialogClose asChild>
                  <Button variant="outline" size="sm">
                    Close
                  </Button>
                </DialogClose>
                <Button
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => {
                    closeMessageDetails()
                    setActiveTab("messages")
                  }}
                >
                  View Full Conversation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
