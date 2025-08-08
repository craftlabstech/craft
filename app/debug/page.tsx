"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function DebugPage() {
  const { data: session, status } = useSession();
  const [debugData, setDebugData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkUserStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/debug/user-status");
      const data = await response.json();
      setDebugData(data);
    } catch (error) {
      console.error("Error checking user status:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetOnboarding = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/debug/user-status", {
        method: "POST",
      });
      const data = await response.json();
      console.log("Reset result:", data);
      // Refresh the status
      await checkUserStatus();
    } catch (error) {
      console.error("Error resetting onboarding:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Please sign in to use this debug page.</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Debug: OAuth Onboarding Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Session Data:</h3>
            <pre className="text-sm bg-gray-100 p-2 rounded">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>

          <div className="space-x-2">
            <Button onClick={checkUserStatus} disabled={loading}>
              Check Database Status
            </Button>
            <Button
              onClick={resetOnboarding}
              disabled={loading}
              variant="destructive"
            >
              Reset Onboarding Status
            </Button>
          </div>

          {debugData && (
            <div>
              <h3 className="font-semibold">Database Data:</h3>
              <pre className="text-sm bg-gray-100 p-2 rounded">
                {JSON.stringify(debugData, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
