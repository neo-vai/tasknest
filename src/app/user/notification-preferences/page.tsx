import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { TelegramLink } from "@/components/TelegramLink";

export default async function NotificationPreferencesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <DashboardShell>
      <div className="mx-auto max-w-2xl space-y-8">
        <PageHeader
          title="Notification Preferences"
          description="Manage how you receive notifications"
        />
        <TelegramLink />
      </div>
    </DashboardShell>
  );
}