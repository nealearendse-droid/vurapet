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

export const metadata: Metadata = {
  title: {
    default: "VuraPet — Your Pet's Lifetime Companion",
    template: "%s | VuraPet",
  },
  description:
    "Track your pet's health, vaccines, nutrition, and memories — all in one place. Built in South Africa for pet parents everywhere. Free to start.",
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
  authors: [{ name: "VuraPet", url: "https://vurapet.vercel.app" }],
  metadataBase: new URL("https://vurapet.vercel.app"),
  alternates: {
    canonical: "/",
  },

  // ✅ THIS is the correct way to add Google verification in Next.js
  verification: {
    google: "O_jkjpxG3yC3-8YhUPGDRRnD3xNDBsAYXAlhlh1mq8A",
  },

  openGraph: {
    title: "VuraPet — Your Pet's Lifetime Companion",
    description:
      "Track your pet's health, vaccines, nutrition, and memories. Free pet health app built in South Africa.",
    url: "https://vurapet.vercel.app",
    siteName: "VuraPet",
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VuraPet — Your Pet's Lifetime Companion",
    description:
      "Track your pet's health, vaccines, nutrition, and memories. Free pet health app built in South Africa.",
  },
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
        {/* ✅ Remove the google meta tag from here — it's now in metadata above */}
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