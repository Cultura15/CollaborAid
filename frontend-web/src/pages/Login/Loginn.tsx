"use client"


import { useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, EyeIcon, EyeOffIcon, ArrowRightIcon, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Link, useNavigate } from "react-router-dom"
import { decodeToken } from "../JWTDecode/JWTDecode"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function Loginn() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)
  const [roleError, setRoleError] = useState(false)
  const navigate = useNavigate()

  const handleShowPasswordToggle = () => {
    setShowPassword((prev) => !prev)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setRoleError(false)

    try {
      const response = await axios.post("https://it342-g5-collaboraid.onrender.com/api/auth/login", { email, password })
      const { token } = response.data

      if (!token) {
        setError("Invalid token received")
        return
      }

      const decodedToken = decodeToken(token)
      if (!decodedToken) {
        setError("Failed to decode token")
        return
      }

      // Check if the user has the USER role
      if (decodedToken.role !== "USER") {
        setRoleError(true)
        return
      }

      // Store token and role only if validation passes
      localStorage.setItem("jwtToken", token)
      localStorage.setItem("role", decodedToken.role)

      // Navigate to user dashboard
      navigate("/user")
    } catch (err) {
      setError("Invalid username or password")
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
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">User Login</CardTitle>
            <CardDescription>Enter your credentials to access your user account</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {roleError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Access Denied</AlertTitle>
                  <AlertDescription>
                    This login is only for users. If you're an administrator, please use the admin login.
                    <div className="mt-2">
                      <Button variant="outline" size="sm" onClick={() => navigate("/admin-login")}>
                        Go to Admin Login
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">Email</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 w-full"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-muted-foreground transition-colors hover:text-primary"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 w-full pe-10"
                  />
                  <button
                    type="button"
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    onClick={handleShowPasswordToggle}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                  </button>
                </div>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="h-11 w-full group flex items-center justify-center">
                Sign in
                <ArrowRightIcon size={16} className="ms-2 transition-transform group-hover:translate-x-1" />
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/register" className="text-primary hover:underline">
                  Create account
                </Link>
              </p>
              <p className="text-center text-sm text-muted-foreground">
                Are you an admin?{" "}
                <Link to="/admin-login" className="text-primary hover:underline">
                  Admin Login
                </Link>
              </p>
              <p className="text-center text-sm text-muted-foreground">
                <Link to="/login-choice" className="text-muted-foreground hover:text-primary">
                  Back to login options
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
