import type React from "react";
import "./globals.css";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "Craft",
  description: "Craft full-stack web apps by chatting with AI",
  icons: {
    icon: "/craft-logo.svg",
    shortcut: "/craft-logo.svg",
    apple: "/craft-logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-roboto antialiased`}>
        <SessionProvider>
          <ThemeProvider
            // attribute="class"
            defaultTheme="system"
            // enableSystem
            // disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
          <Analytics />
        </SessionProvider>
      </body>
    </html>
  );
}
