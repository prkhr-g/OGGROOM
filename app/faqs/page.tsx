"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FaqsPage() {
  const faqs = [
    {
      question: "What is Oggroom and how does it work?",
      answer:
        "Oggroom is an online grooming platform that allows you to book slots at nearby salons and barbershops. It connects you with verified professionals for a smooth, waiting-free experience.",
    },
    {
      question: "How can I download the Oggroom app?",
      answer:
        "You can download the Oggroom app from the Google Play Store. It’s not available on the Apple App Store yet. Once installed, create your account and start booking your slots.",
    },
    {
      question: "Is Oggroom available in all cities?",
      answer:
        "Oggroom is currently available in selected cities and expanding to more locations soon.",
    },
    {
      question: "Is using Oggroom free?",
      answer:
        "Yes, downloading and using the app is free. You only pay for the services you book.",
    },
    {
      question: "Does Oggroom offer services for both men and women?",
      answer:
        "Yes, Oggroom offers grooming and beauty services for both men and women.",
    },
    {
      question: "How can I book a slot?",
      answer:
        "Open the Oggroom app, choose your nearby salon, select your service, pick a suitable time slot, and confirm your booking.",
    },
    {
      question: "Can I cancel my booking?",
      answer:
        "Yes, you can cancel your booking before the scheduled time. However, refunds depend on the salon’s cancellation policy.",
    },
    {
      question: "What payment options are available?",
      answer:
        "Currently, Oggroom supports online payments only — through UPI, debit cards, or credit cards.",
    },
    {
      question: "Is advance payment required?",
      answer:
        "Yes, advance payment is mandatory for all bookings to confirm your slot.",
    },
    {
      question: "What happens if I miss my appointment?",
      answer:
        "If you fail to show up at your booked time, the advance payment will not be refundable. You should cancel or reschedule in advance if needed.",
    },
    {
      question: "Does Oggroom provide invoices or receipts?",
      answer:
        "Yes, every confirmed booking automatically generates a digital invoice, available in the ‘My Bookings’ section of the app.",
    },
    {
      question: "How can I register my salon or barbershop on Oggroom?",
      answer:
        "Go to the ‘For shops’ section on the Oggroom app or website and fill out the registration form. Once verified, your salon will go live on the platform.",
    },
    {
      question: "Is listing my salon on Oggroom free?",
      answer: "Yes, currently all salon listings on Oggroom are completely free.",
    },
    {
      question: "How do I manage bookings and appointments?",
      answer:
        "You’ll get access to the Shop's Dashboard on Oggroom App, where you can accept, manage, or reschedule bookings in real-time.",
    },
    {
      question: "Does Oggroom provide support to its partners?",
      answer:
        "Yes, Oggroom provides full support during onboarding, as well as ongoing help for managing customers and bookings.",
    },
    {
      question: "How long does it take for partners to receive payments?",
      answer:
        "Online payments are transferred directly to the partner’s registered bank account within 2–3 business days.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="OGGROOM Logo" width={40} height={40} />
              <span className="text-2xl font-bold text-foreground">OGGROOM</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6 max-w-4xl">
        <h1 className="text-3xl font-bold">Frequently Asked Questions (FAQs)</h1>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </main>
    </div>
  );
}
