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
  description: "Track your pet's health, vaccines, nutrition, and memories — all in one place. Built in South Africa for pet parents everywhere. Free to start.",
  keywords: ["pet health tracker","pet health app South Africa","dog health records","cat health tracker","pet vaccination tracker","pet nutrition South Africa","vet records app","pet wellness app","dog safe food checker","pet care South Africa","VuraPet"],
  authors: [{ name: "VuraPet", url: "https://vurapet.vercel.app" }],
  metadataBase: new URL("https://vurapet.vercel.app"),
  alternates: { canonical: "/" },
  verification: { google: "O_jkjpxG3yC3-8YhUPGDRRnD3xNDBsAYXAlhlh1mq8A" },
  openGraph: {
    title: "VuraPet — Your Pet's Lifetime Companion",
    description: "Track your pet's health, vaccines, nutrition, and memories. Free pet health app built in South Africa.",
    url: "https://vurapet.vercel.app",
    siteName: "VuraPet",
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VuraPet — Your Pet's Lifetime Companion",
    description: "Track your pet's health, vaccines, nutrition, and memories. Free pet health app built in South Africa.",
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "VuraPet",
  },
  icons: {
    apple: "/icons/icon192.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0c0a08] text-[#f0ebe4]">
        <script dangerouslySetInnerHTML={{ __html: "!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','1649857192966638');fbq('track','PageView');" }} />
        <Navbar />
        <main className="flex-1">{children}</main>
        <LegalFooter />
        <script dangerouslySetInnerHTML={{ __html: "if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').then(function(reg){console.log('VuraPet SW registered');}).catch(function(err){console.log('VuraPet SW failed: ',err);});});}" }} />
      </body>
    </html>
  );
}