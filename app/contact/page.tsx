"use client";

import Link from "next/link";
import Image from "next/image";

export default function ContactPage() {
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
        <h1 className="text-3xl font-bold">Contact Us</h1>
        <p>If you have any questions or concerns, please contact us at:</p>
        <ul className="list-none space-y-2 mt-2">
          <li>
            <strong>Email:</strong> OGGROOM@gmail.com
          </li>
          <li>
            <strong>Phone:</strong> +91-7985305100
          </li>
          <li>
            <strong>Address:</strong> Dehwa, Mohanlalganj, Lucknow, Uttar Pradesh, India
          </li>
        </ul>
      </main>
    </div>
  );
}
