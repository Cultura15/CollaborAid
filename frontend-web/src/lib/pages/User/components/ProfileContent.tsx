"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, Camera, Check, CheckCircle, Edit, Eye, EyeOff, Lock, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { decodeToken } from "../../JWTDecode/JWTDecode"
import { useSettings } from "@/context/SettingsProvider"

// Define interfaces
interface UserData {
  id: number
  username: string
  email: string
  role: string
  bio: string | null
  profilePicture: string | null
  createdAt: string
}

interface TaskStats {
  totalTasks: number
  tasksPosted: number
  tasksInProgress: number
  tasksPending: number
  tasksCompleted: number
}

// Update the interface to accept the user prop
interface ProfileContentProps {
  user?: {
    id: string
    name: string
    email: string
    role: string
    avatar: string
  }
}

// Update the component signature to accept props
export function ProfileContent({ user: initialUser }: ProfileContentProps) {
  // Get settings from context
  const { settings } = useSettings()
  const blurSensitiveData = settings.blurSensitiveData

  // State for user data
  const [userData, setUserData] = useState<UserData | null>(null)
  const [taskStats, setTaskStats] = useState<TaskStats>({
    totalTasks: 0,
    tasksPosted: 0,
    tasksInProgress: 0,
    tasksPending: 0,
    tasksCompleted: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [memberSince, setMemberSince] = useState<string | null>(null)

  // State for edit profile dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    bio: "",
  })

  // State for password reset
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  })
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  // State for profile picture upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Set up axios instance with base URL
  const api = axios.create({
    baseURL: "http://localhost:8080/api",
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

  // Update the fetchTaskStats function to use the provided API endpoints
  const fetchTaskStats = async () => {
    try {
      // Use the provided API endpoints to get task counts
      const [postedResponse, acceptedResponse, pendingResponse, historyResponse] = await Promise.all([
        api.get("/task/posted"),
        api.get("/task/accepted"),
        api.get("/task/pending-verification"),
        api.get("/task/history"),
      ])

      // Calculate task statistics
      const tasksPosted = postedResponse.data.length
      const tasksInProgress = acceptedResponse.data.length
      const tasksPending = pendingResponse.data.length
      const tasksCompleted = historyResponse.data.length
      const totalTasks = tasksPosted + tasksInProgress + tasksPending + tasksCompleted

      // Update task stats state
      setTaskStats({
        totalTasks,
        tasksPosted,
        tasksInProgress,
        tasksPending,
        tasksCompleted,
      })
    } catch (err) {
      console.error("Error fetching task statistics:", err)
    }
  }

  // Function to get or set the member since date
  const getMemberSinceDate = (userId: string | number) => {
    const key = `memberSince_${userId}`
    let date = localStorage.getItem(key)

    if (!date) {
      // If no date is stored, set it to current date
      date = new Date().toISOString()
      localStorage.setItem(key, date)
    }

    return date
  }

  // Update the fetchUserData function to use initialUser as fallback immediately
  const fetchUserData = async () => {
    setIsLoading(true)
    setError(null)

    // If we have initialUser data, use it as initial data
    if (initialUser) {
      // Get or set member since date from localStorage
      const memberSinceDate = getMemberSinceDate(initialUser.id)
      setMemberSince(memberSinceDate)

      setUserData({
        id: Number.parseInt(initialUser.id),
        username: initialUser.name,
        email: initialUser.email,
        role: initialUser.role,
        bio: null,
        profilePicture: initialUser.avatar,
        createdAt: memberSinceDate,
      })

      setEditForm({
        username: initialUser.name,
        email: initialUser.email,
        bio: "",
      })
    }

    try {
      // Get token from localStorage
      const token = localStorage.getItem("jwtToken")

      if (!token) {
        throw new Error("No authentication token found")
      }

      // Verify token is valid by decoding it
      const decodedToken = decodeToken(token)
      if (!decodedToken || !decodedToken.id) {
        throw new Error("Invalid authentication token")
      }

      // Use the new endpoint to get current user data
      const response = await api.get("/auth/current-user")

      // Get or set member since date from localStorage
      const memberSinceDate = getMemberSinceDate(response.data.id)
      setMemberSince(memberSinceDate)

      // Set user data from the response
      setUserData({
        ...response.data,
        createdAt: response.data.createdAt || memberSinceDate,
      })

      // Set edit form initial values
      setEditForm({
        username: response.data.username || "",
        email: response.data.email || "",
        bio: response.data.bio || "",
      })

      // Fetch task statistics
      await fetchTaskStats()
    } catch (err) {
      console.error("Error fetching user data:", err)
      setError("Failed to load user data. Please try again.")

      // We already set initialUser data above, so no need to do it again here
    } finally {
      setIsLoading(false)
    }
  }

  // Update user profile
  const updateProfile = async () => {
    try {
      if (!userData) return

      const updatedUser = {
        username: editForm.username,
        email: editForm.email,
        bio: editForm.bio,
      }

      const response = await api.put("/auth/update", updatedUser)

      // Update local state with the response
      setUserData({
        ...userData,
        username: response.data.username,
        email: response.data.email,
        bio: response.data.bio,
      })

      // Close the dialog
      setIsEditDialogOpen(false)
    } catch (err) {
      console.error("Error updating profile:", err)
      setError("Failed to update profile. Please try again.")
    }
  }

  // Upload profile picture
  const uploadProfilePicture = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const response = await api.post("/auth/upload-profile-picture", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      // After successful upload, fetch the updated user data to get the new profile picture path
      const userResponse = await api.get("/auth/current-user")

      // Update user data with new profile picture
      setUserData(userResponse.data)

      // Clear selected file and preview
      setSelectedFile(null)
      setPreviewUrl(null)
    } catch (err) {
      console.error("Error uploading profile picture:", err)
      setError("Failed to upload profile picture. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  // Handle file selection for profile picture
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)

      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Reset password
  const resetPassword = async () => {
    setPasswordError(null)

    // Validate passwords
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }

    if (passwordStrength < 80) {
      setPasswordError("Password is not strong enough")
      return
    }

    try {
      // Use the correct API endpoint to change password
      const response = await api.patch("/auth/change-password", {
        oldPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })

      // Show success message
      setPasswordSuccess(true)

      // Clear form and close dialog
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setIsResetPasswordDialogOpen(false)
    } catch (err) {
      console.error("Error resetting password:", err)
      if (err.response && err.response.data) {
        setPasswordError(err.response.data)
      } else {
        setPasswordError("Failed to reset password. Please try again.")
      }
    }
  }

  // Check password strength
  useEffect(() => {
    const criteria = {
      length: passwordForm.newPassword.length >= 8,
      uppercase: /[A-Z]/.test(passwordForm.newPassword),
      lowercase: /[a-z]/.test(passwordForm.newPassword),
      number: /[0-9]/.test(passwordForm.newPassword),
      special: /[^A-Za-z0-9]/.test(passwordForm.newPassword),
    }

    setPasswordCriteria(criteria)

    // Calculate strength percentage
    const metCriteria = Object.values(criteria).filter(Boolean).length
    const strengthPercentage = (metCriteria / 5) * 100
    setPasswordStrength(strengthPercentage)
  }, [passwordForm.newPassword])

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData()
  }, [initialUser])

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"

    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    } catch (e) {
      console.error("Error formatting date:", e)
      return "N/A"
    }
  }

  // Helper function to get profile picture URL
  const getProfilePictureUrl = () => {
    if (previewUrl) return previewUrl

    if (userData?.profilePicture) {
      // Check if the profile picture is a full URL or just a path
      if (userData.profilePicture.startsWith("http")) {
        return userData.profilePicture
      } else {
        // For paths from backend, prepend the backend URL
        return `http://localhost:8080${userData.profilePicture}`
      }
    }

    return "/placeholder.svg"
  }

  // Helper function to apply blur class conditionally
  const blurClass = blurSensitiveData ? "blur-sm hover:blur-none transition-all duration-200" : ""

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-2">Manage your personal information</p>
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
        <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
          <Card>
            <CardContent className="p-6 flex flex-col items-center">
              <div className="h-24 w-24 rounded-full bg-muted animate-pulse"></div>
              <div className="h-6 w-32 bg-muted animate-pulse mt-4 rounded"></div>
              <div className="h-4 w-48 bg-muted animate-pulse mt-2 rounded"></div>
              <div className="h-8 w-full bg-muted animate-pulse mt-6 rounded"></div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="h-6 w-40 bg-muted animate-pulse rounded"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i}>
                      <div className="h-4 w-24 bg-muted animate-pulse rounded mb-2"></div>
                      <div className="h-6 w-32 bg-muted animate-pulse rounded"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="h-6 w-40 bg-muted animate-pulse rounded"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i}>
                      <div className="h-4 w-24 bg-muted animate-pulse rounded mb-2"></div>
                      <div className="h-6 w-16 bg-muted animate-pulse rounded"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
          <Card>
            <CardContent className="p-6 flex flex-col items-center">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-2 border-primary">
                  <AvatarImage src={getProfilePictureUrl() || "/placeholder.svg"} alt={userData?.username || "User"} />
                  <AvatarFallback className="text-2xl">{userData?.username?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div
                  className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-8 w-8 text-white" />
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              </div>

              {selectedFile && (
                <div className="mt-2 flex flex-col items-center">
                  <p className="text-sm text-muted-foreground">{selectedFile.name}</p>
                  <Button size="sm" className="mt-2" onClick={uploadProfilePicture} disabled={isUploading}>
                    {isUploading ? "Uploading..." : "Upload Picture"}
                  </Button>
                </div>
              )}

              <h2 className="font-bold text-xl mt-4">{userData?.username || initialUser?.name}</h2>
              <p className={`text-muted-foreground ${blurClass}`}>{userData?.email}</p>
              <div className="mt-4 flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  Active
                </Badge>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Verified Account</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Button variant="outline" className="mt-6 w-full" onClick={() => setIsEditDialogOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Username</p>
                    <p className="font-medium">{userData?.username}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className={`font-medium ${blurClass}`}>{userData?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium">
                      <span className="inline-flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-green-500"></span>
                        Active
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Role</p>
                    <Badge
                      className={
                        userData?.role === "USER"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                          : "bg-purple-100 text-purple-800 border-purple-200"
                      }
                    >
                      {userData?.role}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <p className="font-medium">{formatDate(memberSince || userData?.createdAt || "")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bio</p>
                    <p className="font-medium">{userData?.bio || "No bio provided"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Task Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Tasks</p>
                    <p className={`font-medium text-xl ${blurClass}`}>{taskStats.totalTasks}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tasks Posted</p>
                    <p className={`font-medium text-xl ${blurClass}`}>{taskStats.tasksPosted}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tasks In Progress</p>
                    <p className={`font-medium text-xl ${blurClass}`}>{taskStats.tasksInProgress}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tasks Pending</p>
                    <p className={`font-medium text-xl ${blurClass}`}>{taskStats.tasksPending}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tasks Completed</p>
                    <p className={`font-medium text-xl ${blurClass}`}>{taskStats.tasksCompleted}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="font-medium text-lg flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Password Management
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">Secure your account with a strong password</p>
                    </div>
                    <Button
                      className="bg-slate-800 hover:bg-slate-700 text-white"
                      onClick={() => setIsResetPasswordDialogOpen(true)}
                    >
                      Reset Password
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update your personal information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                placeholder="Tell us about yourself"
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateProfile}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Reset Password
            </DialogTitle>
            <DialogDescription>Create a new secure password for your account</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {passwordError && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-3 flex items-start">
                <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{passwordError}</p>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">{showCurrentPassword ? "Hide password" : "Show password"}</span>
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">{showNewPassword ? "Hide password" : "Show password"}</span>
                </Button>
              </div>

              {passwordForm.newPassword && (
                <div className="mt-2 space-y-2">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground flex justify-between">
                      <span>Password strength:</span>
                      <span className="font-medium">
                        {passwordStrength < 20
                          ? "Very Weak"
                          : passwordStrength < 40
                            ? "Weak"
                            : passwordStrength < 60
                              ? "Fair"
                              : passwordStrength < 80
                                ? "Good"
                                : "Strong"}
                      </span>
                    </div>
                    <Progress value={passwordStrength} className="h-1.5" />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 text-xs">
                      {passwordCriteria.length ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-red-500" />
                      )}
                      <span className={passwordCriteria.length ? "text-green-500" : "text-muted-foreground"}>
                        8+ characters
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {passwordCriteria.uppercase ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-red-500" />
                      )}
                      <span className={passwordCriteria.uppercase ? "text-green-500" : "text-muted-foreground"}>
                        Uppercase letter
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {passwordCriteria.lowercase ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-red-500" />
                      )}
                      <span className={passwordCriteria.lowercase ? "text-green-500" : "text-muted-foreground"}>
                        Lowercase letter
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {passwordCriteria.number ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-red-500" />
                      )}
                      <span className={passwordCriteria.number ? "text-green-500" : "text-muted-foreground"}>
                        Number
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {passwordCriteria.special ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-red-500" />
                      )}
                      <span className={passwordCriteria.special ? "text-green-500" : "text-muted-foreground"}>
                        Special character
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">{showConfirmPassword ? "Hide password" : "Show password"}</span>
                </Button>
              </div>
              {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetPasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-slate-800 hover:bg-slate-700"
              onClick={resetPassword}
              disabled={!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
            >
              <Lock className="h-4 w-4 mr-2" />
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Success Dialog */}
      <Dialog open={passwordSuccess} onOpenChange={setPasswordSuccess}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-green-600 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Success
            </DialogTitle>
            <DialogDescription>Your password has been changed successfully.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <DialogFooter>
            <Button onClick={() => setPasswordSuccess(false)} className="bg-green-600 hover:bg-green-700">
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
