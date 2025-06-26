"use client"

import { useEffect, useState } from "react"
import {
  Shield,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertTriangle,
  Clock,
  Filter,
  Search,
  Mail,
  Hash,
  BarChart2,
  UserCog,
  CalendarDays,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Define the RoleRequest interface
interface RoleRequest {
  requestId: number // Changed from id to requestId to match backend
  status: string // Changed from union type to string to accept any status value
  username: string
  email: string
  bio?: string // Added bio field from backend
  requestDate: string
  reason?: string
  userId?: number // Made optional as it might not be directly in the response
  registrationDate?: string
  lastLoginDate?: string
  currentRole?: string
}

// Update the ConsolidatedRequest interface to match
interface ConsolidatedRequest {
  userId?: number
  username: string
  email: string
  bio?: string // Added bio field
  latestRequestDate: string
  status: string // Changed from union type to string
  reason?: string
  requestCount: number
  requests: RoleRequest[]
  registrationDate?: string
  lastLoginDate?: string
  currentRole?: string
}

export default function RoleRequests() {
  const [roleRequests, setRoleRequests] = useState<RoleRequest[]>([])
  const [consolidatedRequests, setConsolidatedRequests] = useState<ConsolidatedRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedRequest, setSelectedRequest] = useState<ConsolidatedRequest | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  // Fetch role requests from the API
  const fetchRoleRequests = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("jwtToken")
      if (!token) {
        throw new Error("Authentication token not found")
      }

      const response = await fetch("https://it342-g5-collaboraid.onrender.com/api/auth/admin/role-requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch role requests: ${response.statusText}`)
      }

      const data = await response.json()

      // Map the backend response to our RoleRequest interface
      const mappedRequests = data.map((item) => ({
        requestId: item.requestId,
        status: item.status,
        username: item.username,
        email: item.email,
        bio: item.bio,
        requestDate: item.requestDate || new Date().toISOString(), // Fallback if not provided
        userId: item.userId,
        // Keep other optional fields
        reason: item.reason,
        registrationDate: item.registrationDate,
        lastLoginDate: item.lastLoginDate,
        currentRole: item.currentRole || "USER",
      }))

      setRoleRequests(mappedRequests)

      // Consolidate requests by user
      consolidateRequests(mappedRequests)
    } catch (err) {
      setError(err.message || "Failed to fetch role requests")
      toast.error("Failed to load role requests")
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  // Consolidate requests by user
  const consolidateRequests = (requests: RoleRequest[]) => {
    // Since userId might not be directly available, we'll use email as the unique identifier
    const userMap = new Map<string, RoleRequest[]>()

    // Group requests by email
    requests.forEach((request) => {
      if (!userMap.has(request.email)) {
        userMap.set(request.email, [])
      }
      userMap.get(request.email)?.push(request)
    })

    // Create consolidated requests
    const consolidated: ConsolidatedRequest[] = []
    userMap.forEach((userRequests, email) => {
      // Sort requests by date (newest first)
      userRequests.sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime())

      // Get the latest request (first after sorting)
      const latestRequest = userRequests[0]

      // Create consolidated request
      consolidated.push({
        userId: latestRequest.userId,
        username: latestRequest.username,
        email: latestRequest.email,
        bio: latestRequest.bio,
        latestRequestDate: latestRequest.requestDate,
        status: latestRequest.status,
        reason: latestRequest.reason,
        requestCount: userRequests.length,
        requests: userRequests,
        registrationDate: latestRequest.registrationDate,
        lastLoginDate: latestRequest.lastLoginDate,
        currentRole: latestRequest.currentRole || "USER",
      })
    })

    // Sort consolidated requests by date (newest first)
    consolidated.sort((a, b) => new Date(b.latestRequestDate).getTime() - new Date(a.latestRequestDate).getTime())

    setConsolidatedRequests(consolidated)
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchRoleRequests()
  }, [])

  // Handle refresh button click
  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchRoleRequests()
  }

  // Handle request action (approve/reject)
  const handleRequestAction = async (request: ConsolidatedRequest, approve: boolean) => {
    setIsProcessing(true)
    try {
      const token = localStorage.getItem("jwtToken")
      if (!token) {
        throw new Error("Authentication token not found")
      }

      // Find the latest request for this user
      const latestRequest = request.requests[0]
      if (!latestRequest || !latestRequest.requestId) {
        throw new Error("No valid request found")
      }

      const requestId = latestRequest.requestId

      const response = await fetch(
        `https://it342-g5-collaboraid.onrender.com/api/auth/admin/handle-role-request?requestId=${requestId}&approve=${approve}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error(`Failed to process request: ${response.statusText}`)
      }

      toast.success(`Request ${approve ? "approved" : "rejected"} successfully`)

      // Update local state
      const updatedRoleRequests = roleRequests.map((req) =>
        req.requestId === requestId ? { ...req, status: approve ? "APPROVED" : "REJECTED" } : req,
      )
      setRoleRequests(updatedRoleRequests)

      // Update consolidated requests
      consolidateRequests(updatedRoleRequests)

      // Close dialogs
      setIsConfirmDialogOpen(false)
      setIsDetailsOpen(false)
      setSelectedRequest(null)
    } catch (err) {
      toast.error(err.message || "Failed to process request")
    } finally {
      setIsProcessing(false)
    }
  }

  // Open confirmation dialog
  const openConfirmDialog = (request: ConsolidatedRequest, action: "approve" | "reject") => {
    setSelectedRequest(request)
    setActionType(action)
    setIsConfirmDialogOpen(true)
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

  // Filter requests based on search query and status filter
  const filteredRequests = consolidatedRequests.filter((request) => {
    // Add null checks before calling toLowerCase()
    const matchesSearch =
      (request?.username?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (request?.email?.toLowerCase() || "").includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && request?.status === "PENDING") ||
      (statusFilter === "approved" && request?.status === "APPROVED") ||
      (statusFilter === "rejected" && request?.status === "REJECTED")

    return matchesSearch && matchesStatus
  })

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 flex items-center gap-1">
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        )
      case "APPROVED":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Approved
          </Badge>
        )
      case "REJECTED":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1">
            <XCircle className="h-3 w-3" /> Rejected
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
            Unknown
          </Badge>
        )
    }
  }

  // Render loading state
  if (loading && !isRefreshing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  // Render error state
  if (error && !roleRequests.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Failed to Load Requests</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchRoleRequests} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" /> Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Role Requests
        </h1>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          className={`transition-all duration-700 ${isRefreshing ? "rotate-180" : ""}`}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <User className="mr-2 h-4 w-4 text-blue-600" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{consolidatedRequests.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="mr-2 h-4 w-4 text-amber-600" />
              Pending Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {consolidatedRequests.filter((req) => req?.status === "PENDING").length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
              Approved Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {consolidatedRequests.filter((req) => req?.status === "APPROVED").length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <XCircle className="mr-2 h-4 w-4 text-red-600" />
              Rejected Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {consolidatedRequests.filter((req) => req?.status === "REJECTED").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Filters */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="all" onClick={() => setStatusFilter("all")}>
              All Requests
            </TabsTrigger>
            <TabsTrigger value="pending" onClick={() => setStatusFilter("pending")}>
              Pending
            </TabsTrigger>
            <TabsTrigger
              value="processed"
              onClick={() => {
                if (statusFilter !== "approved" && statusFilter !== "rejected") {
                  setStatusFilter("approved")
                }
              }}
            >
              Processed
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by username or email..."
                className="pl-8 w-[200px] md:w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {activeTab === "processed" && (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </Tabs>

      {/* Requests List - Scrollable Area */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-[calc(100vh-350px)] rounded-md border">
          {filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-4">
                <Shield className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-1">No role requests found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters or search query"
                  : "There are currently no role requests to display"}
              </p>
              {(searchQuery || statusFilter !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setStatusFilter("all")
                    setActiveTab("all")
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredRequests.map((request) => (
                <Card key={request.userId} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-10 w-10 bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
                          <AvatarFallback>{request?.username?.[0] || "?"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            {request?.username || "Unknown User"}
                            {request.requestCount > 1 && (
                              <Badge variant="secondary" className="ml-1">
                                {request.requestCount} requests
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="text-xs truncate max-w-[180px]">
                            {request?.email || "No email"}
                          </CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(request?.status || "")}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="text-sm space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Latest request: {formatDate(request?.latestRequestDate || "")}</span>
                      </div>
                      {request.bio && (
                        <div className="text-muted-foreground">
                          <p className="text-xs font-medium mb-1">Bio:</p>
                          <p className="text-xs line-clamp-2">{request.bio}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <UserCog className="h-3.5 w-3.5" />
                        <span>Current role: {request?.currentRole || "USER"}</span>
                      </div>
                      {request.userId && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Hash className="h-3.5 w-3.5" />
                          <span>User ID: {request.userId}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => {
                        setSelectedRequest(request)
                        setIsDetailsOpen(true)
                      }}
                    >
                      View Details
                    </Button>
                  </CardFooter>
                  {request?.status === "PENDING" && (
                    <div className="flex border-t">
                      <Button
                        className="flex-1 rounded-none rounded-bl-lg bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => openConfirmDialog(request, "approve")}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Separator orientation="vertical" />
                      <Button
                        className="flex-1 rounded-none rounded-br-lg bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => openConfirmDialog(request, "reject")}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Request Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Shield className="h-5 w-5 text-purple-600" />
              Role Request Details
            </DialogTitle>
            <DialogDescription>Review the details of this role request.</DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 my-2">
              {/* Status Badge */}
              <div className="flex justify-between items-center">
                {getStatusBadge(selectedRequest?.status || "")}
                {selectedRequest.requestCount > 1 && (
                  <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                    <BarChart2 className="mr-1 h-3 w-3" />
                    {selectedRequest.requestCount} total requests
                  </Badge>
                )}
              </div>

              {/* User Info */}
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                <Avatar className="h-16 w-16 bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
                  <AvatarFallback>{selectedRequest?.username?.[0] || "?"}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-medium">{selectedRequest?.username || "Unknown User"}</h3>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    <span>{selectedRequest?.email || "No email"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <UserCog className="h-3.5 w-3.5" />
                    <span>Current role: {selectedRequest?.currentRole || "USER"}</span>
                  </div>
                </div>
              </div>

              {/* Bio section */}
              {selectedRequest?.bio && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">BIO</h4>
                  <div className="bg-muted/30 p-3 rounded-md text-sm">{selectedRequest.bio}</div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">USER DETAILS</h4>
                  <div className="space-y-3 bg-muted/20 p-3 rounded-md">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Hash className="h-3 w-3" /> User ID
                      </p>
                      <p className="font-medium">{selectedRequest?.userId || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" /> Registration Date
                      </p>
                      <p className="font-medium">{formatDate(selectedRequest?.registrationDate || "")}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Last Login
                      </p>
                      <p className="font-medium">{formatDate(selectedRequest?.lastLoginDate || "")}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">REQUEST HISTORY</h4>
                  <div className="space-y-3 bg-muted/20 p-3 rounded-md max-h-[150px] overflow-y-auto">
                    {selectedRequest.requests.map((req, index) => (
                      <div key={req.requestId} className="text-sm border-b last:border-0 pb-2 last:pb-0">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Request #{index + 1}</span>
                          {getStatusBadge(req.status)}
                        </div>
                        <p className="text-xs text-muted-foreground">{formatDate(req.requestDate)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reason (if available) */}
              {selectedRequest?.reason && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">REQUEST REASON</h4>
                    <div className="bg-muted/50 p-3 rounded-md text-sm">{selectedRequest.reason}</div>
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter>
            {selectedRequest?.status === "PENDING" ? (
              <div className="flex w-full gap-2">
                <Button
                  variant="outline"
                  className="flex-1 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                  onClick={() => openConfirmDialog(selectedRequest, "reject")}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => openConfirmDialog(selectedRequest, "approve")}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsDetailsOpen(false)} className="w-full">
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle
              className={`flex items-center gap-2 ${actionType === "approve" ? "text-green-600" : "text-red-600"}`}
            >
              {actionType === "approve" ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
              Confirm {actionType === "approve" ? "Approval" : "Rejection"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {actionType === "approve" ? "approve" : "reject"} this role request?
              {actionType === "approve"
                ? " This will grant administrative privileges to the user."
                : " The user will not receive administrative privileges."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {selectedRequest && (
            <div className="py-4">
              <div
                className={`flex items-center gap-3 p-3 rounded-md ${
                  actionType === "approve" ? "bg-green-50 border border-green-100" : "bg-red-50 border border-red-100"
                }`}
              >
                <Avatar
                  className={`h-10 w-10 ${
                    actionType === "approve" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  <AvatarFallback>{selectedRequest?.username?.[0] || "?"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedRequest?.username || "Unknown User"}</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest?.email || "No email"}</p>
                  {selectedRequest.requestCount > 1 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Has requested {selectedRequest.requestCount} times
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedRequest && handleRequestAction(selectedRequest, actionType === "approve")}
              className={`${
                actionType === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
              } text-white`}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <>
                  {actionType === "approve" ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve Request
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject Request
                    </>
                  )}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
