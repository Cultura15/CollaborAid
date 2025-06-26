"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Clock } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDashboardData, useTaskInProgress, fetchTasks } from "./MockData" // Import the custom hook and fetchTasks
import { isAuthenticated, decodeToken } from "../JWTDecode/JWTDecode"

export default function Dashboard() {
  const { stats } = useDashboardData()
  const [taskRefreshKey, setTaskRefreshKey] = useState(0)
  const inProgressTasks = useTaskInProgress(taskRefreshKey)
  const [activeTab] = useState<"overview" | "tasks">("overview")

  const [tasks, setTasks] = useState([]) // Local tasks state
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const navigate = useNavigate()

  // Get token and check if user is admin
  const token = localStorage.getItem("jwtToken")
  const decodedToken = token ? decodeToken(token) : null
  console.log("Decoded token in Dashboard component:", decodedToken)
  const userIsAdmin = decodedToken?.role === "ADMIN"
  const userIsAuthenticated = isAuthenticated()

  const [isAdmin, setIsAdmin] = useState(userIsAdmin)

  // Redirect non-admin users
  useEffect(() => {
    setIsAdmin(userIsAdmin)
  }, [userIsAdmin])

  useEffect(() => {
    if (!isAdmin) {
      console.log("Access denied: User is not an admin")
      navigate("/") // Redirect to home page
    }
  }, [isAdmin, navigate])

  // Fetch tasks from backend
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setIsLoading(true)
        const data = await fetchTasks()
        setTasks(data)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch tasks:", err)
        setError("Failed to load tasks. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    loadTasks()
  }, [])

  // If not admin, don't render the dashboard
  if (!isAdmin) {
    return null
  }

  // Sort tasks by newest first (assuming `createdAt` exists in response)
  const latestTasks = [...tasks]
    .sort((a, b) => {
      // Add console.log to debug the timestamp format
      console.log("Task timestamp format:", a.timestamp, typeof a.timestamp)

      // Try to parse the timestamp in various formats
      const getTimestamp = (task) => {
        if (!task) return 0

        // If timestamp exists and is a string, try to parse it
        if (task.timestamp) {
          // Handle ISO string format from LocalDateTime
          if (typeof task.timestamp === "string") {
            return new Date(task.timestamp).getTime()
          }
          // Handle if timestamp is already a Date object
          if (task.timestamp instanceof Date) {
            return task.timestamp.getTime()
          }
        }

        // Fall back to other date fields
        if (task.createdAt) return new Date(task.createdAt).getTime()
        if (task.dueDate) return new Date(task.dueDate).getTime()

        return 0
      }

      return getTimestamp(b) - getTimestamp(a)
    })
    .slice(0, 10) // Get latest 10 tasks for scrolling

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Dashboard Overview
        </h1>
        <div className="flex items-center gap-2">
          <Select defaultValue="today">
            <SelectTrigger className="w-[180px] border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {activeTab === "overview" && (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => {
              // Define different background colors for each stat card
              const bgColors = [
                "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900",
                "bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900",
                "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900",
                "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900",
              ]

              // Define icon colors for each stat card
              const iconColors = [
                "text-blue-600 dark:text-blue-400",
                "text-emerald-600 dark:text-emerald-400",
                "text-amber-600 dark:text-amber-400",
                "text-red-600 dark:text-red-400",
              ]

              // Define icons for each stat card (using Lucide icons)
              const icons = [
                <svg
                  key="users"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`h-6 w-6 ${iconColors[index % iconColors.length]}`}
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>,
                <svg
                  key="tasks"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`h-6 w-6 ${iconColors[index % iconColors.length]}`}
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                  <line x1="3" x2="21" y1="9" y2="9"></line>
                  <line x1="9" x2="9" y1="21" y2="9"></line>
                </svg>,
                <svg
                  key="completed"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`h-6 w-6 ${iconColors[index % iconColors.length]}`}
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>,
                <svg
                  key="inactive"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`h-6 w-6 ${iconColors[index % iconColors.length]}`}
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <line x1="4" y1="21" x2="14" y2="11"></line>
                </svg>,
              ]

              return (
                <Card
                  key={index}
                  className={`${bgColors[index % bgColors.length]} border-none shadow-md hover:shadow-lg transition-shadow duration-300`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                      {icons[index % icons.length]}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline justify-between">
                      <div className="text-3xl font-bold">{stat.value}</div>
                      <Badge
                        variant={stat.changeType === "positive" ? "default" : "destructive"}
                        className={`text-xs font-normal ${stat.changeType === "positive" ? "bg-green-500 hover:bg-green-600" : ""}`}
                      >
                        {stat.change}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2 border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950 dark:to-transparent pb-2">
                <CardTitle className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-blue-600 dark:text-blue-400"
                  >
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg>
                  Recent Activities
                </CardTitle>
                <CardDescription>Overview of the latest activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inProgressTasks
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .slice(0, 3)
                    .map((task, idx) => (
                      <div
                        key={task.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${idx % 2 === 0 ? "bg-gray-50 dark:bg-gray-800" : ""}`}
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">{task.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Posted by {task.user ? task.user.username : "Unknown"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Accepted by {task.acceptedBy ? task.acceptedBy.username : "Not Accepted"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={
                              task.status === "In Progress" ? "bg-amber-500 hover:bg-amber-600 text-white" : ""
                            }
                          >
                            {task.status}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="h-4 w-4"
                                >
                                  <circle cx="12" cy="12" r="1" />
                                  <circle cx="19" cy="12" r="1" />
                                  <circle cx="5" cy="12" r="1" />
                                </svg>
                                <span className="sr-only">More</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View details</DropdownMenuItem>
                              <DropdownMenuItem>Edit task</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Delete task</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950 dark:to-transparent pb-2">
                <CardTitle className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-purple-600 dark:text-purple-400"
                  >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                  Recent Posts
                </CardTitle>
                <CardDescription className="flex justify-between items-center">
                  <span>Latest tasks from CollaborAid app</span>
                  {isLoading && <span className="text-xs text-blue-500">Loading...</span>}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] overflow-y-auto pr-2">
                {error ? (
                  <div className="flex items-center justify-center h-full text-red-500">
                    <p>{error}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {latestTasks.map((task, index) => (
                      <div
                        key={task.id || index}
                        className={`flex items-start gap-4 p-3 rounded-lg ${
                          index % 2 === 0 ? "bg-gray-50 dark:bg-gray-800" : ""
                        }`}
                      >
                        <Avatar className="mt-1 h-8 w-8 bg-purple-200 text-purple-700 dark:bg-purple-800 dark:text-purple-200">
                          <AvatarFallback>
                            {task.user
                              ? task.user.username
                                  ?.split(" ")
                                  .map((name) => name[0])
                                  .join("")
                              : task.createdBy
                                ? task.createdBy.substring(0, 2).toUpperCase()
                                : "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <p className="text-sm">
                            <span className="font-medium">{task.user?.username || task.createdBy || "Unknown"}</span>{" "}
                            created <span className="font-medium">{task.title}</span>
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {(() => {
                              // Debug the timestamp format
                              console.log("Rendering timestamp:", task.timestamp, typeof task.timestamp)

                              // Try to format the timestamp
                              if (task.timestamp) {
                                try {
                                  // For ISO string format from LocalDateTime
                                  return new Date(task.timestamp).toLocaleString()
                                } catch (e) {
                                  console.error("Error parsing timestamp:", e)
                                }
                              }

                              // Fall back to other date fields
                              if (task.createdAt) return new Date(task.createdAt).toLocaleString()
                              if (task.dueDate) return new Date(task.dueDate).toLocaleString()

                              return "Unknown date"
                            })()}
                          </p>
                          {task.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {latestTasks.length === 0 && !isLoading && (
                      <div className="flex items-center justify-center h-32 text-muted-foreground">
                        <p>No tasks found</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
