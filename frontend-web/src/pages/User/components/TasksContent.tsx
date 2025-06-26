"use client"

import { AlertDialogFooter } from "@/components/ui/alert-dialog"

import { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  CheckSquare,
  Clock,
  Edit,
  Trash2,
  Plus,
  AlertCircle,
  CheckCircle,
  Calendar,
  Tag,
  Award,
  MessageSquare,
  User,
  FileText,
  BarChart4,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Import the utility functions from JWTDecode.tsx
import { getToken, decodeToken } from "../../JWTDecode/JWTDecode"

// Define interfaces
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
  category: string
  userAvatar?: string
  helperAvatar?: string
  activeStatus?: string // Add this property
  active?: boolean
}

// Category color mapping
const categoryColors: Record<string, string> = {
  ENGINEERING: "bg-orange-100 text-orange-800 border-orange-200",
  NURSING: "bg-red-100 text-red-800 border-red-200",
  PROGRAMMING: "bg-blue-100 text-blue-800 border-blue-200",
  MATHEMATICS: "bg-indigo-100 text-indigo-800 border-indigo-200",
  PHYSICS: "bg-purple-100 text-purple-800 border-purple-200",
  CHEMISTRY: "bg-pink-100 text-pink-800 border-pink-200",
  BIOLOGY: "bg-green-100 text-green-800 border-green-200",
  PSYCHOLOGY: "bg-yellow-100 text-yellow-800 border-yellow-200",
  ART_DESIGN: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200",
  MUSIC: "bg-violet-100 text-violet-800 border-violet-200",
  LITERATURE: "bg-amber-100 text-amber-800 border-amber-200",
  HISTORY: "bg-brown-100 text-brown-800 border-brown-200",
  SOCIOLOGY: "bg-teal-100 text-teal-800 border-teal-200",
  PHILOSOPHY: "bg-cyan-100 text-cyan-800 border-cyan-200",
  EDUCATION: "bg-lime-100 text-lime-800 border-lime-200",
  MARKETING: "bg-emerald-100 text-emerald-800 border-emerald-200",
  BUSINESS_MANAGEMENT: "bg-sky-100 text-sky-800 border-sky-200",
  FINANCE: "bg-slate-100 text-slate-800 border-slate-200",
  LEGAL_STUDIES: "bg-gray-100 text-gray-800 border-gray-200",
  LANGUAGES: "bg-rose-100 text-rose-800 border-rose-200",
  HEALTH_WELLNESS: "bg-green-100 text-green-800 border-green-200",
  DATA_SCIENCE: "bg-blue-100 text-blue-800 border-blue-200",
  MACHINE_LEARNING: "bg-violet-100 text-violet-800 border-violet-200",
}

// Get category badge class
const getCategoryBadgeClass = (category: string) => {
  return categoryColors[category] || "bg-gray-100 text-gray-800 border-gray-200"
}

// Status color mapping
const getStatusColors = (status: string) => {
  switch (status) {
    case "Open":
      return "bg-blue-100 text-blue-700 border-blue-200"
    case "In Progress":
      return "bg-amber-100 text-amber-700 border-amber-200"
    case "Pending Verification":
      return "bg-purple-100 text-purple-700 border-purple-200"
    case "Done":
      return "bg-green-100 text-green-700 border-green-200"
    default:
      return "bg-gray-100 text-gray-700 border-gray-200"
  }
}

// Status icon mapping
const getStatusIcon = (status: string) => {
  switch (status) {
    case "Open":
      return <FileText className="h-4 w-4 text-blue-500" />
    case "In Progress":
      return <Clock className="h-4 w-4 text-amber-500" />
    case "Pending Verification":
      return <CheckSquare className="h-4 w-4 text-purple-500" />
    case "Done":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    default:
      return <FileText className="h-4 w-4 text-gray-500" />
  }
}

export function TasksContent() {
  // State for tasks data
  const [tasks, setTasks] = useState<Task[]>([])
  const [pendingVerificationTasks, setPendingVerificationTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPendingLoading, setIsPendingLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState("all")

  // State for task creation/editing
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isTaskDetailDialogOpen, setIsTaskDetailDialogOpen] = useState(false)

  // Add a new state for the task limit warning dialog
  const [isTaskLimitDialogOpen, setIsTaskLimitDialogOpen] = useState(false)
  const [taskLimitMessage, setTaskLimitMessage] = useState("")

  // Add a new state for the self-confirmation error dialog
  const [isSelfConfirmDialogOpen, setIsSelfConfirmDialogOpen] = useState(false)

  const [currentTask, setCurrentTask] = useState<Task | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  // Form state
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    category: "",
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

  // Fetch all tasks
  const fetchAllTasks = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [openResponse, postedResponse, acceptedResponse] = await Promise.all([
        api.get("/task/posted"),
        api.get("/task/accepted"),
        api.get("/task/history"),
      ])

      // Combine all tasks
      const allTasks = [...openResponse.data, ...postedResponse.data, ...acceptedResponse.data]

      // Remove duplicates (if any)
      const uniqueTasks = Array.from(new Map(allTasks.map((task) => [task.id, task])).values())

      // Filter out inactive tasks
      const activeTasks = uniqueTasks.filter((task) => task.activeStatus !== "INACTIVE")

      setTasks(activeTasks)
    } catch (err) {
      console.error("Error fetching tasks:", err)
      setError("Failed to load tasks. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch pending verification tasks
  const fetchPendingVerificationTasks = async () => {
    setIsPendingLoading(true)
    setError(null)

    try {
      const response = await api.get("/task/pending-verification")
      // Filter out inactive tasks
      const activePendingTasks = response.data.filter((task) => task.activeStatus !== "INACTIVE")
      setPendingVerificationTasks(activePendingTasks)
    } catch (err) {
      console.error("Error fetching pending verification tasks:", err)
      setError("Failed to load pending verification tasks. Please try again.")
    } finally {
      setIsPendingLoading(false)
    }
  }

  // Update the createTask function to handle the specific error message
  const createTask = async () => {
    try {
      // Get user ID from JWT token instead of localStorage
      const token = getToken()
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.")
      }

      const decodedToken = decodeToken(token)
      if (!decodedToken || !decodedToken.id) {
        throw new Error("User information not found in token. Please log in again.")
      }

      const userId = decodedToken.id
      console.log("Creating task for user ID:", userId)

      // Validate form
      if (!taskForm.title || !taskForm.description || !taskForm.category) {
        throw new Error("Please fill in all required fields")
      }

      // Format the task data
      const taskData = {
        title: taskForm.title,
        description: taskForm.description,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default to 7 days from now
        points: 30, // Default points value
        category: taskForm.category,
      }

      // Send the request
      await api.post(`/task?userId=${userId}`, taskData)

      // Close the dialog and refresh tasks
      setIsCreateDialogOpen(false)
      resetTaskForm()
      fetchAllTasks()
    } catch (err: any) {
      console.error("Error creating task:", err)

      // Check for the specific error message about task limit
      const errorMessage = err.response?.data?.message || err.message || "Failed to create task"

      if (
        errorMessage.includes("You must complete and verify your current task before creating a new one") ||
        err.response?.status === 400
      ) {
        // Show the task limit dialog instead of the generic error
        setTaskLimitMessage("You must complete and verify your current task before creating a new one.")
        setIsTaskLimitDialogOpen(true)
        setIsCreateDialogOpen(false)
      } else {
        // Show generic error for other errors
        setError(errorMessage)
      }
    }
  }

  // Update a task
  const updateTask = async () => {
    try {
      if (!currentTask) return

      // Get user ID from JWT token instead of localStorage
      const token = getToken()
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.")
      }

      const decodedToken = decodeToken(token)
      if (!decodedToken || !decodedToken.id) {
        throw new Error("User information not found in token. Please log in again.")
      }

      const userId = decodedToken.id
      console.log("Updating task for user ID:", userId)

      // Format the task data
      const taskData = {
        ...currentTask,
        title: taskForm.title,
        description: taskForm.description,
        category: taskForm.category,
      }

      // Send the request
      await api.put(`/task/${currentTask.id}?userId=${userId}`, taskData)

      // Close the dialog and refresh tasks
      setIsEditDialogOpen(false)
      setCurrentTask(null)
      resetTaskForm()
      fetchAllTasks()
    } catch (err: any) {
      console.error("Error updating task:", err)
      setError(err.response?.data?.message || err.message || "Failed to update task")
    }
  }

  // Delete (deactivate) a task
  const deleteTask = async () => {
    try {
      if (!currentTask) return

      // Send the request
      await api.put(`/task/${currentTask.id}/deactivate`)

      // Close the dialog and refresh tasks
      setIsDeleteDialogOpen(false)
      setCurrentTask(null)
      fetchAllTasks()
    } catch (err: any) {
      console.error("Error deleting task:", err)
      setError(err.response?.data?.message || err.message || "Failed to delete task")
    }
  }

  // Request task done
  const requestTaskDone = async (taskId: number) => {
    try {
      // Get user ID from JWT token
      const token = getToken()
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.")
      }

      const decodedToken = decodeToken(token)
      if (!decodedToken || !decodedToken.id) {
        throw new Error("User information not found in token. Please log in again.")
      }

      const userId = decodedToken.id

      // Send the request
      await api.put(`/task/${taskId}/request-done?userId=${userId}`)

      // Refresh tasks
      fetchAllTasks()
      fetchPendingVerificationTasks()
    } catch (err: any) {
      console.error("Error requesting task done:", err)
      setError(err.response?.data?.message || err.message || "Failed to request task done")
    }
  }

  // Update the confirmTaskDone function to handle the specific error
  const confirmTaskDone = async (taskId: number) => {
    try {
      // Get user ID from JWT token
      const token = getToken()
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.")
      }

      const decodedToken = decodeToken(token)
      if (!decodedToken || !decodedToken.id) {
        throw new Error("User information not found in token. Please log in again.")
      }

      const userId = decodedToken.id

      // Send the request
      await api.put(`/task/${taskId}/confirm-done?userId=${userId}`)

      // Refresh tasks
      fetchPendingVerificationTasks()
      fetchAllTasks()
    } catch (err: any) {
      console.error("Error confirming task done:", err)

      // Check for the specific error message about self-confirmation
      const errorMessage = err.response?.data || err.message || "Failed to confirm task done"

      if (
        errorMessage.includes("You cannot confirm your own request") ||
        (err.response?.status === 400 && err.response?.data?.includes("You cannot confirm your own request"))
      ) {
        // Show the self-confirmation dialog instead of the generic error
        setIsSelfConfirmDialogOpen(true)
      } else {
        // Show generic error for other errors
        setError(err.response?.data || err.message || "Failed to confirm task done")
      }
    }
  }

  // Reset task form
  const resetTaskForm = () => {
    setTaskForm({
      title: "",
      description: "",
      category: "",
    })
  }

  // Handle edit button click
  const handleEditClick = (task: Task) => {
    setCurrentTask(task)
    setTaskForm({
      title: task.title,
      description: task.description,
      category: task.category,
    })
    setIsEditDialogOpen(true)
  }

  // Handle delete button click
  const handleDeleteClick = (task: Task) => {
    setCurrentTask(task)
    setIsDeleteDialogOpen(true)
  }

  // Handle task click to show details
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setIsTaskDetailDialogOpen(true)
  }

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

  // Filter tasks based on selected tab
  const filteredTasks = tasks.filter((task) => {
    if (selectedTab === "all") return true
    if (selectedTab === "posted") return task.status === "Open"
    if (selectedTab === "accepted") return task.status === "In Progress"
    if (selectedTab === "completed") return task.status === "Done"
    if (selectedTab === "pending") return task.status === "Pending Verification"
    return true
  })

  // Fetch tasks on component mount
  useEffect(() => {
    fetchAllTasks()
    fetchPendingVerificationTasks()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-2">Manage your posted and accepted tasks</p>
        </div>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          <span>Create Task</span>
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0 text-red-600" />
          <div>
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-slate-100">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
          >
            All Tasks
          </TabsTrigger>
          <TabsTrigger
            value="posted"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
          >
            Posted
          </TabsTrigger>
          <TabsTrigger
            value="accepted"
            className="data-[state=active]:bg-white data-[state=active]:text-amber-700 data-[state=active]:shadow-sm"
          >
            Accepted
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm"
          >
            Pending
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-sm"
          >
            Completed
          </TabsTrigger>
        </TabsList>
        <TabsContent value={selectedTab} className="mt-6">
          {selectedTab === "pending" ? (
            isPendingLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="h-5 w-40 bg-muted rounded"></div>
                          <div className="h-4 w-64 bg-muted rounded"></div>
                          <div className="h-4 w-32 bg-muted rounded"></div>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-muted"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : pendingVerificationTasks.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border shadow-sm">
                <CheckSquare className="mx-auto h-12 w-12 text-purple-400" />
                <h3 className="mt-4 text-lg font-medium">No pending verification tasks</h3>
                <p className="mt-2 text-muted-foreground">You don't have any tasks waiting for verification.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {pendingVerificationTasks.map((task) => (
                  <Card
                    key={task.id}
                    className="cursor-pointer hover:bg-purple-50 transition-colors border-purple-100 overflow-hidden"
                  >
                    <div className="h-1 bg-purple-400"></div>
                    <CardContent className="p-6" onClick={() => handleTaskClick(task)}>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <CheckSquare className="h-4 w-4 text-purple-500" />
                            <h3 className="font-semibold">{task.title}</h3>
                            <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                              Pending Verification
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge variant="outline" className={`text-xs ${getCategoryBadgeClass(task.category)}`}>
                              <Tag className="h-3 w-3 mr-1" />
                              {task.category.replace(/_/g, " ")}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center">
                              <Calendar className="mr-1 h-3 w-3 text-purple-400" />
                              {formatDate(task.dueDate)}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Avatar className="h-10 w-10 border-2 border-purple-100">
                            <AvatarImage src={task.userAvatar || "/placeholder.svg"} alt="User" />
                            <AvatarFallback className="bg-purple-100 text-purple-800">U</AvatarFallback>
                          </Avatar>
                          <div className="text-sm font-medium flex items-center">
                            <Award className="h-3 w-3 mr-1 text-amber-500" />
                            {task.points} points
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm text-purple-600 flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          Waiting for verification
                        </div>
                        <Button
                          variant="default"
                          size="sm"
                          className="h-8 gap-1 bg-purple-600 hover:bg-purple-700"
                          onClick={(e) => {
                            e.stopPropagation()
                            confirmTaskDone(task.id)
                          }}
                        >
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />
                          Confirm Done
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          ) : isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="h-5 w-40 bg-muted rounded"></div>
                        <div className="h-4 w-64 bg-muted rounded"></div>
                        <div className="h-4 w-32 bg-muted rounded"></div>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-muted"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border shadow-sm">
              <CheckSquare className="mx-auto h-12 w-12 text-blue-400" />
              <h3 className="mt-4 text-lg font-medium">No tasks found</h3>
              <p className="mt-2 text-muted-foreground">
                {selectedTab === "all"
                  ? "You don't have any tasks yet. Create a new task to get started."
                  : `You don't have any ${selectedTab} tasks.`}
              </p>
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Task
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredTasks.map((task) => {
                const statusColor = getStatusColors(task.status)
                const statusIcon = getStatusIcon(task.status)
                const borderColor =
                  task.status === "Open"
                    ? "border-blue-100"
                    : task.status === "In Progress"
                      ? "border-amber-100"
                      : task.status === "Done"
                        ? "border-green-100"
                        : "border-purple-100"

                const hoverColor =
                  task.status === "Open"
                    ? "hover:bg-blue-50"
                    : task.status === "In Progress"
                      ? "hover:bg-amber-50"
                      : task.status === "Done"
                        ? "hover:bg-green-50"
                        : "hover:bg-purple-50"

                const indicatorColor =
                  task.status === "Open"
                    ? "bg-blue-400"
                    : task.status === "In Progress"
                      ? "bg-amber-400"
                      : task.status === "Done"
                        ? "bg-green-400"
                        : "bg-purple-400"

                return (
                  <Card
                    key={task.id}
                    className={`cursor-pointer ${hoverColor} transition-colors ${borderColor} overflow-hidden`}
                  >
                    <div className={`h-1 ${indicatorColor}`}></div>
                    <CardContent className="p-6" onClick={() => handleTaskClick(task)}>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            {statusIcon}
                            <h3 className="font-semibold">{task.title}</h3>
                            <Badge variant="outline" className={statusColor}>
                              {task.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge variant="outline" className={`text-xs ${getCategoryBadgeClass(task.category)}`}>
                              <Tag className="h-3 w-3 mr-1" />
                              {task.category.replace(/_/g, " ")}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center">
                              <Calendar className="mr-1 h-3 w-3 text-slate-400" />
                              {formatDate(task.dueDate)}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Avatar
                            className={`h-10 w-10 border-2 ${
                              task.status === "Open"
                                ? "border-blue-100"
                                : task.status === "In Progress"
                                  ? "border-amber-100"
                                  : task.status === "Done"
                                    ? "border-green-100"
                                    : "border-purple-100"
                            }`}
                          >
                            <AvatarImage src={task.userAvatar || "/placeholder.svg"} alt="User" />
                            <AvatarFallback
                              className={
                                task.status === "Open"
                                  ? "bg-blue-100 text-blue-800"
                                  : task.status === "In Progress"
                                    ? "bg-amber-100 text-amber-800"
                                    : task.status === "Done"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-purple-100 text-purple-800"
                              }
                            >
                              U
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-sm font-medium flex items-center">
                            <Award className="h-3 w-3 mr-1 text-amber-500" />
                            {task.points} points
                          </div>
                        </div>
                      </div>

                      {task.status === "Open" ? (
                        <div className="mt-4 flex items-center justify-between">
                          <div className="text-sm text-muted-foreground flex items-center">
                            <MessageSquare className="h-3.5 w-3.5 mr-1 text-blue-400" />
                            {task.responses || 0} {(task.responses || 0) === 1 ? "response" : "responses"}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditClick(task)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteClick(task)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </div>
                      ) : task.status === "In Progress" ? (
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {task.helperAvatar && (
                                <Avatar className="h-6 w-6 border border-amber-200">
                                  <AvatarImage src={task.helperAvatar || "/placeholder.svg"} alt="Helper" />
                                  <AvatarFallback className="bg-amber-100 text-amber-800">H</AvatarFallback>
                                </Avatar>
                              )}
                              <span className="text-sm flex items-center">
                                <User className="h-3.5 w-3.5 mr-1 text-amber-500" />
                                Helper
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="default"
                                size="sm"
                                className="h-8 gap-1 bg-amber-600 hover:bg-amber-700"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  requestTaskDone(task.id)
                                }}
                              >
                                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                Request Task Done
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Progress</span>
                            <span>{task.progress || 0}%</span>
                          </div>
                          <Progress value={task.progress || 0} className="h-2 bg-amber-100">
                            <div
                              className={`h-full ${
                                task.progress && task.progress > 75
                                  ? "bg-green-500"
                                  : task.progress && task.progress > 40
                                    ? "bg-amber-500"
                                    : "bg-blue-500"
                              }`}
                            />
                          </Progress>
                        </div>
                      ) : (
                        <div className="mt-4 flex items-center justify-between">
                          <div className="text-sm text-green-600 flex items-center">
                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                            Completed
                          </div>
                          <div className="flex items-center">
                            <BarChart4 className="h-4 w-4 text-green-500 mr-1" />
                            <span className="text-sm text-green-700">100% Complete</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Task Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>Post a new task for others to help with</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                placeholder="Enter a clear title for your task"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                className="border-slate-200 focus-visible:ring-blue-500"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what you need help with"
                className="min-h-[100px] border-slate-200 focus-visible:ring-blue-500"
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={taskForm.category}
                onValueChange={(value) => setTaskForm({ ...taskForm, category: value })}
              >
                <SelectTrigger id="category" className="border-slate-200 focus:ring-blue-500">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ENGINEERING">Engineering</SelectItem>
                  <SelectItem value="NURSING">Nursing</SelectItem>
                  <SelectItem value="PROGRAMMING">Programming</SelectItem>
                  <SelectItem value="MATHEMATICS">Mathematics</SelectItem>
                  <SelectItem value="PHYSICS">Physics</SelectItem>
                  <SelectItem value="CHEMISTRY">Chemistry</SelectItem>
                  <SelectItem value="BIOLOGY">Biology</SelectItem>
                  <SelectItem value="PSYCHOLOGY">Psychology</SelectItem>
                  <SelectItem value="ART_DESIGN">Art & Design</SelectItem>
                  <SelectItem value="MUSIC">Music</SelectItem>
                  <SelectItem value="LITERATURE">Literature</SelectItem>
                  <SelectItem value="HISTORY">History</SelectItem>
                  <SelectItem value="SOCIOLOGY">Sociology</SelectItem>
                  <SelectItem value="PHILOSOPHY">Philosophy</SelectItem>
                  <SelectItem value="EDUCATION">Education</SelectItem>
                  <SelectItem value="MARKETING">Marketing</SelectItem>
                  <SelectItem value="BUSINESS_MANAGEMENT">Business Management</SelectItem>
                  <SelectItem value="FINANCE">Finance</SelectItem>
                  <SelectItem value="LEGAL_STUDIES">Legal Studies</SelectItem>
                  <SelectItem value="LANGUAGES">Languages</SelectItem>
                  <SelectItem value="HEALTH_WELLNESS">Health & Wellness</SelectItem>
                  <SelectItem value="DATA_SCIENCE">Data Science</SelectItem>
                  <SelectItem value="MACHINE_LEARNING">Machine Learning</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false)
                resetTaskForm()
              }}
            >
              Cancel
            </Button>
            <Button onClick={createTask} className="bg-blue-600 hover:bg-blue-700">
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update your task details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Task Title</Label>
              <Input
                id="edit-title"
                placeholder="Enter a clear title for your task"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                className="border-slate-200 focus-visible:ring-blue-500"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Describe what you need help with"
                className="min-h-[100px] border-slate-200 focus-visible:ring-blue-500"
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select
                value={taskForm.category}
                onValueChange={(value) => setTaskForm({ ...taskForm, category: value })}
              >
                <SelectTrigger id="edit-category" className="border-slate-200 focus:ring-blue-500">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ENGINEERING">Engineering</SelectItem>
                  <SelectItem value="NURSING">Nursing</SelectItem>
                  <SelectItem value="PROGRAMMING">Programming</SelectItem>
                  <SelectItem value="MATHEMATICS">Mathematics</SelectItem>
                  <SelectItem value="PHYSICS">Physics</SelectItem>
                  <SelectItem value="CHEMISTRY">Chemistry</SelectItem>
                  <SelectItem value="BIOLOGY">Biology</SelectItem>
                  <SelectItem value="PSYCHOLOGY">Psychology</SelectItem>
                  <SelectItem value="ART_DESIGN">Art & Design</SelectItem>
                  <SelectItem value="MUSIC">Music</SelectItem>
                  <SelectItem value="LITERATURE">Literature</SelectItem>
                  <SelectItem value="HISTORY">History</SelectItem>
                  <SelectItem value="SOCIOLOGY">Sociology</SelectItem>
                  <SelectItem value="PHILOSOPHY">Philosophy</SelectItem>
                  <SelectItem value="EDUCATION">Education</SelectItem>
                  <SelectItem value="MARKETING">Marketing</SelectItem>
                  <SelectItem value="BUSINESS_MANAGEMENT">Business Management</SelectItem>
                  <SelectItem value="FINANCE">Finance</SelectItem>
                  <SelectItem value="LEGAL_STUDIES">Legal Studies</SelectItem>
                  <SelectItem value="LANGUAGES">Languages</SelectItem>
                  <SelectItem value="HEALTH_WELLNESS">Health & Wellness</SelectItem>
                  <SelectItem value="DATA_SCIENCE">Data Science</SelectItem>
                  <SelectItem value="MACHINE_LEARNING">Machine Learning</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false)
                setCurrentTask(null)
                resetTaskForm()
              }}
            >
              Cancel
            </Button>
            <Button onClick={updateTask} className="bg-blue-600 hover:bg-blue-700">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate the task "{currentTask?.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setCurrentTask(null)
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={deleteTask} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Task Detail Dialog */}
      <Dialog open={isTaskDetailDialogOpen} onOpenChange={setIsTaskDetailDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                {getStatusIcon(selectedTask?.status || "")}
                {selectedTask?.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={getStatusColors(selectedTask?.status || "")}>
                  {selectedTask?.status}
                </Badge>
                <Badge variant="outline" className={`${getCategoryBadgeClass(selectedTask?.category || "")}`}>
                  <Tag className="h-3 w-3 mr-1" />
                  {selectedTask?.category?.replace(/_/g, " ")}
                </Badge>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-md border border-slate-100">
              <p className="whitespace-pre-wrap">{selectedTask?.description}</p>
            </div>

            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="mr-1 h-4 w-4 text-slate-400" />
                {selectedTask?.dueDate && formatDate(selectedTask.dueDate)}
              </div>
              <div className="flex items-center">
                <Award className="mr-1 h-4 w-4 text-amber-500" />
                {selectedTask?.points} points
              </div>
            </div>

            {selectedTask?.status === "In Progress" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress</span>
                  <span>{selectedTask?.progress || 0}%</span>
                </div>
                <Progress value={selectedTask?.progress || 0} className="h-2 bg-amber-100">
                  <div
                    className={`h-full ${
                      selectedTask?.progress && selectedTask.progress > 75
                        ? "bg-green-500"
                        : selectedTask?.progress && selectedTask.progress > 40
                          ? "bg-amber-500"
                          : "bg-blue-500"
                    }`}
                  />
                </Progress>
                <Button
                  className="w-full mt-2 bg-amber-600 hover:bg-amber-700"
                  onClick={() => {
                    requestTaskDone(selectedTask!.id)
                    setIsTaskDetailDialogOpen(false)
                  }}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Request Task Done
                </Button>
              </div>
            )}

            {selectedTask?.status === "Pending Verification" && (
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={() => {
                  confirmTaskDone(selectedTask!.id)
                  setIsTaskDetailDialogOpen(false)
                }}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirm Task Done
              </Button>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTaskDetailDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Limit Dialog */}
      <Dialog open={isTaskLimitDialogOpen} onOpenChange={setIsTaskLimitDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-amber-600">Task Limit Reached</DialogTitle>
            <DialogDescription>{taskLimitMessage}</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center mt-2">
            <CheckSquare className="h-16 w-16 text-amber-500" />
          </div>
          <p className="text-center text-sm text-muted-foreground mt-2">
            Please complete your current task before creating a new one.
          </p>
          <DialogFooter className="mt-4">
            <Button onClick={() => setIsTaskLimitDialogOpen(false)} className="bg-amber-600 hover:bg-amber-700">
              I Understand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add the self-confirmation dialog after the Task Limit Dialog */}
      <Dialog open={isSelfConfirmDialogOpen} onOpenChange={setIsSelfConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-amber-600">Action Not Allowed</DialogTitle>
            <DialogDescription>
              You cannot confirm your own request, wait for the Task Helper to confirm
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center mt-2">
            <AlertCircle className="h-16 w-16 text-amber-500" />
          </div>
          <p className="text-center text-sm text-muted-foreground mt-2">
            Task completion must be verified by the helper who accepted the task.
          </p>
          <DialogFooter className="mt-4">
            <Button onClick={() => setIsSelfConfirmDialogOpen(false)} className="bg-amber-600 hover:bg-amber-700">
              I Understand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
