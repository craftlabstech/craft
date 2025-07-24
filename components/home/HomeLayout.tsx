"use client";

import React from "react";
import { useSession } from "next-auth/react";
import Header from "./Header";
import HeroSection from "./HeroSection";
import Footer from "./Footer";

export default function HomeLayout() {
  const { data: session } = useSession();

  return (
    <div className="relative flex min-h-screen flex-col text-white overflow-hidden">
      {/* Content with relative positioning */}
      <div className="relative z-10 flex min-h-screen flex-col flex-1">
        {/* Header - always visible, full width from left corner */}
        <Header />

        {/* Main container for hero section - takes remaining height */}
        <div className="flex flex-1">
          {/* Main content - hero section takes full remaining height */}
          <main className="flex flex-col flex-1 items-center justify-center px-4">
            {/* Hero Section - centered in remaining space */}
            <HeroSection />
          </main>
        </div>
      </div>

      {/* Responsive Footer - with relative positioning */}
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
