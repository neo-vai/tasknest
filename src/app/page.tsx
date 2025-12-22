"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import {
  RiTeamLine,
  RiTaskLine,
  RiShieldCheckLine,
  RiArrowRightLine,
  RiGithubFill,
  RiRobot2Line,
  RiFlashlightLine,
  RiUserStarLine,
} from "@remixicon/react"

const features = [
  {
    icon: RiTaskLine,
    title: "Granular task management",
    description: "Create, assign, and track tasks with statuses from To Do to Done. Role-based permissions control every action.",
  },
  {
    icon: RiTeamLine,
    title: "Team collaboration",
    description: "Invite members, assign roles (Owner, Manager, Member, Viewer), and work together in real time.",
  },
  {
    icon: RiRobot2Line,
    title: "Telegram notifications",
    description: "Link your Telegram account to receive instant updates — task assignments, completions, and project changes.",
  },
  {
    icon: RiFlashlightLine,
    title: "Real-time updates",
    description: "Server-Sent Events keep every client in perfect sync without polling. Optimistic UI makes it feel instant.",
  },
  {
    icon: RiShieldCheckLine,
    title: "Secure & auditable",
    description: "Credentials auth with bcrypt + JWT. Email change cooldown prevents abuse. Full notification preferences.",
  },
  {
    icon: RiUserStarLine,
    title: "Powerful search",
    description: "Debounced full‑text search across projects and tasks. Command‑palette style instant results.",
  },
]

const steps = [
  { step: "01", title: "Create a project", description: "Spin up a workspace with a name and description — your team's ground truth." },
  { step: "02", title: "Add and assign tasks", description: "Break work into actionable pieces, set assignees, and define the workflow." },
  { step: "03", title: "Ship with confidence", description: "Move tasks through stages, get real‑time notifications, and celebrate done work." },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

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
        <section className="relative overflow-hidden border-b border-border py-20 md:py-28">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative mx-auto max-w-4xl px-6 text-center"
          >
            <Badge variant="secondary" className="mb-6 gap-1.5 px-3 py-1 text-xs">
              <RiFlashlightLine className="h-3 w-3" />
              Internal tool for high‑performance teams
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Clarity and speed for
              <br />
              your project workflows
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
              TaskNest is the lightweight project tracker that keeps your entire team aligned — from idea to delivery.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Link href="/register">
                <Button size="sm" className="gap-1.5">
                  Start your workspace
                  <RiArrowRightLine className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Sign in
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Features (bento grid) */}
        <section className="border-b border-border py-20 md:py-24">
          <div className="mx-auto max-w-6xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                Built for how modern teams really work
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Every feature designed to reduce friction and increase transparency.
              </p>
            </motion.div>
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {features.map(({ icon: Icon, title, description }) => (
                <motion.div key={title} variants={item}>
                  <Card className="h-full border border-border hover:border-primary/30 transition-colors duration-300">
                    <CardContent className="flex flex-col items-start gap-4 p-5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">{title}</h3>
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                          {description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-b border-border py-20 md:py-24">
          <div className="mx-auto max-w-6xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                Start shipping in minutes
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Three simple steps to transform how your team delivers.
              </p>
            </motion.div>
            <div className="grid gap-8 md:grid-cols-3">
              {steps.map(({ step, title, description }, index) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative rounded-xl border border-border bg-card p-6"
                >
                  <span className="text-xs font-mono text-muted-foreground">{step}</span>
                  <h3 className="mt-3 text-sm font-semibold">{title}</h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 md:py-24">
          <div className="mx-auto max-w-5xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="overflow-hidden border-0 bg-muted/50">
                <CardContent className="flex flex-col items-center gap-6 py-12 text-center sm:flex-row sm:justify-between sm:text-left">
                  <div>
                    <h2 className="text-xl font-bold md:text-2xl">
                      Ready to align your team?
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Deploy TaskNest internally and start shipping with clarity today.
                    </p>
                  </div>
                  <Link href="/register">
                    <Button size="sm" className="gap-1.5">
                      Set up your workspace
                      <RiArrowRightLine className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
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
            <a href="https://github.com/neo-vai" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              <RiGithubFill className="h-4 w-4" />
            </a>
            <span>&copy; {new Date().getFullYear()} TaskNest</span>
          </div>
        </div>
      </footer>
    </div>
  )
}