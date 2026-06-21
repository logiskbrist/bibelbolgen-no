import { SiteHeader } from "~/components/site-header";
import { PageHeader } from "~/components/ui";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import { requireGlobalAdminForPage } from "~/server/auth/page-guards";
import { getActiveReadingPlanWithSections } from "~/server/reading-plan/queries";

export const metadata = {
  title: "Leseplan · Global admin · Bibelbølgen",
};

export const dynamic = "force-dynamic";

export default async function GlobalLeseplanPage() {
  await requireGlobalAdminForPage("/admin/global/leseplan");
  const plan = await getActiveReadingPlanWithSections();

  return (
    <div className="min-h-screen bg-surface text-ink">
      <SiteHeader variant="admin" />

      <main className="bb-container py-10">
        <PageHeader
          kicker="Global admin"
          lead="Overordnet visning av leseplanen som alle gruppene følger."
          title="Leseplan"
        />

        <Card className="mt-8 border-forest-900/10 bg-paper py-0">
          <CardContent className="p-6">
            {plan ? (
              <>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="bb-kicker">{plan.title}</p>
                    <h2 className="mt-2 font-black font-display text-3xl text-forest-900">
                      {plan.totalDays} dager
                    </h2>
                    <p className="mt-2 text-ink/55 text-sm">
                      {plan._count.days} dager er lagt inn · brukes av{" "}
                      {plan._count.groups} grupper
                    </p>
                  </div>
                  <Badge className="bg-sage-100 text-forest-900">Aktiv</Badge>
                </div>

                <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {plan.sections.map((section) => (
                    <li
                      className="rounded-md border border-forest-900/10 bg-surface p-4"
                      key={section.id}
                    >
                      <p className="font-black text-forest-900">
                        Dag {section.startDayNumber}-{section.endDayNumber}
                      </p>
                      <p className="mt-1 font-semibold text-forest-700 text-sm">
                        {section.name}
                      </p>
                      {section.subtitle && (
                        <p className="mt-1 text-ink/50 text-xs">
                          {section.subtitle}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              </>
            ) : (
              <p className="bb-muted text-sm leading-6">
                Ingen aktiv leseplan er satt opp.
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
