"use client";

import Link from "next/link";
import Image from "next/image";

export default function PrivacyPolicyPage() {
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
        <h1 className="text-3xl font-bold">Privacy Policy – OGGROOM</h1>
        <p className="text-muted-foreground">Last Updated: 23 September 2025</p>

        <div className="space-y-4">
          <section>
            <h2 className="text-2xl font-semibold">1. Information We Collect</h2>
            <p>When you use OGGROOM, we may collect the following information:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>
                <strong>Personal Information:</strong> Name, phone number, email address, and profile details you provide.
              </li>
              <li>
                <strong>Booking Information:</strong> Service details, date & time of appointment, salon details.
              </li>
              <li>
                <strong>Payment Information:</strong> Payment method, transaction ID, billing details (processed securely via
                third-party payment gateways).
              </li>
              <li>
                <strong>Device Information:</strong> Device type, operating system, and app usage data.
              </li>
              <li>
                <strong>Location Information:</strong> If you allow location access, we may collect your location to suggest nearby
                salons.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Provide and improve our services.</li>
              <li>Process bookings and payments securely.</li>
              <li>Send booking confirmations, updates, and reminders.</li>
              <li>Offer customer support and resolve issues.</li>
              <li>Personalize your app experience.</li>
              <li>Ensure security and prevent fraud.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">3. How We Share Your Information</h2>
            <p>We do not sell or rent your personal data. Your information may be shared only with:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>
                <strong>Service Providers (Salons/Barbers):</strong> To confirm and manage your bookings.
              </li>
              <li>
                <strong>Payment Gateways:</strong> To securely process transactions.
              </li>
              <li>
                <strong>Legal Authorities:</strong> If required by law or to protect our rights.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">4. Data Security</h2>
            <p>
              We use reasonable security measures to protect your data. However, no method of transmission
              over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Access, update, or delete your personal information.</li>
              <li>Opt-out of receiving promotional communications.</li>
              <li>Withdraw location or notification permissions anytime through your device settings.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">6. Third-Party Services</h2>
            <p>
              OGGROOM may use third-party services (e.g., Google, payment gateways) which have their own
              privacy policies. We recommend reviewing them as well.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">7. Age Restriction</h2>
            <p>
              OGGROOM is intended for users who are at least 18 years old. We do not knowingly collect personal
              information from individuals under 18 years of age.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">8. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes will be reflected here with an
              updated date.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
