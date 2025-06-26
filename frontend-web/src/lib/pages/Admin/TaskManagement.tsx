"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Edit, Plus, Trash2 } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { useUsers, useTasks, useTaskOpen, useTaskInProgress, useTaskDone } from "./MockData"
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
} from "@/components/ui/dialog"


export default function TaskManagement() {
  const users = useUsers()
  const allTasks = useTasks().filter(task => task.activeStatus === "ACTIVE")
  const openTasks = useTaskOpen()
  const inProgressTasks = useTaskInProgress()
  const completedTasks = useTaskDone()
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
const [isDialogOpen, setIsDialogOpen] = useState(false)  // Controls the dialog visibility
const [searchQuery, setSearchQuery] = useState("");



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
  
const handleAddTask = async () => {
  if (!newTaskTitle || !newTaskAssignee || !newTaskDescription) {
    toast.error("Please provide title, description, and assignee.")
    return
  }

  const taskPayload = {
    title: newTaskTitle,
    description: newTaskDescription,
    status: "OPEN",
    acceptedBy: null
  }

  try {
    const response = await axios.post(
      `https://it342-g5-collaboraid.onrender.com/api/task?userId=${newTaskAssignee}`,
      taskPayload,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          "Content-Type": "application/json",
        },
      }
    )

    toast.success("Task added successfully.")
    console.log("New Task:", response.data)

    // Optionally update the UI (e.g., re-fetch tasks or push to state if using local list)
    setNewTaskTitle("")
    setNewTaskDescription("")
    setNewTaskAssignee("")

    // Close the dialog
    setIsDialogOpen(false)

  } catch (error) {
    console.error("Error adding task:", error)
    toast.error("Failed to add task.")
  }
}
  
const [editingTask, setEditingTask] = useState(null);
  const [editedTaskTitle, setEditedTaskTitle] = useState("");
  const [editedTaskDescription, setEditedTaskDescription] = useState("");
  const [editedTaskAssignee, setEditedTaskAssignee] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  
const handleEditTask = (taskId) => {
  console.log("Editing task ID:", taskId);  // Debug: Log task ID
  const task = allTasks.find(t => t.id === taskId);
  console.log("Found task for editing:", task);  // Debug: Log task found

  if (task) {
    setEditingTask(task);
    setEditedTaskTitle(task.title);
    setEditedTaskDescription(task.description);
    setEditedTaskAssignee(task.user.id.toString()); // Ensure you have the assignee's ID
    setIsEditDialogOpen(true);
  } else {
    console.error(`Task with ID ${taskId} not found.`);
  }
};

const handleUpdateTask = async () => {
  // Validation before update
  if (!editedTaskTitle || !editedTaskDescription || !editedTaskAssignee) {
    toast.error("Please provide title, description, and assignee.");
    return;
  }

  const updatedTask = {
    title: editedTaskTitle,
    description: editedTaskDescription,
    userId: editedTaskAssignee,  // Use the dynamically set user ID
    status: "Open",
  };

  console.log("Updating task with payload:", updatedTask);  // Debug: Log payload before sending

  try {
    // Assuming the token is already stored in localStorage, if not handle accordingly
    const jwtToken = localStorage.getItem("jwtToken");
    if (!jwtToken) {
      toast.error("User is not authenticated. Please log in.");
      return;
    }

    // Sending the update request to the backend
    const response = await axios.put(
      `https://it342-g5-collaboraid.onrender.com/api/task/${editingTask.id}?userId=${editedTaskAssignee}`,  // Dynamically pass userId as a query param
      updatedTask,
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Update response:", response.data);  // Debug: Log response
    toast.success("Task updated successfully.");
    setIsDialogOpen(false);  // Close the edit dialog
  } catch (error) {
    console.error("Error updating task:", error);
    toast.error("Failed to update task. Please try again.");
  }
};

const handleDeleteTask = async (taskId) => {
  try {
    const response = await fetch(`https://it342-g5-collaboraid.onrender.com/api/task/${taskId}/deactivate`, {
      method: "PUT",  // Changed to PUT
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // If authentication is required
      },
    });

    if (!response.ok) {
      throw new Error("Failed to deactivate task");
    }

    toast({
      title: "Task Deactivated",
      description: `Task #${taskId} was successfully marked as inactive.`,
    });

  } catch (error) {
    toast({
      title: "Error",
      description: `Failed to deactivate task #${taskId}.`,
      variant: "destructive",
    });
  }
};


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

  const filteredTasksAll = currentTasksAll.filter(task =>

    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // For Open Tasks
  const filteredTasksOpen = currentTasksOpen.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // For In Progress Tasks
  const filteredTasksInProgress = currentTasksInProgress.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // For Completed Tasks
  const filteredTasksCompleted = currentTasksCompleted.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  
  

  

  // Function to render the task table
  const renderTaskTable = (tasks, emptyRows) => {
    return (
      <div className="rounded-md border">
        <div className="relative w-full overflow-auto" style={{ minHeight: `${tasksPerPage * 73}px` }}>
          <table className="w-full text-sm table-auto">
            <thead className="[&_tr]:border-b sticky top-0 bg-background z-10">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Task</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Assignee</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Accepted By</th>
                <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">Status</th>
                <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">Actions</th>
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
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
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
                        variant={
                          task.status === "Done" ? "default" : task.status === "In Progress" ? "outline" : "secondary"
                        }
                        className={
                          task.status === "Done"
                            ? "bg-red-500"
                            : task.status === "In Progress"
                              ? "bg-yellow-500 text-white"
                              : task.status === "Open"
                                ? "bg-green-500 text-white"
                                : ""
                        }
                      >
                        {task.status}
                      </Badge>

                      
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditTask(task.id)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteTask(task.id)}
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
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === Math.ceil(totalItems / tasksPerPage) || totalItems === 0}
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
    <Button className="mb-4">
      <Plus className="mr-2 h-4 w-4" /> Add Task
    </Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Create a new task</DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      <Input
        placeholder="Task title"
        value={newTaskTitle}
        onChange={(e) => setNewTaskTitle(e.target.value)}
      />
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
    </div>
    <DialogFooter>
      <Button onClick={handleAddTask}>Add Task</Button>
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
              <DialogTitle>Edit Task</DialogTitle>
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
            </div>
            <DialogFooter>
              <Button onClick={handleUpdateTask}>Update</Button>
              <Button onClick={() => setIsEditDialogOpen(false)} variant="outline">
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>





      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="todo">Open</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <div className="mt-4 flex items-center gap-4">
        <Input 
  placeholder="Search tasks..." 
  className="max-w-sm" 
  value={searchQuery} 
  onChange={(e) => setSearchQuery(e.target.value)} 
/>

          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
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
    </div>
  )
}

