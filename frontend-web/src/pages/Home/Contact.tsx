"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowRight,
  Send,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ExternalLink,
  Menu,
  Settings,
  Sun,
  Moon,
  Code,
  Rocket,
  Laptop,
  X,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useTheme } from "@/context/ThemeProvider"

export default function Contact() {
  const navigate = useNavigate()
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isThemeDialogOpen, setIsThemeDialogOpen] = useState(false)
  const { theme, themeMode, setThemeMode } = useTheme()

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormStatus("submitting")

    // Simulate form submission
    setTimeout(() => {
      // In a real application, you would send the form data to your backend
      setFormStatus("success")
      setFormState({
        name: "",
        email: "",
        subject: "",
        message: "",
      })
    }, 1500)
  }

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
            <a href="/#features" className="text-sm font-medium transition-colors hover:text-primary relative group">
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a
              href="/#what-is-collaboraid"
              className="text-sm font-medium transition-colors hover:text-primary relative group"
            >
              About
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a
              href="/#what-we-offer"
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
                    href="/#features"
                    className="text-sm font-medium transition-colors hover:text-primary flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Features
                    <ChevronRight className="ml-auto h-4 w-4" />
                  </a>
                  <a
                    href="/#what-is-collaboraid"
                    className="text-sm font-medium transition-colors hover:text-primary flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    About
                    <ChevronRight className="ml-auto h-4 w-4" />
                  </a>
                  <a
                    href="/#what-we-offer"
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

      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-28 overflow-hidden bg-background">
        {/* Animated background elements */}
        <div className="absolute inset-0 -z-10">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-background to-background animate-pulse-slow"></div>

          {/* Floating orbs */}
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
          <div className="orb orb-4"></div>
          <div className="orb orb-5"></div>

          {/* Animated grid */}
          <div className="absolute inset-0 grid-animation opacity-20"></div>

          {/* Animated wave */}
          <div className="wave-container">
            <div className="wave wave1"></div>
            <div className="wave wave2"></div>
            <div className="wave wave3"></div>
          </div>
        </div>

        

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center text-center">
            <div className="animate-float">
              <Badge
                variant="outline"
                className="mb-4 px-3 py-1 text-sm rounded-full border-primary/20 bg-primary/10 text-primary backdrop-blur-sm shadow-glow"
              >
                Get In Touch
              </Badge>
            </div>

            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl mb-6 text-gradient animate-text-reveal">
              <span className="inline-block overflow-hidden">
                <span className="animate-slide-up">Contact</span>
              </span>{" "}
              <span className="inline-block overflow-hidden">
                <span className="text-primary animate-slide-up animation-delay-100">Our Team</span>
              </span>
            </h1>

            <div className="max-w-[800px] perspective-text">
              <p className="text-muted-foreground text-lg md:text-xl leading-relaxed mb-8 animate-fade-in animation-delay-200 backdrop-blur-sm py-2 px-4 rounded-lg bg-background/30">
                Have questions about CollaborAid? We'd love to hear from you!
              </p>
            </div>
            <br></br>

            <div className="flex flex-wrap gap-4 justify-center animate-fade-in animation-delay-300">
              <Button
                variant="outline"
                className="group hover-effect"
                onClick={() => {
                  const contactFormElement = document.getElementById("contact-form")
                  contactFormElement?.scrollIntoView({ behavior: "smooth" })
                }}
              >
                <span className="relative z-10">Send a Message</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                <span className="btn-glow"></span>
              </Button>
              <Button
                variant="outline"
                className="group hover-effect"
                onClick={() => {
                  const teamElement = document.getElementById("team")
                  teamElement?.scrollIntoView({ behavior: "smooth" })
                }}
              >
                <span className="relative z-10">Meet Our Team</span>
                <ChevronDown className="ml-2 h-4 w-4 transition-transform group-hover:translate-y-1" />
                <span className="btn-glow"></span>
              </Button>
            </div>

            {/* Mouse scroll indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hidden md:block">
              <div className="w-8 h-12 rounded-full border-2 border-primary/30 flex justify-center pt-2">
                <div className="w-1 h-2 rounded-full bg-primary animate-mouse-scroll"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Animated shapes */}
        <div className="shape-blob shape-blob-1"></div>
        <div className="shape-blob shape-blob-2"></div>
        <div className="shape-blob shape-blob-3"></div>
        <div className="shape-blob shape-blob-4"></div>
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

      {/* Team Section */}
      <section id="team" className="py-20 bg-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
              Developers of CollaborAid
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                name: "Harold Destura",
                role: "Full Stack Developer",
                role2: "Web Developer",
                bio: "Harold is a full-stack developer with 3 years of experience. He's known for integrating AI and mastering WebSocket technology. He’s passionate about creating tools that make education more accessible.",
                socialLinks: {
                  github: "https://github.com/harold0t1",
                  email: "arutsedharold@gmail.com",
                },
              },
              {
                name: "Jesson Cultura",
                role: "Team Lead",
                role2: "Mobile/Web Full Stack Developer",
                role3: "UI/UX Designer",
                bio: "Jesson is the team leader of the project and a full-stack developer with 3 years of experience. He oversees both mobile and web development, ensuring seamless integration between the frontend and backend systems.",
                socialLinks: {
                  github: "https://github.com/Cultura15",
                  email: "mcfreddyjesson@gmail.com",
                },
              },
              {
                name: "Jhudiel Artezuela",
                role: "Figma Designer",
                bio: "Jhudiel is responsible for designing the UI of the platform using Figma. He ensures that the final design aligns closely with the team's vision and expectations.",
                socialLinks: {
                  github: "https://github.com/AdrianJhudiel",
                  email: "jhudzartezuela@gmail.com ",
                },
              },
            ].map((member, index) => (
              <Card
                key={index}
                className="overflow-hidden border border-gray-200 hover:border-primary/20 hover:shadow-lg transition-all duration-300"
              >
                <div className="aspect-square w-full overflow-hidden bg-muted relative">
                  <img
                    src={
                      member.name === "Harold Destura"
                        ? "/harold.jpg"
                        : member.name === "Jesson Cultura"
                          ? "/jesson.jpg"
                          : member.name === "Jhudiel Artezuela"
                            ? "/jhudiel.jpg"
                            : "/default-profile.png"
                    }
                    alt={member.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-xl">{member.name}</h3>
                      <br></br>
                      <p className="text-primary font-medium">{member.role}</p>
                      <p className="text-primary font-medium">{member.role2}</p>
                      <p className="text-primary font-medium">{member.role3}</p>
                    </div>
                    <p className="text-muted-foreground">{member.bio}</p>
                    <div className="flex gap-3 pt-2">
                      <a
                        href={member.socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <img src="/github.png" alt="Gmail icon" className="h-5 w-5" />
                        <span className="sr-only">GitHub</span>
                      </a>

                      <a
                        href={member.socialLinks.email}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <img src="/gmail.webp" alt="Gmail icon" className="h-5 w-5" />
                        <span className="sr-only">Email</span>
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact-form" className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 items-start">
            <div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-6">Get In Touch</h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-[600px]">
                Have a question or want to learn more about CollaborAid? Fill out the form and we'll get back to you as
                soon as possible.
              </p>

              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Connect With Us</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <a
                      href="mcfreddyjesson@gmail.com"
                      className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/20 hover:bg-primary/5 transition-colors"
                    >
                      <div className="rounded-full bg-primary/10 p-2">
                        <img src="/gmail.webp" alt="Gmail icon" className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Email Us</p>
                        <p className="text-sm text-muted-foreground">mcfreddyjesson@gmail.com</p>
                      </div>
                    </a>
                    <a
                      href="https://github.com/Cultura15"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/20 hover:bg-primary/5 transition-colors"
                    >
                      <div className="rounded-full bg-primary/10 p-2">
                        <img src="/github.png" alt="Gmail icon" className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">GitHub</p>
                        <p className="text-sm text-muted-foreground">@Cultura15</p>
                      </div>
                    </a>
                    <a
                      href="https://facebook.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/20 hover:bg-primary/5 transition-colors"
                    >
                      <div className="rounded-full bg-primary/10 p-2">
                        <img src="/facebook.webp" alt="Gmail icon" className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Facebook</p>
                        <p className="text-sm text-muted-foreground">@collaboraid</p>
                      </div>
                    </a>
                    <a
                      href="https://linkedin.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/20 hover:bg-primary/5 transition-colors"
                    >
                      <div className="rounded-full bg-primary/10 p-2">
                        <img src="/linkedin.png" alt="Gmail icon" className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">LinkedIn</p>
                        <p className="text-sm text-muted-foreground">CollaborAid</p>
                      </div>
                    </a>
                  </div>
                </div>

                <div>
  <h3 className="text-xl font-semibold mb-4">FAQ</h3>
  <Accordion type="single" collapsible className="w-full">
    <AccordionItem value="item-1">
      <AccordionTrigger>Can I get the source code of this project?</AccordionTrigger>
      <AccordionContent>
        Yes, the source code is available upon request. You can reach out to the developers using the contact
        information provided at the top of the page. The team is highly approachable and open to sharing their work for
        educational or collaborative purposes.
      </AccordionContent>
    </AccordionItem>

    <AccordionItem value="item-2">
      <AccordionTrigger>What kind of project is this?</AccordionTrigger>
      <AccordionContent>
        This is a capstone project developed for the subject IT342. It was officially presented on May 10, 2025, by a
        group of third-year college students during their second semester. The project showcases practical skills in
        full-stack development, real-time systems, and modern UI/UX practices.
      </AccordionContent>
    </AccordionItem>

    <AccordionItem value="item-3">
      <AccordionTrigger>What was the total cost of the project?</AccordionTrigger>
      <AccordionContent>
        The team invested in AI integration services, cloud database hosting, and deployment infrastructure. The
        estimated total cost came to around $23 USD, covering essential tools and services to support the project’s
        backend, AI support, and hosting.
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</div>

              </div>
            </div>

            <div>
              <Card className="border border-border/40">
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Your name"
                        value={formState.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={formState.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium">
                        Subject
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder="What is this regarding?"
                        value={formState.subject}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium">
                        Message
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Your message..."
                        rows={5}
                        value={formState.message}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={formStatus === "submitting"}>
                      {formStatus === "submitting" ? (
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
                          Sending...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          Send Message
                          <Send className="ml-2 h-4 w-4" />
                        </span>
                      )}
                    </Button>

                    {formStatus === "success" && (
                      <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-3 rounded-md flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <p>Your message has been sent successfully! We'll get back to you soon.</p>
                      </div>
                    )}

                    {formStatus === "error" && (
                      <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-3 rounded-md flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <p>There was an error sending your message. Please try again later.</p>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
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

      {/* Office Location Section */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">Our University</h2>
            <p className="text-muted-foreground text-lg max-w-[700px]">Cebu Institute of Technology University</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="aspect-video w-full overflow-hidden rounded-xl bg-muted relative">
              {/* This would be replaced with an actual map in a real implementation */}
              <img src="/cit.jpg" className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-semibold mb-2">Cebu Institute of Technology University</h3>
                  <p className="text-muted-foreground">
                    N. Bacalso Avenue
                    <br />
                    Cebu City
                    <br />
                    San Francisco, CA 94107
                    <br />
                    Philippines
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-medium mb-2">Office Hours</h4>
                  <p className="text-muted-foreground">
                    Monday - Staurday: 8:00 AM - 5:00 PM PST
                    <br />
                    Sunday: Closed
                  </p>
                </div>
                <div>
                  <Button
                    variant="outline"
                    className="group"
                    onClick={() =>
                      window.open(
                        "https://www.google.com/maps/place/Cebu+Institute+of+Technology+-+University/@10.2947224,123.8801961,18.19z/data=!4m6!3m5!1s0x33a99c015a4bf233:0x95d783198f4634f8!8m2!3d10.2944755!4d123.881134!16s%2Fm%2F03qjzl5?entry=ttu&g_ep=EgoyMDI1MDQzMC4xIKXMDSoASAFQAw%3D%3D",
                        "_blank",
                      )
                    }
                  >
                    Get Directions
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
                  <a href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                    Home
                  </a>
                </li>
                <li>
                  <a href="/#features" className="text-muted-foreground hover:text-foreground transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="/#what-is-collaboraid"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    About
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
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Cookie Policy
                  </a>
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
