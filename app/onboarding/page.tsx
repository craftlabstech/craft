"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  User,
  Briefcase,
  Building,
  ArrowRight,
  ArrowLeft,
  Camera,
} from "lucide-react";
import ProfilePictureUpload from "@/components/profile-picture-upload";

export default function Onboarding() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(0); // Start from 0 for profile picture
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    bio: "",
    occupation: "",
    company: "",
  });

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    if (session.user?.onboardingCompleted) {
      router.push("/");
      return;
    }

    // Auto-skip profile picture step for OAuth users
    const hasOAuthImage = Boolean(
      session.user?.image &&
        (session.user.image.includes("avatars.githubusercontent.com") ||
          session.user.image.includes("lh3.googleusercontent.com"))
    );

    if (hasOAuthImage && step === 0) {
      setStep(1);
    }
  }, [session, router, step]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bio: formData.bio,
          occupation: formData.occupation,
          company: formData.company,
        }),
      });

      if (response.ok) {
        // Update session
        await update();
        router.push("/");
      } else {
        console.error("Failed to complete onboarding");
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return null;
  }

  const totalSteps = 4; // Updated to include profile picture step

  // Check if user has OAuth provider (don't show profile upload for OAuth users)
  const hasOAuthImage = Boolean(
    session.user?.image &&
      (session.user.image.includes("avatars.githubusercontent.com") ||
        session.user.image.includes("lh3.googleusercontent.com"))
  );

  // Skip profile picture step for OAuth users
  const shouldSkipProfileStep = hasOAuthImage;
  const effectiveStep = shouldSkipProfileStep && step === 0 ? 1 : step;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Welcome to Craft!</CardTitle>
          <p className="text-muted-foreground">
            Let&apos;s set up your profile to get started
          </p>
          <div className="flex justify-center mt-4">
            <div className="flex space-x-2">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`h-2 w-8 rounded-full ${
                    i + 1 <= step ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {effectiveStep === 0 && !shouldSkipProfileStep && (
            <div className="space-y-6">
              <div className="text-center">
                <Camera className="h-12 w-12 mx-auto text-primary mb-4" />
                <h3 className="text-xl font-semibold">Add a profile picture</h3>
                <p className="text-muted-foreground">
                  Upload a photo to personalize your profile (optional)
                </p>
              </div>

              <div className="flex justify-center">
                <ProfilePictureUpload className="w-full max-w-sm" />
              </div>
            </div>
          )}

          {effectiveStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <User className="h-12 w-12 mx-auto text-primary mb-4" />
                <h3 className="text-xl font-semibold">
                  Tell us about yourself
                </h3>
                <p className="text-muted-foreground">
                  Share a bit about who you are and what you do
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Bio</label>
                  <Textarea
                    placeholder="Tell us about yourself, your interests, and what brings you to Craft..."
                    value={formData.bio}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      handleInputChange("bio", e.target.value)
                    }
                    rows={4}
                  />
                </div>
              </div>
            </div>
          )}

          {effectiveStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <Briefcase className="h-12 w-12 mx-auto text-primary mb-4" />
                <h3 className="text-xl font-semibold">What do you do?</h3>
                <p className="text-muted-foreground">
                  Help us understand your professional background
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Occupation/Role
                  </label>
                  <Input
                    placeholder="e.g., Software Developer, Designer, Product Manager..."
                    value={formData.occupation}
                    onChange={(e) =>
                      handleInputChange("occupation", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {effectiveStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <Building className="h-12 w-12 mx-auto text-primary mb-4" />
                <h3 className="text-xl font-semibold">Where do you work?</h3>
                <p className="text-muted-foreground">
                  Tell us about your company or organization
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Company (Optional)
                  </label>
                  <Input
                    placeholder="e.g., Google, Freelancer, Startup XYZ..."
                    value={formData.company}
                    onChange={(e) =>
                      handleInputChange("company", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 0 || (shouldSkipProfileStep && step === 1)}
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {effectiveStep < 3 ? (
              <Button onClick={handleNext} className="flex items-center">
                {effectiveStep === 0 ? "Skip" : "Next"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={isLoading}
                className="flex items-center"
              >
                {isLoading ? "Completing..." : "Complete Setup"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>

          {effectiveStep === 3 && (
            <div className="text-center text-sm text-muted-foreground">
              You can always update your profile later in settings
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
