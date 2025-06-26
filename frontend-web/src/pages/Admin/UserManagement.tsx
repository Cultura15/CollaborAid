"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Edit,
  Trash2,
  Search,
  UserPlus,
  UserCog,
  Shield,
  User,
  Users,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Mail,
  Key,
  RefreshCw,
  AlertTriangle,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useUsers } from "./MockData"
import { decodeToken } from "../JWTDecode/JWTDecode"
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
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function UserManagement() {
  const [userRefreshKey, setUserRefreshKey] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)

  // Add state for delete success dialog
  const [deleteSuccessOpen, setDeleteSuccessOpen] = useState(false)
  const [deletedUserId, setDeletedUserId] = useState(null)
  const [deletedUsername, setDeletedUsername] = useState("")

  const [showReactivateConfirm, setShowReactivateConfirm] = useState(false)
  const [userToReactivate, setUserToReactivate] = useState(null)

  const users = useUsers(userRefreshKey)
  const navigate = useNavigate()

  const [currentPage, setCurrentPage] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)

  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "USER", // Default role is USER and no longer selectable
  })
  const [editUser, setEditUser] = useState({
    id: "",
    username: "",
    email: "",
    role: "USER",
  })

  const usersPerPage = 6

  // Get token and check if user is admin
  const token = localStorage.getItem("jwtToken")
  const decodedToken = token ? decodeToken(token) : null
  console.log("Decoded token in UserManagement component:", decodedToken)
  const isAdmin = decodedToken?.role === "ADMIN"

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const [inactiveUsers, setInactiveUsers] = useState([])
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    if (!isAdmin) {
      console.log("Access denied: User is not an admin")
      navigate("/")
    }
  }, [isAdmin, navigate])

  // Set status filter based on active tab
  useEffect(() => {
    if (activeTab === "active") {
      setStatusFilter("active")
    } else if (activeTab === "inactive") {
      setStatusFilter("inactive")
    } else {
      setStatusFilter("all")
    }
  }, [activeTab])

  if (!isAdmin) {
    return null
  }

  const handleAddUser = () => {
    setShowAddModal(true)
  }

  const handleRefreshUsers = () => {
    setIsRefreshing(true)
    setUserRefreshKey((prev) => prev + 1)

    // Simulate a delay for the refresh animation
    setTimeout(() => {
      setIsRefreshing(false)
      toast.success("User list refreshed")
    }, 800)
  }

  // Calculate the current users to display based on the page
  const indexOfLastUser = currentPage * usersPerPage
  const indexOfFirstUser = indexOfLastUser - usersPerPage
  const filteredUsers = users.filter(
    (user) =>
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Apply status filter BEFORE pagination
  const statusFilteredUsers =
    statusFilter === "inactive"
      ? filteredUsers.filter((user) => user.status === "inactive")
      : statusFilter === "active"
        ? filteredUsers.filter((user) => user.status !== "inactive")
        : filteredUsers

  const currentUsers = statusFilteredUsers.slice(indexOfFirstUser, indexOfLastUser)

  // Function to handle marking a user as inactive
  const handleDeleteUser = async (userId) => {
    try {
      const response = await fetch(`https://it342-g5-collaboraid.onrender.com/api/auth/deactivate/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast.success("User deactivated successfully")

        // Store deleted user info for success dialog
        if (userToDelete) {
          setDeletedUserId(userToDelete.id)
          setDeletedUsername(userToDelete.username)
        }

        // After deactivation, trigger a re-fetch or state update to reflect changes
        setInactiveUsers((prevUsers) =>
          prevUsers.map((user) => (user.id === userId ? { ...user, status: "inactive" } : user)),
        )
        setUserRefreshKey((prev) => prev + 1)

        // Close the confirmation dialog
        setShowDeleteConfirm(false)

        // Show the success dialog
        setDeleteSuccessOpen(true)
      } else {
        const error = await response.json()
        toast.error("Failed to deactivate user: " + (error.message || response.statusText))
      }
    } catch (error) {
      toast.error("Error deactivating user: " + error.message)
    }
  }

  function confirmReactivateUser(user) {
    setUserToReactivate(user)
    setShowReactivateConfirm(true)
  }

  function handleReactivateUser(userId) {
    try {
      fetch(`https://it342-g5-collaboraid.onrender.com/api/auth/reactivate/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (response.ok) {
            toast.success("User reactivated successfully")
            setUserRefreshKey((prev) => prev + 1)
            setShowReactivateConfirm(false)
          } else {
            response.json().then((error) => {
              toast.error("Failed to reactivate user: " + (error.message || response.statusText))
            })
          }
        })
        .catch((error) => {
          toast.error("Error reactivating user: " + error.message)
        })
    } catch (error) {
      toast.error("Error reactivating user: " + error.message)
    }
  }

  // Filter users based on status (active/inactive)
  const filteredByStatus =
    statusFilter === "inactive"
      ? currentUsers.filter((user) => user.status === "inactive")
      : statusFilter === "active"
        ? currentUsers.filter((user) => user.status !== "inactive")
        : currentUsers

  // Create empty rows to maintain consistent table height
  const emptyRows = Array(usersPerPage - filteredByStatus.length).fill(null)

  // Function to go to the next page
  const handleNextPage = () => {
    if (currentPage < Math.ceil(statusFilteredUsers.length / usersPerPage)) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleSubmitNewUser = async () => {
    try {
      const response = await fetch("https://it342-g5-collaboraid.onrender.com/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newUser),
      })

      if (response.ok) {
        console.log("Submitting new user:", newUser)

        // Close the modal
        setShowAddModal(false)

        // Reset form
        setNewUser({
          username: "",
          email: "",
          password: "",
          role: "USER",
        })

        // Refresh user list
        setUserRefreshKey((prev) => prev + 1)

        // Show success popup
        setShowSuccessPopup(true)
        setTimeout(() => setShowSuccessPopup(false), 3000) // Auto-close after 3 seconds

        // Also show toast
        toast.success("User added successfully!")
      } else {
        const err = await response.json()
        toast.error("Failed to add user: " + (err.message || response.statusText))
      }
    } catch (error) {
      toast.error("Error adding user: " + error.message)
    }
  }

  // Replace with the new implementation that handles role changes separately
  const handleSubmitEditUser = async () => {
    try {
      // Get the original user data to check if role has changed
      const originalUser = users.find((user) => user.id === editUser.id)
      const hasRoleChanged = originalUser && originalUser.role !== editUser.role

      // If the role has changed, use the specific role change endpoint
      if (hasRoleChanged) {
        // Make the role change request
        const roleResponse = await fetch(
          `https://it342-g5-collaboraid.onrender.com/api/auth/admin/set-role?userId=${editUser.id}&newRole=${editUser.role}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        if (!roleResponse.ok) {
          const roleErr = await roleResponse.json()
          throw new Error(roleErr.message || roleResponse.statusText)
        }

        // If role change was successful, update other user data if needed
        if (originalUser.username !== editUser.username || originalUser.email !== editUser.email) {
          // Create a user update object without the role field
          const userUpdate = {
            username: editUser.username,
            email: editUser.email,
          }

          const dataResponse = await fetch(`https://it342-g5-collaboraid.onrender.com/api/auth/${editUser.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(userUpdate),
          })

          if (!dataResponse.ok) {
            const dataErr = await dataResponse.json()
            throw new Error(dataErr.message || dataResponse.statusText)
          }
        }

        toast.success("User updated successfully with new role!")
      } else {
        // If role hasn't changed, just update the user data
        const response = await fetch(`https://it342-g5-collaboraid.onrender.com/api/auth/${editUser.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            username: editUser.username,
            email: editUser.email,
          }),
        })

        if (!response.ok) {
          const err = await response.json()
          throw new Error(err.message || response.statusText)
        }

        toast.success("User information updated successfully!")
      }

      // Close modal and refresh user list
      setShowEditModal(false)
      setUserRefreshKey((prev) => prev + 1)
    } catch (error) {
      toast.error("Error updating user: " + error.message)
    }
  }

  // Column width definitions
  const columnWidths = {
    username: "30%",
    email: "30%",
    role: "15%",
    status: "15%",
    actions: "10%",
  }

  // Get counts for summary cards
  const totalUsers = users.length
  const activeUsers = users.filter((user) => user.status !== "inactive").length
  const inactiveUserCount = users.filter((user) => user.status === "inactive").length
  const adminUsers = users.filter((user) => user.role === "ADMIN").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          User Management
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefreshUsers}
            className={`transition-all duration-700 ${isRefreshing ? "rotate-180" : ""}`}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={handleAddUser} className="bg-blue-600 hover:bg-blue-700">
            <UserPlus className="mr-2 h-4 w-4" /> Add User
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="mr-2 h-4 w-4 text-blue-600" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <XCircle className="mr-2 h-4 w-4 text-red-600" />
              Inactive Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inactiveUserCount}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Shield className="mr-2 h-4 w-4 text-purple-600" />
              Admin Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminUsers}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>User List</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-8 w-[250px] bg-background"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                All Users
              </TabsTrigger>
              <TabsTrigger value="active" className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Active
              </TabsTrigger>
              <TabsTrigger value="inactive" className="flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Inactive
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div
              className="relative w-full overflow-auto"
              style={{ minHeight: `${Math.min(filteredByStatus.length, usersPerPage) * 73}px` }}
            >
              <table className="w-full caption-bottom text-sm table-fixed">
                <thead className="[&_tr]:border-b sticky top-0 bg-background z-10">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th
                      className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                      style={{ width: columnWidths.username }}
                    >
                      Username
                    </th>
                    <th
                      className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                      style={{ width: columnWidths.email }}
                    >
                      Email
                    </th>
                    <th
                      className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                      style={{ width: columnWidths.role }}
                    >
                      Role
                    </th>
                    <th
                      className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                      style={{ width: columnWidths.actions }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {filteredByStatus.length > 0 ? (
                    filteredByStatus.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                      >
                        <td className="p-4 align-middle truncate" style={{ width: columnWidths.username }}>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                              <AvatarFallback>
                                {user.username
                                  ?.split(" ")
                                  .map((name) => name[0])
                                  .join("") || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="font-medium truncate block">{user.username}</span>
                              <span className="text-xs text-muted-foreground">
                                {user.status === "inactive" ? (
                                  <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                                    Inactive
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                    Active
                                  </Badge>
                                )}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 align-middle truncate" style={{ width: columnWidths.email }}>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{user.email}</span>
                          </div>
                        </td>
                        <td className="p-4 align-middle" style={{ width: columnWidths.role }}>
                          <Badge
                            variant="outline"
                            className={
                              user.role === "ADMIN"
                                ? "bg-purple-100 text-purple-800 border-purple-200 flex items-center gap-1 w-fit"
                                : "bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1 w-fit"
                            }
                          >
                            {user.role === "ADMIN" ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                            {user.role}
                          </Badge>
                        </td>
                        <td className="p-4 align-middle" style={{ width: columnWidths.actions }}>
                          <div className="flex items-center gap-2">
                            {user.status === "inactive" ? (
                              /* Reactivate Button for inactive users */
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
                                onClick={() => confirmReactivateUser(user)}
                              >
                                <RefreshCw className="h-4 w-4" />
                                <span className="sr-only">Reactivate</span>
                              </Button>
                            ) : (
                              /* Edit Button for active users */
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                                onClick={() => {
                                  setEditUser(user)
                                  setShowEditModal(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                            )}
                            {/* Delete Button - always show */}
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:text-red-800"
                              onClick={() => {
                                setUserToDelete(user)
                                setShowDeleteConfirm(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-muted-foreground">
                        No users found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t p-4">
          <div className="text-sm text-muted-foreground">
            Showing {statusFilteredUsers.length > 0 ? indexOfFirstUser + 1 : 0} to{" "}
            {Math.min(indexOfLastUser, statusFilteredUsers.length)} of {statusFilteredUsers.length} users
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={
                currentPage === Math.ceil(statusFilteredUsers.length / usersPerPage) || statusFilteredUsers.length === 0
              }
              className="flex items-center gap-1"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Add User Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogTrigger />
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-blue-600" />
              Add New User
            </DialogTitle>
            <DialogDescription>Create a new user account. All fields are required.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="username" className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                className="border-input"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="border-input"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Key className="h-4 w-4 text-muted-foreground" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="border-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitNewUser}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!newUser.username || !newUser.email || !newUser.password}
            >
              <UserPlus className="mr-2 h-4 w-4" /> Add User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogTrigger />
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5 text-blue-600" />
              Edit User
            </DialogTitle>
            <DialogDescription>Update user information and permissions.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-username" className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Username
              </Label>
              <Input
                id="edit-username"
                type="text"
                value={editUser.username}
                onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
                className="border-input"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Email
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={editUser.email}
                onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                className="border-input"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role" className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                Role
              </Label>
              <Select value={editUser.role} onValueChange={(value) => setEditUser({ ...editUser, role: value })}>
                <SelectTrigger className="border-input">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER" className="flex items-center gap-2">
                    <User className="h-4 w-4 inline mr-2" /> User
                  </SelectItem>
                  <SelectItem value="ADMIN" className="flex items-center gap-2">
                    <Shield className="h-4 w-4 inline mr-2" /> Admin
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitEditUser} className="bg-blue-600 hover:bg-blue-700">
              <UserCog className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog - Using AlertDialog for better semantics */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirm User Deactivation
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate this user? This action can be reversed later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {userToDelete && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-3 rounded-md bg-red-50 border border-red-100">
                <Avatar className="h-10 w-10 bg-red-100 text-red-700">
                  <AvatarFallback>
                    {userToDelete.username
                      ?.split(" ")
                      .map((name) => name[0])
                      .join("") || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{userToDelete.username}</p>
                  <p className="text-sm text-muted-foreground">{userToDelete.email}</p>
                </div>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToDelete && handleDeleteUser(userToDelete.id)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Deactivate User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Success Dialog */}
      <Dialog open={deleteSuccessOpen} onOpenChange={setDeleteSuccessOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center text-emerald-600">
              <CheckCircle2 className="mr-2 h-5 w-5" />
              User Deactivated Successfully
            </DialogTitle>
            <DialogDescription>
              User {deletedUsername} has been successfully deactivated from the system.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <div className="rounded-full bg-emerald-100 p-3">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setDeleteSuccessOpen(false)} className="bg-emerald-600 hover:bg-emerald-700 w-full">
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reactivate Confirmation Dialog */}
      <AlertDialog open={showReactivateConfirm} onOpenChange={setShowReactivateConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-emerald-600">
              <RefreshCw className="h-5 w-5" />
              Confirm User Reactivation
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reactivate this user? They will regain access to the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {userToReactivate && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-3 rounded-md bg-emerald-50 border border-emerald-100">
                <Avatar className="h-10 w-10 bg-emerald-100 text-emerald-700">
                  <AvatarFallback>
                    {userToReactivate.username
                      ?.split(" ")
                      .map((name) => name[0])
                      .join("") || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{userToReactivate.username}</p>
                  <p className="text-sm text-muted-foreground">{userToReactivate.email}</p>
                </div>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToReactivate && handleReactivateUser(userToReactivate.id)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Reactivate User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/20" onClick={() => setShowSuccessPopup(false)}></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full mx-4 animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">User Added Successfully!</h3>
              <p className="text-muted-foreground mb-4">
                The new user has been added to the system and can now log in.
              </p>
              <Button onClick={() => setShowSuccessPopup(false)} className="bg-green-600 hover:bg-green-700">
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
