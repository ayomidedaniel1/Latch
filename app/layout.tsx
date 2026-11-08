import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://latch-wheat.vercel.app"),
  title: "Latch | Capture, Inspect, and Replay Webhooks Instantly",
  description:
    "A developer-first, permanent webhook ledger. Connect any third-party service or custom API in seconds. No tunnels, no lost events, infinite one-click replays.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-latch-bg text-latch-primary">
        {children}
      </body>
    </html>
  );
}
