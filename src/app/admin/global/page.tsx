import Link from "next/link";
import { SiteHeader } from "~/components/site-header";
import { PageHeader, StatCard } from "~/components/ui";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { getGlobalAdminSummary } from "~/server/admin/queries";
import { requireGlobalAdminForPage } from "~/server/auth/page-guards";
import { getActiveReadingPlan } from "~/server/reading-plan/queries";

export const metadata = {
  title: "Global admin · Bibelbølgen",
};

export const dynamic = "force-dynamic";

const globalAdminLinks = [
  { href: "/admin/global/grupper", label: "Alle grupper" },
  { href: "/admin/global/brukere", label: "Brukere og roller" },
  { href: "/admin/global/leseplan", label: "Leseplan" },
];

export default async function GlobalAdminPage() {
  const admin = await requireGlobalAdminForPage("/admin/global");
  const [summary, readingPlan] = await Promise.all([
    getGlobalAdminSummary(admin.id),
    getActiveReadingPlan(),
  ]);

  return (
    <div className="min-h-screen bg-surface text-ink">
      <SiteHeader variant="admin" />

      <main className="bb-container py-10">
        <PageHeader
          kicker="Global admin"
          lead="Overordnet kontroll for grupper, administratorer og leseplanen i Bibelbølgen."
          title="Global oversikt"
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Grupper" value={summary.groupCount} />
          <StatCard label="Deltakere" value={summary.activeMemberCount} />
          <StatCard label="Private grupper" value={summary.privateGroupCount} />
          <StatCard
            hint={readingPlan?.title}
            label="Dager i leseplanen"
            value={readingPlan?.totalDays ?? 0}
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Åpne grupper" value={summary.publicGroupCount} />
          <StatCard
            label="Meldingsutsendinger"
            value={summary.messageDispatchCount}
          />
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {globalAdminLinks.map((link) => (
            <Card
              className="border-forest-900/10 bg-paper py-0"
              key={link.href}
            >
              <CardContent className="p-5">
                <Button
                  asChild
                  className="w-full justify-start"
                  variant="ghost"
                >
                  <Link href={link.href}>{link.label}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
