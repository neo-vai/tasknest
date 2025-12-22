import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  RiTeamLine,
  RiTaskLine,
  RiLineChartLine,
  RiShieldCheckLine,
  RiArrowRightLine,
  RiGithubFill,
} from "@remixicon/react"

const features = [
  {
    icon: RiTaskLine,
    title: "Task management",
    description: "Create, assign, and track tasks across projects. Set statuses from To Do to Done.",
  },
  {
    icon: RiTeamLine,
    title: "Team collaboration",
    description: "Invite members, set roles, and work together in real-time on shared projects.",
  },
  {
    icon: RiLineChartLine,
    title: "Progress tracking",
    description: "Monitor project health with built-in stats and task completion insights.",
  },
  {
    icon: RiShieldCheckLine,
    title: "Secure access",
    description: "Role-based permissions ensure the right people see the right information.",
  },
]

const steps = [
  { step: "01", title: "Create a project", description: "Set up a workspace with a name and description." },
  { step: "02", title: "Add tasks", description: "Break work into actionable tasks and assign them to your team." },
  { step: "03", title: "Track progress", description: "Move tasks through stages and deliver on time." },
]

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b border-border px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
            T
          </div>
          <span className="text-sm font-semibold">TaskNest</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="h-8 text-xs">
              Sign in
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="h-8 text-xs">
              Get started
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-border py-16 md:py-24">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Manage projects with
              <br />
              clarity and speed
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
              TaskNest is a lightweight project tracker for teams who value simplicity.
              Organize work, assign tasks, and ship faster.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Link href="/register">
                <Button size="sm" className="gap-1.5">
                  Sign up
                  <RiArrowRightLine className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Sign in
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-b border-border py-16 md:py-20">
          <div className="mx-auto max-w-5xl px-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                Everything your team needs
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Simple tools for effective project delivery.
              </p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex flex-col items-center text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-5 w-5 text-foreground" />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold">{title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-b border-border py-16 md:py-20">
          <div className="mx-auto max-w-5xl px-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                How it works
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Get up and running in under a minute.
              </p>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              {steps.map(({ step, title, description }) => (
                <div key={step} className="relative">
                  <span className="text-xs font-mono text-muted-foreground">{step}</span>
                  <h3 className="mt-2 text-sm font-semibold">{title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-5xl px-6">
            <Card className="overflow-hidden border-0 bg-muted/50">
              <CardContent className="flex flex-col items-center gap-4 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
                <div>
                  <h2 className="text-lg font-bold md:text-xl">
                    Ready to streamline your workflow?
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Join teams already shipping with TaskNest.
                  </p>
                </div>
                <Link href="/register">
                  <Button size="sm" className="gap-1.5">
                    Get started free
                    <RiArrowRightLine className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="mx-auto max-w-5xl px-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs font-bold text-primary-foreground">
              T
            </div>
            <span className="text-xs text-muted-foreground">TaskNest</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <a href="https://github.com" className="hover:text-foreground transition-colors">
              <RiGithubFill className="h-4 w-4" />
            </a>
            <span>&copy; {new Date().getFullYear()} TaskNest</span>
          </div>
        </div>
      </footer>
    </div>
  )
}