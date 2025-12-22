"use client";

import { useUpdateTaskAssignee } from "@/hooks/useTasks";
import { AssigneeSelect } from "./AssigneeSelect";

interface AssigneeSelectorProps {
  projectId: string;
  taskId: string;
  currentAssigneeId: string | null;
  canChange: boolean;
}

export function AssigneeSelector({
  projectId,
  taskId,
  currentAssigneeId,
  canChange,
}: AssigneeSelectorProps) {
  const mutation = useUpdateTaskAssignee();

  const handleChange = (newAssigneeId: string | null) => {
    mutation.mutate({ taskId, assigneeId: newAssigneeId });
  };

  return (
    <AssigneeSelect
      projectId={projectId}
      value={currentAssigneeId}
      onChange={handleChange}
      disabled={!canChange || mutation.isPending}
    />
  );
}