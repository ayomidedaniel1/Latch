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
  title: "Latch | Webhook Ledger & Replay Engine",
  description:
    "The ultimate ledger, tunnel, and replay engine for developers who ship. Monitor, inspect, and route your webhooks with zero friction.",
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
      <body className="min-h-full flex flex-col bg-[#000000] text-[#e5e1e4] font-sans selection:bg-[#10b981]/20 selection:text-[#10b981]">
        {children}
      </body>
    </html>
  );
}
