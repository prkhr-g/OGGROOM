"use client";

import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
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
        <h1 className="text-3xl font-bold">About Oggroom</h1>
        <div className="space-y-4">
          <p>
            Oggroom is a smart grooming platform built to make salon visits
            effortless. We help customers discover, book, and experience trusted
            salons and barbershops nearby — without wasting time waiting in
            queues.
          </p>
          <p>
            Our mission is simple: to make grooming more organized,
            time-efficient, and transparent for both customers and salon owners.
          </p>
          <p>
            With Oggroom, users can explore verified salons, check real-time
            availability, and secure appointments instantly through the app. For
            salon owners, Oggroom acts as a digital partner, helping them manage
            bookings, grow visibility, and deliver a seamless customer
            experience.
          </p>
          <p>
            We believe “Style shouldn’t be a waiting game.” And with Oggroom, it
            never is
          </p>
        </div>
      </main>
    </div>
  );
}