import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Menu,
  Scissors,
  Users,
  Clock,
  CalendarDays,
  CreditCard,
  Sparkles,
  MessageSquare,
  ThumbsUp,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LandingPage() {
  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#testimonials", label: "Testimonials" },
    { href: "/auth?type=shop-owner", label: "For Shops" },
  ]

  const features = [
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Multi-Service Booking",
      description:
        "Select multiple services in one go. We'll automatically calculate the total time and price for your convenience.",
    },
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: "Smart Slot Selection",
      description: "Our intelligent system shows only the time slots that perfectly fit your service duration.",
    },
    {
      icon: <CalendarDays className="h-8 w-8 text-primary" />,
      title: "Efficient Scheduling",
      description:
        "No more waiting! Our system optimizes shop schedules to eliminate unnecessary gaps between appointments.",
    },
    {
      icon: <CreditCard className="h-8 w-8 text-primary" />,
      title: "Transparent Pricing",
      description: "See the exact price breakdown before checkout. No hidden charges or surprises at checkout.",
    },
  ]

  const howItWorksSteps = [
    {
      number: "01",
      title: "Choose Your Services",
      description: "Select multiple services you'd like to book for your visit.",
      icon: <Sparkles className="h-6 w-6 text-primary" />,
    },
    {
      number: "02",
      title: "Pick a Time Slot",
      description: "Our smart system shows available time slots that fit your selected services perfectly.",
      icon: <Clock className="h-6 w-6 text-primary" />,
    },
    {
      number: "03",
      title: "Confirm and Pay",
      description: "Review your booking summary, confirm details, and complete the payment (if applicable).",
      icon: <CheckCircle className="h-6 w-6 text-primary" />,
    },
    {
      number: "04",
      title: "Enjoy Your Visit",
      description: "Arrive at your scheduled time and enjoy your professional services.",
      icon: <ThumbsUp className="h-6 w-6 text-primary" />,
    },
  ]

  const testimonials = [
    {
      quote:
        "OGGroom has completely transformed how we manage appointments. No more overbookings or scheduling errors!",
      name: "Michael Rodriguez",
      role: "Shop Owner, Elite Cuts",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      quote:
        "I love being able to book multiple services at once and see the exact time I'll be finished. Makes planning my day so much easier.",
      name: "Sarah Johnson",
      role: "Regular Customer",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      quote:
        "The smart scheduling has eliminated dead time in our shop. We're now serving more clients without feeling rushed.",
      name: "David Chen",
      role: "Shop Owner, Modern Barbers",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  const footerLinks = {
    services: [
      { label: "Haircut", href: "#" },
      { label: "Shaving", href: "#" },
      { label: "Hair Coloring", href: "#" },
      { label: "Beard Trimming", href: "#" },
    ],
    company: [
      { label: "About Us", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Blog", href: "#" },
    ],
    support: [
      { label: "FAQs", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Help Center", href: "#" },
    ],
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container  flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="OGGroom Logo" width={40} height={40} />
            <span className="text-2xl font-bold text-foreground">OGGroom</span>
          </Link>
          <nav className="hidden md:flex gap-6 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/auth?type=customer">
              <Button size="sm">Sign In</Button>
            </Link>
          </nav>
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="grid gap-4 py-6">
                  <Link href="/" className="flex items-center gap-2 mb-4">
                    <Image src="/logo.png" alt="OGGroom Logo" width={40} height={40} />
                    <span className="text-xl font-bold">OGGroom</span>
                  </Link>
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="text-lg font-medium text-muted-foreground hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Link href="/auth?type=customer">
                    <Button className="w-full mt-4">Sign In</Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 lg:py-32 bg-background overflow-hidden">
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-primary/10 rounded-full opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-primary/20 rounded-full opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="container relative z-10">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="text-center md:text-left">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-6">
                  Style shouldn't be a <span className="text-primary">waiting game</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto md:mx-0">
                  Book your next salon appointment with ease. Smart scheduling, real-time availability, and seamless
                  experience for both customers and shop owners.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <Link href="/auth?type=customer">
                    <Button size="lg" className="w-full sm:w-auto">
                      Get Started
                    </Button>
                  </Link>
                  <Link href="#features">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      Explore Features
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="hidden md:block relative group">
                <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-2xl transform transition-transform duration-500 group-hover:scale-105">
                  <Image
                    src="/images/barbershop-hero.jpeg"
                    alt="Barbershop Interior"
                    width={600}
                    height={450}
                    className="object-cover w-full h-full"
                    priority
                  />
                </div>
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-primary/20 rounded-lg opacity-20 transform rotate-12 transition-transform duration-500 group-hover:rotate-6"></div>
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-muted rounded-full opacity-10 transform -rotate-6 transition-transform duration-500 group-hover:-rotate-3"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Smarter Booking / Features Section */}
        <section id="features" className="py-16 md:py-24 bg-card">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Smarter Booking. Better Experience.</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                OGGroom utilizes advanced scheduling algorithms to provide the most efficient booking experience for
                both customers and shop owners.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature) => (
                <Card key={feature.title} className="text-center shadow-lg hover:shadow-xl transition-shadow bg-background">
                  <CardHeader>
                    <div className="mx-auto w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl font-semibold text-foreground">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How OGGroom Works Section */}
        <section id="how-it-works" className="py-16 md:py-24 bg-background">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How OGGroom Works</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our intelligent booking platform makes scheduling your appointments seamless and efficient.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorksSteps.map((step) => (
                <div key={step.number} className="bg-card p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-xl font-bold">
                      {step.number}
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link href="/auth?type=customer">
                <Button size="lg">Get Started Now</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-16 md:py-24 bg-card">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">What People Are Saying</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Don't just take our word for it - see what our customers and shop owners have to say.
              </p>
            </div>
            <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.name} className="shadow-lg bg-background">
                  <CardContent className="p-6">
                    <MessageSquare className="w-8 h-8 text-primary mb-4 opacity-50" />
                    <p className="text-muted-foreground mb-6 italic">"{testimonial.quote}"</p>
                    <div className="flex items-center">
                      <Avatar className="h-12 w-12 mr-4">
                        <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                        <AvatarFallback>
                          {testimonial.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-16 md:py-24 bg-secondary text-secondary-foreground">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to transform your booking experience?</h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of customers and shop owners who are saving time with OGGroom's intelligent booking
              platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth?type=customer">
                <Button
                  size="lg"
                  variant="default"
                  className="w-full sm:w-auto"
                >
                  Sign Up as Customer
                </Button>
              </Link>
              <Link href="/auth?type=shop-owner">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Register Your Shop
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Section */}
      <footer className="py-12 bg-background border-t border-border">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <Image src="/logo.png" alt="OGGroom Logo" width={40} height={40} />
                <span className="text-2xl font-bold text-foreground">OGGroom</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Style shouldn't be a waiting game. Book your next appointment with ease and precision.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Services</h3>
              <ul className="space-y-2">
                {footerLinks.services.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Support</h3>
              <ul className="space-y-2">
                {footerLinks.support.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} OGGroom. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}