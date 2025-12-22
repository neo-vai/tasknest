"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { DashboardShell } from "@/components/layout/DashboardShell"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RiArrowLeftLine } from "@remixicon/react"

export default function NewProjectPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    })

    if (res.ok) {
      const project = await res.json()
      router.push(`/projects/${project.id}`)
    } else {
      const data = await res.json()
      setError(data.error || "Failed to create project")
    }
    setLoading(false)
  }

  return (
    <DashboardShell>
      <div className="mx-auto max-w-2xl space-y-8">
        <PageHeader
          title="New Project"
          description="Create a new project for your team"
        >
          <Link href="/projects">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <RiArrowLeftLine className="h-4 w-4" />
              Back to projects
            </Button>
          </Link>
        </PageHeader>

        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Provide a name and optional description for your new project.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  placeholder="My awesome project"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of what this project is about..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
            <CardContent>
              <Button type="submit" disabled={loading || !name.trim()} className="w-full">
                {loading ? "Creating..." : "Create Project"}
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>
    </DashboardShell>
  )
}