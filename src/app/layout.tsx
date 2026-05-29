// FILE: src/app/layout.tsx
// Replace your entire layout.tsx with this file.
// The big change is the "metadata" section — it's now much richer,
// which helps Google understand exactly what VuraPet is.

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import LegalFooter from "@/components/LegalFooter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ✅ This is the big SEO upgrade — much more detailed than before
export const metadata: Metadata = {
  // The title that shows in Google search results
  title: {
    default: "VuraPet — Your Pet's Lifetime Companion",
    template: "%s | VuraPet", // Other pages will show e.g. "Food Checker | VuraPet"
  },

  // The description shown under your title in Google
  description:
    "Track your pet's health, vaccines, nutrition, and memories — all in one place. Built in South Africa for pet parents everywhere. Free to start.",

  // Words Google uses to understand your site
  keywords: [
    "pet health tracker",
    "pet health app South Africa",
    "dog health records",
    "cat health tracker",
    "pet vaccination tracker",
    "pet nutrition South Africa",
    "vet records app",
    "pet wellness app",
    "dog safe food checker",
    "pet care South Africa",
    "VuraPet",
  ],

  // Your name as the creator
  authors: [{ name: "VuraPet", url: "https://vurapet.vercel.app" }],

  // Tells Google this is the real/official URL of your site
  metadataBase: new URL("https://vurapet.vercel.app"),
  alternates: {
    canonical: "/",
  },

  // Open Graph = how your site looks when shared on Facebook, WhatsApp, etc.
  openGraph: {
    title: "VuraPet — Your Pet's Lifetime Companion",
    description:
      "Track your pet's health, vaccines, nutrition, and memories. Free pet health app built in South Africa.",
    url: "https://vurapet.vercel.app",
    siteName: "VuraPet",
    locale: "en_ZA",
    type: "website",
  },

  // How your site looks when shared on Twitter/X
  twitter: {
    card: "summary_large_image",
    title: "VuraPet — Your Pet's Lifetime Companion",
    description:
      "Track your pet's health, vaccines, nutrition, and memories. Free pet health app built in South Africa.",
  },

  // Tells Google it's OK to index your site and follow links
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/icon.png" />
      </head>
      <body className="min-h-full flex flex-col bg-[#0c0a08] text-[#f0ebe4]">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <LegalFooter />
      </body>
    </html>
  );
}