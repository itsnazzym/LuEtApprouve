import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Inter } from "next/font/google";
import "./globals.css";
// Navigation component for global app structure
import Navigation from "@/components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"),
  title: "LuEtApprouvé - Comprends les règles",
  description: "Scanner de CGU et politiques de confidentialité pour comprendre leurs implications",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { url: "/favicon.ico" },
    ],
  },
  openGraph: {
    title: "LuEtApprouvé - Comprends les règles",
    description: "Scanner de CGU et politiques de confidentialité pour comprendre leurs implications",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <head>
        <title>LuEtApprouvé</title>
        <meta name="description" content="Scanner" />
        <meta property="og:title" content="LuEtApprouvé" />
        <meta property="og:description" content="Scanner" />
        <link href="https://cdn.jsdelivr.net/npm/harmonyos-sans-webfont-splitted@1.1.0/css/harmonyos-sans.css" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Navigation />
        <main className="flex-grow flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
