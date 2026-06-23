import Link from "next/link";
import { SiteHeader } from "~/components/site-header";
import { PageHeader, ProgressBar, StatusBadge } from "~/components/ui";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import { listAllGroupsForGlobalAdmin } from "~/server/admin/queries";
import { requireGlobalAdminForPage } from "~/server/auth/page-guards";

export const metadata = {
  title: "Alle grupper · Global admin · Bibelbølgen",
};

export const dynamic = "force-dynamic";

export default async function GlobaleGrupperPage() {
  const admin = await requireGlobalAdminForPage("/admin/global/grupper");
  const groups = await listAllGroupsForGlobalAdmin(admin.id);

  return (
    <div className="min-h-screen bg-surface text-ink">
      <SiteHeader variant="admin" />

      <main className="bb-container py-10">
        <PageHeader
          kicker="Global admin"
          lead="Alle grupper på tvers av lokale administratorer."
          title="Alle grupper"
        />

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {groups.map((group) => (
            <Card className="border-forest-900/10 bg-paper py-0" key={group.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link
                      className="bb-focus-ring rounded-md font-black font-display text-2xl text-forest-900"
                      href={`/admin/grupper/${group.slug}`}
                    >
                      {group.name}
                    </Link>
                    <p className="mt-1 font-semibold text-forest-700 text-sm">
                      {group._count.memberships} deltakere ·{" "}
                      {group._count.admins} admins
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge className="bg-sage-100 text-forest-900">
                        {group.visibility}
                      </Badge>
                      <Badge className="bg-surface text-forest-900">
                        {group.status}
                      </Badge>
                    </div>
                  </div>
                  <StatusBadge
                    status={
                      group.progress.currentDay > 0 ? "on-track" : "not-started"
                    }
                  />
                </div>
                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-forest-950/70">
                      Dag {group.progress.currentDay} av{" "}
                      {group.progress.totalDays}
                    </span>
                    <span className="font-bold text-forest-900">
                      {group.progress.percent}%
                    </span>
                  </div>
                  <ProgressBar value={group.progress.percent} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
