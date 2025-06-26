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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()

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
        <div className="container flex h-16 items-center justify-between">
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
            <a href="#gallery" className="text-sm font-medium transition-colors hover:text-primary relative group">
              Gallery
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#content" className="text-sm font-medium transition-colors hover:text-primary relative group">
              Content
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#contact" className="text-sm font-medium transition-colors hover:text-primary relative group">
              Contact
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate("/login")} className="hidden md:flex">
              Sign In
            </Button>
            <Button onClick={() => navigate("/register")} className="hidden md:flex">
              Get Started
            </Button>

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
                  {["Features", "Gallery", "Content", "Contact"].map((item) => (
                    <a
                      key={item}
                      href={`#${item.toLowerCase()}`}
                      className="text-sm font-medium transition-colors hover:text-primary flex items-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item}
                      <ChevronRight className="ml-auto h-4 w-4" />
                    </a>
                  ))}
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
        <section className="relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-[40%] -right-[30%] h-[800px] w-[800px] rounded-full bg-primary/5 blur-3xl"></div>
            <div className="absolute -bottom-[40%] -left-[30%] h-[800px] w-[800px] rounded-full bg-primary/5 blur-3xl"></div>
          </div>

          <div className="container py-24 md:py-32">
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
                  <Button size="lg" onClick={() => navigate("/register")} className="group relative overflow-hidden">
                    <span className="relative z-10 flex items-center">
                      Get Started
                      <ArrowRight className="ms-2 transition-transform group-hover:translate-x-1" />
                    </span>
                    <span className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                  </Button>
                  <Button variant="outline" size="lg" className="group">
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
                    <span className="font-medium text-foreground">500+</span> students already joined
                  </div>
                </div>
              </div>
              <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-60"></div>
                <img
                  src="/campus-collaboration.png"
                  alt="Students collaborating"
                  className="object-cover w-full h-full"
                />
                {/* Floating elements */}
                <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm rounded-lg p-3 shadow-lg flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">4.9/5 Rating</span>
                </div>
                <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg p-3 shadow-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="font-medium">10k+ Active Users</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-muted/30 py-24 relative">
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
          </div>

          <div className="container">
            <div className="flex flex-col items-center text-center mb-16">
              <Badge
                variant="outline"
                className="mb-4 px-3 py-1 text-sm rounded-full border-primary/20 bg-primary/5 text-primary"
              >
                Why Choose CollaborAid
              </Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">Powerful Features</h2>
              <p className="mt-4 text-muted-foreground text-lg max-w-[700px]">
                Discover what makes our collaborative approach stand out from the crowd.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: <MessageSquare className="h-6 w-6 text-primary" />,
                  title: "AI Chat Support",
                  description: "Smart, helpful AI chatbot ready to guide users and answer questions instantly.",
                },
                {
                  icon: <Bell className="h-6 w-6 text-primary" />,
                  title: "Real-Time Messaging",
                  description: "Instant notifications and messaging to keep users connected and informed.",
                },
                {
                  icon: <CheckCircle className="h-6 w-6 text-primary" />,
                  title: "Task-Based Collaboration",
                  description: "Easily post, accept, and manage help requests in a rewarding, community-driven space.",
                },
                {
                  icon: <Shield className="h-6 w-6 text-primary" />,
                  title: "Secure by Design",
                  description: "Protected with JWT authentication to ensure user data and sessions stay safe.",
                },
                {
                  icon: <Code className="h-6 w-6 text-primary" />,
                  title: "Maintainable Codebase",
                  description: "Clean architecture and modular design make updates and scaling hassle-free.",
                },
                {
                  icon: <Zap className="h-6 w-6 text-primary" />,
                  title: "High Performance",
                  description: "Optimized backend and frontend for fast, seamless user experiences.",
                },
              ].map((feature, index) => (
                <Card
                  key={index}
                  className="border border-border/40 bg-background/60 backdrop-blur-sm hover:border-primary/20 hover:shadow-md transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
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

        {/* Testimonials Section */}
        <section className="py-24">
          <div className="container">
            <div className="flex flex-col items-center text-center mb-16">
              <Badge
                variant="outline"
                className="mb-4 px-3 py-1 text-sm rounded-full border-primary/20 bg-primary/5 text-primary"
              >
                What Students Say
              </Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">Student Testimonials</h2>
              <p className="mt-4 text-muted-foreground text-lg max-w-[700px]">
                Hear from students who have transformed their academic journey with CollaborAid.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  quote:
                    "CollaborAid helped me connect with peers who could help with my programming assignments. The platform is intuitive and the reward system keeps me motivated.",
                  name: "Sarah Johnson",
                  role: "Computer Science Student",
                  avatar: "/serene-gaze.png",
                },
                {
                  quote:
                    "As someone who loves helping others, CollaborAid gave me a platform to assist fellow students while earning rewards. It's a win-win for everyone involved.",
                  name: "Michael Chen",
                  role: "Engineering Student",
                  avatar: "/thoughtful-gaze.png",
                },
                {
                  quote:
                    "The real-time messaging and AI support make collaboration seamless. I've improved my grades and made new friends through this platform.",
                  name: "Aisha Patel",
                  role: "Business Student",
                  avatar: "/serene-gaze.png",
                },
              ].map((testimonial, index) => (
                <Card key={index} className="border border-border/40 bg-background/60 backdrop-blur-sm">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex-1">
                      <svg
                        className="h-8 w-8 text-primary/30 mb-4"
                        fill="currentColor"
                        viewBox="0 0 32 32"
                        aria-hidden="true"
                      >
                        <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                      </svg>
                      <p className="text-muted-foreground mb-6">{testimonial.quote}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full overflow-hidden">
                        <img
                          src={testimonial.avatar || "/placeholder.svg"}
                          alt={testimonial.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section id="gallery" className="py-24 bg-muted/30 relative">
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
          </div>

          <div className="container">
            <div className="flex flex-col items-center text-center mb-16">
              <Badge
                variant="outline"
                className="mb-4 px-3 py-1 text-sm rounded-full border-primary/20 bg-primary/5 text-primary"
              >
                Visual Showcase
              </Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">Gallery</h2>
              <p className="mt-4 text-muted-foreground text-lg max-w-[700px]">
                Explore how CollaborAid empowers student collaboration and support.
              </p>
            </div>

            <Tabs defaultValue="all" className="w-full mb-8">
              <div className="flex justify-center">
                <TabsList className="grid grid-cols-4 w-fit">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="campus">Campus</TabsTrigger>
                  <TabsTrigger value="events">Events</TabsTrigger>
                  <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all" className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    "/library-collaboration.png",
                    "/placeholder.svg?key=1okxd",
                    "/collaborative-learning-space.png",
                    "/campus-quad.png",
                    "/diverse-students-presenting.png",
                    "/collaborative-learning.png",
                  ].map((image, index) => (
                    <div key={index} className="overflow-hidden rounded-lg shadow-sm border border-border/40">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Gallery image ${index + 1}`}
                        className="aspect-[4/3] w-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="campus" className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {["/campus-quad.png", "/library-study-session.png", "/university-gathering.png"].map(
                    (image, index) => (
                      <div key={index} className="overflow-hidden rounded-lg shadow-sm border border-border/40">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Campus image ${index + 1}`}
                          className="aspect-[4/3] w-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                      </div>
                    ),
                  )}
                </div>
              </TabsContent>

              <TabsContent value="events" className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {["/vibrant-campus-fair.png", "/placeholder.svg?key=q3qyo", "/collaborative-coding-session.png"].map(
                    (image, index) => (
                      <div key={index} className="overflow-hidden rounded-lg shadow-sm border border-border/40">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Event image ${index + 1}`}
                          className="aspect-[4/3] w-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                      </div>
                    ),
                  )}
                </div>
              </TabsContent>

              <TabsContent value="collaboration" className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    "/placeholder.svg?key=dnz00",
                    "/collaborative-learning.png",
                    "/collaborative-learning-session.png",
                  ].map((image, index) => (
                    <div key={index} className="overflow-hidden rounded-lg shadow-sm border border-border/40">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Collaboration image ${index + 1}`}
                        className="aspect-[4/3] w-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Content Section */}
        <section id="content" className="py-24">
          <div className="container">
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

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Integrating OpenAI for Smarter Support",
                  excerpt: "See how AI-driven chat helps users get instant assistance within CollaborAid.",
                  image: "/modern-ai-interface.png",
                  tag: "AI Technology",
                },
                {
                  title: "Leveraging Google Cloud for Scalability",
                  excerpt: "Learn how we use Google Cloud to ensure fast, reliable performance for all users.",
                  image: "/interconnected-cloud-network.png",
                  tag: "Cloud Infrastructure",
                },
                {
                  title: "Building Resilient Systems with Azure",
                  excerpt: "Explore how Microsoft Azure powers secure and maintainable backend infrastructure.",
                  image: "/data-fortress.png",
                  tag: "Security",
                },
              ].map((post, index) => (
                <Card
                  key={index}
                  className="overflow-hidden border border-border/40 hover:shadow-md transition-all duration-300"
                >
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
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="contact" className="py-24 bg-muted/30 relative">
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
            <div className="absolute -top-[40%] -right-[30%] h-[800px] w-[800px] rounded-full bg-primary/5 blur-3xl"></div>
          </div>

          <div className="container">
            <div className="rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 md:p-12 lg:p-16 border border-primary/10 backdrop-blur-sm">
              <div className="grid gap-10 lg:grid-cols-2 items-center">
                <div className="space-y-4">
                  <Badge
                    variant="outline"
                    className="px-3 py-1 text-sm rounded-full border-primary/20 bg-primary/10 text-primary mb-4"
                  >
                    Join Our Community
                  </Badge>
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Ready to get started?</h2>
                  <p className="text-muted-foreground text-lg max-w-[600px]">
                    Join a growing community of students and helpers working together, earning rewards, and making a
                    real impact through collaboration.
                  </p>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row lg:justify-end">
                  <Button size="lg" onClick={() => navigate("/register")} className="group relative overflow-hidden">
                    <span className="relative z-10 flex items-center">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                    <span className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                  </Button>
                  <Button variant="outline" size="lg">
                    Contact Us
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24">
          <div className="container">
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

            <div className="mx-auto max-w-3xl space-y-4">
              {[
                {
                  question: "How can I customize this template?",
                  answer:
                    "You can easily customize this template by modifying the React components and Tailwind CSS classes to match your brand's colors, typography, and overall style.",
                },
                {
                  question: "  typography, and overall style.",
                },
                {
                  question: "Is this template responsive?",
                  answer:
                    "Yes, this template is fully responsive and works well on all devices, from mobile phones to desktop computers.",
                },
                {
                  question: "Can I add more sections?",
                  answer:
                    "The modular design makes it easy to add, remove, or rearrange sections to suit your specific needs.",
                },
                {
                  question: "What technologies are used?",
                  answer:
                    "This template uses React with TypeScript, Tailwind CSS for styling, and shadcn/ui for UI components.",
                },
              ].map((faq, index) => (
                <Card
                  key={index}
                  className="border border-border/40 bg-background/60 backdrop-blur-sm hover:border-primary/20 hover:shadow-sm transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-2">
                      <h3 className="font-semibold text-lg">{faq.question}</h3>
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container py-12">
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
                  <a href="#gallery" className="text-muted-foreground hover:text-foreground transition-colors">
                    Gallery
                  </a>
                </li>
                <li>
                  <a href="#content" className="text-muted-foreground hover:text-foreground transition-colors">
                    Content
                  </a>
                </li>
                <li>
                  <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
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
