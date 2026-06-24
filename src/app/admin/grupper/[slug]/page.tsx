import { ExternalLink, Plus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GroupMemberRoleControl } from "~/components/group-member-role-control";
import { MessageComposer } from "~/components/message-composer";
import { SiteHeader } from "~/components/site-header";
import { Avatar, ProgressBar } from "~/components/ui";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
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
  const canTransferOwnership =
    adminRolesByUserId.get(admin.id) === GroupAdminRole.OWNER;
  const memberships = [...group.memberships].sort((first, second) => {
    const firstIsOwner =
      adminRolesByUserId.get(first.userId) === GroupAdminRole.OWNER;
    const secondIsOwner =
      adminRolesByUserId.get(second.userId) === GroupAdminRole.OWNER;

    return Number(secondIsOwner) - Number(firstIsOwner);
  });
  const smsRecipientPhoneNumbers = new Set([
    ...group.memberships.map((membership) => membership.user.phoneNumber),
    ...group.admins.map((assignment) => assignment.user.phoneNumber),
  ]);
  const smsRecipientCount = smsRecipientPhoneNumbers.size;
  const averageMemberDay = group.memberProgress?.averageDay;

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

        <div className="mt-5 mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-black font-display text-4xl text-forest-900 leading-tight">
                {group.name}
              </h1>
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

        <div className="mt-6 flex items-end justify-between gap-6 border-gray-300 border-t pt-2">
          <div>
            <p className="mt-2 font-black font-display text-3xl text-forest-900">
              Dag {group.progress.currentDay} av {group.progress.totalDays}
            </p>
            <p className="text-ink/50 text-sm">Gruppas fremdrift</p>
          </div>
          <p className="font-black text-5xl text-forest-900 leading-none">
            {group.progress.percent}%
          </p>
        </div>

        <div className="mt-6">
          <ProgressBar value={group.progress.percent} />
          {typeof averageMemberDay === "number" && (
            <p className="mt-2 text-ink/50 text-xs">
              Snitt innmeldt: dag {averageMemberDay.toLocaleString("nb-NO")} ·{" "}
              {group.memberProgress?.reportingMemberCount} rapportert
            </p>
          )}
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
                {memberships.map((membership) => {
                  const adminRole = adminRolesByUserId.get(membership.userId);
                  const currentRole = adminRole ?? "MEMBER";

                  return (
                    <li
                      className="flex flex-wrap items-center gap-3 px-6 py-4"
                      key={membership.id}
                    >
                      <Avatar name={membership.user.name} />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-forest-950">
                          {membership.user.name}
                          {adminRole === GroupAdminRole.OWNER && (
                            <Badge className="ml-2 bg-forest-900 font-bold text-[0.6rem] text-white uppercase">
                              Eier
                            </Badge>
                          )}
                        </p>
                        <p className="text-ink/55 text-xs">
                          {membership.user.phoneNumber} ·{" "}
                          {membership.user.email}
                        </p>
                      </div>
                      <div className="text-right">
                        <GroupMemberRoleControl
                          canTransferOwnership={canTransferOwnership}
                          currentRole={currentRole}
                          groupId={group.id}
                          groupSlug={group.slug}
                          isCurrentAdmin={membership.userId === admin.id}
                          userId={membership.userId}
                          userName={membership.user.name}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>

          <div className="space-y-6 lg:sticky lg:top-6">
            <MessageComposer
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
