import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://latch-wheat.vercel.app"),
  title: "Latch | Capture, Inspect, and Replay Webhooks Instantly",
  description:
    "A developer-first, permanent webhook ledger. Connect any third-party service or custom API in seconds. Built-in tunnel, zero lost events, infinite one-click replays.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-surface-container-lowest text-on-background">
        {children}
      </body>
    </html>
  );
}
