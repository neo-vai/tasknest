"use client";

import { useState } from "react";
import { useUpdateTaskStatus } from "@/hooks/useTasks";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RiPlayFill, RiCheckFill, RiArrowGoBackLine } from "@remixicon/react";

interface TaskStatusActionsProps {
  taskId: string;
  status: string;
  canChangeStatus: boolean;
  canComplete?: boolean;
  size?: "sm" | "default";
}

export function TaskStatusActions({
  taskId,
  status,
  canChangeStatus,
  canComplete = true,
  size = "default",
}: TaskStatusActionsProps) {
  const updateStatusMutation = useUpdateTaskStatus();
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);

  const handleConfirm = () => {
    if (!pendingStatus) return;
    updateStatusMutation.mutate(
      { taskId, status: pendingStatus },
      {
        onSettled: () => setPendingStatus(null),
      }
    );
  };

  if (!canChangeStatus) return null;

  const btnSize = size === "sm" ? "xs" : "sm";
  const iconClass = size === "sm" ? "h-3 w-3" : "h-4 w-4";

  const confirmationTitle =
    pendingStatus === "IN_PROGRESS"
      ? "Start task?"
      : pendingStatus === "DONE"
        ? "Complete task?"
        : pendingStatus === "TODO"
          ? "Reopen task?"
          : "";

  const confirmationDescription =
    pendingStatus === "IN_PROGRESS"
      ? "This will move the task to In Progress."
      : pendingStatus === "DONE"
        ? "This will mark the task as Done."
        : pendingStatus === "TODO"
          ? "This will move the task back to To Do."
          : "";

  return (
    <>
      <div className="flex items-center gap-1.5">
        {status === "TODO" && (
          <Button
            size={btnSize}
            onClick={() => setPendingStatus("IN_PROGRESS")}
            className="gap-1"
          >
            <RiPlayFill className={iconClass} /> Start
          </Button>
        )}

        {status === "IN_PROGRESS" && (
          <>
            {canComplete && (
              <Button
                size={btnSize}
                variant="default"
                onClick={() => setPendingStatus("DONE")}
                className="gap-1"
              >
                <RiCheckFill className={iconClass} /> Complete
              </Button>
            )}
            <Button
              size={btnSize}
              variant="ghost"
              onClick={() => setPendingStatus("TODO")}
              className="text-muted-foreground"
            >
              <RiArrowGoBackLine className={iconClass} />
            </Button>
          </>
        )}

        {status === "DONE" && (
          <Button
            size={btnSize}
            variant="ghost"
            onClick={() => setPendingStatus("TODO")}
            className="text-muted-foreground"
          >
            <RiArrowGoBackLine className={iconClass} /> Reopen
          </Button>
        )}
      </div>

      <AlertDialog
        open={pendingStatus !== null}
        onOpenChange={(open) => {
          if (!open) setPendingStatus(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmationTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmationDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}