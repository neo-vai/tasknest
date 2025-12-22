import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

interface ProjectMember {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  owner: { name?: string | null; email: string };
  _count: { tasks: number; members: number };
  members?: ProjectMember[];
}

export function useProjects() {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      if (!res.ok) return [];
      return (await res.json()) as Project[];
    },
    enabled: !!session?.user,
  });
}

export function useProject(projectId: string) {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) throw new Error("Project not found");
      return (await res.json()) as Project;
    },
    enabled: !!session?.user && !!projectId,
  });
}

export function useProjectMembers(projectId: string) {
  return useQuery({
    queryKey: ["project", projectId, "members"],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/members`);
      if (!res.ok) return [];
      return (await res.json()) as ProjectMember[];
    },
    enabled: !!projectId,
  });
}

export function useAddMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      email,
      role,
    }: {
      projectId: string;
      email: string;
      role: string;
    }) => {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to add member");
      }
      return res.json();
    },
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      userId,
    }: {
      projectId: string;
      userId: string;
    }) => {
      await fetch(`/api/projects/${projectId}/members/${userId}`, {
        method: "DELETE",
      });
    },
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      userId,
      role,
    }: {
      projectId: string;
      userId: string;
      role: string;
    }) => {
      const res = await fetch(
        `/api/projects/${projectId}/members/${userId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role }),
        }
      );
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update role");
      }
    },
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
  });
}