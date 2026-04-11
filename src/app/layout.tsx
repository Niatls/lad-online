import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { ChatWidgetWrapper } from "@/components/chat/chat-widget-wrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: "Лад — Психологические консультации",
  description: "Психологическая помощь. Консультирование при стрессах, депрессии, апатии, тревожных состояниях. Профессиональная поддержка вашего ментального здоровья.",
  keywords: ["психолог", "консультация", "депрессия", "тревога", "стресс", "ПТСР", "психологическая помощь"],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", sizes: "180x180", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Лад — Психологические консультации",
    description: "Ваше психическое здоровье — наша цель. Профессиональная психологическая помощь.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      suppressHydrationWarning
      style={
        {
          "--font-geist-sans": '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
          "--font-geist-mono": '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
        } as CSSProperties
      }
    >
      <body
        className="antialiased bg-cream text-foreground"
      >
        {children}
        <ChatWidgetWrapper />
      </body>
    </html>
  );
}
