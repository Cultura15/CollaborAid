"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckSquare, Clock, Award, MessageSquare, AlertCircle, Trash2, Bell } from "lucide-react"
import {
  Dialog,
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

// Define interface for notification data
interface NotificationEntity {
  id: number
  userId: number
  message: string
  type: string
  createdAt: string
  read: boolean
}

export function NotificationsContent() {
  // State for notifications data
  const [notifications, setNotifications] = useState<NotificationEntity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedNotification, setSelectedNotification] = useState<NotificationEntity | null>(null)
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false)
  const [isClearAllDialogOpen, setIsClearAllDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

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

  // Fetch notifications
  const fetchNotifications = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await api.get("/notifications/user")
      setNotifications(response.data)
    } catch (err) {
      console.error("Error fetching notifications:", err)
      setError("Failed to load notifications. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      await api.delete("/notifications/clear")
      setNotifications([])
      setIsClearAllDialogOpen(false)
    } catch (err) {
      console.error("Error clearing notifications:", err)
      setError("Failed to clear notifications. Please try again.")
    }
  }

  // Delete a specific notification
  const deleteNotification = async (id: number) => {
    try {
      await api.delete(`/notifications/clear/${id}`)
      setNotifications(notifications.filter((notification) => notification.id !== id))
      setIsDeleteDialogOpen(false)
      setIsNotificationDialogOpen(false)
    } catch (err) {
      console.error("Error deleting notification:", err)
      setError("Failed to delete notification. Please try again.")
    }
  }

  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "TASK_CREATED":
      case "TASK_UPDATED":
      case "TASK_COMPLETED":
        return CheckSquare
      case "MESSAGE_RECEIVED":
        return MessageSquare
      case "POINTS_EARNED":
      case "POINTS_SPENT":
        return Award
      case "DEADLINE_APPROACHING":
        return Clock
      default:
        return Bell
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

  // Open notification dialog
  const openNotificationDialog = (notification: NotificationEntity) => {
    setSelectedNotification(notification)
    setIsNotificationDialogOpen(true)
  }

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-2">Stay updated with your activity</p>
        </div>
        {notifications.length > 0 && (
          <Button variant="outline" onClick={() => setIsClearAllDialogOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
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

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-muted p-2">
                    <div className="h-5 w-5"></div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="h-5 w-40 bg-muted rounded"></div>
                      <div className="h-4 w-20 bg-muted rounded"></div>
                    </div>
                    <div className="h-4 w-full bg-muted rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No notifications</h3>
          <p className="mt-2 text-muted-foreground">You're all caught up! Check back later for updates.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {notifications.map((notification) => {
            const NotificationIcon = getNotificationIcon(notification.type)
            return (
              <Card
                key={notification.id}
                className={`hover:bg-muted/50 transition-colors cursor-pointer ${
                  !notification.read ? "border-l-4 border-l-primary" : ""
                }`}
                onClick={() => openNotificationDialog(notification)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-muted p-2">
                      <NotificationIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{notification.type.replace(/_/g, " ")}</h3>
                        <span className="text-xs text-muted-foreground">{formatTimeAgo(notification.createdAt)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Notification Detail Dialog */}
      <Dialog open={isNotificationDialogOpen} onOpenChange={setIsNotificationDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedNotification && (
                <>
                  <div className="rounded-full bg-muted p-2">
                    {(() => {
                      const IconComponent = getNotificationIcon(selectedNotification.type)
                      return <IconComponent className="h-5 w-5" />
                    })()}
                  </div>
                  <span>{selectedNotification.type.replace(/_/g, " ")}</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedNotification && new Date(selectedNotification.createdAt).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>{selectedNotification?.message}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNotificationDialogOpen(false)}>
              Close
            </Button>
            <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Notification Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this notification? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => selectedNotification && deleteNotification(selectedNotification.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear All Notifications Confirmation Dialog */}
      <AlertDialog open={isClearAllDialogOpen} onOpenChange={setIsClearAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Notifications</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to clear all notifications? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={clearAllNotifications}>
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
