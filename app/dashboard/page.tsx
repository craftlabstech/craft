"use client";

import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { User, Mail } from "lucide-react";

export default function Dashboard() {
  const { data: session } = useSession();

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome to your Dashboard!</h1>
          <p className="text-muted-foreground mt-2">
            Your authentication setup is complete.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              {session.user?.image && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={session.user.image}
                    alt="Profile"
                    className="w-16 h-16 rounded-full"
                  />
                </>
              )}
              <div>
                <h3 className="text-lg font-semibold">{session.user?.name}</h3>
                <p className="text-muted-foreground flex items-center">
                  <Mail className="w-4 h-4 mr-1" />
                  {session.user?.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Signed In:</span>
                  <span className="text-green-600">✓ Yes</span>
                </div>
                <div className="flex justify-between">
                  <span>Onboarding Complete:</span>
                  <span className="text-green-600">
                    {session.user?.onboardingCompleted ? "✓ Yes" : "✗ No"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✓ Google OAuth Authentication</li>
                <li>✓ GitHub OAuth Authentication</li>
                <li>✓ Email + Magic Link Authentication</li>
                <li>✓ User Onboarding Flow</li>
                <li>✓ Protected Routes</li>
                <li>✓ Session Management</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button onClick={() => signOut()} variant="outline">
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
