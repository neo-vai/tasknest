"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function TelegramLinkDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: session } = useSession();
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setCode(null);
      setError("");
      setLoading(false);
    }
  }, [open]);

  const generateCode = async () => {
    if (!session?.user) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/user/telegram-link-code", {
        method: "POST",
      });
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

  const botUsername =
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "TaskNestBot";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Telegram Notifications</DialogTitle>
          <DialogDescription>
            Link your Telegram account to receive instant notifications from
            TaskNest.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {code ? (
            <>
              <p className="text-sm">
                Your linking code:{" "}
                <span className="font-mono font-bold text-lg">{code}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                1. Open Telegram and find our bot{" "}
                <span className="font-medium">{botUsername}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                2. Send the command:
              </p>
              <div className="bg-muted p-2 rounded-md font-mono text-sm">
                /link {code}
              </div>
              <p className="text-xs text-muted-foreground">
                This code expires in 10 minutes.
              </p>
            </>
          ) : (
            <Button
              onClick={generateCode}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Generating..." : "Generate Linking Code"}
            </Button>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}