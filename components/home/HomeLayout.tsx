"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "./Header";
import HeroSection from "./HeroSection";
import Footer from "./Footer";

export default function HomeLayout() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect authenticated users who haven't completed onboarding
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      console.log("HomeLayout - Detailed session data:", {
        status,
        userId: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
        emailVerified: session.user.emailVerified,
        emailVerifiedType: typeof session.user.emailVerified,
        emailVerifiedValue: session.user.emailVerified?.toString(),
        onboardingCompleted: session.user.onboardingCompleted,
        onboardingCompletedType: typeof session.user.onboardingCompleted,
      });

      // For authenticated users who haven't completed onboarding:
      // - OAuth users (Google/GitHub) have emailVerified automatically set, so they should proceed to onboarding
      // - Credential users need verified email before onboarding
      const shouldRedirectToOnboarding =
        !session.user.onboardingCompleted &&
        // OAuth users: emailVerified is set (Date object)
        (session.user.emailVerified instanceof Date ||
          // Credential users: emailVerified is truthy (not null/undefined)
          (session.user.emailVerified !== null &&
            session.user.emailVerified !== undefined));

      console.log("HomeLayout - Redirect decision:", {
        shouldRedirectToOnboarding,
        onboardingCompleted: session.user.onboardingCompleted,
        emailVerifiedInstanceOfDate: session.user.emailVerified instanceof Date,
        emailVerifiedTruthy:
          session.user.emailVerified !== null &&
          session.user.emailVerified !== undefined,
      });

      if (shouldRedirectToOnboarding) {
        console.log("HomeLayout - Redirecting to onboarding");
        router.push("/onboarding");
      }
    } else {
      console.log("HomeLayout - Session state:", {
        status,
        hasSession: !!session,
      });
    }
  }, [session, status, router]);

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
