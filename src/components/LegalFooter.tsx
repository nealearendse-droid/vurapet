// FILE: components/LegalFooter.jsx
// Add this component to your layout.jsx (or wherever your current footer/layout is)
// Usage: import LegalFooter from "@/components/LegalFooter"; then <LegalFooter /> at bottom of layout

import Link from "next/link";

export default function LegalFooter() {
  return (
    <footer className="border-t border-gray-100 bg-gray-50 mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
        <p>© {new Date().getFullYear()} VuraPet. Built in 🇿🇦 South Africa.</p>
        <nav className="flex flex-wrap gap-4 justify-center">
          <Link href="/terms" className="hover:text-teal-600 transition-colors">
            Terms &amp; Conditions
          </Link>
          <Link href="/privacy" className="hover:text-teal-600 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/disclaimer" className="hover:text-teal-600 transition-colors">
            Disclaimer
          </Link>
          <a href="mailto:support@vurapet.co.za" className="hover:text-teal-600 transition-colors">
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}