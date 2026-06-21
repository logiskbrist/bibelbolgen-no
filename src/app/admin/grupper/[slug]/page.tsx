import {
  ExternalLink,
  LinkIcon,
  MessageSquare,
  Plus,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageComposer } from "~/components/message-composer";
import { SiteHeader } from "~/components/site-header";
import { Avatar, ProgressBar, StatCard, StatusBadge } from "~/components/ui";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { latestReportedDay, statusForProgress } from "~/lib/progress-status";
import { requireAdminUserForPage } from "~/server/auth/page-guards";
import { getAdminGroupBySlug } from "~/server/groups/queries";
import { GroupAdminRole } from "../../../../../generated/prisma/client";

export const dynamic = "force-dynamic";

export default async function GruppeadminPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const admin = await requireAdminUserForPage(`/admin/grupper/${slug}`);
  const group = await getAdminGroupBySlug(slug, admin.id);

  if (!group) {
    notFound();
  }

  const adminRolesByUserId = new Map(
    group.admins.map((assignment) => [assignment.userId, assignment.role]),
  );
  const memberRows = group.memberships.map((membership) => {
    const reportedDay = latestReportedDay(membership.checkIns);

    return {
      isAdmin: adminRolesByUserId.has(membership.userId),
      membership,
      reportedDay,
      status: statusForProgress(reportedDay, group.progress.currentDay),
    };
  });
  const behindCount = memberRows.filter(
    (member) => member.status === "behind",
  ).length;
  const onTrackCount = memberRows.filter(
    (member) => member.status === "on-track" || member.status === "ahead",
  ).length;
  const smsRecipientCount = group.memberships.filter(
    (membership) => membership.smsOptIn,
  ).length;
  const emailRecipientCount = group.memberships.filter(
    (membership) => membership.emailOptIn,
  ).length;
  const groupStatus =
    group.progress.currentDay > 0
      ? ("on-track" as const)
      : ("not-started" as const);

  return (
    <div className="min-h-screen bg-surface text-ink">
      <SiteHeader variant="admin" />

      <main className="bb-container py-10">
        <Button
          asChild
          className="-ml-2 font-semibold text-forest-700 hover:text-forest-900"
          size="sm"
          variant="ghost"
        >
          <Link href="/admin">← Alle grupper</Link>
        </Button>

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-black font-display text-4xl text-forest-900 leading-tight">
                {group.name}
              </h1>
              <StatusBadge status={groupStatus} />
            </div>
            <p className="bb-muted mt-2 font-medium">
              {group.visibility} · startet{" "}
              {group.startsOn.toLocaleDateString("nb-NO", {
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>
          <Button asChild className="min-h-11" variant="secondary">
            <Link href={`/grupper/${group.slug}`}>
              <ExternalLink />
              Se offentlig side
            </Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          <StatCard label="Deltakere" value={group.memberships.length} />
          <StatCard label="I rute" value={onTrackCount} />
          <StatCard label="Bak planen" value={behindCount} />
          <StatCard
            hint={`dag ${group.progress.currentDay} av ${group.progress.totalDays}`}
            label="Fremdrift"
            value={`${group.progress.percent}%`}
          />
        </div>

        <div className="mt-6">
          <ProgressBar value={group.progress.percent} />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-start">
          <Card className="border-forest-900/10 bg-paper py-0">
            <CardHeader className="flex flex-row items-center justify-between border-forest-900/10 border-b p-6">
              <CardTitle className="font-black font-display text-forest-900 text-lg">
                Deltakere
              </CardTitle>
              <Button
                asChild
                className="border-forest-900/15 text-forest-900 hover:bg-sage-50"
                size="sm"
                variant="outline"
              >
                <Link href={`/admin/grupper/${group.slug}/invitasjon`}>
                  <Plus />
                  Legg til
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y divide-forest-900/10">
                {memberRows.map(
                  ({ isAdmin, membership, reportedDay, status }) => {
                    const adminRole = adminRolesByUserId.get(membership.userId);

                    return (
                      <li
                        className="flex flex-wrap items-center gap-3 px-6 py-4"
                        key={membership.id}
                      >
                        <Avatar name={membership.user.name} />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-forest-950">
                            {membership.user.name}
                            {isAdmin && (
                              <Badge className="ml-2 bg-forest-900 font-bold text-[0.6rem] text-white uppercase">
                                {adminRole === GroupAdminRole.OWNER
                                  ? "Eier"
                                  : "Leder"}
                              </Badge>
                            )}
                          </p>
                          <p className="text-ink/55 text-xs">
                            {membership.user.phoneNumber} ·{" "}
                            {membership.user.email}
                          </p>
                        </div>
                        <div className="text-right">
                          <StatusBadge status={status} />
                          <p className="mt-1 text-ink/45 text-xs">
                            {reportedDay
                              ? `Sist sett dag ${reportedDay}`
                              : "Ingen tilbakemelding"}
                          </p>
                        </div>
                      </li>
                    );
                  },
                )}
              </ul>
            </CardContent>
          </Card>

          <div className="space-y-6 lg:sticky lg:top-6">
            <Card className="border-forest-900/10 bg-paper py-0">
              <CardHeader className="p-6 pb-0">
                <CardTitle className="font-black font-display text-forest-900 text-lg">
                  Gruppeverktøy
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 p-6 pt-4">
                <ToolLink
                  href={`/admin/grupper/${group.slug}/deltakere`}
                  icon={<Users className="size-4" />}
                  label="Deltakere"
                />
                <ToolLink
                  href={`/admin/grupper/${group.slug}/meldinger`}
                  icon={<MessageSquare className="size-4" />}
                  label="Send SMS"
                />
                <ToolLink
                  href={`/admin/grupper/${group.slug}/admins`}
                  icon={<ShieldCheck className="size-4" />}
                  label="Administratorer"
                />
                <ToolLink
                  href={`/admin/grupper/${group.slug}/invitasjon`}
                  icon={<LinkIcon className="size-4" />}
                  label="Invitasjonslenke"
                />
              </CardContent>
            </Card>

            <MessageComposer
              emailRecipientCount={emailRecipientCount}
              groupId={group.id}
              groupSlug={group.slug}
              smsRecipientCount={smsRecipientCount}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function ToolLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Button
      asChild
      className="justify-start border-forest-900/15 text-forest-900 hover:bg-sage-50"
      variant="outline"
    >
      <Link href={href}>
        {icon}
        {label}
      </Link>
    </Button>
  );
}
