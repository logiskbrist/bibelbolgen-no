import Link from "next/link";
import { SiteHeader } from "~/components/site-header";
import {
  PageHeader,
  ProgressBar,
  StatCard,
  StatusBadge,
} from "~/components/ui";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  getPublicPlatformSummary,
  listPublicGroups,
} from "~/server/groups/queries";
import { getActiveReadingPlan } from "~/server/reading-plan/queries";

export const metadata = {
  title: "Gruppeoversikt · Bibelbølgen",
};

export const dynamic = "force-dynamic";

export default async function GruppeoversiktPage() {
  const [summary, groups, readingPlan] = await Promise.all([
    getPublicPlatformSummary(),
    listPublicGroups(),
    getActiveReadingPlan(),
  ]);

  return (
    <div className="min-h-screen bg-surface text-ink">
      <SiteHeader active="/grupper" />

      <main className="bb-container py-12">
        <PageHeader
          kicker="Oversikt"
          lead="Følg med på åpne lesegrupper i Bibelbølgen, hvor langt de har kommet, og hvor mange som er med."
          title="Åpne grupper i Bibelbølgen"
        >
          <Button asChild className="min-h-11">
            <Link href="/bli-med">Bli med i en gruppe</Link>
          </Button>
        </PageHeader>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Aktive grupper" value={summary.groupCount} />
          <StatCard label="Deltakere totalt" value={summary.memberCount} />
          <StatCard
            hint={readingPlan?.title}
            label="Dager i leseplanen"
            value={readingPlan?.totalDays ?? 0}
          />
          <StatCard label="Åpne grupper" value={groups.length} />
        </div>

        {groups.length === 0 ? (
          <Card className="mt-10 border-forest-900/10 bg-paper py-0 shadow-soft">
            <CardContent className="p-8">
              <h2 className="font-black font-display text-2xl text-forest-900">
                Ingen åpne grupper ennå
              </h2>
              <p className="bb-muted mt-2 max-w-xl text-sm leading-6">
                Databasen er klar, men det er ikke opprettet noen åpne grupper.
                Når den første gruppa er opprettet vises den her automatisk.
              </p>
              <Button asChild className="mt-5">
                <Link href="/start-gruppe">Start en gruppe</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {groups.map((group) => {
              const currentDay = group.progress.currentDay;
              const totalDays = group.progress.totalDays;

              return (
                <Card
                  className="border-forest-900/10 bg-paper py-0 shadow-soft transition-transform hover:-translate-y-0.5"
                  key={group.id}
                >
                  <CardContent className="p-0">
                    <Link
                      className="bb-focus-ring block p-6"
                      href={`/grupper/${group.slug}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h2 className="font-black font-display text-2xl text-forest-900 leading-tight">
                            {group.name}
                          </h2>
                          <p className="mt-1 font-semibold text-forest-700 text-sm">
                            {group.city ?? "Digital gruppe"} · startet{" "}
                            {group.startsOn.toLocaleDateString("nb-NO", {
                              day: "numeric",
                              month: "long",
                            })}
                          </p>
                        </div>
                        <StatusBadge
                          status={currentDay > 0 ? "on-track" : "not-started"}
                        />
                      </div>

                      {group.description && (
                        <p className="bb-muted mt-3 text-sm leading-6">
                          {group.description}
                        </p>
                      )}

                      <div className="mt-5">
                        <div className="flex items-center justify-between font-semibold text-sm">
                          <span className="text-forest-950/70">
                            {currentDay > 0
                              ? `Dag ${currentDay} av ${totalDays}`
                              : "Ikke startet"}
                          </span>
                          <span className="text-forest-900">
                            {group.progress.percent}%
                          </span>
                        </div>
                        <div className="mt-2">
                          <ProgressBar value={group.progress.percent} />
                        </div>
                      </div>

                      <div className="mt-5 flex items-center gap-4 text-sm">
                        <span className="font-semibold text-forest-950/70">
                          {group._count.memberships} deltakere
                        </span>
                        <span className="text-ink/30">·</span>
                        <span className="font-semibold text-forest-700">
                          Åpen gruppe
                        </span>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
