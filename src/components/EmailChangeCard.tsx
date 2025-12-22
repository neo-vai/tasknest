"use client";

import { useState, useEffect } from "react";
import { useUserProfile, useUpdateEmail } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function EmailChangeCard() {
  const { data: profile } = useUserProfile();
  const updateEmail = useUpdateEmail();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState(profile?.email || "");
  const [cooldownDays, setCooldownDays] = useState<number | null>(null);

  useEffect(() => {
    if (profile?.lastEmailChange) {
      const now = Date.now();
      const last = new Date(profile.lastEmailChange).getTime();
      const cooldownMs = 7 * 24 * 60 * 60 * 1000;
      const diff = now - last;
      if (diff < cooldownMs) {
        const remaining = Math.ceil((cooldownMs - diff) / (1000 * 60 * 60 * 24));
        setCooldownDays(remaining);
      } else {
        setCooldownDays(null);
      }
    } else {
      setCooldownDays(null);
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmail.mutate({ currentPassword, newEmail });
  };

  const isDisabled = cooldownDays !== null || updateEmail.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {updateEmail.isError && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {(updateEmail.error as Error)?.message}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email-new">New email</Label>
        <Input
          id="email-new"
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          required
          disabled={cooldownDays !== null}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email-password">Current password</Label>
        <Input
          id="email-password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          disabled={cooldownDays !== null}
        />
      </div>
      {cooldownDays !== null && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          You can change your email again in {cooldownDays} day(s).
        </div>
      )}
      <Button type="submit" disabled={isDisabled} className="w-full mt-2">
        {updateEmail.isPending ? "Saving..." : "Change Email"}
      </Button>
    </form>
  );
}