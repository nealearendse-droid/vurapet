// FILE: app/privacy/page.jsx
// Place this file at: src/app/privacy/page.jsx

import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | VuraPet",
  description:
    "Read VuraPet's Privacy Policy. We are committed to protecting your personal information in compliance with POPIA.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="text-teal-100 text-sm hover:text-white mb-4 inline-block">
            ← Back to VuraPet
          </Link>
          <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
          <p className="text-teal-100 mt-2">Effective Date: 1 June 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-10 text-gray-700 leading-relaxed">

        <Section title="1. Introduction">
          <p>
            VuraPet ("we", "our", "us") is committed to protecting your privacy and handling your
            personal information responsibly. This Privacy Policy explains how we collect, use, store,
            and share information when you use the VuraPet platform.
          </p>
          <p className="mt-3">
            This Policy is compliant with the Protection of Personal Information Act 4 of 2013 (POPIA)
            and other applicable South African privacy legislation.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <SubSection title="2.1 Information You Provide">
            <ul className="list-disc ml-6 mt-1 space-y-1">
              <li>Account information: name, email address, and password</li>
              <li>Pet information: pet names, breed, age, weight, medical history, vaccination records, and photos</li>
              <li>Payment information: processed securely through PayFast (we do not store card details)</li>
              <li>Communications: messages you send to our support team</li>
            </ul>
          </SubSection>
          <SubSection title="2.2 Information Collected Automatically">
            <ul className="list-disc ml-6 mt-1 space-y-1">
              <li>Device information: device type, operating system, browser type</li>
              <li>Usage data: pages visited, features used, time spent on the platform</li>
              <li>Log data: IP address, access times, referring URLs</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </SubSection>
          <SubSection title="2.3 Information from Third Parties">
            <p>
              We may receive limited information from payment processors (PayFast) to confirm transaction
              status, and from analytics providers to understand how the Service is used.
            </p>
          </SubSection>
        </Section>

        <Section title="3. How We Use Your Information">
          <ul className="list-disc ml-6 mt-1 space-y-1">
            <li>Provide, maintain, and improve the VuraPet Service</li>
            <li>Process payments and manage your subscription</li>
            <li>Send service-related communications (account updates, receipts, important notices)</li>
            <li>Respond to your support requests and enquiries</li>
            <li>Send promotional content where you have opted in (you may opt out at any time)</li>
            <li>Analyse usage patterns to improve the platform</li>
            <li>Comply with legal obligations</li>
            <li>Detect and prevent fraudulent or unauthorised activity</li>
          </ul>
        </Section>

        <Section title="4. Sharing Your Information">
          <p>We do not sell your personal information. We may share it with:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li><strong>PayFast</strong> — to process subscription payments securely</li>
            <li><strong>Vercel</strong> — our hosting provider, for platform infrastructure</li>
            <li><strong>Analytics providers</strong> — for anonymised usage analytics</li>
            <li><strong>Legal authorities</strong> — if required by law or to protect our rights</li>
          </ul>
          <p className="mt-3">
            All third-party providers are required to handle your information in accordance with
            applicable privacy laws.
          </p>
        </Section>

        <Section title="5. Data Storage and Security">
          <p>
            Your data is stored on secure servers provided by Vercel. We implement appropriate technical
            and organisational measures to protect your information against unauthorised access, loss,
            alteration, or disclosure.
          </p>
          <p className="mt-3">
            In the event of a data breach likely to result in a risk to your rights, we will notify you
            and the Information Regulator as required by POPIA.
          </p>
        </Section>

        <Section title="6. Cookies">
          <p>VuraPet uses cookies to enhance your experience:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li><strong>Essential cookies</strong> — required for the platform to function</li>
            <li><strong>Analytics cookies</strong> — to understand how users interact with the Service</li>
            <li><strong>Preference cookies</strong> — to remember your settings</li>
          </ul>
          <p className="mt-3">
            You can control cookie settings through your browser. Disabling certain cookies may affect
            platform functionality.
          </p>
        </Section>

        <Section title="7. Data Retention">
          <p>
            We retain your personal information for as long as your account is active or as needed to
            provide the Service. If you close your account, we will delete or anonymise your data within
            90 days, unless required by law to retain it longer.
          </p>
        </Section>

        <Section title="8. Your Rights Under POPIA">
          <p>As a data subject, you have the right to:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Access the personal information we hold about you</li>
            <li>Request correction of inaccurate or incomplete information</li>
            <li>Request deletion of your personal information</li>
            <li>Object to the processing of your personal information</li>
            <li>Lodge a complaint with the Information Regulator of South Africa</li>
          </ul>
          <p className="mt-3">
            To exercise any of these rights, contact us at{" "}
            <a href="mailto:support@vurapet.co.za" className="text-teal-600 hover:underline">
              support@vurapet.co.za
            </a>
            . We will respond within 30 days.
          </p>
          <p className="mt-3">
            The Information Regulator of South Africa:{" "}
            <a
              href="https://www.justice.gov.za/inforeg/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-600 hover:underline"
            >
              www.justice.gov.za/inforeg
            </a>{" "}
            | inforeg@justice.gov.za
          </p>
        </Section>

        <Section title="9. Children's Privacy">
          <p>
            VuraPet is not intended for use by children under the age of 18. We do not knowingly collect
            personal information from minors. If you believe we have inadvertently collected such
            information, please contact us immediately.
          </p>
        </Section>

        <Section title="10. Contact">
          <p>
            For privacy-related queries, contact our Information Officer at:{" "}
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