"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type BillingCycle = "monthly" | "annual";

interface TierFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
  note?: string; // e.g. "Max 3 entries"
}

interface Tier {
  id: "free" | "pro" | "family";
  name: string;
  tagline: string;
  monthlyPrice: number | null;
  annualPrice: number | null;
  annualMonthly: number | null;
  badge?: string;
  badgeColor?: string;
  ctaLabel: string;
  ctaStyle: "outline" | "primary" | "premium";
  ctaSubtext?: string;
  features: TierFeature[];
}

const TIERS: Tier[] = [
  {
    id: "free",
    name: "Starter",
    tagline: "Get a feel for what's possible. A good start — but not enough when it really matters.",
    monthlyPrice: 0,
    annualPrice: 0,
    annualMonthly: 0,
    ctaLabel: "Start Free",
    ctaStyle: "outline",
    features: [
      { text: "1 pet profile", included: true },
      { text: "1 trusted viewer (view-only access)", included: true },
      { text: "Basic food safety checker", included: true, highlight: true },
      { text: "Weight tracker (limited history)", included: true },
      { text: "Their Story — memory moments", included: true, highlight: true, note: "Max 3 entries" },
      { text: "Know what's wrong before it gets serious", included: false },
      { text: "Everything your vet needs, instantly", included: false },
      { text: "Feed with confidence — custom meal plans", included: false },
      { text: "Spot health changes before they become problems", included: false },
      { text: "Track patterns over time — health journal", included: false },
      { text: "Emergency-ready care document", included: false },
      { text: "Vaccine calendar & reminders", included: false },
    ],
  },
  {
    id: "pro",
    name: "Full Protection",
    tagline: "The plan that actually protects your pet — especially when you're not there.",
    monthlyPrice: 99,
    annualPrice: 799,
    annualMonthly: 67,
    badge: "Most Popular",
    badgeColor: "emerald",
    ctaLabel: "Start Full Protection",
    ctaStyle: "primary",
    ctaSubtext: "Recommended for every responsible pet owner",
    features: [
      { text: "1 pet profile", included: true },
      { text: "1 trusted guardian — emergency-ready access", included: true, highlight: true },
      { text: "Smart food safety checker", included: true },
      { text: "Full weight & health tracking", included: true },
      { text: "Their Story — unlimited memory moments", included: true, highlight: true },
      { text: "Know what's wrong before it gets serious", included: true, highlight: true },
      { text: "Everything your vet needs, instantly", included: true, highlight: true },
      { text: "Feed with confidence — custom meal plans", included: true, highlight: true },
      { text: "Spot health changes before they become problems", included: true },
      { text: "Track patterns over time — health journal", included: true },
      { text: "Emergency-ready care document", included: true },
      { text: "Vaccine calendar & reminders", included: true },
    ],
  },
  {
    id: "family",
    name: "Family Plan",
    tagline: "Because every pet in your home deserves the same level of protection.",
    monthlyPrice: 149,
    annualPrice: 1199,
    annualMonthly: 100,
    badge: "Best Value",
    badgeColor: "amber",
    ctaLabel: "Protect the Whole Family",
    ctaStyle: "premium",
    features: [
      { text: "Up to 5 pet profiles", included: true, highlight: true },
      { text: "Multiple trusted guardians", included: true, highlight: true },
      { text: "Smart food safety checker", included: true },
      { text: "Full weight & health tracking", included: true },
      { text: "Their Story — unlimited memory moments", included: true },
      { text: "Know what's wrong before it gets serious", included: true },
      { text: "Everything your vet needs, instantly", included: true },
      { text: "Feed with confidence — custom meal plans", included: true },
      { text: "Spot health changes before they become problems", included: true },
      { text: "Track patterns over time — health journal", included: true },
      { text: "Emergency-ready care document", included: true },
      { text: "Vaccine calendar & reminders", included: true },
    ],
  },
];

export default function PricingTiers() {
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const router = useRouter();

  const handleCta = (tierId: Tier["id"]) => {
    if (tierId === "free") router.push("/auth/signup");
    else router.push(`/auth/signup?plan=${tierId}&billing=${billing}`);
  };

  const annualSavingsPro =
    TIERS[1].monthlyPrice! * 12 - TIERS[1].annualPrice!;

  return (
    <section className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-20 px-4">

      {/* ── Emotional Hook ── */}
      <div className="max-w-2xl mx-auto text-center mb-6">
        <span className="inline-block text-xs font-semibold tracking-widest text-emerald-600 uppercase mb-4">
          Pricing
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-5">
          If something happens…{" "}
          <span className="text-emerald-500">will they know what to do?</span>
        </h1>
        <p className="text-slate-500 text-lg leading-relaxed mb-3">
          Your pet can&apos;t explain their needs. And in stressful moments, even
          the most caring person can forget the details that matter.
        </p>
        <p className="text-slate-700 font-medium text-lg leading-relaxed">
          VuraPet gives your pet a voice — even when you&apos;re not there.
        </p>
      </div>

      {/* ── Micro-story ── */}
      <div className="max-w-xl mx-auto mb-10">
        <div className="bg-amber-50 border border-amber-100 rounded-2xl px-7 py-5 text-slate-600 text-sm leading-relaxed text-center italic">
          Your dog gets sick while you&apos;re away. The person watching them
          doesn&apos;t know what food they can eat… doesn&apos;t know their
          vet… doesn&apos;t know their history.{" "}
          <span className="not-italic font-semibold text-slate-800">
            That&apos;s where VuraPet comes in.
          </span>
        </div>
      </div>

      {/* ── Billing toggle ── */}
      <div className="text-center mb-14">
        <p className="text-slate-400 text-sm mb-5">
          Start free. Upgrade when you&apos;re ready. No hidden fees.
        </p>
        <div className="inline-flex items-center gap-3 bg-slate-100 rounded-full p-1">
          <button
            onClick={() => setBilling("monthly")}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
              billing === "monthly"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling("annual")}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
              billing === "annual"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Annual
            <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-bold">
              Save R{annualSavingsPro}
            </span>
          </button>
        </div>
      </div>

      {/* ── Tier cards ── */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {TIERS.map((tier) => (
          <TierCard
            key={tier.id}
            tier={tier}
            billing={billing}
            onCta={() => handleCta(tier.id)}
          />
        ))}
      </div>

      {/* ── Bottom trust reinforcement ── */}
      <div className="max-w-xl mx-auto text-center mt-14">
        <p className="text-slate-700 font-semibold text-lg mb-2">
          Because love isn&apos;t enough in an emergency — preparation is.
        </p>
        <p className="text-slate-400 text-sm">
          Whether you&apos;re at work, on holiday, or just out for the day —
          VuraPet makes sure the person with your pet has everything they need
          to do the right thing.
        </p>
      </div>

      <p className="text-center text-slate-400 text-sm mt-8">
        Prices in South African Rand (ZAR). Cancel anytime. No contracts.
      </p>
    </section>
  );
}

function TierCard({
  tier,
  billing,
  onCta,
}: {
  tier: Tier;
  billing: BillingCycle;
  onCta: () => void;
}) {
  const isPro = tier.id === "pro";
  const displayPrice =
    billing === "monthly" ? tier.monthlyPrice : tier.annualMonthly;

  return (
    <div
      className={`relative rounded-2xl flex flex-col transition-all duration-300 ${
        isPro
          ? "bg-emerald-600 text-white shadow-2xl shadow-emerald-200 scale-105 md:-mt-4 md:mb-4"
          : "bg-white text-slate-900 shadow-md border border-slate-100 hover:shadow-lg"
      }`}
    >
      {/* Badge */}
      {tier.badge && (
        <div
          className={`absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap ${
            tier.badgeColor === "emerald"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {tier.badge}
        </div>
      )}

      <div className="p-7 flex flex-col flex-1">

        {/* Name & tagline */}
        <div className="mb-6">
          <h2
            className={`text-xl font-bold mb-1.5 ${
              isPro ? "text-white" : "text-slate-900"
            }`}
          >
            {tier.name}
          </h2>
          <p
            className={`text-sm leading-snug ${
              isPro ? "text-emerald-100" : "text-slate-500"
            }`}
          >
            {tier.tagline}
          </p>
        </div>

        {/* Price */}
        <div className="mb-2">
          {displayPrice === 0 ? (
            <span
              className={`text-4xl font-extrabold ${
                isPro ? "text-white" : "text-slate-900"
              }`}
            >
              Free
            </span>
          ) : (
            <div className="flex items-end gap-1">
              <span
                className={`text-lg font-semibold ${
                  isPro ? "text-emerald-200" : "text-slate-400"
                }`}
              >
                R
              </span>
              <span
                className={`text-4xl font-extrabold leading-none ${
                  isPro ? "text-white" : "text-slate-900"
                }`}
              >
                {displayPrice}
              </span>
              <span
                className={`text-sm pb-1 ${
                  isPro ? "text-emerald-200" : "text-slate-400"
                }`}
              >
                /mo
              </span>
            </div>
          )}
          {billing === "annual" && tier.annualPrice && tier.annualPrice > 0 && (
            <p
              className={`text-xs mt-1 ${
                isPro ? "text-emerald-200" : "text-slate-400"
              }`}
            >
              Billed R{tier.annualPrice}/year
            </p>
          )}
        </div>

        {/* Daily cost reframe — Pro only */}
        {isPro && (
          <p className="text-emerald-200 text-xs mb-5 font-medium">
            Less than R4 a day for total peace of mind
          </p>
        )}
        {!isPro && <div className="mb-5" />}

        {/* CTA */}
        <button
          onClick={onCta}
          className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
            tier.ctaStyle === "primary"
              ? "bg-white text-emerald-700 hover:bg-emerald-50 shadow-sm"
              : tier.ctaStyle === "premium"
              ? "bg-amber-400 text-amber-900 hover:bg-amber-300 shadow-sm"
              : "border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
          }`}
        >
          {tier.ctaLabel}
        </button>

        {/* CTA subtext — Pro only */}
        {tier.ctaSubtext && (
          <p className="text-center text-emerald-200 text-xs mt-2">
            {tier.ctaSubtext}
          </p>
        )}

        <div className={`h-px my-6 ${isPro ? "bg-emerald-500" : "bg-slate-100"}`} />

        {/* Features */}
        <ul className="flex flex-col gap-3 flex-1">
          {tier.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm">
              {feature.included ? (
                <CheckIcon isPro={isPro} />
              ) : (
                <CrossIcon />
              )}
              <span
                className={`leading-snug ${
                  !feature.included
                    ? "text-slate-300 line-through"
                    : feature.highlight
                    ? isPro
                      ? "text-white font-semibold"
                      : "text-slate-900 font-semibold"
                    : isPro
                    ? "text-emerald-100"
                    : "text-slate-600"
                }`}
              >
                {feature.text}
                {feature.note && (
                  <span
                    className={`ml-1.5 text-xs font-normal px-1.5 py-0.5 rounded-full ${
                      isPro
                        ? "bg-emerald-500 text-emerald-100"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {feature.note}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>

        {/* Free plan upgrade nudge */}
        {tier.id === "free" && (
          <p className="text-slate-400 text-xs text-center mt-6 leading-relaxed">
            Good to get started —{" "}
            <span className="text-slate-600 font-medium">
              but not enough when it really matters.
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

function CheckIcon({ isPro }: { isPro: boolean }) {
  return (
    <svg
      className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
        isPro ? "text-emerald-300" : "text-emerald-500"
      }`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg
      className="w-4 h-4 flex-shrink-0 mt-0.5 text-slate-200"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}