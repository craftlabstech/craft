"use client";

import React from "react";
import { useSession } from "next-auth/react";
import Header from "./Header";
import HeroSection from "./HeroSection";
import Footer from "./Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HomeLayout() {
  const { data: session } = useSession();

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground overflow-hidden">
      {/* Content with relative positioning */}
      <div className="relative z-10 flex min-h-screen flex-col flex-1">
        {/* Header - always visible, full width from left corner */}
        <Header />

        {/* Main container for hero section - takes remaining height */}
        <div className="flex flex-1">
          {/* Main content - hero section takes full remaining height */}
          <main className="flex flex-col flex-1 items-center justify-center w-full px-4">
            {/* Hero Section - centered in remaining space */}
            <HeroSection />

            {/* Show dashboard link for authenticated users */}
            {session && session.user?.onboardingCompleted && (
              <div className="mt-8">
                <Link href="/dashboard">
                  <Button className="flex items-center">
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Responsive Footer - with relative positioning */}
      <div className="relative">
        <Footer />
      </div>
    </div>
  );
}
