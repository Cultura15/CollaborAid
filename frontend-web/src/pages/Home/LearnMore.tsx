"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Lightbulb,
  Rocket,
  Target,
  Users,
  MessageSquare,
  CheckCircle,
  Shield,
  Code,
  Zap,
  ChevronRight,
  Star,
  Settings,
  Menu,
  Database,
  Sun,
  Box,
  Cloud,
  Play,
  Moon,
  Laptop,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useTheme } from "@/context/ThemeProvider"

// Use the navigate function from props instead of useRouter
export default function LearnMore() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isThemeDialogOpen, setIsThemeDialogOpen] = useState(false)
  const { theme, themeMode, setThemeMode } = useTheme()

  // Declare navigate function to match your app.tsx implementation
  const navigate = (path) => {
    window.location.href = path
  }

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
       

        {/* Animated Divider */}
        <div className="relative h-24 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
          </div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background border border-border/50 rounded-full p-3 shadow-lg">
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          </div>
        </div>

        {/* Mission & Vision Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="order-2 md:order-1">
                <Badge
                  variant="outline"
                  className="mb-4 px-3 py-1 text-sm rounded-full border-primary/20 bg-primary/5 text-primary"
                >
                  Our Purpose
                </Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-6">Mission & Vision</h2>

                <div className="space-y-8">
                  <div className="relative pl-10 border-l border-primary/20">
                    <div className="absolute left-0 top-0 -translate-x-1/2 bg-primary/10 rounded-full p-2">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Our Mission</h3>
                    <p className="text-muted-foreground">
                      To create a supportive ecosystem where students can easily connect, collaborate, and help each
                      other overcome academic challenges while building valuable skills and relationships.
                    </p>
                  </div>

                  <div className="relative pl-10 border-l border-primary/20">
                    <div className="absolute left-0 top-0 -translate-x-1/2 bg-primary/10 rounded-full p-2">
                      <Lightbulb className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Our Vision</h3>
                    <p className="text-muted-foreground">
                      To revolutionize student collaboration by leveraging technology to break down barriers, foster
                      meaningful connections, and create a global community of learners who support each other's growth.
                    </p>
                  </div>

                  <div className="relative pl-10 border-l border-primary/20">
                    <div className="absolute left-0 top-0 -translate-x-1/2 bg-primary/10 rounded-full p-2">
                      <Rocket className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Our Values</h3>
                    <ul className="text-muted-foreground space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        <span>Collaboration over competition</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        <span>Inclusivity and accessibility for all learners</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        <span>Innovation through continuous improvement</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        <span>Integrity in all interactions</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="order-1 md:order-2 relative">
                <div className="relative aspect-square rounded-2xl overflow-hidden border border-border/50 shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
                  <img
                    src="/mission.jpg"
                    alt="Students collaborating"
                    className="object-cover w-full h-full"
                  />
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/5 rounded-full blur-xl"></div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary/5 rounded-full blur-xl"></div>

                {/* Floating card */}
                <div className="absolute -bottom-8 -right-8 md:right-8 bg-background border border-border/50 rounded-lg p-4 shadow-lg max-w-[200px]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-1.5">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-sm font-medium">Rating</div>
                  </div>
                  <div className="text-2xl font-bold mb-1">86%</div>
                  <div className="text-xs text-muted-foreground">of students suggests using CollaborAid</div>
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
            <Code className="h-6 w-6 text-primary animate-pulse" />
          </div>
        </div>

        {/* Technology Stack Section */}
        <section className="py-20 relative overflow-hidden bg-muted/30">
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-primary/5"></div>
          </div>

          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center text-center mb-16">
              <Badge
                variant="outline"
                className="mb-4 px-3 py-1 text-sm rounded-full border-primary/20 bg-primary/5 text-primary"
              >
                Under the Hood
              </Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">Our Technology Stack</h2>
              <p className="mt-4 text-muted-foreground text-lg max-w-[700px]">
                CollaborAid is built with cutting-edge technologies to ensure a seamless, secure, and responsive
                experience across all devices.
              </p>
            </div>

            <Tabs defaultValue="frontend" className="max-w-4xl mx-auto">
              <TabsList className="grid grid-cols-3 mb-8">
                <TabsTrigger value="frontend">Frontend</TabsTrigger>
                <TabsTrigger value="backend">Backend</TabsTrigger>
                <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
              </TabsList>

              <TabsContent value="frontend" className="space-y-8">
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    {
                      title: "React & TypeScript",
                      description: "For type-safe, component-based UI development",
                      icon: <Code className="h-6 w-6 text-blue-500" />,
                    },
                    {
                      title: "Vite",
                      description: "For server-side rendering and optimized performance",
                      icon: <Zap className="h-6 w-6 text-black dark:text-white" />,
                    },
                    {
                      title: "Tailwind CSS & Jetpack Compose",
                      description: "For utility-first styling and responsive design",
                      icon: <Settings className="h-6 w-6 text-cyan-500" />,
                    },
                  ].map((tech, index) => (
                    <Card
                      key={index}
                      className="overflow-hidden border-primary/10 hover:border-primary/30 transition-all duration-300"
                    >
                      <CardContent className="p-6">
                        <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                          {tech.icon}
                        </div>
                        <h3 className="text-xl font-bold mb-2">{tech.title}</h3>
                        <p className="text-muted-foreground">{tech.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="bg-background border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Frontend Architecture</h3>
                  <p className="text-muted-foreground mb-4">
                    Our frontend is built with a component-based architecture that prioritizes:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Reusable UI components for consistent user experience</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Responsive design that works seamlessly on all devices</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Optimized performance with code splitting and lazy loading</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Accessibility compliance for all users</span>
                    </li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="backend" className="space-y-8">
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    {
                      title: "Java Spring Boot",
                      description: "For robust API development and business logic",
                      icon: <Code className="h-6 w-6 text-green-600" />,
                    },
                    {
                      title: "WebSockets & STOMP Protocol",
                      description: "For real-time messaging and notifications",
                      icon: <MessageSquare className="h-6 w-6 text-purple-500" />,
                    },
                    {
                      title: "MySQL",
                      description: "For reliable and scalable data storage",
                      icon: <Database className="h-6 w-6 text-blue-600" />,
                    },
                  ].map((tech, index) => (
                    <Card
                      key={index}
                      className="overflow-hidden border-primary/10 hover:border-primary/30 transition-all duration-300"
                    >
                      <CardContent className="p-6">
                        <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                          {tech.icon}
                        </div>
                        <h3 className="text-xl font-bold mb-2">{tech.title}</h3>
                        <p className="text-muted-foreground">{tech.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="bg-background border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Backend Architecture</h3>
                  <p className="text-muted-foreground mb-4">
                    Our backend follows a microservices architecture that ensures:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Scalability to handle growing user demands</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Fault isolation for improved system reliability</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Secure data handling with JWT authentication</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Efficient API design for optimal performance</span>
                    </li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="infrastructure" className="space-y-8">
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    {
                      title: "Vercel",
                      description: "For frontend hosting and consistent deployment",
                      icon: <Box className="h-6 w-6 text-blue-500" />,
                    },
                    {
                      title: "Render",
                      description: "For reliable cloud hosting and scaling",
                      icon: <Cloud className="h-6 w-6 text-purple-500" />,
                    },
                    {
                      title: "Azure",
                      description: "For database hosting and additional services",
                      icon: <Database className="h-6 w-6 text-blue-600" />,
                    },
                  ].map((tech, index) => (
                    <Card
                      key={index}
                      className="overflow-hidden border-primary/10 hover:border-primary/30 transition-all duration-300"
                    >
                      <CardContent className="p-6">
                        <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                          {tech.icon}
                        </div>
                        <h3 className="text-xl font-bold mb-2">{tech.title}</h3>
                        <p className="text-muted-foreground">{tech.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="bg-background border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Infrastructure Design</h3>
                  <p className="text-muted-foreground mb-4">Our infrastructure is designed with these principles:</p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>High availability with 99.9% uptime guarantee</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Automated CI/CD pipelines for rapid deployment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Comprehensive monitoring and alerting</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Disaster recovery with regular backups</span>
                    </li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
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

     
    </div>
  )
}
