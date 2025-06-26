"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  CheckSquare,
  MessageSquare,
  Bell,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Link } from "react-router-dom"
import { ChatSupport } from "./components/ChatSupport"
import { decodeToken } from "../JWTDecode/JWTDecode"
import { ThemeProvider } from "@/context/ThemeProvider"
import { SettingsProvider } from "@/context/SettingsProvider"

// Import all content components
import { DashboardContent } from "./components/DashboardContent"
import { TasksContent } from "./components/TasksContent"
import { MessagesContent } from "./components/MessagesContent"
import { NotificationsContent } from "./components/NotificationsContent"
import { ProfileContent } from "./components/ProfileContent"
import { SettingsContent } from "./components/SettingsContent"

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [userProfilePicture, setUserProfilePicture] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const navigate = useNavigate()

  useEffect(() => {
    setIsMounted(true)

    // Check if user is authenticated
    const token = localStorage.getItem("jwtToken")
    if (!token) {
      navigate("/login")
      return
    }

    try {
      const decodedToken = decodeToken(token)
      if (!decodedToken || decodedToken.role !== "USER") {
        // Redirect if not a USER
        navigate("/login")
        return
      }

      // Set user data
      setUser({
        id: decodedToken.id || "user-123",
        name: decodedToken.username || "Student User",
        email: decodedToken.email || "student@example.com",
        role: decodedToken.role,
      })

      // Fetch user profile data including profile picture
      const fetchUserProfile = async () => {
        try {
          const response = await fetch("http://localhost:8080/api/auth/current-user", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (response.ok) {
            const userData = await response.json()
            if (userData.profilePicture) {
              setUserProfilePicture(`http://localhost:8080${userData.profilePicture}`)
            }
          }
        } catch (error) {
          console.error("Failed to fetch user profile:", error)
        }
      }

      fetchUserProfile()
    } catch (error) {
      console.error("Failed to parse user data:", error)
      navigate("/login")
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem("jwtToken")
    localStorage.removeItem("role")
    navigate("/login")
  }

  if (!isMounted || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  const navigation = [
    { name: "Dashboard", href: "#dashboard", icon: LayoutDashboard, id: "dashboard" },
    { name: "Tasks", href: "#tasks", icon: CheckSquare, badge: "3", id: "tasks" },
    { name: "Messages", href: "#messages", icon: MessageSquare, badge: "5", id: "messages" },
    { name: "Notifications", href: "#notifications", icon: Bell, badge: "2", id: "notifications" },
    { name: "Profile", href: "#profile", icon: User, id: "profile" },
    { name: "Settings", href: "#settings", icon: Settings, id: "settings" },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardContent user={{ ...user, avatar: userProfilePicture }} setActiveTab={setActiveTab} />
      case "tasks":
        return <TasksContent />
      case "messages":
        return <MessagesContent />
      case "notifications":
        return <NotificationsContent />
      case "profile":
        return <ProfileContent user={{ ...user, avatar: userProfilePicture }} />
      case "settings":
        return <SettingsContent />
      default:
        return <DashboardContent user={{ ...user, avatar: userProfilePicture }} setActiveTab={setActiveTab} />
    }
  }

  return (
    <ThemeProvider>
      <SettingsProvider>
        <div className="min-h-screen bg-muted/30">
          {/* Header */}
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
            <div className="flex flex-1 items-center gap-4">
              {/* Mobile menu button */}
              <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="outline" size="icon" className="shrink-0">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                  <div className="flex h-16 items-center border-b px-6">
                    <Link to="/" className="flex items-center gap-2 font-semibold">
                      <span className="text-lg">
                        Collabor<span className="text-primary">Aid</span>
                      </span>
                    </Link>
                  </div>
                  <ScrollArea className="h-[calc(100vh-64px)] pb-10">
                    <div className="px-2 py-4">
                      <nav className="grid gap-1 px-2">
                        {navigation.map((item) => (
                          <a
                            key={item.name}
                            href={item.href}
                            onClick={(e) => {
                              e.preventDefault()
                              setActiveTab(item.id)
                              setIsMobileNavOpen(false)
                            }}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                              activeTab === item.id
                                ? "bg-muted text-foreground"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                          >
                            <item.icon className="h-5 w-5" />
                            <span>{item.name}</span>
                            {item.badge && (
                              <Badge className="ml-auto h-5 w-5 justify-center rounded-full p-0">{item.badge}</Badge>
                            )}
                          </a>
                        ))}
                      </nav>
                      <Separator className="my-4" />
                      <div className="px-2">
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-3 text-muted-foreground"
                          onClick={() => {
                            setIsMobileNavOpen(false)
                            setIsChatOpen(true)
                          }}
                        >
                          <HelpCircle className="h-5 w-5" />
                          <span>Help & Support</span>
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-3 text-muted-foreground"
                          onClick={handleLogout}
                        >
                          <LogOut className="h-5 w-5" />
                          <span>Log out</span>
                        </Button>
                      </div>
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>

              {/* Logo */}
              <Link to="/" className="hidden lg:flex items-center gap-2 font-semibold">
                <span className="text-lg">
                  Collabor<span className="text-primary">Aid</span>
                </span>
              </Link>
            </div>

            {/* Right side of header */}
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" className="relative" onClick={() => setActiveTab("notifications")}>
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
                <Badge className="absolute -right-1 -top-1 h-5 w-5 justify-center rounded-full p-0">2</Badge>
              </Button>

              <Button variant="outline" size="icon" className="relative" onClick={() => setIsChatOpen(true)}>
                <HelpCircle className="h-5 w-5" />
                <span className="sr-only">Help</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={userProfilePicture || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setActiveTab("profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab("settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <div className="flex">
            {/* Sidebar (desktop) */}
            <aside className="hidden lg:flex h-[calc(100vh-64px)] w-64 flex-col border-r bg-background">
              <ScrollArea className="flex-1 p-4">
                <nav className="grid gap-1 px-2">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault()
                        setActiveTab(item.id)
                      }}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                        activeTab === item.id
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                      {item.badge && (
                        <Badge className="ml-auto h-5 w-5 justify-center rounded-full p-0">{item.badge}</Badge>
                      )}
                    </a>
                  ))}
                </nav>
                <Separator className="my-4" />
                <div className="px-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-muted-foreground"
                    onClick={() => setIsChatOpen(true)}
                  >
                    <HelpCircle className="h-5 w-5" />
                    <span>Help & Support</span>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-muted-foreground"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Log out</span>
                  </Button>
                </div>
              </ScrollArea>
            </aside>

            {/* Main content */}
            <main className="flex-1">
              <div className="container py-6 md:py-8 lg:py-10">{renderContent()}</div>
            </main>
          </div>

          {/* Chat Support */}
          <ChatSupport isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </div>
      </SettingsProvider>
    </ThemeProvider>
  )
}
