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
}

interface Message {
  id: number
  senderId: number
  senderName: string
  senderAvatar?: string
  content: string
  timestamp: string
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
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<Task[]>([])

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
    // baseURL: "https://it342-g5-collaboraid.onrender.com/api",
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

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const response = await api.get("/messages/received")
      setMessages(response.data)
    } catch (err) {
      console.error("Error fetching messages:", err)
      setError((prev) => ({ ...prev, messages: "Failed to load messages" }))
    } finally {
      setIsLoading((prev) => ({ ...prev, messages: false }))
    }
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
  const generateActivities = () => {
    const allActivities: Activity[] = []

    // Add activities from posted tasks
    postedTasks.slice(0, 2).forEach((task) => {
      allActivities.push({
        id: `task-${task.id}`,
        action: "Posted a new task",
        detail: task.title,
        time: new Date(task.dueDate).toLocaleString(),
        icon: CheckSquare,
      })
    })

    // Add activities from messages
    messages.slice(0, 2).forEach((message) => {
      allActivities.push({
        id: `message-${message.id}`,
        action: "Received a message",
        detail: `From ${message.senderName}`,
        time: new Date(message.timestamp).toLocaleString(),
        icon: MessageSquare,
      })
    })

    // Add activities from notifications
    notifications.slice(0, 2).forEach((notification) => {
      allActivities.push({
        id: `notification-${notification.id}`,
        action: notification.type,
        detail: notification.message,
        time: new Date(notification.createdAt).toLocaleString(),
        icon: notification.type.includes("point") ? Award : Bell,
      })
    })

    // Sort by time (newest first)
    allActivities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

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
  }, [postedTasks, acceptedTasks, messages, notifications, isLoading])

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
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
                `From ${new Set(messages.filter((msg) => !msg.read).map((msg) => msg.senderId)).size} conversations`
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
            <div className="text-2xl font-bold text-green-700">250</div>
            <p className="text-xs text-green-600">+25 this week</p>
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
                  .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
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
                          >
                            View Details
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progress</span>
                            <span>{task.progress || 0}%</span>
                          </div>
                          <Progress value={task.progress || 0} className="h-2 bg-slate-100">
                            <div
                              className={`h-full ${task.progress && task.progress > 70 ? "bg-green-500" : task.progress && task.progress > 30 ? "bg-amber-500" : "bg-blue-500"}`}
                            />
                          </Progress>
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
                {messages
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .slice(0, 3)
                  .map((message) => (
                    <div
                      key={message.id}
                      className="flex items-start gap-4 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <Avatar>
                        <AvatarImage src={message.senderAvatar || "/placeholder.svg"} alt={message.senderName} />
                        <AvatarFallback className={message.read ? "bg-slate-100" : "bg-purple-100 text-purple-700"}>
                          {message.senderName ? message.senderName.charAt(0) : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium flex items-center">
                            <MessageSquare className="mr-1 h-3 w-3 text-purple-500" />
                            {message.senderName}
                          </p>
                          <span className="text-xs text-muted-foreground flex items-center">
                            <Clock className="mr-1 h-3 w-3 text-slate-400" />
                            {formatTimeAgo(message.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{message.content}</p>
                        <p className="text-xs text-slate-500 flex items-center">
                          <CheckSquare className="mr-1 h-3 w-3 text-blue-400" />
                          Re: {message.taskTitle}
                        </p>
                      </div>
                      {!message.read && <div className="h-2 w-2 rounded-full bg-purple-500"></div>}
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
                    <div className="rounded-full bg-primary/10 p-2">
                      <activity.icon className="h-4 w-4 text-primary" />
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
                  <XAxis dataKey="category" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} tickMargin={8} />
                  <YAxis hide />
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
    </div>
  )
}
