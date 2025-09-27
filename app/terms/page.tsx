"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsAndConditionsPage() {
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
        <h1 className="text-3xl font-bold">Terms & Conditions – OGGROOM</h1>
        <p className="text-muted-foreground">Effective Date: 22 September 2025</p>

        <div className="space-y-4">
          <section>
            <h2 className="text-2xl font-semibold">1. Use of OGGROOM</h2>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>
                OGGROOM is an online platform that connects users with salons, barbers, and grooming service
                providers (“Vendors”).
              </li>
              <li>
                We act only as a booking and payment facilitator. Actual grooming services are provided by
                Vendors.
              </li>
              <li>You must be at least 18 years old to use OGGROOM.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">2. User Responsibilities</h2>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Provide accurate and complete information during sign-up and booking.</li>
              <li>Do not misuse the platform for illegal, fraudulent, or abusive purposes.</li>
              <li>Respect Vendor’s timings, rules, and service policies.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">3. Bookings & Payments</h2>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Service prices are set by Vendors and displayed in the App.</li>
              <li>Payments are processed securely through our payment partners.</li>
              <li>In case of failed transactions, refunds will follow payment gateway policies.</li>
              <li>OGGROOM may charge a platform/service fee.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">4. Cancellations & Refunds</h2>
            <p>Cancellation and refund rules depend on Vendor policies.</p>
            <p>Minimum OGGROOM Standard Policy:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Cancellation within 1 hour of booking → Full refund.</li>
              <li>Cancellation after service start time → No refund.</li>
              <li>Any disputes will be reviewed by OGGROOM’s support team within 7 working days.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">5. Role of OGGROOM</h2>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>OGGROOM is only a facilitator, not the actual service provider.</li>
              <li>Quality, delays, damages, or dissatisfaction are the Vendor’s responsibility.</li>
              <li>OGGROOM is not liable for personal injury, service failure, or loss caused by Vendors.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">6. Privacy & Data</h2>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>
                We collect personal details (name, phone, location, payment info) only to provide services.
              </li>
              <li>Data is shared only with Vendors and payment partners when required.</li>
              <li>We protect your data and follow applicable data protection laws.</li>
              <li>For detailed information, see our Privacy Policy.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">7. Limitation of Liability</h2>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>OGGROOM shall not be liable for indirect, incidental, or consequential damages.</li>
              <li>
                OGGROOM’s maximum liability in any case will not exceed the platform/service fee charged.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">8. Indemnity</h2>
            <p>
              You agree to indemnify and hold OGGROOM harmless against any claims, damages, or liabilities
              arising from misuse of the platform, violation of these Terms, or disputes with Vendors.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">9. Termination</h2>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>OGGROOM may suspend/terminate accounts violating these Terms.</li>
              <li>Users may delete their account anytime via the App.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">10. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. Continued use of OGGROOM means you accept the
              updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">11. Governing Law & Dispute Resolution</h2>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>These Terms are governed by the laws of India.</li>
              <li>Any disputes will fall under the jurisdiction of Lucknow, Uttar Pradesh courts.</li>
              <li>OGGROOM will provide a grievance redressal mechanism (support email/helpdesk).</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
