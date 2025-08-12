import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, Database, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Database Setup Required - Craft",
  description: "Database setup is required to continue",
};

export default function DatabaseSetupPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="mx-auto max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
          </div>
          <CardTitle className="text-xl font-semibold">
            Database Setup Required
          </CardTitle>
          <CardDescription>
            The database needs to be set up before you can sign in.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start space-x-2">
              <Database className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">For Developers:</p>
                <p>Run the following commands to set up your database:</p>
                <div className="mt-2 rounded bg-muted p-2 font-mono text-xs">
                  npm run db:migrate
                  <br />
                  npm run db:generate
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <ExternalLink className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">
                  Using Cloud Database:
                </p>
                <p>
                  Set up your database connection in your environment variables.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/">Return to Home</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/auth/signin">Try Again</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
