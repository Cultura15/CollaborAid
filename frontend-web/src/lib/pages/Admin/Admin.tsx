
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

import DashboardOverview from "./DashboardOverview"
import UserManagement from "./UserManagement"
import TaskManagement from "./TaskManagement"
import Service from "./Service"
import { decodeToken } from "../JWTDecode/JWTDecode"
import Cookies from "js-cookie";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle" // Import DarkModeToggle
import { useNotification } from '@/context/NotificationContext';  // Import Notification Context

export default function Admin() {
  const [activeTab, setActiveTab] = React.useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTabs, setFilteredTabs] = useState(["overview", "users", "tasks", "service"]);

  
  const { notifications } = useNotification(); // Access notifications from context
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isBellDropdownOpen, setIsBellDropdownOpen] = useState(false); // Separate state for the bell dropdown

  

  const [settingsOpen, setSettingsOpen] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("jwtToken");
  const decodedToken = token ? decodeToken(token) : null;
  const isAdmin = decodedToken?.role === "ADMIN";

  const adminName = decodedToken?.sub || "Admin";

  useEffect(() => {
    if (!isAdmin) {
      navigate("/"); // Redirect to home page if not admin
    }
  }, [isAdmin, navigate]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = ["overview", "users", "tasks", "service"].filter(option =>
      option.toLowerCase().includes(query)
    );
    setFilteredTabs(filtered);
    setIsDropdownOpen(filtered.length > 0);
  };

  useEffect(() => {
    console.log('Dropdown is now', isBellDropdownOpen ? 'open' : 'closed');
  }, [isBellDropdownOpen]);

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
                      position: 'absolute',
                      top: '-100%',
                      left: 0,
                      transform: 'translateY(440px)',
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
                        localStorage.removeItem("jwtToken");
                        localStorage.removeItem("role")
                        navigate("/login");
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
                              setActiveTab(option);
                              setIsDropdownOpen(false);
                            }}
                            className="cursor-pointer p-3 hover:bg-gray-100 transition-all ease-in-out duration-200"
                          >
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </form>
              <div className="ml-auto flex items-center gap-2">
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="outline"
        size="icon"
        className="relative"
        onClick={() => setIsBellDropdownOpen(!isBellDropdownOpen)} // Toggle bell dropdown visibility
        
      >
        <Bell className="h-4 w-4" />
        {notifications.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
            {notifications.length}
          </span>
        )}
      </Button>
    </DropdownMenuTrigger>

    {isBellDropdownOpen && ( // Conditionally render the bell dropdown based on isBellDropdownOpen
   <DropdownMenuContent
   className="w-80 bg-white dark:bg-zinc-900 text-black dark:text-white shadow-lg rounded-lg mt-2 z-50 absolute top-20 left-225"
   align="end"
  >
    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
    <DropdownMenuSeparator />
    {notifications.length > 0 ? (
      notifications.map((notification, index) => (
        <DropdownMenuItem key={index}>
          {/* Display message */}
              <div>{notification.message}</div>
              {/* Optionally, display the notification type */}
              <div className="text-xs text-gray-500">{notification.type}</div>
              {/* Display timestamp if needed */}
              <div className="text-xs text-gray-400">{new Date(notification.timestamp).toLocaleString()}</div>
            </DropdownMenuItem>
      ))
    ) : (
      <DropdownMenuItem>No notifications</DropdownMenuItem>
    )}
  </DropdownMenuContent>
    )}
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
          </main>

        </div>
      </div>
    </SidebarProvider>
  );
}
