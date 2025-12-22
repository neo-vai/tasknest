"use client";

import { useProjectMembers, useUpdateMemberRole, useRemoveMember } from "@/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { RiDeleteBinLine } from "@remixicon/react";

interface Member {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

interface MemberListProps {
  projectId: string;
  currentUserId: string;
  currentUserRole: string | null;
}

export function MemberList({
  projectId,
  currentUserId,
  currentUserRole,
}: MemberListProps) {
  const { data: members, isLoading } = useProjectMembers(projectId);
  const updateRoleMutation = useUpdateMemberRole();
  const removeMemberMutation = useRemoveMember();

  const canManage = currentUserRole === "OWNER" || currentUserRole === "MANAGER";

  const updateRole = (userId: string, newRole: string) => {
    updateRoleMutation.mutate({ projectId, userId, role: newRole });
  };

  const removeMember = (userId: string) => {
    removeMemberMutation.mutate({ projectId, userId });
  };

  if (isLoading) {
    return <LoadingSkeleton className="h-32" />;
  }

  if (!members || members.length === 0) {
    return <EmptyState message="No members found." />;
  }

  return (
    <div className="space-y-3">
      {members.map((member) => {
        const isOwner = member.role === "OWNER";
        const isSelf = member.id === currentUserId;
        const canEditRole = canManage && !isOwner && !(isSelf && currentUserRole === "OWNER");
        const canRemove = canManage && !isOwner && !(isSelf && currentUserRole === "OWNER");

        return (
          <div
            key={member.id}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium">
                {member.name?.[0] || member.email[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm truncate font-medium">
                  {member.name || member.email}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {member.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {canEditRole ? (
                <Select
                  value={member.role || "MEMBER"}
                  onValueChange={(val) => updateRole(member.id, val)}
                  disabled={updateRoleMutation.isPending}
                >
                  <SelectTrigger className="w-28 h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEMBER">Member</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="VIEWER">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant={isOwner ? "secondary" : "outline"} className="text-xs">
                  {member.role}
                </Badge>
              )}
              {canRemove && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <RiDeleteBinLine className="h-3.5 w-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove member</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to remove {member.name || member.email} from this project?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => removeMember(member.id)}>
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}