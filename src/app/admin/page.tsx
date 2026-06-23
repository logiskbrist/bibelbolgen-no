import { Plus } from "lucide-react";
import Link from "next/link";
import { SiteHeader } from "~/components/site-header";
import { ProgressBar, StatCard, StatusBadge } from "~/components/ui";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { latestReportedDay, statusForProgress } from "~/lib/progress-status";
import { requireAdminUserForPage } from "~/server/auth/page-guards";
import { listGroupsForAdmin } from "~/server/groups/queries";
import { getActiveReadingPlan } from "~/server/reading-plan/queries";

export const metadata = {
  title: "Adminoversikt · Bibelbølgen",
};

export const dynamic = "force-dynamic";

export default async function AdminoversiktPage() {
  const admin = await requireAdminUserForPage("/admin");
  const [groups, readingPlan] = await Promise.all([
    listGroupsForAdmin(admin.id),
    getActiveReadingPlan(),
  ]);
  const groupSummaries = groups.map((group) => {
    const memberStatuses = group.memberships.map((membership) =>
      statusForProgress(
        latestReportedDay(membership.checkIns),
        group.progress.currentDay,
      ),
    );

    return {
      behindCount: memberStatuses.filter((status) => status === "behind")
        .length,
      currentLabel:
        group.progress.currentDay > 0
          ? `Dag ${group.progress.currentDay}`
          : "Ikke startet",
      group,
      memberCount: group._count.memberships,
      percent: group.progress.percent,
      status:
        group.progress.currentDay > 0
          ? ("on-track" as const)
          : ("not-started" as const),
    };
  });
  const summary = {
    behindCount: groupSummaries.reduce(
      (sum, group) => sum + group.behindCount,
      0,
    ),
    groupCount: groups.length,
    memberCount: groupSummaries.reduce(
      (sum, group) => sum + group.memberCount,
      0,
    ),
  };

  return (
    <div className="min-h-screen bg-surface text-ink">
      <SiteHeader variant="admin" />

      <main className="bb-container py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="bb-kicker">Administrasjon</p>
            <h1 className="mt-2 font-black font-display text-4xl text-forest-900 leading-tight">
              Adminoversikt
            </h1>
            <p className="bb-muted mt-2 max-w-xl font-medium">
              Se gruppene du administrerer, følg fremdriften og gå videre til
              deltakere, invitasjoner og meldinger.
            </p>
          </div>
          <Button asChild className="min-h-11">
            <Link href="/admin/grupper/ny">
              <Plus />
              Ny gruppe
            </Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Grupper" value={summary.groupCount} />
          <StatCard label="Deltakere" value={summary.memberCount} />
          <StatCard
            hint="trenger oppfølging"
            label="Deltakere bak planen"
            value={summary.behindCount}
          />
          <StatCard
            hint={readingPlan?.title}
            label="Dager i leseplanen"
            value={readingPlan?.totalDays ?? 0}
          />
        </div>

        <Card className="mt-8 border-forest-900/10 bg-paper py-0">
          <CardHeader className="border-forest-900/10 border-b p-6">
            <CardTitle className="font-black font-display text-forest-900 text-lg">
              Grupper
            </CardTitle>
            <CardDescription>Sortert etter fremdrift</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-6">Gruppe</TableHead>
                  <TableHead className="min-w-60">Fremdrift</TableHead>
                  <TableHead>Deltakere</TableHead>
                  <TableHead className="px-6 text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...groupSummaries]
                  .sort(
                    (a, b) =>
                      b.group.progress.currentDay - a.group.progress.currentDay,
                  )
                  .map((summary) => {
                    const group = summary.group;

                    return (
                      <TableRow key={group.id}>
                        <TableCell className="px-6">
                          <Link
                            className="bb-focus-ring block rounded-md font-bold text-forest-900 hover:text-forest-700"
                            href={`/admin/grupper/${group.slug}`}
                          >
                            {group.name}
                          </Link>
                          <p className="text-ink/50 text-xs">
                            {summary.currentLabel}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex min-w-56 items-center gap-3">
                            <div className="flex-1">
                              <ProgressBar value={summary.percent} />
                            </div>
                            <span className="w-10 text-right font-bold text-forest-900 text-sm">
                              {summary.percent}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-forest-950/70">
                            {summary.memberCount}
                          </span>
                          {summary.behindCount > 0 && (
                            <span className="ml-2 font-semibold text-stone-700">
                              ({summary.behindCount} bak)
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="px-6 text-right">
                          <StatusBadge status={summary.status} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
