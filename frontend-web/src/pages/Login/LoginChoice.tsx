"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, User, ShieldIcon, ArrowRightIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google"

// Add import for decodeToken at the top of the file
import { decodeToken } from "../JWTDecode/JWTDecode"

export default function LoginChoice() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  // Update the handleGoogleCredentialResponse function to properly handle JWT token
  const handleGoogleCredentialResponse = async (response: any) => {
    try {
      console.log("Google credential response:", response)

      // Get the ID token from the response
      const idToken = response.credential

      if (!idToken) {
        throw new Error("Failed to get ID token from Google")
      }

      setIsLoading(true)

      // Send the ID token to your backend
      const backendResponse = await axios.post("https://it342-g5-collaboraid.onrender.com/api/auth/google-login/web", {
        idToken: idToken,
        platform: "web",
      })

      console.log("Backend response:", backendResponse.data)

      // Handle successful login
      if (backendResponse.data && backendResponse.data.token) {
        // Store the JWT token
        localStorage.setItem("jwtToken", backendResponse.data.token)

        // Store user info if needed
        if (backendResponse.data.user) {
          localStorage.setItem("user", JSON.stringify(backendResponse.data.user))

          // Decode the token to get user information
          const decodedToken = decodeToken(backendResponse.data.token)
          console.log("Decoded token after Google login:", decodedToken)

          // Check if this is a new user (not in the response, so we'll infer)
          const isNewUser = backendResponse.data.isNewUser || false

          // Show appropriate message
          if (isNewUser) {
            alert("Account created successfully! Welcome to CollaborAid!")
          } else {
            alert("Welcome back to CollaborAid!")
          }

          // Redirect based on role from the token or user object
          const userRole = decodedToken?.role || backendResponse.data.user.role

          if (userRole === "ADMIN") {
            navigate("/admin")
          } else {
            // Default to user dashboard for regular users
            navigate("/user")
          }
        } else {
          // If no user info in response, try to decode the token
          const decodedToken = decodeToken(backendResponse.data.token)
          console.log("Decoded token (no user object):", decodedToken)

          if (decodedToken && decodedToken.role) {
            // Redirect based on role from token
            if (decodedToken.role === "ADMIN") {
              navigate("/admin")
            } else {
              navigate("/user")
            }
          } else {
            // Default fallback if we can't determine role
            alert("Login successful! Welcome to CollaborAid!")
            navigate("/user")
          }
        }
      } else {
        throw new Error("Invalid response from server")
      }
    } catch (error: any) {
      console.error("Google login error:", error)

      // Show error message
      alert(`Login failed: ${error.response?.data?.error || error.message || "An error occurred during login"}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <a href="/" className="font-semibold text-xl">
              Collabor<span className="text-primary">Aid</span>
            </a>
          </div>
          <nav className="hidden md:flex gap-6">
            {["Features", "Gallery", "Content", "Contact"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {item}
              </a>
            ))}
          </nav>
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[240px] sm:w-[300px]">
              <nav className="flex flex-col gap-4 mt-8">
                {["Features", "Gallery", "Content", "Contact"].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="text-sm font-medium transition-colors hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item}
                  </a>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
              Welcome to Collabor<span className="text-primary">Aid</span>
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Choose the appropriate login option based on your role in the system
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* User Login Card */}
            <Card className="w-full shadow-lg transition-all duration-300 hover:shadow-xl hover:translate-y-[-5px]">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                    <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold">User Login</CardTitle>
                    <CardDescription>For students and regular users</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <span className="bg-blue-100 dark:bg-blue-900 p-1 rounded-full mr-2">
                        <svg
                          className="h-3 w-3 text-blue-600 dark:text-blue-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      Access to learning resources
                    </li>
                    <li className="flex items-center">
                      <span className="bg-blue-100 dark:bg-blue-900 p-1 rounded-full mr-2">
                        <svg
                          className="h-3 w-3 text-blue-600 dark:text-blue-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      Submit assignments and tasks
                    </li>
                    <li className="flex items-center">
                      <span className="bg-blue-100 dark:bg-blue-900 p-1 rounded-full mr-2">
                        <svg
                          className="h-3 w-3 text-blue-600 dark:text-blue-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      Participate in discussions
                    </li>
                  </ul>
                  <Link to="/login">
                    <Button className="w-full group bg-blue-600 hover:bg-blue-700">
                      Continue as User
                      <ArrowRightIcon size={16} className="ms-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Admin Login Card */}
            <Card className="w-full shadow-lg border-purple-200 transition-all duration-300 hover:shadow-xl hover:translate-y-[-5px]">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                    <ShieldIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold">Admin Login</CardTitle>
                    <CardDescription>For administrators and staff</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <span className="bg-purple-100 dark:bg-purple-900 p-1 rounded-full mr-2">
                        <svg
                          className="h-3 w-3 text-purple-600 dark:text-purple-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      Manage users and permissions
                    </li>
                    <li className="flex items-center">
                      <span className="bg-purple-100 dark:bg-purple-900 p-1 rounded-full mr-2">
                        <svg
                          className="h-3 w-3 text-purple-600 dark:text-purple-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      Create and assign tasks
                    </li>
                    <li className="flex items-center">
                      <span className="bg-purple-100 dark:bg-purple-900 p-1 rounded-full mr-2">
                        <svg
                          className="h-3 w-3 text-purple-600 dark:text-purple-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      Access system analytics
                    </li>
                  </ul>
                  <Link to="/admin-login">
                    <Button className="w-full group bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                      Continue as Admin
                      <ArrowRightIcon size={16} className="ms-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Google Login Section */}
          <div className="mt-8">
            <div className="flex items-center gap-4 mb-4">
              <Separator className="flex-1" />
              <span className="text-sm text-muted-foreground">Or continue with</span>
              <Separator className="flex-1" />
            </div>

            <GoogleOAuthProvider clientId="201627461876-go9n1oe7mpcof8uf175v12gug1jqfeug.apps.googleusercontent.com">
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleCredentialResponse}
                  onError={() => {
                    console.log("Google Login Failed")
                    alert("Google Sign-In failed. Please try again later.")
                  }}
                  useOneTap
                  theme="outline"
                  text="continue_with"
                  shape="rectangular"
                  logo_alignment="left"
                  width="100%"
                />
              </div>
            </GoogleOAuthProvider>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:underline">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
