import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-cream text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
