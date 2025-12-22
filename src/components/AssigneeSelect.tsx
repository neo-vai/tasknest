"use client"

import { useEffect, useState } from "react"
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
  members?: MemberOption[]
  loading?: boolean
}

export function AssigneeSelect({
  projectId,
  value,
  onChange,
  disabled,
  members: externalMembers,
  loading: externalLoading,
}: AssigneeSelectProps) {
  const [internalMembers, setInternalMembers] = useState<MemberOption[]>([])
  const [internalLoading, setInternalLoading] = useState(!externalMembers)

  useEffect(() => {
    if (externalMembers !== undefined) {
      setInternalMembers(externalMembers)
      setInternalLoading(false)
      return
    }

    let cancelled = false
    setInternalLoading(true)
    fetch(`/api/projects/${projectId}/members`)
      .then((res) => res.json())
      .then((data: MemberOption[]) => {
        if (!cancelled) {
          setInternalMembers(data)
          setInternalLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) setInternalLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [projectId, externalMembers])

  const isLoading = externalMembers !== undefined ? externalLoading : internalLoading

  if (isLoading) {
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
        {internalMembers.map((member) => (
          <SelectItem key={member.id} value={member.id}>
            {member.name || member.email}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}