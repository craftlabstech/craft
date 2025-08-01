import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Mail } from "lucide-react";

export default function VerifyRequest() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Check your email</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <Mail className="h-12 w-12 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">
            A sign-in link has been sent to your email address.
          </p>
          <p className="text-sm text-muted-foreground">
            Click the link in the email to sign in to your account.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
