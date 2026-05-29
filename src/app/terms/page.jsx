// FILE: app/terms/page.jsx  (or pages/terms.jsx if using Pages Router)
// Place this file at: src/app/terms/page.jsx

import Link from "next/link";

export const metadata = {
  title: "Terms and Conditions | VuraPet",
  description:
    "Read VuraPet's Terms and Conditions governing use of our pet health platform and subscription service.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="text-teal-100 text-sm hover:text-white mb-4 inline-block">
            ← Back to VuraPet
          </Link>
          <h1 className="text-3xl font-bold text-white">Terms and Conditions</h1>
          <p className="text-teal-100 mt-2">Effective Date: 1 June 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-10 text-gray-700 leading-relaxed">

        <Section title="1. Introduction and Acceptance of Terms">
          <p>
            Welcome to VuraPet ("VuraPet", "we", "our", or "us"). These Terms and Conditions ("Terms")
            govern your access to and use of the VuraPet platform, including our website at
            vurapet.vercel.app, mobile applications, and all related services (collectively, the "Service").
          </p>
          <p className="mt-3">
            By creating an account, subscribing to our service, or otherwise using VuraPet, you agree to
            be bound by these Terms. If you do not agree, please do not use the Service.
          </p>
          <p className="mt-3">
            These Terms are governed by the laws of the Republic of South Africa, including the Consumer
            Protection Act 68 of 2008, the Electronic Communications and Transactions Act 25 of 2002, and
            the Protection of Personal Information Act 4 of 2013 (POPIA).
          </p>
        </Section>

        <Section title="2. Description of Service">
          <p>VuraPet is a digital pet health management platform that allows users to:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Track their pet's health records, vaccination schedules, and medical history</li>
            <li>Access nutrition plans and food safety information for pets</li>
            <li>Store and manage memories, photos, and important pet documents</li>
            <li>Plan for pet care continuity</li>
            <li>Access general pet wellness information and guidance</li>
          </ul>
          <p className="mt-3">
            VuraPet offers both a free tier and paid subscription plans. Features available may differ
            between tiers.
          </p>
        </Section>

        <Section title="3. Account Registration">
          <p>To access certain features of the Service, you must create an account. You agree to:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Provide accurate, current, and complete information during registration</li>
            <li>Maintain and update your account information to keep it accurate</li>
            <li>Keep your password secure and confidential</li>
            <li>Notify us immediately of any unauthorised access to your account</li>
            <li>Accept responsibility for all activities conducted through your account</li>
          </ul>
          <p className="mt-3">
            You must be at least 18 years of age to create an account.
          </p>
        </Section>

        <Section title="4. Subscription Plans and Billing">
          <SubSection title="4.1 Subscription Options">
            <p>
              VuraPet offers monthly subscription plans. Details of current plans, features, and pricing
              are available on our website. Prices are displayed in South African Rand (ZAR) and are
              inclusive of applicable VAT.
            </p>
          </SubSection>
          <SubSection title="4.2 Payment Processing">
            <p>
              All payments are processed securely through PayFast, a South African payment gateway. By
              subscribing, you authorise VuraPet and PayFast to charge your selected payment method on a
              recurring monthly basis. VuraPet does not store your full payment card details.
            </p>
          </SubSection>
          <SubSection title="4.3 Automatic Renewal">
            <p>
              Your subscription will automatically renew at the end of each billing period unless you
              cancel before the renewal date.
            </p>
          </SubSection>
          <SubSection title="4.4 Cancellation Policy">
            <p>
              You may cancel your subscription at any time through your account settings. Cancellation
              takes effect at the end of your current billing period. You will retain access to paid
              features until the end of the period already paid for. Pro-rated refunds for partial periods
              are not offered, except where required by the Consumer Protection Act.
            </p>
          </SubSection>
          <SubSection title="4.5 Refund Policy">
            <p>
              In accordance with Section 56 of the Consumer Protection Act 68 of 2008, you may be
              entitled to a refund if the service is materially defective or not as described. Refund
              requests must be submitted to{" "}
              <a href="mailto:support@vurapet.co.za" className="text-teal-600 hover:underline">
                support@vurapet.co.za
              </a>{" "}
              within 5 business days of the issue arising.
            </p>
          </SubSection>
        </Section>

        <Section title="5. Acceptable Use">
          <p>You agree not to use the Service to:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Violate any applicable laws or regulations</li>
            <li>Upload or share content that is harmful, offensive, or infringes third-party rights</li>
            <li>Attempt to gain unauthorised access to our systems or data</li>
            <li>Use the Service for commercial purposes without our written consent</li>
            <li>Scrape, copy, or reproduce any part of the Service without permission</li>
            <li>Introduce viruses, malware, or other harmful code</li>
          </ul>
          <p className="mt-3">
            We reserve the right to suspend or terminate accounts that violate these Terms without prior
            notice.
          </p>
        </Section>

        <Section title="6. Intellectual Property">
          <p>
            All content, features, and functionality of the Service are the exclusive property of VuraPet
            and are protected by South African and international intellectual property laws. You are
            granted a limited, non-exclusive licence to use the Service for personal, non-commercial
            purposes only.
          </p>
          <p className="mt-3">
            Content you upload (such as pet photos and records) remains your property. By uploading, you
            grant us a limited licence to store and display it solely for the purpose of providing the
            Service.
          </p>
        </Section>

        <Section title="7. Privacy and Data Protection">
          <p>
            Your use of the Service is also governed by our{" "}
            <Link href="/privacy" className="text-teal-600 hover:underline">
              Privacy Policy
            </Link>
            , which is incorporated into these Terms by reference. We are committed to complying with
            POPIA.
          </p>
        </Section>

        <Section title="8. Disclaimer of Warranties">
          <p>
            The Service is provided on an "as is" and "as available" basis without warranties of any
            kind. We do not warrant that the Service will be uninterrupted, error-free, or free of harmful
            components. Please also read our{" "}
            <Link href="/disclaimer" className="text-teal-600 hover:underline">
              Disclaimer
            </Link>
            .
          </p>
        </Section>

        <Section title="9. Limitation of Liability">
          <p>
            To the fullest extent permitted by law, VuraPet shall not be liable for any indirect,
            incidental, special, or consequential damages arising from your use of the Service. Our total
            liability shall not exceed the total amount you have paid to VuraPet in the three months
            preceding the claim.
          </p>
        </Section>

        <Section title="10. Governing Law">
          <p>
            These Terms are governed by the laws of the Republic of South Africa. Any disputes shall be
            subject to the jurisdiction of the South African courts. We encourage you to contact us first
            at{" "}
            <a href="mailto:support@vurapet.co.za" className="text-teal-600 hover:underline">
              support@vurapet.co.za
            </a>{" "}
            to resolve disputes informally.
          </p>
        </Section>

        <Section title="11. Contact">
          <p>
            For questions about these Terms, contact us at:{" "}
            <a href="mailto:support@vurapet.co.za" className="text-teal-600 hover:underline">
              support@vurapet.co.za
            </a>
          </p>
        </Section>

        <p className="text-sm text-gray-400 mt-10 border-t pt-6">Last updated: 1 June 2025</p>
      </div>
    </main>
  );
}

function Section({ title, children }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold text-teal-700 border-b border-teal-100 pb-2 mb-3">
        {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function SubSection({ title, children }) {
  return (
    <div className="mt-4">
      <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
      {children}
    </div>
  );
}