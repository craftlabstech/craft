import type React from "react";
import "./globals.css";
import type { Metadata } from "next";
import { Knewave } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "CraftJS - AI Website Generator",
  description: "Create beautiful websites with AI in seconds",
};

const knewave = Knewave({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-knewave",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${knewave.variable} font-geist antialiased`}>
        <ThemeProvider
          // attribute="class"
          defaultTheme="system"
          // enableSystem
          // disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
