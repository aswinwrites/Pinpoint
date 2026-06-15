import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { ServiceWorkerRegistrar } from "./sw-register";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "PinPoint – Never Lose Your Vehicle Again",
  description:
    "Save your parking spot with one tap. Works offline. No account needed. Navigate back instantly.",
  keywords: ["parking", "vehicle", "location", "GPS", "car parking", "find my car"],
  authors: [{ name: "PinPoint" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PinPoint",
  },
  openGraph: {
    title: "PinPoint – Never Lose Your Vehicle Again",
    description: "Save your parking spot with one tap. Works offline.",
    type: "website",
    siteName: "PinPoint",
  },
  twitter: {
    card: "summary",
    title: "PinPoint – Never Lose Your Vehicle Again",
    description: "Save your parking spot with one tap. Works offline.",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-apple-touch.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#4f46e5",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#4f46e5" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="PinPoint" />
        <meta name="msapplication-TileColor" content="#4f46e5" />
      </head>
      <body style={{ minHeight: "100dvh", background: "#07071a" }}>
        <ToastProvider>
          <ServiceWorkerRegistrar />
          <div className="max-w-md mx-auto min-h-screen flex flex-col">
            {children}
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
