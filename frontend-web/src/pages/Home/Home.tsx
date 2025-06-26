"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Menu,
  ArrowRight,
  MessageSquare,
  Bell,
  CheckCircle,
  Shield,
  Code,
  Zap,
  ChevronRight,
  Users,
  Star,
  ArrowUpRight,
  Settings,
  Sun,
  Moon,
  Laptop,
  X,
  Check,
  Sparkles,
  Rocket,  
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ChatWidget } from "@/components/ui/chat-widget"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useTheme } from "@/context/ThemeProvider"
import collaboraidImage from "@/assets/collabs.png" // adjust the path if needed

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isThemeDialogOpen, setIsThemeDialogOpen] = useState(false)
  const navigate = useNavigate()
  const { theme, themeMode, setThemeMode } = useTheme()

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? "border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="w-full px-4 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <a href="/" className="font-bold text-xl">
              Collabor<span className="text-primary">Aid</span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6">
            <a href="#features" className="text-sm font-medium transition-colors hover:text-primary relative group">
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a
              href="#what-is-collaboraid"
              className="text-sm font-medium transition-colors hover:text-primary relative group"
            >
              About
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a
              href="#what-we-offer"
              className="text-sm font-medium transition-colors hover:text-primary relative group"
            >
              What We Offer
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="/contact" className="text-sm font-medium transition-colors hover:text-primary relative group">
              Contact
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate("/login")} className="hidden md:flex">
              Sign In
            </Button>
            <Button onClick={() => navigate("/login-choice")} className="hidden md:flex">
              Get Started
            </Button>

            {/* Theme Switcher Dialog */}
            <Dialog open={isThemeDialogOpen} onOpenChange={setIsThemeDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full relative">
                  <Settings className="h-[1.2rem] w-[1.2rem]" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="text-xl flex items-center justify-between">
                    <span>Theme Settings</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsThemeDialogOpen(false)}
                      className="h-8 w-8 rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Select Theme</h3>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant={themeMode === "light" ? "default" : "outline"}
                        className="flex flex-col items-center justify-center gap-1 h-24"
                        onClick={() => {
                          setThemeMode("light")
                          setIsThemeDialogOpen(false)
                        }}
                      >
                        <Sun className="h-8 w-8" />
                        <span>Light</span>
                      </Button>
                      <Button
                        variant={themeMode === "dark" ? "default" : "outline"}
                        className="flex flex-col items-center justify-center gap-1 h-24"
                        onClick={() => {
                          setThemeMode("dark")
                          setIsThemeDialogOpen(false)
                        }}
                      >
                        <Moon className="h-8 w-8" />
                        <span>Dark</span>
                      </Button>
                      <Button
                        variant={themeMode === "system" ? "default" : "outline"}
                        className="flex flex-col items-center justify-center gap-1 h-24"
                        onClick={() => {
                          setThemeMode("system")
                          setIsThemeDialogOpen(false)
                        }}
                      >
                        <Laptop className="h-8 w-8" />
                        <span>System</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Mobile Navigation */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" aria-label="Menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[240px] sm:w-[300px]">
                <div className="font-bold text-xl mb-8 mt-4">
                  Collabor<span className="text-primary">Aid</span>
                </div>
                <nav className="flex flex-col gap-4">
                  <a
                    href="#features"
                    className="text-sm font-medium transition-colors hover:text-primary flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Features
                    <ChevronRight className="ml-auto h-4 w-4" />
                  </a>
                  <a
                    href="#what-is-collaboraid"
                    className="text-sm font-medium transition-colors hover:text-primary flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    About
                    <ChevronRight className="ml-auto h-4 w-4" />
                  </a>
                  <a
                    href="#what-we-offer"
                    className="text-sm font-medium transition-colors hover:text-primary flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    What We Offer
                    <ChevronRight className="ml-auto h-4 w-4" />
                  </a>
                  <a
                    href="/contact"
                    className="text-sm font-medium transition-colors hover:text-primary flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Contact
                    <ChevronRight className="ml-auto h-4 w-4" />
                  </a>
                  <Separator className="my-4" />

                  {/* Theme options in mobile menu */}
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium">Theme</p>
                    <div className="flex gap-2">
                      <Button
                        variant={themeMode === "light" ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                        onClick={() => setThemeMode("light")}
                      >
                        <Sun className="mr-1 h-4 w-4" />
                        Light
                      </Button>
                      <Button
                        variant={themeMode === "dark" ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                        onClick={() => setThemeMode("dark")}
                      >
                        <Moon className="mr-1 h-4 w-4" />
                        Dark
                      </Button>
                    </div>
                    <Button
                      variant={themeMode === "system" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setThemeMode("system")}
                    >
                      <Laptop className="mr-1 h-4 w-4" />
                      System
                    </Button>
                  </div>

                  <Separator className="my-4" />
                  <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/login")}>
                    Sign In
                  </Button>
                  <Button className="w-full justify-start" onClick={() => navigate("/register")}>
                    Get Started
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden w-full">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-[40%] -right-[30%] h-[800px] w-[800px] rounded-full bg-primary/5 blur-3xl"></div>
            <div className="absolute -bottom-[40%] -left-[30%] h-[800px] w-[800px] rounded-full bg-primary/5 blur-3xl"></div>
          </div>

          <div className="w-full py-24 md:py-32">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="space-y-8">
                <Badge
                  variant="outline"
                  className="px-3 py-1 text-sm rounded-full border-primary/20 bg-primary/5 text-primary"
                >
                  Empowering Student Collaboration
                </Badge>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                  Connect, Help, <br />
                  <span className="text-primary relative">
                    Grow Together
                    <svg
                      className="absolute -bottom-2 left-0 w-full"
                      viewBox="0 0 300 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 5.5C32.5 1.5 62.5 1.5 93 5.5C123.5 9.5 154 9.5 184.5 5.5C215 1.5 245.5 1.5 299 5.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        className="text-primary/30"
                      />
                    </svg>
                  </span>
                </h1>
                <p className="text-muted-foreground text-lg md:text-xl max-w-[600px] leading-relaxed">
                  CollaborAid empowers a supportive community where users can easily post tasks, offer help, and earn
                  rewards, making collaboration fun, engaging, and impactful.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    onClick={() => navigate("/login-choice")}
                    className="group relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center">
                      Get Started
                      <ArrowRight className="ms-2 transition-transform group-hover:translate-x-1" />
                    </span>
                    <span className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                  </Button>
                  <Button variant="outline" size="lg" className="group" 
                  onClick={() => navigate("/learn-more")}>
                    Learn More
                    <ArrowUpRight className="ms-2 opacity-70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Button>
                </div>
                <div className="flex items-center gap-4 pt-4">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted overflow-hidden">
                        <img
                          src={`/blue-skinned-figure.png?height=32&width=32&query=avatar ${i}`}
                          alt={`User ${i}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">100+</span> students already joined
                  </div>
                </div>
              </div>
              <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-60"></div>
                <img
                  src={collaboraidImage || "/placeholder.svg"}
                  alt="CollaborAid"
                  className="object-cover w-full h-full"
                />

                {/* Floating elements */}
                <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm rounded-lg p-3 shadow-lg flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">4.6/5 Rating</span>
                </div>
                <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg p-3 shadow-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="font-medium">80+ Active Users</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <style>
          {`
section {
  transition: background-color 0.3s ease;
}

@keyframes gradientFlow {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.animated-divider-blue {
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.7), transparent);
  background-size: 200% 100%;
  animation: gradientFlow 8s ease infinite;
  height: 3px;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
}

.animated-divider-white {
  background-color: rgba(255, 255, 255, 0.7);
  height: 2px;
}

.dark .animated-divider-white {
  background-color: rgba(255, 255, 255, 0.15);
}

.section-content {
  width: 100%;
}

@media (min-width: 640px) {
  .section-content {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .section-content {
    padding-left: 2rem;
    padding-right: 2rem;
  }
}

.blue-gradient-bg {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%);
}

.dark .blue-gradient-bg {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.05) 100%);
}

.feature-timeline-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.feature-timeline-line {
  position: absolute;
  left: 12px;
  top: 24px;
  bottom: 0;
  width: 2px;
  background-color: #e5e7eb;
}

.dark .feature-timeline-line {
  background-color: rgba(255, 255, 255, 0.1);
}

.feature-card {
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-left: 2rem;
  position: relative;
  border: 1px solid rgba(59, 130, 246, 0.1);
  transition: all 0.3s ease;
}

.feature-card:hover {
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow: 0 4px 20px -5px rgba(59, 130, 246, 0.15);
}

.dark .feature-card {
  border-color: rgba(59, 130, 246, 0.2);
}

.dark .feature-card:hover {
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 0 4px 20px -5px rgba(59, 130, 246, 0.25);
}

.card-shine {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.03) 30%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.03) 70%,
    rgba(255, 255, 255, 0) 100%
  );
  z-index: 1;
  transform: translateY(100%);
  animation: shine 5s infinite;
}

@keyframes shine {
  0% {
    transform: translateY(100%) translateX(-100%);
  }
  50% {
    transform: translateY(-100%) translateX(100%);
  }
  100% {
    transform: translateY(-100%) translateX(100%);
  }
}

.monochrome-card {
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.monochrome-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.monochrome-card:hover::before {
  opacity: 1;
}

.dark .monochrome-card::before {
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
}

.icon-container {
  position: relative;
  z-index: 1;
}

.icon-container::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.15), transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.monochrome-card:hover .icon-container::after {
  opacity: 1;
}
          `}
        </style>

        {/* Animated Divider */}
        <div className="relative h-24 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
          </div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background border border-border/50 rounded-full p-3 shadow-lg">
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="blue-gradient-bg py-24 relative w-full">
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
          </div>

          <div className="section-content">
            <div className="flex flex-col items-center text-center mb-16">
              <Badge
                variant="outline"
                className="mb-4 px-3 py-1 text-sm rounded-full border-primary/20 bg-primary/5 text-primary"
              >
                Why Choose CollaborAid
              </Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
                Software Requirements
              </h2>
              <p className="mt-4 text-muted-foreground text-lg max-w-[700px]">
                Discover what makes our collaborative approach stand out from the crowd.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: <MessageSquare className="h-6 w-6 text-blue-500" />,
                  title: "AI Chat Support",
                  description: "Smart, helpful AI chatbot ready to guide users and answer questions instantly.",
                  depth: "1",
                },
                {
                  icon: <Bell className="h-6 w-6 text-amber-500" />,
                  title: "Real-Time Messaging & Notification",
                  description: "Instant notifications and messaging using advanced websocket setup",
                  depth: "2",
                },
                {
                  icon: <CheckCircle className="h-6 w-6 text-green-500" />,
                  title: "Task-Based Collaboration",
                  description: "Easily post, accept, and manage help requests in a rewarding, community-driven space.",
                  depth: "3",
                },
                {
                  icon: <Shield className="h-6 w-6 text-purple-500" />,
                  title: "Highly Secured",
                  description: "Protected with JWT authentication to ensure user data and sessions stay safe.",
                  depth: "4",
                },
                {
                  icon: <Code className="h-6 w-6 text-rose-500" />,
                  title: "External Integrations",
                  description: "External integrations with Microsoft Azure and Google Cloud.",
                  depth: "5",
                },
                {
                  icon: <Zap className="h-6 w-6 text-yellow-500" />,
                  title: "High Performance",
                  description: "Optimized backend and frontend for fast, seamless user experiences.",
                  depth: "6",
                },
              ].map((feature, index) => (
                <Card
                  key={index}
                  className={`monochrome-card border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300`}
                  style={{
                    background: `linear-gradient(to bottom right, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.${feature.depth}))`,
                  }}
                >
                  <CardContent className="p-6 relative z-10">
                    <div className="icon-container rounded-full bg-gray-100 dark:bg-gray-800 w-12 h-12 flex items-center justify-center mb-4 shadow-sm">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Animated Divider */}
        <div className="relative h-24 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
          </div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background border border-border/50 rounded-full p-3 shadow-lg">
            <Code className="h-6 w-6 text-primary animate-pulse" />
          </div>
        </div>

        {/* What is CollaborAid Section (replacing Gallery) */}
        <section id="what-is-collaboraid" className="py-24 w-full">
          <div className="section-content">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-medium text-muted-foreground mb-2">WHAT IS COLLABORAID?</h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h3 className="text-4xl md:text-5xl font-bold mb-6">
                  An <span className="text-primary">innovative</span> <br />
                  <span className="text-primary">learning platform</span> <br />
                  for student collaboration.
                </h3>
                <p className="text-lg text-muted-foreground mb-8">
                  CollaborAid revolutionizes how students work together, creating a supportive ecosystem where knowledge
                  sharing and mutual assistance thrive.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  "AI-powered assistance for instant help",
                  "Secure and reliable communication channels",
                  "Task management and tracking tools",
                  "Accessible via mobile and desktop devices",
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-1 mt-0.5">
                      <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-lg">{feature}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

           {/* Animated Divider */}
           <div className="relative h-24 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
          </div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background border border-border/50 rounded-full p-3 shadow-lg">
            <Rocket className="h-6 w-6 text-primary animate-pulse" />
          </div>
        </div>

        {/* What We Offer Section (replacing Testimonials) */}
        <section id="what-we-offer" className="blue-gradient-bg py-24 relative w-full">
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
          </div>

          <div className="section-content">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-medium text-muted-foreground mb-2">WHAT WE OFFER</h2>
              <h3 className="text-4xl md:text-5xl font-bold">CollaborAid's Features</h3>
            </div>

            <div className="relative">
              {/* First Year */}
              <div className="relative pl-10 mb-12">
                <div className="feature-timeline-dot bg-blue-100 dark:bg-blue-900/50 absolute left-0 top-0">
                  <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                </div>
                <div className="feature-timeline-line"></div>
                <div className="bg-blue-50/50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                  <h4 className="text-lg font-semibold text-blue-600 dark:text-blue-400">Communication Tools</h4>
                </div>

                <div className="space-y-4">
                  <div className="feature-card bg-white dark:bg-gray-800/50">
                    <h5 className="text-xl font-semibold mb-2">Real-Time Messaging</h5>
                    <p className="text-muted-foreground">
                      Instant messaging system that allows students to communicate directly, share files, and
                      collaborate on projects in real-time.
                    </p>
                  </div>

                  <div className="feature-card bg-white dark:bg-gray-800/50">
                    <h5 className="text-xl font-semibold mb-2">AI Chatbot Assistant</h5>
                    <p className="text-muted-foreground">
                      Intelligent chatbot that provides immediate responses to common questions, guides users through
                      the platform, and offers helpful resources.
                    </p>
                  </div>
                </div>
              </div>

              {/* Second Year */}
              <div className="relative pl-10 mb-12">
                <div className="feature-timeline-dot bg-green-100 dark:bg-green-900/50 absolute left-0 top-0">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                </div>
                <div className="feature-timeline-line"></div>
                <div className="bg-green-50/50 dark:bg-green-900/20 rounded-lg p-4 mb-6">
                  <h4 className="text-lg font-semibold text-green-600 dark:text-green-400">Collaboration Features</h4>
                </div>

                <div className="space-y-4">
                  <div className="feature-card bg-white dark:bg-gray-800/50">
                    <h5 className="text-xl font-semibold mb-2">Task Management System</h5>
                    <p className="text-muted-foreground">
                      Comprehensive system for creating, assigning, and tracking tasks between students, with progress
                      monitoring and deadline reminders.
                    </p>
                  </div>

                  <div className="feature-card bg-white dark:bg-gray-800/50">
                    <h5 className="text-xl font-semibold mb-2">Real-Time Notifications</h5>
                    <p className="text-muted-foreground">
                      Stay informed with instant alerts for new messages, task updates, deadlines, and important
                      announcements across all your devices.
                    </p>
                  </div>
                </div>
              </div>

              {/* Third Year */}
              <div className="relative pl-10">
                <div className="feature-timeline-dot bg-purple-100 dark:bg-purple-900/50 absolute left-0 top-0">
                  <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                </div>
                <div className="bg-purple-50/50 dark:bg-purple-900/20 rounded-lg p-4 mb-6">
                  <h4 className="text-lg font-semibold text-purple-600 dark:text-purple-400">Android Application</h4>
                </div>

                <div className="space-y-4">
                  <div className="feature-card bg-white dark:bg-gray-800/50">
                    <h5 className="text-xl font-semibold mb-2">Smart Task Interaction</h5>
                    <p className="text-muted-foreground">
                      Experience seamless task browsing on mobile — view posted tasks, accept opportunities instantly,
                      and engage by commenting or offering help. Collaboration is now just a tap away.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

            {/* Animated Divider */}
            <div className="relative h-24 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
          </div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background border border-border/50 rounded-full p-3 shadow-lg">
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          </div>
        </div>

        {/* Content Section */}
        <section id="content" className="py-24 w-full">
          <div className="section-content">
            <div className="flex flex-col items-center text-center mb-16">
              <Badge
                variant="outline"
                className="mb-4 px-3 py-1 text-sm rounded-full border-primary/20 bg-primary/5 text-primary"
              >
                Technology Insights
              </Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">Developer Spotlight</h2>
              <p className="mt-4 text-muted-foreground text-lg max-w-[700px]">
                Dive into the latest insights and updates on how CollaborAid integrates powerful tools like Google
                Cloud, OpenAI, and Microsoft Azure.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
              {[
                {
                  title: "Integrating OpenAI for Smarter Support",
                  excerpt: "Integrated with Platform AI to provide instant support and assistance.",
                  image: "https://cdn.sologo.ai/2025/0102/20250102115051110.png",
                  tag: "AI Technology",
                  url: "https://platform.openai.com/docs/overview",
                },
                {
                  title: "Leveraging Render for Scalability",
                  excerpt: "Backend hosted on Render for seamless scalability and performance.",
                  image: "https://pbs.twimg.com/profile_images/1735429515541938176/zOO1N7Su_400x400.jpg",
                  tag: "Cloud Infrastructure",
                  url: "https://render.com/",
                },
                {
                  title: "Building Resilient Systems with Azure",
                  excerpt: "Database hosted on Azure for reliability and security.",
                  image:
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKKvZ6yMedMSyGk4ljqf3RF3yVQDXF30WplcQF-tQu8crgrjzYeg&s=10&ec=72940544",
                  tag: "Security",
                  url: "https://azure.microsoft.com/en-gb/pricing/purchase-options/azure-account/search?ef_id=_k_Cj0KCQjwoNzABhDbARIsALfY8VOOvc-MbQQIGKwLs7QRCxWzzIp3tFzrFsuVIFEwslMkTAuUJdPDmqgaAlx6EALw_wcB_k_&OCID=AIDcmm76som1hh_SEM__k_Cj0KCQjwoNzABhDbARIsALfY8VOOvc-MbQQIGKwLs7QRCxWzzIp3tFzrFsuVIFEwslMkTAuUJdPDmqgaAlx6EALw_wcB&gad_source=1&gbraid=0AAAAADcJh_tKF1e7UE-icbVrji7H1KIu8&gclid=Cj0KCQjwoNzABhDbARIsALfY8VOOvc-MbQQIGKwLs7QRCxWzzIp3tFzrFsuVIFEwslMkTAuUJdPDmqgaAlx6EALw_wcB",
                },
              ].map((post, index) => (
                <a key={index} href={post.url} target="_blank" rel="noopener noreferrer" className="block">
                  <Card className="overflow-hidden border border-border/40 hover:shadow-md transition-all duration-300">
                    <div className="aspect-video w-full overflow-hidden relative">
                      <div className="absolute top-4 left-4 z-10">
                        <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                          {post.tag}
                        </Badge>
                      </div>
                      <img
                        src={post.image || "/placeholder.svg"}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                    <CardContent className="p-6">
                      <div className="space-y-2">
                        <h3 className="font-bold text-xl">{post.title}</h3>
                        <p className="text-muted-foreground">{post.excerpt}</p>
                        <div className="pt-4">
                          <Button
                            variant="ghost"
                            className="p-0 h-auto text-primary font-medium hover:text-primary/80 hover:bg-transparent group flex items-center"
                          >
                            Read More
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>
          </div>
        </section>

           {/* Animated Divider */}
           <div className="relative h-24 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
          </div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background border border-border/50 rounded-full p-3 shadow-lg">
            <Code className="h-6 w-6 text-primary animate-pulse" />
          </div>
        </div>

        {/* FAQ Section */}
        <section className="py-24 w-full">
          <div className="section-content">
            <div className="flex flex-col items-center text-center mb-16">
              <Badge
                variant="outline"
                className="mb-4 px-3 py-1 text-sm rounded-full border-primary/20 bg-primary/5 text-primary"
              >
                Common Questions
              </Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
                Frequently Asked Questions
              </h2>
              <p className="mt-4 text-muted-foreground text-lg max-w-[700px]">
                Find answers to common questions about our services.
              </p>
            </div>
            <div className="mx-auto max-w-4xl space-y-4">
              {[
                {
                  question: "What technology powers real-time messaging and notifications?",
                  answer:
                    "CollaborAid uses WebSockets to enable live messaging and instant notifications. From the initial handshake to sending and receiving messages, communication is handled in real-time for a seamless user experience.",
                  icon: <Zap className="h-5 w-5 text-purple-500" />,
                  bgColor: "from-purple-500/20 to-purple-600/5",
                  iconBg: "bg-purple-500",
                  borderColor: "border-purple-500/20 hover:border-purple-500/40",
                  shadowColor: "hover:shadow-purple-500/10",
                },
                {
                  question: "What frontend stack does CollaborAid use?",
                  answer:
                    "CollaborAid is built using Vite with React and TypeScript for a modern, fast development experience. Tailwind CSS handles the styling, offering utility-first classes for responsive and consistent design.",
                  icon: <Laptop className="h-5 w-5 text-sky-500" />,
                  bgColor: "from-sky-500/20 to-sky-600/5",
                  iconBg: "bg-sky-500",
                  borderColor: "border-sky-500/20 hover:border-sky-500/40",
                  shadowColor: "hover:shadow-sky-500/10",
                },
                {
                  question: "What technologies power the backend?",
                  answer:
                    "The backend of CollaborAid is developed entirely in Java using Spring Boot. It's containerized with Docker and hosted on Render for scalable, reliable performance.",
                  icon: <Code className="h-5 w-5 text-green-500" />,
                  bgColor: "from-green-500/20 to-green-600/5",
                  iconBg: "bg-green-500",
                  borderColor: "border-green-500/20 hover:border-green-500/40",
                  shadowColor: "hover:shadow-green-500/10",
                },
                {
                  question: "How long did the development take?",
                  answer:
                    "The development of CollaborAid took a full month. The team dedicated two weeks to building the web application and another two weeks to developing the mobile version.",
                  icon: <Settings className="h-5 w-5 text-amber-500" />,
                  bgColor: "from-amber-500/20 to-amber-600/5",
                  iconBg: "bg-amber-500",
                  borderColor: "border-amber-500/20 hover:border-amber-500/40",
                  shadowColor: "hover:shadow-amber-500/10",
                },
              ].map((faq, index) => (
                <Card
                  key={index}
                  className={`border ${faq.borderColor} bg-gradient-to-br ${faq.bgColor} backdrop-blur-sm ${faq.shadowColor} hover:shadow-lg transition-all duration-300 overflow-hidden`}
                >
                  <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-gradient-to-br from-white/5 to-white/10 -translate-y-1/2 translate-x-1/2 blur-xl"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-gradient-to-br from-white/5 to-white/10 translate-y-1/2 -translate-x-1/2 blur-lg"></div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex gap-4">
                      <div className={`mt-1 ${faq.iconBg} rounded-full p-2 flex-shrink-0 shadow-md`}>{faq.icon}</div>
                      <div className="flex flex-col gap-2">
                        <h3 className="font-semibold text-lg">{faq.question}</h3>
                        <p className="text-muted-foreground">{faq.answer}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Now Dark */}
      <footer className="border-t bg-background w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <h3 className="font-bold text-xl">
                Collabor<span className="text-primary">Aid</span>
              </h3>
              <p className="text-muted-foreground">
                Creating a supportive community where students can connect, collaborate, and grow together.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#what-is-collaboraid"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a href="#what-we-offer" className="text-muted-foreground hover:text-foreground transition-colors">
                    What We Offer
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="text-muted-foreground hover:text-foreground transition-colors text-left">
                        Privacy Policy
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Privacy Policy</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4 text-muted-foreground">
                        <p className="text-sm">Last Updated: {new Date().toLocaleDateString()}</p>

                        <h3 className="text-lg font-semibold text-foreground">1. Introduction</h3>
                        <p>
                          Welcome to CollaborAid ("we," "our," or "us"). We are committed to protecting your privacy and
                          personal information. This Privacy Policy explains how we collect, use, disclose, and
                          safeguard your information when you use our platform.
                        </p>

                        <h3 className="text-lg font-semibold text-foreground">2. Information We Collect</h3>
                        <p>
                          <strong>Personal Information:</strong> When you register for an account, we collect your name,
                          email address, educational institution, and profile information.
                        </p>
                        <p>
                          <strong>Usage Data:</strong> We collect information about how you interact with our platform,
                          including tasks posted, help offered, messages sent, and features used.
                        </p>
                        <p>
                          <strong>Device Information:</strong> We collect information about the device you use to access
                          our platform, including IP address, browser type, operating system, and mobile device
                          identifiers.
                        </p>

                        <h3 className="text-lg font-semibold text-foreground">3. How We Use Your Information</h3>
                        <p>We use the information we collect to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>Provide, maintain, and improve our platform</li>
                          <li>Process and complete tasks and collaboration requests</li>
                          <li>Send notifications, updates, and support messages</li>
                          <li>Analyze usage patterns and optimize user experience</li>
                          <li>Ensure the security and integrity of our platform</li>
                          <li>Comply with legal obligations</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-foreground">4. Information Sharing</h3>
                        <p>We may share your information with:</p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>Other users as necessary for collaboration features</li>
                          <li>Service providers who help us operate our platform</li>
                          <li>Educational institutions as required for program participation</li>
                          <li>Legal authorities when required by law</li>
                        </ul>
                        <p>We will never sell your personal information to third parties.</p>

                        <h3 className="text-lg font-semibold text-foreground">5. Data Security</h3>
                        <p>
                          We implement appropriate technical and organizational measures to protect your personal
                          information. However, no method of transmission over the Internet or electronic storage is
                          100% secure, so we cannot guarantee absolute security.
                        </p>

                        <h3 className="text-lg font-semibold text-foreground">6. Data Retention</h3>
                        <p>
                          We retain your personal information for as long as necessary to fulfill the purposes outlined
                          in this Privacy Policy, unless a longer retention period is required by law.
                        </p>

                        <h3 className="text-lg font-semibold text-foreground">7. Your Rights</h3>
                        <p>
                          Depending on your location, you may have rights regarding your personal information,
                          including:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>Accessing your personal information</li>
                          <li>Correcting inaccurate information</li>
                          <li>Deleting your information</li>
                          <li>Restricting or objecting to processing</li>
                          <li>Data portability</li>
                        </ul>
                        <p>To exercise these rights, please contact us using the information provided below.</p>

                        <h3 className="text-lg font-semibold text-foreground">8. Changes to This Privacy Policy</h3>
                        <p>
                          We may update this Privacy Policy from time to time. We will notify you of any changes by
                          posting the new Privacy Policy on this page and updating the "Last Updated" date.
                        </p>

                        <h3 className="text-lg font-semibold text-foreground">9. Contact Us</h3>
                        <p>If you have any questions about this Privacy Policy, please contact us at:</p>
                        <p>
                          Email: privacy@collaboraid.edu
                          <br />
                          Address: N. Bacalso Avenue, Cebu City, Philippines
                        </p>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          onClick={() => 
                            (document.querySelector('[role="dialog"] button[aria-label="Close"]') as HTMLButtonElement)?.click()}
                        >
                          Close
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </li>
                <li>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="text-muted-foreground hover:text-foreground transition-colors text-left">
                        Terms of Service
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Terms of Service</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4 text-muted-foreground">
                        <p className="text-sm">Last Updated: {new Date().toLocaleDateString()}</p>

                        <h3 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h3>
                        <p>
                          By accessing or using CollaborAid, you agree to be bound by these Terms of Service. If you do
                          not agree to these terms, please do not use our platform.
                        </p>

                        <h3 className="text-lg font-semibold text-foreground">2. Description of Service</h3>
                        <p>
                          CollaborAid is a collaborative platform designed for students to connect, share knowledge, and
                          assist each other with academic tasks and projects.
                        </p>

                        <h3 className="text-lg font-semibold text-foreground">3. User Accounts</h3>
                        <p>
                          <strong>Registration:</strong> To use certain features of our platform, you must register for
                          an account. You agree to provide accurate, current, and complete information during
                          registration.
                        </p>
                        <p>
                          <strong>Account Security:</strong> You are responsible for maintaining the confidentiality of
                          your account credentials and for all activities that occur under your account. You must
                          immediately notify us of any unauthorized use of your account.
                        </p>

                        <h3 className="text-lg font-semibold text-foreground">4. User Conduct</h3>
                        <p>You agree not to:</p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>Use the platform for any illegal purpose or in violation of any laws</li>
                          <li>Post or share content that is harmful, offensive, or inappropriate</li>
                          <li>Impersonate any person or entity</li>
                          <li>Interfere with or disrupt the platform or servers</li>
                          <li>Attempt to gain unauthorized access to any part of the platform</li>
                          <li>Use the platform for cheating or academic dishonesty</li>
                          <li>
                            Engage in any activity that could harm other users or compromise the integrity of the
                            platform
                          </li>
                        </ul>

                        <h3 className="text-lg font-semibold text-foreground">5. Intellectual Property</h3>
                        <p>
                          <strong>Our Content:</strong> All content provided by CollaborAid, including but not limited
                          to text, graphics, logos, and software, is owned by or licensed to us and is protected by
                          copyright and other intellectual property laws.
                        </p>
                        <p>
                          <strong>User Content:</strong> You retain ownership of any content you submit to the platform.
                          By posting content, you grant us a non-exclusive, worldwide, royalty-free license to use,
                          display, and distribute your content in connection with the platform.
                        </p>

                        <h3 className="text-lg font-semibold text-foreground">6. Termination</h3>
                        <p>
                          We reserve the right to suspend or terminate your account at any time for any reason,
                          including violation of these Terms of Service. Upon termination, your right to use the
                          platform will immediately cease.
                        </p>

                        <h3 className="text-lg font-semibold text-foreground">7. Disclaimer of Warranties</h3>
                        <p>
                          THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER
                          EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED OR ERROR-FREE.
                        </p>

                        <h3 className="text-lg font-semibold text-foreground">8. Limitation of Liability</h3>
                        <p>
                          TO THE MAXIMUM EXTENT PERMITTED BY LAW, COLLABORAID SHALL NOT BE LIABLE FOR ANY INDIRECT,
                          INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATING TO YOUR USE
                          OF THE PLATFORM.
                        </p>

                        <h3 className="text-lg font-semibold text-foreground">9. Changes to Terms</h3>
                        <p>
                          We may modify these Terms of Service at any time. We will notify you of any changes by posting
                          the new terms on the platform. Your continued use of the platform after such modifications
                          constitutes your acceptance of the modified terms.
                        </p>

                        <h3 className="text-lg font-semibold text-foreground">10. Governing Law</h3>
                        <p>
                          These Terms of Service shall be governed by and construed in accordance with the laws of the
                          Philippines, without regard to its conflict of law provisions.
                        </p>

                        <h3 className="text-lg font-semibold text-foreground">11. Contact Information</h3>
                        <p>If you have any questions about these Terms of Service, please contact us at:</p>
                        <p>
                          Email: terms@collaboraid.edu
                          <br />
                          Address: N. Bacalso Avenue, Cebu City, Philippines
                        </p>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          onClick={() => 
                            (document.querySelector('[role="dialog"] button[aria-label="Close"]') as HTMLButtonElement)?.click()}
                        >
                          Close
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </li>
                <li>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="text-muted-foreground hover:text-foreground transition-colors text-left">
                        Cookie Policy
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Cookie Policy</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4 text-muted-foreground">
                        <p className="text-sm">Last Updated: {new Date().toLocaleDateString()}</p>

                        <h3 className="text-lg font-semibold text-foreground">1. What Are Cookies</h3>
                        <p>
                          Cookies are small text files that are placed on your device when you visit a website. They are
                          widely used to make websites work more efficiently and provide information to the website
                          owners.
                        </p>

                        <h3 className="text-lg font-semibold text-foreground">2. How We Use Cookies</h3>
                        <p>CollaborAid uses cookies for the following purposes:</p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>
                            <strong>Essential Cookies:</strong> These cookies are necessary for the website to function
                            properly and cannot be disabled.
                          </li>
                          <li>
                            <strong>Functionality Cookies:</strong> These cookies enable the website to provide enhanced
                            functionality and personalization, such as remembering your preferences.
                          </li>
                          <li>
                            <strong>Analytics Cookies:</strong> These cookies help us understand how visitors interact
                            with our website by collecting and reporting information anonymously.
                          </li>
                          <li>
                            <strong>Authentication Cookies:</strong> These cookies help us identify users when they log
                            in to our platform and remember their authentication status.
                          </li>
                        </ul>

                        <h3 className="text-lg font-semibold text-foreground">3. Types of Cookies We Use</h3>
                        <p>
                          <strong>Session Cookies:</strong> These cookies are temporary and are deleted when you close
                          your browser.
                        </p>
                        <p>
                          <strong>Persistent Cookies:</strong> These cookies remain on your device for a specified
                          period or until you delete them manually.
                        </p>
                        <p>
                          <strong>First-Party Cookies:</strong> These cookies are set by our website.
                        </p>
                        <p>
                          <strong>Third-Party Cookies:</strong> These cookies are set by third parties, such as
                          analytics providers.
                        </p>

                        <h3 className="text-lg font-semibold text-foreground">4. Specific Cookies We Use</h3>
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2">Cookie Name</th>
                              <th className="text-left py-2">Purpose</th>
                              <th className="text-left py-2">Duration</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b">
                              <td className="py-2">session_id</td>
                              <td className="py-2">Authentication</td>
                              <td className="py-2">Session</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2">preferences</td>
                              <td className="py-2">User preferences</td>
                              <td className="py-2">1 year</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2">_ga</td>
                              <td className="py-2">Google Analytics</td>
                              <td className="py-2">2 years</td>
                            </tr>
                          </tbody>
                        </table>

                        <h3 className="text-lg font-semibold text-foreground">5. Managing Cookies</h3>
                        <p>Most web browsers allow you to control cookies through their settings. You can:</p>
                        <ul className="list-disc pl-6 space-y-2">
                          <li>Delete cookies from your device</li>
                          <li>
                            Block cookies by activating the setting on your browser that allows you to refuse all or
                            some cookies
                          </li>
                          <li>Set your browser to notify you when you receive a cookie</li>
                        </ul>
                        <p>
                          Please note that if you choose to block or delete cookies, you may not be able to access
                          certain areas or features of our website, and some services may not function properly.
                        </p>

                        <h3 className="text-lg font-semibold text-foreground">6. Changes to This Cookie Policy</h3>
                        <p>
                          We may update this Cookie Policy from time to time. We will notify you of any changes by
                          posting the new Cookie Policy on this page and updating the "Last Updated" date.
                        </p>

                        <h3 className="text-lg font-semibold text-foreground">7. Contact Us</h3>
                        <p>If you have any questions about our Cookie Policy, please contact us at:</p>
                        <p>
                          Email: privacy@collaboraid.edu
                          <br />
                          Address: N. Bacalso Avenue, Cebu City, Philippines
                        </p>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          onClick={() => 
                            (document.querySelector('[role="dialog"] button[aria-label="Close"]') as HTMLButtonElement)?.click()}
                        >
                          Close
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </li>
              </ul>
            </div>
          </div>
          <Separator className="my-8" />
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} CollaborAid. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <span className="sr-only">Twitter</span>
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
                  className="h-5 w-5"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <span className="sr-only">Instagram</span>
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
                  className="h-5 w-5"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <span className="sr-only">GitHub</span>
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
                  className="h-5 w-5"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                  <path d="M9 18c-4.51 2-5-2-7-2"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  )
}
