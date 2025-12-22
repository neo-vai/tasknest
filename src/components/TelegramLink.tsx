"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function TelegramLink() {
  const { data: session } = useSession();
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateCode = async () => {
    if (!session?.user) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/user/telegram-link-code", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setCode(data.code);
      } else {
        setError(data.error || "Failed to generate code");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Telegram Notifications</CardTitle>
        <CardDescription>
          Link your Telegram account to receive instant notifications.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {code ? (
          <div className="space-y-2">
            <p className="text-sm">
              Your linking code: <span className="font-mono font-bold text-lg">{code}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Go to our Telegram bot ({process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "TaskNestBot"}) and send:
            </p>
            <p className="font-mono text-sm bg-muted p-2 rounded">
              /link {code}
            </p>
            <p className="text-xs text-muted-foreground">
              This code expires in 10 minutes.
            </p>
          </div>
        ) : (
          <Button onClick={generateCode} disabled={loading}>
            {loading ? "Generating..." : "Link Telegram"}
          </Button>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}