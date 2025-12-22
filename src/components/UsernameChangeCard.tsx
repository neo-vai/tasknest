"use client";

import { useState } from "react";
import { useUserProfile, useUpdateUsername } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function UsernameChangeCard() {
  const { data: profile } = useUserProfile();
  const updateUsername = useUpdateUsername();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newName, setNewName] = useState(profile?.name || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUsername.mutate({ currentPassword, newName });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {updateUsername.isError && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {(updateUsername.error as Error)?.message}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="username-new">New username</Label>
        <Input
          id="username-new"
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="username-password">Current password</Label>
        <Input
          id="username-password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={updateUsername.isPending} className="w-full mt-2">
        {updateUsername.isPending ? "Saving..." : "Change Username"}
      </Button>
    </form>
  );
}