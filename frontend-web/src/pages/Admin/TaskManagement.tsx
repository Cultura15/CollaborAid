"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Edit,
  Plus,
  Trash2,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Tag,
  AlertTriangle,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { useUsers, fetchTasks, useTaskOpen, useTaskInProgress, useTaskDone } from "./MockData"
import { useState } from "react"
import { decodeToken } from "../JWTDecode/JWTDecode"
import axios from "axios"

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function TaskManagement() {
  const [userRefreshKey, setUserRefreshKey] = useState(0)

  const users = useUsers(userRefreshKey)

  const [tasks, setTasks] = useState([]) // Local tasks state
  const [taskRefreshKey, setTaskRefreshKey] = useState(0)

  const openTasks = useTaskOpen(taskRefreshKey)
  const inProgressTasks = useTaskInProgress(taskRefreshKey)
  const completedTasks = useTaskDone(taskRefreshKey)

  // Add states for delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState(null)

  // Add state for delete success dialog
  const [deleteSuccessOpen, setDeleteSuccessOpen] = useState(false)
  const [deletedTaskId, setDeletedTaskId] = useState(null)

  // Combine all tasks and filter out inactive ones
  const allTasks = [...openTasks, ...inProgressTasks, ...completedTasks].filter(
    (task) => task.activeStatus !== "INACTIVE",
  )

  const navigate = useNavigate()

  // State for pagination - separate state for each tab
  const [currentPageAll, setCurrentPageAll] = useState(1)
  const [currentPageOpen, setCurrentPageOpen] = useState(1)
  const [currentPageInProgress, setCurrentPageInProgress] = useState(1)
  const [currentPageCompleted, setCurrentPageCompleted] = useState(1)
  const tasksPerPage = 6

  // Get token and check if user is admin
  const token = localStorage.getItem("jwtToken")
  const decodedToken = token ? decodeToken(token) : null
  console.log("Decoded token in TaskManagement component:", decodedToken)
  const isAdmin = decodedToken?.role === "ADMIN"

  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskDescription, setNewTaskDescription] = useState("")
  const [newTaskAssignee, setNewTaskAssignee] = useState("")
  const [newTaskCategory, setNewTaskCategory] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false) // Controls the dialog visibility
  const [searchQuery, setSearchQuery] = useState("")

  // Add a new state for the selected task details dialog
  const [selectedTask, setSelectedTask] = useState(null)
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false)

  const [editingTask, setEditingTask] = useState(null)
  const [editedTaskTitle, setEditedTaskTitle] = useState("")
  const [editedTaskDescription, setEditedTaskDescription] = useState("")
  const [editedTaskAssignee, setEditedTaskAssignee] = useState("")
  const [editedTaskCategory, setEditedTaskCategory] = useState("")
  const [editedTaskStatus, setEditedTaskStatus] = useState("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Update the useEffect hook to properly refresh tasks when taskRefreshKey changes
  useEffect(() => {
    const fetchAndSetTasks = async () => {
      try {
        console.log("Refreshing tasks with key:", taskRefreshKey)
        const data = await fetchTasks()
        setTasks(data)
      } catch (error) {
        console.error("Error fetching tasks:", error)
      }
    }

    fetchAndSetTasks()
  }, [taskRefreshKey]) // Re-run whenever taskRefreshKey changes

  // Redirect non-admin users
  useEffect(() => {
    if (!isAdmin) {
      console.log("Access denied: User is not an admin")
      navigate("/") // Redirect to home page
    }
  }, [isAdmin, navigate])

  // If not admin, don't render the component
  if (!isAdmin) {
    return null
  }

  const categories = [
    "ENGINEERING",
    "NURSING",
    "PROGRAMMING",
    "MATHEMATICS",
    "PHYSICS",
    "CHEMISTRY",
    "BIOLOGY",
    "PSYCHOLOGY",
    "ART_DESIGN",
    "MUSIC",
    "LITERATURE",
    "HISTORY",
    "SOCIOLOGY",
    "PHILOSOPHY",
    "EDUCATION",
    "MARKETING",
    "BUSINESS_MANAGEMENT",
    "FINANCE",
    "LEGAL_STUDIES",
    "LANGUAGES",
    "HEALTH_WELLNESS",
    "DATA_SCIENCE",
    "MACHINE_LEARNING",
  ]

  const handleAddTask = async () => {
    if (!newTaskTitle || !newTaskAssignee || !newTaskDescription || !newTaskCategory) {
      toast.error("Please provide title, description, assignee, and category.")
      return
    }

    const taskPayload = {
      title: newTaskTitle,
      description: newTaskDescription,
      category: newTaskCategory, // Add the category field
      status: "Open",
      acceptedBy: null,
      timestamp: new Date().toISOString(), // You can send a timestamp or let the backend set it
    }

    try {
      const response = await axios.post(`https://it342-g5-collaboraid.onrender.com/api/task?userId=${newTaskAssignee}`, taskPayload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          "Content-Type": "application/json",
        },
      })

      toast.success("Task added successfully.")
      console.log("New Task:", response.data)

      setTaskRefreshKey((prev) => prev + 1)

      // Optionally update the UI (e.g., re-fetch tasks or push to state if using local list)
      setNewTaskTitle("")
      setNewTaskDescription("")
      setNewTaskAssignee("")
      setNewTaskCategory("") // Reset the category input field

      // Close the dialog
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error adding task:", error)
      toast.error("Failed to add task.")
    }
  }

  const handleEditTask = (taskId) => {
    console.log("Editing task ID:", taskId) // Debug: Log task ID
    const task = allTasks.find((t) => t.id === taskId)
    console.log("Found task for editing:", task) // Debug: Log task found

    if (task) {
      setEditingTask(task)
      setEditedTaskTitle(task.title)
      setEditedTaskDescription(task.description)
      setEditedTaskAssignee(task.user.id.toString()) // Ensure you have the assignee's ID
      setEditedTaskCategory(task.category)
      setEditedTaskStatus(task.status) // Se
      setIsEditDialogOpen(true)
    } else {
      console.error(`Task with ID ${taskId} not found.`)
    }
  }

  // Update the handleUpdateTask function to properly close the edit dialog and refresh data
  const handleUpdateTask = async () => {
    // Validation before update
    if (!editedTaskTitle || !editedTaskDescription || !editedTaskAssignee || !editedTaskCategory || !editedTaskStatus) {
      toast.error("Please provide title, description, and assignee.")
      return
    }

    const updatedTask = {
      title: editedTaskTitle,
      description: editedTaskDescription,
      userId: editedTaskAssignee, // Use the dynamically set user ID
      category: editedTaskCategory,
      status: editedTaskStatus,
    }

    console.log("Updating task with payload:", updatedTask) // Debug: Log payload before sending

    try {
      // Assuming the token is already stored in localStorage, if not handle accordingly
      const jwtToken = localStorage.getItem("jwtToken")
      if (!jwtToken) {
        toast.error("User is not authenticated. Please log in.")
        return
      }

      // Sending the update request to the backend
      const response = await axios.put(
        `https://it342-g5-collaboraid.onrender.com/api/task/${editingTask.id}?userId=${editedTaskAssignee}`, // Dynamically pass userId as a query param
        updatedTask,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
        },
      )

      console.log("Update response:", response.data) // Debug: Log response

      // Close the edit dialog first
      setIsEditDialogOpen(false)

      // Show success message
      toast.success("Task updated successfully!")

      // Refresh the task list
      setTaskRefreshKey((prev) => prev + 1)
    } catch (error) {
      console.error("Error updating task:", error)
      toast.error("Failed to update task. Please try again.")
    }
  }

  // Function to initiate delete confirmation
  const confirmDeleteTask = (taskId) => {
    const task = allTasks.find((t) => t.id === taskId)
    if (task) {
      setTaskToDelete(task)
      setDeleteConfirmOpen(true)
    }
  }

  // Updated handleDeleteTask function to handle the actual deletion after confirmation
  const handleDeleteTask = async () => {
    if (!taskToDelete) return

    try {
      const response = await fetch(`https://it342-g5-collaboraid.onrender.com/api/task/${taskToDelete.id}/deactivate`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to deactivate task")
      }

      // Show toast notification
      toast.success(`Task #${taskToDelete.id} was successfully deleted.`)

      // Set the deleted task ID for the success dialog
      setDeletedTaskId(taskToDelete.id)

      // Close the confirmation dialog
      setDeleteConfirmOpen(false)

      // Open the success dialog
      setDeleteSuccessOpen(true)

      // Refresh the task list
      setTaskRefreshKey((prev) => prev + 1)
    } catch (error) {
      toast.error(`Failed to delete task #${taskToDelete.id}.`)
      setDeleteConfirmOpen(false)
    }
  }

  // Calculate pagination for all tasks
  const indexOfLastTaskAll = currentPageAll * tasksPerPage
  const indexOfFirstTaskAll = indexOfLastTaskAll - tasksPerPage
  const currentTasksAll = allTasks.slice(indexOfFirstTaskAll, indexOfLastTaskAll)
  const emptyRowsAll = Array(tasksPerPage - currentTasksAll.length).fill(null)

  // Calculate pagination for open tasks
  const indexOfLastTaskOpen = currentPageOpen * tasksPerPage
  const indexOfFirstTaskOpen = indexOfLastTaskOpen - tasksPerPage
  const currentTasksOpen = openTasks.slice(indexOfFirstTaskOpen, indexOfLastTaskOpen)
  const emptyRowsOpen = Array(tasksPerPage - currentTasksOpen.length).fill(null)

  // Calculate pagination for in progress tasks
  const indexOfLastTaskInProgress = currentPageInProgress * tasksPerPage
  const indexOfFirstTaskInProgress = indexOfLastTaskInProgress - tasksPerPage
  const currentTasksInProgress = inProgressTasks.slice(indexOfFirstTaskInProgress, indexOfLastTaskInProgress)
  const emptyRowsInProgress = Array(tasksPerPage - currentTasksInProgress.length).fill(null)

  // Calculate pagination for completed tasks
  const indexOfLastTaskCompleted = currentPageCompleted * tasksPerPage
  const indexOfFirstTaskCompleted = indexOfLastTaskCompleted - tasksPerPage
  const currentTasksCompleted = completedTasks.slice(indexOfFirstTaskCompleted, indexOfLastTaskCompleted)
  const emptyRowsCompleted = Array(tasksPerPage - currentTasksCompleted.length).fill(null)

  const filteredTasksAll = currentTasksAll.filter(
    (task) =>
      task.activeStatus === "ACTIVE" &&
      (task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.user.username.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  // For Open Tasks
  const filteredTasksOpen = currentTasksOpen.filter(
    (task) =>
      task.activeStatus === "ACTIVE" &&
      (task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.user.username.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  // For In Progress Tasks
  const filteredTasksInProgress = currentTasksInProgress.filter(
    (task) =>
      task.activeStatus === "ACTIVE" &&
      (task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.user.username.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  // For Completed Tasks
  const filteredTasksCompleted = currentTasksCompleted.filter(
    (task) =>
      task.activeStatus === "ACTIVE" &&
      (task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.user.username.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  // Add a new function to handle clicking on a task row
  const handleTaskClick = (task) => {
    setSelectedTask(task)
    setIsTaskDetailsOpen(true)
  }

  // Function to render the task table
  const renderTaskTable = (tasks, emptyRows) => {
    return (
      <div className="rounded-md border">
        <div className="relative w-full overflow-auto" style={{ minHeight: `${tasksPerPage * 73}px` }}>
          <table className="w-full text-sm table-auto">
            <thead className="[&_tr]:border-b sticky top-0 bg-gray-50 z-10">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-gray-600">
                  <div className="flex items-center">
                    <Tag className="mr-2 h-4 w-4" />
                    Task
                  </div>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-gray-600">
                  <div className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Assignee
                  </div>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-gray-600">
                  <div className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Accepted By
                  </div>
                </th>
                <th className="h-12 px-4 text-center align-middle font-medium text-gray-600">
                  <div className="flex items-center justify-center">
                    <Clock className="mr-2 h-4 w-4" />
                    Status
                  </div>
                </th>
                <th className="h-12 px-4 text-center align-middle font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {tasks.map((task) => {
                // Get the user who created the task (user field)
                const assignee = task.user ? task.user.username : "No Assignee"

                // Get the user who accepted the task (acceptedBy field)
                const acceptedBy = task.acceptedBy ? task.acceptedBy.username : "Not Accepted"

                return (
                  <tr
                    key={task.id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted cursor-pointer"
                    onClick={() => handleTaskClick(task)}
                  >
                    <td className="p-4 align-middle font-medium truncate">{task.title}</td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6 flex-shrink-0">
                          <AvatarFallback>{task.user ? task.user.username[0] : "U"}</AvatarFallback>
                        </Avatar>
                        <span className="truncate">{assignee}</span>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6 flex-shrink-0">
                          <AvatarFallback>{task.acceptedBy ? task.acceptedBy.username[0] : "N"}</AvatarFallback>
                        </Avatar>
                        <span className="truncate">{acceptedBy}</span>
                      </div>
                    </td>
                    <td className="p-4 align-middle text-center">
                      <Badge
                        variant="outline"
                        className={
                          task.status === "Done"
                            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                            : task.status === "In Progress"
                              ? "bg-amber-100 text-amber-700 border-amber-200"
                              : task.status === "Open"
                                ? "bg-sky-100 text-sky-700 border-sky-200"
                                : ""
                        }
                      >
                        {task.status === "Done" && <CheckCircle className="mr-1 h-3 w-3" />}
                        {task.status === "In Progress" && <Clock className="mr-1 h-3 w-3" />}
                        {task.status === "Open" && <AlertCircle className="mr-1 h-3 w-3" />}
                        {task.status}
                      </Badge>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200"
                          onClick={(e) => {
                            e.stopPropagation() // Prevent row click event
                            handleEditTask(task.id)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                          onClick={(e) => {
                            e.stopPropagation() // Prevent row click event
                            confirmDeleteTask(task.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {/* Add empty rows to maintain consistent height */}
              {emptyRows.map((_, index) => (
                <tr key={`empty-${index}`} className="border-b h-[73px]">
                  <td colSpan={5} className="p-4"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Pagination controls for each tab
  const renderPagination = (currentPage, setCurrentPage, totalItems) => {
    return (
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          Showing{" "}
          <strong>
            {Math.min((currentPage - 1) * tasksPerPage + 1, totalItems)}-
            {Math.min(currentPage * tasksPerPage, totalItems)}
          </strong>{" "}
          of <strong>{totalItems}</strong> tasks
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="border-gray-200 hover:bg-gray-50"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === Math.ceil(totalItems / tasksPerPage) || totalItems === 0}
            className="border-gray-200 hover:bg-gray-50"
          >
            Next
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mb-4 bg-emerald-600 hover:bg-emerald-700 text-white">
              <Plus className="mr-2 h-4 w-4" /> Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center text-emerald-600">
                <Plus className="mr-2 h-5 w-5" />
                Create a new task
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Task title" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} />
              <Input
                type="text"
                placeholder="Enter task description"
                className="mt-2"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
              />
              <Select onValueChange={(value) => setNewTaskAssignee(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Add input for category */}
              {/* Static category dropdown using categories array */}
              <Select onValueChange={(value) => setNewTaskCategory(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.replace(/_/g, " ")} {/* Format category name */}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button onClick={handleAddTask} className="bg-emerald-600 hover:bg-emerald-700">
                Add Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Task Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <Button className="hidden" />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center text-amber-600">
                <Edit className="mr-2 h-5 w-5" />
                Edit Task
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <Input
                value={editedTaskTitle}
                onChange={(e) => setEditedTaskTitle(e.target.value)}
                placeholder="Task Title"
              />
              <Input
                value={editedTaskDescription}
                onChange={(e) => setEditedTaskDescription(e.target.value)}
                placeholder="Task Description"
              />

              {/* Styled Status Dropdown */}
              <Select value={editedTaskStatus} onValueChange={(value) => setEditedTaskStatus(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                onClick={() => {
                  handleUpdateTask() // Update task
                  setIsEditDialogOpen(false) // Close the dialog after updating
                }}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Update
              </Button>
              <Button onClick={() => setIsEditDialogOpen(false)} variant="outline">
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4 rounded-xl bg-gray-100 p-1">
          <TabsTrigger
            value="all"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow"
          >
            <Filter className="mr-2 h-4 w-4" />
            All Tasks
          </TabsTrigger>
          <TabsTrigger
            value="todo"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow"
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            Open
          </TabsTrigger>
          <TabsTrigger
            value="in-progress"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow"
          >
            <Clock className="mr-2 h-4 w-4" />
            In Progress
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Completed
          </TabsTrigger>
        </TabsList>
        <div className="mt-4 flex items-center gap-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search tasks..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="todo">Open</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <User className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignees</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.username.toLowerCase().replace(" ", "-")}>
                  {user.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        All Tasks Tab
        <TabsContent value="all" className="mt-4">
          {renderTaskTable(filteredTasksAll, emptyRowsAll)}
          {renderPagination(currentPageAll, setCurrentPageAll, allTasks.length)}
        </TabsContent>
        {/* Open Tasks Tab */}
        <TabsContent value="todo" className="mt-4">
          {renderTaskTable(filteredTasksOpen, emptyRowsOpen)}
          {renderPagination(currentPageOpen, setCurrentPageOpen, openTasks.length)}
        </TabsContent>
        {/* In Progress Tasks Tab */}
        <TabsContent value="in-progress" className="mt-4">
          {renderTaskTable(filteredTasksInProgress, emptyRowsInProgress)}
          {renderPagination(currentPageInProgress, setCurrentPageInProgress, inProgressTasks.length)}
        </TabsContent>
        {/* Completed Tasks Tab */}
        <TabsContent value="completed" className="mt-4">
          {renderTaskTable(filteredTasksCompleted, emptyRowsCompleted)}
          {renderPagination(currentPageCompleted, setCurrentPageCompleted, completedTasks.length)}
        </TabsContent>
      </Tabs>

      {/* Task Details Dialog */}
      <Dialog open={isTaskDetailsOpen} onOpenChange={setIsTaskDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedTask && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold flex items-center">
                  <span className="mr-2">Task Details</span>
                  <Badge
                    variant="outline"
                    className={
                      selectedTask.status === "Done"
                        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                        : selectedTask.status === "In Progress"
                          ? "bg-amber-100 text-amber-700 border-amber-200"
                          : selectedTask.status === "Open"
                            ? "bg-sky-100 text-sky-700 border-sky-200"
                            : ""
                    }
                  >
                    {selectedTask.status === "Done" && <CheckCircle className="mr-1 h-3 w-3" />}
                    {selectedTask.status === "In Progress" && <Clock className="mr-1 h-3 w-3" />}
                    {selectedTask.status === "Open" && <AlertCircle className="mr-1 h-3 w-3" />}
                    {selectedTask.status}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-500">Title</h3>
                  <p className="text-lg">{selectedTask.title}</p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-gray-500">Description</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">{selectedTask.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-500">Assigned To</h3>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>{selectedTask.user ? selectedTask.user.username[0] : "U"}</AvatarFallback>
                      </Avatar>
                      <span>{selectedTask.user ? selectedTask.user.username : "No Assignee"}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-500">Accepted By</h3>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>
                          {selectedTask.acceptedBy ? selectedTask.acceptedBy.username[0] : "N"}
                        </AvatarFallback>
                      </Avatar>
                      <span>{selectedTask.acceptedBy ? selectedTask.acceptedBy.username : "Not Accepted"}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-gray-500">Category</h3>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    <Tag className="mr-1 h-3 w-3" />
                    {selectedTask.category ? selectedTask.category.replace(/_/g, " ") : "No Category"}
                  </Badge>
                </div>

                {selectedTask.timestamp && (
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-500">Created</h3>
                    <p className="text-sm text-gray-600">{new Date(selectedTask.timestamp).toLocaleString()}</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsTaskDetailsOpen(false)}>
                  Close
                </Button>
                <Button
                  className="bg-amber-600 hover:bg-amber-700"
                  onClick={() => {
                    handleEditTask(selectedTask.id)
                    setIsTaskDetailsOpen(false)
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Task
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-rose-600">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
              {taskToDelete && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                  <p className="font-medium">{taskToDelete.title}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Assigned to: {taskToDelete.user ? taskToDelete.user.username : "No Assignee"}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTask} className="bg-rose-600 hover:bg-rose-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Success Dialog */}
      <Dialog open={deleteSuccessOpen} onOpenChange={setDeleteSuccessOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center text-emerald-600">
              <CheckCircle className="mr-2 h-5 w-5" />
              Deleted Successfully
            </DialogTitle>
            <DialogDescription>Task #{deletedTaskId} has been successfully deleted from the system.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <div className="rounded-full bg-emerald-100 p-3">
              <CheckCircle className="h-10 w-10 text-emerald-600" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setDeleteSuccessOpen(false)} className="bg-emerald-600 hover:bg-emerald-700 w-full">
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
