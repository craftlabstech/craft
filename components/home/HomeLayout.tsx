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
      {/* Full Background Effects */}
      <div className="absolute inset-0 bg-black"></div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20"></div>

        {/* Animated gradient orbs - larger for full screen */}
        <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/6 w-80 h-80 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-pink-500/8 to-blue-500/8 rounded-full blur-3xl animate-float delay-500"></div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

        {/* Subtle radial gradient for depth */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/20"></div>

        {/* Additional corner gradients for more depth */}
        <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-gradient-to-br from-blue-600/10 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-to-tl from-purple-600/10 to-transparent"></div>
      </div>

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
