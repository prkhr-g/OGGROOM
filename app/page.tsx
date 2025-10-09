"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import {
  Menu,
  Users,
  Clock,
  CalendarDays,
  CreditCard,
  Sparkles,
  MessageSquare,
  ThumbsUp,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageTransition } from "@/components/ui/page-transition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function MainContent() {
  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#testimonials", label: "Testimonials" },
    { href: "/auth?type=shop-owner", label: "For Shops" },
  ];

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
      description:
        "Our intelligent system shows only the time slots that perfectly fit your service duration.",
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
      description:
        "See the exact price breakdown before checkout. No hidden charges or surprises at checkout.",
    },
  ];

  const howItWorksSteps = [
    {
      number: "01",
      title: "Choose Your Services",
      description:
        "Select multiple services you'd like to book for your visit.",
      icon: <Sparkles className="h-6 w-6 text-primary" />,
    },
    {
      number: "02",
      title: "Pick a Time Slot",
      description:
        "Our smart system shows available time slots that fit your selected services perfectly.",
      icon: <Clock className="h-6 w-6 text-primary" />,
    },
    {
      number: "03",
      title: "Confirm and Pay",
      description:
        "Review your booking summary, confirm details, and complete the payment (if applicable).",
      icon: <CheckCircle className="h-6 w-6 text-primary" />,
    },
    {
      number: "04",
      title: "Enjoy Your Visit",
      description:
        "Arrive at your scheduled time and enjoy your professional services.",
      icon: <ThumbsUp className="h-6 w-6 text-primary" />,
    },
  ];

  const testimonials = [
    {
      quote:
        "OGGROOM has completely transformed how we manage appointments. No more overbookings or scheduling errors!",
      name: "Harsh Laware",
      role: "Shop Owner, Elite Cuts",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      quote:
        "I love being able to book multiple services at once and see the exact time I'll be finished. Makes planning my day so much easier.",
      name: "Kshitija Jain",
      role: "Regular Customer",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      quote:
        "The smart scheduling has eliminated dead time in our shop. We're now serving more clients without feeling rushed.",
      name: "Prakhar Jain",
      role: "Shop Owner, Modern Barbers",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ];

  const footerLinks = {
    services: [
      { label: "Haircut", href: "#" },
      { label: "Shaving", href: "#" },
      { label: "Hair Coloring", href: "#" },
      { label: "Beard Trimming", href: "#" },
    ],
    company: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
    support: [
      { label: "FAQs", href: "/faqs" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  };

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "300%"]);
  const buttonsY = useTransform(scrollYProgress, [0, 1], ["0%", "250%"]);

  const featuresRef = useRef(null);
  const isInView = useInView(featuresRef, { once: false, amount: 0.5 });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  const howItWorksRef = useRef(null);
  const isHowItWorksInView = useInView(howItWorksRef, {
    once: false,
    amount: 0.5,
  });

  const sideSlideContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const sideSlideItemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  const testimonialsRef = useRef(null);
  const isTestimonialsInView = useInView(testimonialsRef, {
    once: false,
    amount: 0.1,
  });

  const ctaRef = useRef(null);
  const isCtaInView = useInView(ctaRef, { once: false, amount: 0.1 });

  const footerRef = useRef(null);
  const isFooterInView = useInView(footerRef, { once: false, amount: 0.1 });

  const singleSectionVariant = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6 md:px-8 lg:px-12 ">
        <div className="container  flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="OGGROOM Logo" width={40} height={40} />
            <span className="text-2xl font-bold text-foreground">OGGROOM</span>
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
                    <Image
                      src="/logo.png"
                      alt="OGGROOM Logo"
                      width={40}
                      height={40}
                    />
                    <span className="text-xl font-bold">OGGROOM</span>
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
        <section
          ref={heroRef}
          className="relative h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6 md:px-8 lg:px-12"
        >
          <motion.div
            className="absolute inset-0 z-0"
            style={{
              y: backgroundY,
            }}
          >
            <Image
              src="/hero.webp"
              alt="Barbershop Interior"
              layout="fill"
              objectFit="cover"
              className="opacity-30"
              priority
            />
          </motion.div>
          <motion.div
            className="relative z-10 text-center"
            style={{
              y: textY,
            }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-6">
              Style shouldn't be a{" "}
              <span className="text-primary">waiting game</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
              Book your next salon appointment with ease. Smart scheduling,
              real-time availability, and seamless experience for both customers
              and shop owners.
            </p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              style={{
                y: buttonsY,
              }}
            >
              <Link href="/auth?type=customer">
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-4 sm:px-6 md:px-8 lg:px-12"
                >
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
            </motion.div>
          </motion.div>
        </section>

        {/* Smarter Booking / Features Section */}
        <section
          id="features"
          className="py-16 md:py-24 bg-card px-4 sm:px-6 md:px-8 lg:px-12"
        >
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Smarter Booking. Better Experience.
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                OGGROOM utilizes advanced scheduling algorithms to provide the
                most efficient booking experience for both customers and shop
                owners.
              </p>
            </div>
            <motion.div
              ref={featuresRef}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
            >
              {features.map((feature) => (
                <motion.div key={feature.title} variants={itemVariants}>
                  <Card className="text-center shadow-lg hover:shadow-xl transition-shadow bg-background h-full">
                    <CardHeader>
                      <div className="mx-auto w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-xl font-semibold text-foreground">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How OGGROOM Works Section */}
        <section
          id="how-it-works"
          className="py-16 md:py-24 bg-background px-4 sm:px-6 md:px-8 lg:px-12"
        >
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                How OGGROOM Works
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our intelligent booking platform makes scheduling your
                appointments seamless and efficient.
              </p>
            </div>
            <motion.div
              ref={howItWorksRef}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
              variants={sideSlideContainerVariants}
              initial="hidden"
              animate={isHowItWorksInView ? "visible" : "hidden"}
            >
              {howItWorksSteps.map((step) => (
                <motion.div key={step.number} variants={sideSlideItemVariants}>
                  <div className="bg-card p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow h-full">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-xl font-bold">
                        {step.number}
                      </div>
                      <h3 className="text-xl font-semibold text-foreground">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            <div className="text-center mt-12">
              <Link href="/auth?type=customer">
                <Button size="lg">Get Started Now</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section
          id="testimonials"
          className="py-16 md:py-24 bg-card px-4 sm:px-6 md:px-8 lg:px-12"
        >
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                What People Are Saying
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Don't just take our word for it - see what our customers and
                shop owners have to say.
              </p>
            </div>
            <motion.div
              ref={testimonialsRef}
              className="grid md:grid-cols-1 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate={isTestimonialsInView ? "visible" : "hidden"}
            >
              {testimonials.map((testimonial) => (
                <motion.div key={testimonial.name} variants={itemVariants}>
                  <Card className="shadow-lg bg-background h-full">
                    <CardContent className="p-6">
                      <MessageSquare className="w-8 h-8 text-primary mb-4 opacity-50" />
                      <p className="text-muted-foreground mb-6 italic">
                        "{testimonial.quote}"
                      </p>
                      <div className="flex items-center">
                        <Avatar className="h-12 w-12 mr-4">
                          <AvatarImage
                            src={testimonial.avatar || "/placeholder.svg"}
                            alt={testimonial.name}
                          />
                          <AvatarFallback>
                            {testimonial.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground">
                            {testimonial.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {testimonial.role}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Call to Action Section */}
        <motion.section
          ref={ctaRef}
          className="py-16 md:py-24 bg-secondary text-secondary-foreground px-4 sm:px-6 md:px-8 lg:px-12"
          variants={singleSectionVariant}
          initial="hidden"
          animate={isCtaInView ? "visible" : "hidden"}
        >
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to transform your booking experience?
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of customers and shop owners who are saving time
              with OGGROOM's intelligent booking platform.
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
                  variant="default"
                  className="w-full sm:text-grey-950"
                >
                  Register Your Shop
                </Button>
              </Link>
            </div>
          </div>
        </motion.section>
      </main>

      {/* Footer Section */}
      <motion.footer
        ref={footerRef}
        className="py-12 bg-background border-t border-border px-4 sm:px-6 md:px-8 lg:px-12"
        variants={singleSectionVariant}
        initial="hidden"
        animate={isFooterInView ? "visible" : "hidden"}
      >
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <Image
                  src="/logo.png"
                  alt="OGGROOM Logo"
                  width={40}
                  height={40}
                />
                <span className="text-2xl font-bold text-foreground">
                  OGGROOM
                </span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Style shouldn't be a waiting game. Book your next appointment
                with ease and precision.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Services
              </h3>
              <ul className="space-y-2">
                {footerLinks.services.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Company
              </h3>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Support
              </h3>
              <ul className="space-y-2">
                {footerLinks.support.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} OGGROOM. All rights reserved.
            </p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-white">
        <Image
          src="/logo.png"
          alt="Oggroom"
          width={100}
          height={100}
          className="animate-pulse"
        />
      </div>
    );
  }

  return (
    <PageTransition>
      <MainContent />
    </PageTransition>
  );
}