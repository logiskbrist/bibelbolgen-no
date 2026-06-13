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
import { groupSummary, groups, platformSummary } from "~/lib/mock-data";

export const metadata = {
  title: "Grupper · Bibelbølgen",
};

export default function GruppeOversiktPage() {
  const summary = platformSummary();

  return (
    <div className="min-h-screen bg-surface text-ink">
      <SiteHeader active="/grupper" />

      <main className="bb-container py-12">
        <PageHeader
          kicker="Oversikt"
          lead="Følg med på alle lesegruppene i Bibelbølgen – hvor langt de har kommet, og hvem som er i rute."
          title="Grupper i Bibelbølgen"
        >
          <Button asChild className="min-h-11">
            <Link href="/bli-med">Bli med i en gruppe</Link>
          </Button>
        </PageHeader>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Aktive grupper" value={summary.groupCount} />
          <StatCard label="Deltakere totalt" value={summary.memberCount} />
          <StatCard
            hint="leser litt under planen"
            label="Bak planen"
            value={summary.behindCount}
          />
          <StatCard label="Meldinger sendt" value={summary.messageCount} />
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {groups.map((group) => {
            const s = groupSummary(group);
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
                          {group.city} · {group.meetingRhythm}
                        </p>
                      </div>
                      <StatusBadge status={s.status} />
                    </div>

                    <p className="bb-muted mt-3 text-sm leading-6">
                      {group.description}
                    </p>

                    <div className="mt-5">
                      <div className="flex items-center justify-between font-semibold text-sm">
                        <span className="text-forest-950/70">
                          Dag {group.currentDay} · {s.currentLabel}
                        </span>
                        <span className="text-forest-900">{s.percent}%</span>
                      </div>
                      <div className="mt-2">
                        <ProgressBar expected={s.expected} value={s.percent} />
                      </div>
                    </div>

                    <div className="mt-5 flex items-center gap-4 text-sm">
                      <span className="font-semibold text-forest-950/70">
                        {s.memberCount} deltakere
                      </span>
                      <span className="text-ink/30">·</span>
                      <span className="font-semibold text-forest-700">
                        {s.onTrackCount} i rute
                      </span>
                      {s.behindCount > 0 && (
                        <>
                          <span className="text-ink/30">·</span>
                          <span className="font-semibold text-stone-700">
                            {s.behindCount} bak
                          </span>
                        </>
                      )}
                    </div>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
