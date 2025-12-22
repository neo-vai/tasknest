"use client";

import { useState } from "react";
import { useCreateTask } from "@/hooks/useTasks";
import { useProjectMembers } from "@/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AssigneeSelect } from "@/components/AssigneeSelect";

export function NewTaskForm({ projectId }: { projectId: string }) {
  const createTask = useCreateTask();
  const { data: members, isLoading: membersLoading } = useProjectMembers(projectId);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTask.mutate(
      {
        projectId,
        title: title.trim(),
        description: description.trim(),
        assigneeId,
      },
      {
        onSuccess: () => {
          setTitle("");
          setDescription("");
          setAssigneeId(null);
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Task</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {createTask.isError && (
            <p className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">
              {(createTask.error as Error)?.message || "Failed to create task"}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-desc">Description</Label>
            <Textarea
              id="task-desc"
              placeholder="Optional description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Assignee</Label>
            <AssigneeSelect
              projectId={projectId}
              value={assigneeId}
              onChange={setAssigneeId}
              disabled={createTask.isPending}
              members={members?.map((m) => ({ id: m.id, name: m.name, email: m.email })) ?? []}
              loading={membersLoading}
            />
          </div>
        </CardContent>
        <CardContent>
          <Button
            type="submit"
            disabled={createTask.isPending || !title.trim()}
            className="w-full"
          >
            {createTask.isPending ? "Adding..." : "Add Task"}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}