"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import {
  Bell,
  Calendar,
  Home,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  User,
  Users,
  MessageSquare,
  UserCog,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import DashboardOverview from "./DashboardOverview"
import UserManagement from "./UserManagement"
import TaskManagement from "./TaskManagement"
import Service from "./Service"
import RoleRequests from "./RoleRequests" // Import the new component
import { decodeToken } from "../JWTDecode/JWTDecode"
import { DarkModeToggle } from "@/components/ui/DarkModeToggle" // Import DarkModeToggle
import { useNotification } from "@/context/NotificationContext" // Import Notification Context
// Import toast at the top of the file
import { toast } from "sonner"

// Change the interface name from Notification to AdminNotification to avoid conflicts
interface AdminNotification {
  id: number
  message: string
  type: string
  timestamp: string
  requestId?: number
  userId?: number
  username?: string
  email?: string
  requestDate?: string
  status?: string
}

export default function Admin() {
  const [activeTab, setActiveTab] = React.useState("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredTabs, setFilteredTabs] = useState(["overview", "users", "tasks", "service", "role-requests"])

  const { notifications, clearNotifications } = useNotification() // Access notifications from context
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isBellDropdownOpen, setIsBellDropdownOpen] = useState(false) // Separate state for the bell dropdown
  const [notificationRefreshKey, setNotificationRefreshKey] = useState(0) // Add a refresh key state

  const [settingsOpen, setSettingsOpen] = useState(false)
  const navigate = useNavigate()

  const token = localStorage.getItem("jwtToken")
  const decodedToken = token ? decodeToken(token) : null
  const isAdmin = decodedToken?.role === "ADMIN"

  const adminName = decodedToken?.sub || "Admin"

  useEffect(() => {
    if (!isAdmin) {
      navigate("/") // Redirect to home page if not admin
    }
  }, [isAdmin, navigate])

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase()
    setSearchQuery(query)
    const filtered = ["overview", "users", "tasks", "service", "role-requests"].filter((option) =>
      option.toLowerCase().includes(query),
    )
    setFilteredTabs(filtered)
    setIsDropdownOpen(filtered.length > 0)
  }

  // Handle notification click
  const handleNotificationClick = (notification: any) => {
    // Just close the dropdown for now
    setIsBellDropdownOpen(false)

    // You can add specific handling for different notification types here if needed
    toast.info("Notification clicked: " + notification.message)
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Function to handle clearing notifications
  const handleClearNotifications = async () => {
    try {
      const token = localStorage.getItem("jwtToken")
      const response = await fetch("https://it342-g5-collaboraid.onrender.com/api/notifications/clear", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        // Clear notifications in the context
        clearNotifications()

        // Force a refresh of the component
        setNotificationRefreshKey((prev) => prev + 1)

        toast.success("All notifications cleared")
      } else {
        toast.error("Failed to clear notifications")
      }
    } catch (error) {
      console.error("Error clearing notifications:", error)
      toast.error("Error clearing notifications")
    }

    // Close dropdown after clearing
    setIsBellDropdownOpen(false)
  }

  return (
    <SidebarProvider>
      <div className="flex w-screen h-screen bg-muted/30 overflow-hidden">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-4 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="font-semibold text-lg">
                Admin<span className="text-primary">Panel</span>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Main</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setActiveTab("overview")}>
                      <Home className="h-4 w-4" />
                      <span>Overview</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setActiveTab("users")}>
                      <Users className="h-4 w-4" />
                      <span>Users</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setActiveTab("tasks")}>
                      <Calendar className="h-4 w-4" />
                      <span>Tasks</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setActiveTab("service")}>
                      <MessageSquare className="h-4 w-4" />
                      <span>Service</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setActiveTab("role-requests")}>
                      <UserCog className="h-4 w-4" />
                      <span>Requested for Roles</span>
                      {notifications.filter((n) => n.type === "ROLE_REQUEST").length > 0 && (
                        <Badge variant="destructive" className="ml-auto">
                          {notifications.filter((n) => n.type === "ROLE_REQUEST").length}
                        </Badge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setSettingsOpen(!settingsOpen)}>
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {settingsOpen && (
                    <SidebarMenuItem>
                      <div className="w-full px-4">
                        <DarkModeToggle />
                      </div>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="relative">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src="/placeholder.svg?height=32&width=32" />
                        <AvatarFallback>{adminName?.[0] || "A"}</AvatarFallback>
                      </Avatar>
                      <span>{adminName}</span>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="start"
                    className="w-56 bg-white dark:bg-zinc-900 text-black dark:text-white shadow-lg rounded-lg mt-2 z-50"
                    style={{
                      position: "absolute",
                      top: "-100%",
                      left: 0,
                      transform: "translateY(440px)",
                    }}
                  >
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        localStorage.removeItem("jwtToken")
                        localStorage.removeItem("role")
                        navigate("/login")
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
            <div className="flex flex-1 items-center gap-4">
              <form className="flex-1 md:max-w-sm">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    value={searchQuery}
                    onChange={handleSearch}
                    placeholder="Search..."
                    className="w-full bg-background pl-8 md:w-[300px] lg:w-[300px]"
                  />
                  {/* Enhanced Dropdown */}
                  {isDropdownOpen && searchQuery && (
                    <div className="absolute w-full bg-white shadow-xl rounded-lg mt-2 z-50 overflow-hidden">
                      <ul>
                        {filteredTabs.map((option) => (
                          <li
                            key={option}
                            onClick={() => {
                              setActiveTab(option)
                              setIsDropdownOpen(false)
                            }}
                            className="cursor-pointer p-3 hover:bg-gray-100 transition-all ease-in-out duration-200"
                          >
                            {option.charAt(0).toUpperCase() + option.slice(1).replace("-", " ")}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </form>

              <div className="ml-auto flex items-center gap-2">
                <DropdownMenu open={isBellDropdownOpen} onOpenChange={setIsBellDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="relative cursor-pointer">
                      <Bell className="h-4 w-4" />
                      {notifications.length > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                          {notifications.length}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    className="w-80 bg-white dark:bg-zinc-900 text-black dark:text-white shadow-lg rounded-lg mt-2 z-50 absolute top-20 left-220"
                    align="end"
                    alignOffset={-5}
                    sideOffset={5}
                    forceMount
                    style={{ zIndex: 100 }}
                    key={notificationRefreshKey} // Add key to force re-render when notifications change
                  >
                    <DropdownMenuLabel className="flex justify-between items-center">
                      <span>Notifications</span>
                      <Button variant="ghost" size="sm" onClick={handleClearNotifications} className="text-xs h-6">
                        Clear all
                      </Button>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="max-h-[300px] overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification, index) => (
                          <DropdownMenuItem
                            key={index}
                            className="flex flex-col items-start p-3 border-b last:border-0 cursor-pointer hover:bg-muted/50"
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="font-medium break-words w-full">{notification.message}</div>
                            <div className="flex justify-between w-full mt-1">
                              <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
                                {notification.type}
                              </span>
                              <span className="text-xs text-gray-400">{formatDate(notification.timestamp)}</span>
                            </div>
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <div className="p-4 text-center text-muted-foreground">No notifications</div>
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-hidden p-6 relative">
            {/* Dynamic Tabs */}
            <div
              className={`absolute inset-0 overflow-auto transition-all transform bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 ${
                activeTab === "overview"
                  ? "opacity-100 translate-x-0 scale-100 pointer-events-auto"
                  : "opacity-0 translate-x-full scale-95 pointer-events-none"
              } duration-700 ease-in-out`}
            >
              {activeTab === "overview" && <DashboardOverview />}
            </div>

            <div
              className={`absolute inset-0 overflow-auto transition-all transform bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 ${
                activeTab === "users"
                  ? "opacity-100 translate-x-0 scale-100 pointer-events-auto"
                  : "opacity-0 -translate-x-full scale-95 pointer-events-none"
              } duration-700 ease-in-out`}
            >
              {activeTab === "users" && <UserManagement />}
            </div>

            <div
              className={`absolute inset-0 overflow-auto transition-all transform bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 ${
                activeTab === "tasks"
                  ? "opacity-100 translate-x-0 scale-100 pointer-events-auto"
                  : "opacity-0 -translate-x-full scale-95 pointer-events-none"
              } duration-700 ease-in-out`}
            >
              {activeTab === "tasks" && <TaskManagement />}
            </div>

            <div
              className={`absolute inset-0 overflow-auto transition-all transform bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 ${
                activeTab === "service"
                  ? "opacity-100 translate-x-0 scale-100 pointer-events-auto"
                  : "opacity-0 translate-x-full scale-95 pointer-events-none"
              } duration-700 ease-in-out`}
            >
              {activeTab === "service" && <Service />}
            </div>

            {/* New Role Requests Tab */}
            <div
              className={`absolute inset-0 overflow-auto transition-all transform bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 ${
                activeTab === "role-requests"
                  ? "opacity-100 translate-x-0 scale-100 pointer-events-auto"
                  : "opacity-0 translate-y-full scale-95 pointer-events-none"
              } duration-700 ease-in-out`}
            >
              {activeTab === "role-requests" && <RoleRequests key={notificationRefreshKey} />}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
