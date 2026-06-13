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
import { groupSummary, groups, platformSummary } from "~/lib/mock-data";

export const metadata = {
  title: "Admin · Bibelbølgen",
};

export default function AdminDashboardPage() {
  const summary = platformSummary();

  return (
    <div className="min-h-screen bg-surface text-ink">
      <SiteHeader variant="admin" />

      <main className="bb-container py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="bb-kicker">Global administrasjon</p>
            <h1 className="mt-2 font-black font-display text-4xl text-forest-900 leading-tight">
              Alle grupper
            </h1>
            <p className="bb-muted mt-2 max-w-xl font-medium">
              Overvåk fremdriften i hele Bibelbølgen, og hopp inn i en gruppe
              for å sende meldinger eller se deltakere.
            </p>
          </div>
          <Button className="min-h-11" type="button">
            <Plus />
            Ny gruppe
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
          <StatCard label="Meldinger sendt" value={summary.messageCount} />
        </div>

        <Card className="mt-8 border-forest-900/10 bg-paper py-0 shadow-soft">
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
                {[...groups]
                  .sort((a, b) => b.currentDay - a.currentDay)
                  .map((group) => {
                    const s = groupSummary(group);

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
                            {group.city} · {s.currentLabel}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex min-w-56 items-center gap-3">
                            <div className="flex-1">
                              <ProgressBar
                                expected={s.expected}
                                value={s.percent}
                              />
                            </div>
                            <span className="w-10 text-right font-bold text-forest-900 text-sm">
                              {s.percent}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-forest-950/70">
                            {s.memberCount}
                          </span>
                          {s.behindCount > 0 && (
                            <span className="ml-2 font-semibold text-stone-700">
                              ({s.behindCount} bak)
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="px-6 text-right">
                          <StatusBadge status={s.status} />
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
