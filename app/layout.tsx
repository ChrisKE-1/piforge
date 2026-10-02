import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Script from "next/script";

export const metadata: Metadata = {
  title: "PiForge – Verified Human + AI Work OS",
  description:
    "Earn Pi with your verified identity. Post trusted micro-tasks, AI data work, and local services on the Pi Network.",
  other: {
    "pi:app": "piforge",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Official Pi SDK – must load before any Pi calls */}
        <Script
          src="https://sdk.minepi.com/pi-sdk.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-6 pb-24">{children}</main>
        <footer className="border-t border-slate-900 py-8 text-center text-xs text-slate-600">
          <p>PiForge · Built for the Pi Network ecosystem · Identity-native work infrastructure</p>
          <p className="mt-1">Open in Pi Browser for full authentication & payments</p>
        </footer>
      </body>
    </html>
  );
}
