"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function TelegramLink() {
  const { data: session } = useSession();
  const [code, setCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [linked, setLinked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unlinking, setUnlinking] = useState(false);

  useEffect(() => {
    if (!session?.user) return;
    const fetchCode = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/user/telegram-link-code");
        const data = await res.json();
        if (res.ok) {
          setLinked(data.linked === true);
          if (data.code) {
            setCode(data.code);
            setExpiresAt(data.expiresAt);
          } else {
            setCode(null);
            setExpiresAt(null);
          }
        } else {
          setError(data.error || "Failed to load");
        }
      } catch {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    };
    fetchCode();
  }, [session?.user]);

  const generateCode = async () => {
    if (!session?.user) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/user/telegram-link-code", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setCode(data.code);
        setExpiresAt(data.expiresAt);
        setLinked(false);
      } else {
        setError(data.error || "Failed to generate code");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async () => {
    setUnlinking(true);
    setError("");
    try {
      const res = await fetch("/api/user/telegram", { method: "DELETE" });
      if (res.ok) {
        setLinked(false);
        setCode(null);
        setExpiresAt(null);
      } else {
        const data = await res.json().catch(() => ({ error: "Failed to unlink" }));
        setError(data.error || "Failed to unlink");
      }
    } catch {
      setError("Network error");
    } finally {
      setUnlinking(false);
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
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : linked ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              Your Telegram account is already linked.
            </p>
            <p className="text-xs text-muted-foreground">
              You will receive notifications through the bot{" "}
              {process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "TaskNestBot"}.
            </p>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleUnlink}
              disabled={unlinking}
            >
              {unlinking ? "Unlinking..." : "Unlink Telegram"}
            </Button>
          </div>
        ) : code ? (
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