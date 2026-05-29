// FILE: app/disclaimer/page.jsx
// Place this file at: src/app/disclaimer/page.jsx

import Link from "next/link";

export const metadata = {
  title: "Disclaimer | VuraPet",
  description:
    "VuraPet is not a veterinary service. Read our disclaimer about the limitations of pet health information on our platform.",
};

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="text-teal-100 text-sm hover:text-white mb-4 inline-block">
            ← Back to VuraPet
          </Link>
          <h1 className="text-3xl font-bold text-white">Disclaimer</h1>
          <p className="text-teal-100 mt-2">Effective Date: 1 June 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-10 text-gray-700 leading-relaxed">

        {/* Important Notice Banner */}
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg mb-8">
          <p className="font-semibold text-amber-800">🐾 Important Notice</p>
          <p className="text-amber-700 mt-1">
            VuraPet is a pet health management tool, not a veterinary service. Always consult a
            qualified veterinarian for medical advice about your pet.
          </p>
        </div>

        <Section title="1. Not a Substitute for Veterinary Advice">
          <p>
            VuraPet is a pet health management and record-keeping platform. The information, tools, and
            content provided — including nutrition guides, food safety information, vaccination trackers,
            health logs, and general wellness content — are intended for informational and organisational
            purposes only.
          </p>
          <p className="mt-3 font-semibold text-red-700">
            VuraPet does NOT provide veterinary advice, diagnosis, or treatment.
          </p>
          <p className="mt-3">Always consult a qualified, registered veterinarian for:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Diagnosis or treatment of any illness, injury, or health condition in your pet</li>
            <li>Advice on medications, dosages, or medical procedures</li>
            <li>Guidance on emergency situations or urgent health concerns</li>
            <li>Nutritional advice tailored to your pet's specific medical needs</li>
            <li>Vaccination schedules appropriate for your pet's individual health profile</li>
          </ul>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
            <p className="text-red-700 font-semibold">
              🚨 In a pet health emergency, contact your veterinarian or an emergency animal hospital
              immediately. Do not rely on this platform in place of professional care.
            </p>
          </div>
        </Section>

        <Section title="2. Food Safety and Nutrition Information">
          <p>
            The food safety checker and nutrition information on VuraPet are based on general guidance
            from widely available veterinary and animal nutrition sources. This information:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Is intended as a general reference only and may not account for your pet's individual conditions, allergies, or dietary requirements</li>
            <li>May not reflect the most current research or veterinary guidelines</li>
            <li>Does not account for preparation methods, portion sizes, or medication interactions</li>
            <li>Should not replace consultation with a qualified veterinary nutritionist</li>
          </ul>
          <p className="mt-3">
            If your pet has a known medical condition or is on medication, please consult your
            veterinarian before making any dietary changes.
          </p>
        </Section>

        <Section title="3. Accuracy of Information">
          <p>
            While VuraPet strives to provide accurate and up-to-date information, we make no
            representations or warranties regarding the accuracy, completeness, or reliability of any
            content on the platform. Information:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Is provided in good faith but may contain errors or omissions</li>
            <li>May not be updated in real time to reflect the latest veterinary research</li>
            <li>May not be applicable to all pet species, breeds, ages, or health conditions</li>
          </ul>
        </Section>

        <Section title="4. User-Generated Records">
          <p>
            VuraPet allows users to record and store their own pet health data. We are not responsible
            for the accuracy of information entered by users. It is your responsibility to ensure that
            health records, vaccination dates, and other information are accurate and kept up to date.
          </p>
          <p className="mt-3">
            We recommend keeping independent copies of important veterinary records and not relying
            solely on the platform for critical medical documentation.
          </p>
        </Section>

        <Section title="5. Service Availability">
          <p>
            The VuraPet platform is provided "as is" and "as available". We do not guarantee that the
            Service will be available at all times or free from errors. We are not liable for any loss
            arising from temporary unavailability of the platform.
          </p>
        </Section>

        <Section title="6. Limitation of Liability">
          <p>
            To the maximum extent permitted by South African law, VuraPet, its directors, employees, and
            affiliates shall not be liable for any damages arising from:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Your reliance on any information provided on the platform</li>
            <li>Any decisions made based on content found on VuraPet</li>
            <li>Any veterinary outcomes, whether or not related to use of the platform</li>
            <li>Any errors, omissions, or inaccuracies in platform content</li>
          </ul>
        </Section>

        <Section title="7. Contact">
          <p>
            If you have concerns about information on the platform, please contact us at:{" "}
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