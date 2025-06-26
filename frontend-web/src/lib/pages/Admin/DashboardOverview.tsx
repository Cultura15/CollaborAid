import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDashboardData, useTaskInProgress, useTasks } from "./MockData"; // Import the custom hook
import { useState } from 'react';
import { isAdmin, isAuthenticated, decodeToken } from '../JWTDecode/JWTDecode';


export default function Dashboard() {
  const { stats } = useDashboardData();
  const inProgressTasks = useTaskInProgress();
  const [activeTab] = useState<"overview" | "tasks">("overview");
  const tasks = useTasks(); 
  const navigate = useNavigate();

  // Get token and check if user is admin
  const token = localStorage.getItem("jwtToken");
  const decodedToken = token ? decodeToken(token) : null;
  console.log("Decoded token in Dashboard component:", decodedToken);
  const userIsAdmin = decodedToken?.role === 'ADMIN';
  const userIsAuthenticated = isAuthenticated();

  // Redirect non-admin users
  useEffect(() => {
    if (!userIsAdmin) {
      console.log("Access denied: User is not an admin");
      navigate('/'); // Redirect to home page
    }
  }, [userIsAdmin, navigate]);

  // If not admin, don't render the dashboard
  if (!userIsAdmin) {
    return null;
  }

  // Sort tasks by newest first (assuming `createdAt` exists in response)
  const latestTasks = [...tasks]
  .sort((a, b) => b.id - a.id) // Sort by ID, with the latest (highest) ID first
  .slice(0, 4);// Get latest 4 tasks

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <div className="flex items-center gap-2">
          <Select defaultValue="today">
            <SelectTrigger className="w-[180px]">
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

      
      {activeTab === "overview" &&(
        <>
        
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline justify-between">
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <Badge
                      variant={stat.changeType === "positive" ? "default" : "destructive"}
                      className="text-xs font-normal"
                    >
                      {stat.change}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  <Card className="col-span-2">
    <CardHeader>
      <CardTitle>Recent Activities</CardTitle>
      <CardDescription>Overview of the latest activities</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {inProgressTasks
          // Sort by timestamp in descending order (newest first)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())  // Sorting by 'timestamp' field
          .slice(0, 3)  // Display only the top 3 tasks
          .map((task) => (
            <div key={task.id} className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">{task.title}</p>
                <p className="text-sm text-muted-foreground">Posted by {task.user ? task.user.username : "Unknown"}</p>
                <p className="text-sm text-muted-foreground">Accepted by {task.acceptedBy ? task.acceptedBy.username : "Not Accepted"}</p>
                <br />
              </div>
              <div className="flex items-center gap-2">
                <Badge className={task.status === "In Progress" ? "bg-yellow-500 text-white" : ""}>
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

  
  
            <Card>
              <CardHeader>
                <CardTitle>Recent Posts</CardTitle>
                <CardDescription>Latest actions from CollaborAid app</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {latestTasks.map((task, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <Avatar className="mt-1 h-8 w-8">
                        <AvatarFallback>
                          {task.user
                            ? task.user.username
                              .split(" ")
                              .map((name) => name[0])
                              .join("")
                            : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="text-sm">
                          <span className="font-medium">{task.user ? task.user.username : "Unknown"}</span> created{" "}
                          <span className="font-medium">{task.title}</span>
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          {new Date(task.timestamp).toLocaleString()} {/* Display creation time */}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
