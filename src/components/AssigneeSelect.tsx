"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

interface MemberOption {
  id: string
  name: string | null
  email: string
}

interface AssigneeSelectProps {
  projectId: string
  value: string | null
  onChange: (assigneeId: string | null) => void
  disabled?: boolean
}

export function AssigneeSelect({ projectId, value, onChange, disabled }: AssigneeSelectProps) {
  const [members, setMembers] = useState<MemberOption[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/projects/${projectId}/members`)
      .then((res) => res.json())
      .then((data: MemberOption[]) => {
        setMembers(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [projectId])

  if (loading) {
    return <Skeleton className="h-8 w-full" />
  }

  return (
    <Select
      value={value || "unassigned"}
      onValueChange={(val) => onChange(val === "unassigned" ? null : val)}
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Unassigned" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="unassigned">Unassigned</SelectItem>
        {members.map((member) => (
          <SelectItem key={member.id} value={member.id}>
            {member.name || member.email}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}