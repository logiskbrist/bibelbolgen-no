import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "~/components/site-header";
import { Avatar, PageHeader, StatusBadge } from "~/components/ui";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  latestComputedMemberDay,
  latestReportedDay,
  statusForProgress,
} from "~/lib/progress-status";
import { requireAdminUserForPage } from "~/server/auth/page-guards";
import { getAdminGroupBySlug } from "~/server/groups/queries";
import { GroupAdminRole } from "../../../../../../generated/prisma/client";

export const metadata = {
  title: "Deltakere · Admin · Bibelbølgen",
};

export const dynamic = "force-dynamic";

export default async function GruppedeltakerePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const admin = await requireAdminUserForPage(
    `/admin/grupper/${slug}/deltakere`,
  );
  const group = await getAdminGroupBySlug(slug, admin.id);

  if (!group) {
    notFound();
  }

  const adminRolesByUserId = new Map(
    group.admins.map((assignment) => [assignment.userId, assignment.role]),
  );

  return (
    <div className="min-h-screen bg-surface text-ink">
      <SiteHeader variant="admin" />

      <main className="bb-container py-10">
        <Button asChild className="-ml-2" size="sm" variant="ghost">
          <Link href={`/admin/grupper/${group.slug}`}>← Til gruppeadmin</Link>
        </Button>

        <div className="mt-6">
          <PageHeader
            kicker={group.name}
            lead="Se hvem som er med i gruppa, kontaktinformasjon og siste rapporterte lesedag."
            title="Deltakere"
          />
        </div>

        <Card className="mt-8 border-forest-900/10 bg-paper py-0">
          <CardContent className="p-0">
            <ul className="divide-y divide-forest-900/10">
              {group.memberships.map((membership) => {
                const adminRole = adminRolesByUserId.get(membership.userId);
                const reportedDay = latestReportedDay(membership.checkIns);
                const computedDay = latestComputedMemberDay({
                  checkIns: membership.checkIns,
                  timeZone: group.timeZone,
                  totalDays: group.progress.totalDays,
                });
                const memberStatus = statusForProgress(
                  computedDay,
                  group.progress.currentDay,
                );

                return (
                  <li
                    className="flex flex-wrap items-center gap-3 px-6 py-4"
                    key={membership.id}
                  >
                    <Avatar name={membership.user.name} />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-forest-950">
                        {membership.user.name}
                        {adminRole && (
                          <Badge className="ml-2 bg-forest-900 font-bold text-[0.6rem] text-white uppercase">
                            {adminRole === GroupAdminRole.OWNER
                              ? "Eier"
                              : "Admin"}
                          </Badge>
                        )}
                      </p>
                      <p className="text-ink/55 text-xs">
                        {membership.user.phoneNumber} · {membership.user.email}
                      </p>
                      <p className="mt-1 text-ink/45 text-xs">
                        SMS: {membership.smsOptIn ? "ja" : "nei"} · E-post:{" "}
                        {membership.emailOptIn ? "ja" : "nei"}
                      </p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={memberStatus} />
                      <p className="mt-1 text-ink/45 text-xs">
                        {typeof computedDay === "number"
                          ? `Nå dag ${computedDay.toLocaleString("nb-NO")}`
                          : "Ikke meldt inn"}
                      </p>
                      {typeof reportedDay === "number" && (
                        <p className="text-ink/40 text-xs">
                          {computedDay !== reportedDay
                            ? `meldte dag ${reportedDay}`
                            : "oppdatert automatisk"}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
