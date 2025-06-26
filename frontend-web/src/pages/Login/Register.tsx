"use client"


import { useState, useEffect } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Menu, EyeIcon, EyeOffIcon, ArrowRightIcon, CheckIcon, XIcon } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Link, useNavigate } from "react-router-dom"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"

export default function Register() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
  })
  const [termsDialogOpen, setTermsDialogOpen] = useState(false)
  const navigate = useNavigate()
  const [passwordFocused, setPasswordFocused] = useState(false)

  // Check password criteria and update strength
  useEffect(() => {
    const criteria = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    }

    setPasswordCriteria(criteria)

    // Calculate strength percentage
    const metCriteria = Object.values(criteria).filter(Boolean).length
    const strengthPercentage = (metCriteria / 4) * 100
    setPasswordStrength(strengthPercentage)
  }, [password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validate form
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (passwordStrength < 100) {
      setError("Please ensure your password meets all requirements")
      return
    }

    if (!termsAccepted) {
      setError("Please accept the terms and conditions")
      return
    }

    try {
      const response = await axios.post("https://it342-g5-collaboraid.onrender.com/api/auth/register", {
        username,
        email,
        password,
        role: "USER", // Always set to USER
      })

      setSuccess("Registration successful! Redirecting...")
      setTimeout(() => navigate("/login"), 2000) // Redirect to login page
    } catch (err) {
      setError("Registration failed. Try again.")
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <a href="/" className="font-semibold text-xl">
              Collabor<span className="text-primary">Aid</span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6">
            <a href="#features" className="text-sm font-medium transition-colors hover:text-primary">
              Features
            </a>
            <a href="#gallery" className="text-sm font-medium transition-colors hover:text-primary">
              Gallery
            </a>
            <a href="#content" className="text-sm font-medium transition-colors hover:text-primary">
              Content
            </a>
            <a href="#contact" className="text-sm font-medium transition-colors hover:text-primary">
              Contact
            </a>
          </nav>

          {/* Mobile Navigation */}
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
            <CardTitle className="text-2xl font-bold tracking-tight text-balance">Create an Account</CardTitle>
            <CardDescription className="text-wrap">Enter your details to register</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="size-11 h-auto w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="size-11 h-auto w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    required
                    className="h-11 w-full pe-10"
                  />
                  <button
                    type="button"
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                  </button>
                </div>

                {/* Password strength indicator */}
                {(passwordFocused || password.length > 0) && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Password strength</span>
                      <span className="text-sm font-medium">{passwordStrength.toFixed(0)}%</span>
                    </div>
                    <Progress value={passwordStrength} className="h-2" />

                    {/* Password criteria checklist */}
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="flex items-center gap-2 text-sm">
                        {passwordCriteria.length ? (
                          <CheckIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <XIcon className="h-4 w-4 text-red-500" />
                        )}
                        <span className={passwordCriteria.length ? "text-green-500" : "text-muted-foreground"}>
                          8+ characters
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {passwordCriteria.uppercase ? (
                          <CheckIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <XIcon className="h-4 w-4 text-red-500" />
                        )}
                        <span className={passwordCriteria.uppercase ? "text-green-500" : "text-muted-foreground"}>
                          Uppercase letter
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {passwordCriteria.number ? (
                          <CheckIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <XIcon className="h-4 w-4 text-red-500" />
                        )}
                        <span className={passwordCriteria.number ? "text-green-500" : "text-muted-foreground"}>
                          Number
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {passwordCriteria.special ? (
                          <CheckIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <XIcon className="h-4 w-4 text-red-500" />
                        )}
                        <span className={passwordCriteria.special ? "text-green-500" : "text-muted-foreground"}>
                          Special character
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-11 w-full pe-10"
                  />
                  <button
                    type="button"
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                  </button>
                </div>
                {password && confirmPassword && password !== confirmPassword && (
                  <p className="text-sm text-red-500">Passwords do not match</p>
                )}
              </div>

              {/* Terms and conditions */}
              <div className="flex items-center space-x-2 mb-4">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  required
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I agree to the{" "}
                    <Dialog open={termsDialogOpen} onOpenChange={setTermsDialogOpen}>
                      <DialogTrigger asChild>
                        <button type="button" className="text-primary hover:underline">
                          terms and conditions
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Terms and Conditions</DialogTitle>
                          <DialogDescription>
                            Please read these terms carefully before using our service.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
                          <h3 className="text-lg font-semibold">1. Acceptance of Terms</h3>
                          <p>
                            By accessing or using our service, you agree to be bound by these Terms and Conditions and
                            our Privacy Policy. If you disagree with any part of the terms, you may not access the
                            service.
                          </p>

                          <h3 className="text-lg font-semibold">2. User Accounts</h3>
                          <p>
                            When you create an account with us, you must provide information that is accurate, complete,
                            and current at all times. Failure to do so constitutes a breach of the Terms, which may
                            result in immediate termination of your account.
                          </p>

                          <h3 className="text-lg font-semibold">3. Content</h3>
                          <p>
                            Our service allows you to post, link, store, share and otherwise make available certain
                            information, text, graphics, videos, or other material. You are responsible for the content
                            that you post to the service, including its legality, reliability, and appropriateness.
                          </p>

                          <h3 className="text-lg font-semibold">4. Termination</h3>
                          <p>
                            We may terminate or suspend your account immediately, without prior notice or liability, for
                            any reason whatsoever, including without limitation if you breach the Terms.
                          </p>
                        </div>
                        <div className="flex justify-end mt-4">
                          <DialogClose asChild>
                            <Button onClick={() => setTermsAccepted(true)}>I Accept</Button>
                          </DialogClose>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </label>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
              {success && <p className="text-green-500 text-sm mt-4">{success}</p>}
            </CardContent>
            <CardFooter className="flex flex-col space-y-6 pt-4">
              <Button type="submit" className="h-11 w-full group">
                Sign up
                <ArrowRightIcon size={16} className="ms-2 transition-transform group-hover:translate-x-1" />
              </Button>
              <p className="text-center text-sm text-muted-foreground text-balance">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
