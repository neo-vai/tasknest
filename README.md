# 🐣 TaskNest

> **Lightweight project & task manager for teams who value clarity and speed.**

Built with modern web technologies, real-time updates, and Telegram notifications — a perfect showcase of full‑stack skills.

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2-black?logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Prisma-7.8-2D3748?logo=prisma" alt="Prisma">
  <img src="https://img.shields.io/badge/PostgreSQL-18.3-4169E1?logo=postgresql" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/TailwindCSS-4.3-38BDF8?logo=tailwindcss" alt="TailwindCSS">
  <img src="https://img.shields.io/badge/shadcn/ui-radix-000?logo=shadcnui" alt="shadcn/ui">
  <img src="https://img.shields.io/badge/Docker-✓-2496ED?logo=docker" alt="Docker">
</p>

---

## ✨ Features

- **Projects & Tasks** – Create projects, break work into tasks, assign team members, and track progress through stages (To Do → In Progress → Done).
- **Team roles** – Owner, Manager, Member, Viewer with fine‑grained permissions.
- **Real‑time updates** – Server‑Sent Events (SSE) keep every client in sync instantly.
- **Smart notifications** – In‑app bell + Telegram bot integration. Users control which events they receive.
- **Full‑text search** – Quickly find projects and tasks with a command palette‑like search bar.
- **Dark / Light / System theme** – Looks great in any color scheme.
- **Secure authentication** – Credentials‑based auth with NextAuth.js, bcrypt hashing, and JWT sessions.
- **Email & username management** – Change display name or email (with cooldown for security).
- **Docker‑first** – Production‑ready `docker-compose` setup with PostgreSQL, Next.js, Telegram bot, and Caddy reverse proxy.

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Database** | PostgreSQL + Prisma ORM |
| **UI** | Tailwind CSS 4 + shadcn/ui (Radix) |
| **Auth** | NextAuth.js v5 (Credentials + JWT) |
| **Real‑time** | Server‑Sent Events (custom SSE) |
| **Notifications** | Multi‑channel dispatcher (In‑App + Telegram) |
| **Bot** | Grammy (Telegram Bot API) |
| **State** | TanStack Query (React Query) |
| **Validation** | Zod |
| **Proxy** | Caddy (auto‑HTTPS) |
| **Containerization** | Docker & Docker Compose |

---

## 📸 Screenshots

| Dashboard | Project View |
|:---------:|:------------:|
| ![Dashboard](https://placehold.co/600x400?text=Dashboard) | ![Project](https://placehold.co/600x400?text=Project+View) |

| Notifications | Telegram Link |
|:------------:|:-------------:|
| ![Notifications](https://placehold.co/600x400?text=Notifications) | ![Telegram](https://placehold.co/600x400?text=Telegram+Link) |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) ≥ 20
- [Docker](https://docker.com) and Docker Compose (for production mode)
- [PostgreSQL](https://www.postgresql.org/) (if running without Docker)

### 1. Clone & install

```bash
git clone https://github.com/your-username/tasknest.git
cd tasknest
cp .env.example .env
# fill in the required environment variables (see below)
```

### 2. Environment variables

Edit `.env` with your own values:

```
# Database
DATABASE_URL="postgresql://user:password@db:5432/tasknest?schema=public"
DB_USER=user
DB_PASSWORD=password
DB_NAME=tasknest
DB_PORT=5432

# Auth
AUTH_SECRET="your-secret-here"

# Telegram Bot (optional, for Telegram notifications)
TELEGRAM_BOT_TOKEN="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
TELEGRAM_LINK_SECRET="another-secret"
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME="YourTaskNestBot"

# App URL (used by bot for linking)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Telegram Bot internal send API (used by Next.js to push messages)
TELEGRAM_BOT_INTERNAL_HOST="http://bot"
TELEGRAM_BOT_INTERNAL_PORT="4000"
```

### 3. Run with Docker (recommended)

```bash
docker compose up -d
```

This starts:

- `db` → PostgreSQL 18
- `nextjs` → Next.js production server (port 3000 internally, exposed via Caddy)
- `bot` → Telegram bot long‑polling
- `caddy` → reverse proxy (port 80/443)

The app will be available at `http://localhost`.

### 4. Run locally (development)

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev        # starts Next.js dev server
npm run bot        # starts Telegram bot
```

Visit `http://localhost:3000`.

---

## 📁 Project Structure

```
src/
├── app/           # Next.js App Router pages & API routes
├── components/    # Reusable UI components (shadcn/ui + custom)
├── hooks/         # TanStack Query hooks & SSE listener
├── lib/           # Prisma client, SSE manager, notifications, utilities
├── bot/           # Telegram bot (Grammy)
└── types/         # NextAuth type augmentation
prisma/
├── schema.prisma  # Database schema
└── migrations/    # Migration history
docker-compose.yml # Full stack orchestration
```

---

## 🔔 Notifications & Real‑time

- In‑app notifications are delivered via **SSE** and displayed in the bell menu.
- Telegram notifications are sent through the integrated bot. Users can link their Telegram account, manage preferences, and even unlink directly from the bot.
- The notification dispatcher supports a channel pattern (InApp + Telegram), so adding new channels (email, Slack) is straightforward.

---

## 🧪 Key Highlights

- **Fine‑grained permissions** – Owners, Managers, Members, and Viewers all have different capabilities (create/edit/delete tasks, manage members, etc.).
- **Task status workflow** – Only the assignee or manager can mark a task as done; authors can’t edit an in‑progress task assigned to someone else.
- **Email cooldown** – Email changes are limited to once per week to prevent abuse.
- **SSE + optimistic updates** – TanStack Query + SSE listener keep the UI fast and consistent.
- **Full‑text search** – Debounced search across projects and tasks, with keyboard‑friendly navigation.
- **Desktop & mobile ready** – Responsive layout with collapsible sidebar.

---

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">
  Made with 💙 by <a href="https://github.com/neo-vai">NeoVai</a>
</p>