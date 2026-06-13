import { ExternalLink, Plus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageComposer } from "~/components/message-composer";
import { SiteHeader } from "~/components/site-header";
import { Avatar, ProgressBar, StatCard, StatusBadge } from "~/components/ui";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { getGroup, groupSummary, groups, statusFor } from "~/lib/mock-data";

export function generateStaticParams() {
  return groups.map((group) => ({ slug: group.slug }));
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("nb-NO", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminGruppePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const group = getGroup(slug);
  if (!group) {
    notFound();
  }

  const s = groupSummary(group);

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
              <StatusBadge status={s.status} />
            </div>
            <p className="bb-muted mt-2 font-medium">
              {group.city} · {group.meetingRhythm} · startet{" "}
              {new Date(group.startDate).toLocaleDateString("nb-NO", {
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
          <StatCard label="Deltakere" value={s.memberCount} />
          <StatCard label="I rute" value={s.onTrackCount} />
          <StatCard label="Bak planen" value={s.behindCount} />
          <StatCard
            hint={`dag ${group.currentDay} av 150`}
            label="Fremdrift"
            value={`${s.percent}%`}
          />
        </div>

        <div className="mt-6">
          <ProgressBar expected={s.expected} value={s.percent} />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-start">
          <Card className="border-forest-900/10 bg-paper py-0 shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between border-forest-900/10 border-b p-6">
              <CardTitle className="font-black font-display text-forest-900 text-lg">
                Deltakere
              </CardTitle>
              <Button
                className="border-forest-900/15 text-forest-900 hover:bg-sage-50"
                size="sm"
                type="button"
                variant="outline"
              >
                <Plus />
                Legg til
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y divide-forest-900/10">
                {group.members.map((member) => {
                  const memberStatus = statusFor(member.currentDay, s.expected);

                  return (
                    <li
                      className="flex flex-wrap items-center gap-3 px-6 py-4"
                      key={member.id}
                    >
                      <Avatar name={member.name} />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-forest-950">
                          {member.name}
                          {member.role === "local-admin" && (
                            <Badge className="ml-2 bg-forest-900 font-bold text-[0.6rem] text-white uppercase">
                              Leder
                            </Badge>
                          )}
                        </p>
                        <p className="text-ink/55 text-xs">
                          {member.phone} · {member.email}
                        </p>
                      </div>
                      <div className="text-right">
                        <StatusBadge status={memberStatus} />
                        <p className="mt-1 text-ink/45 text-xs">
                          {member.lastCheckIn
                            ? `Sist sett dag ${member.currentDay}`
                            : "Ingen tilbakemelding"}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>

          <div className="space-y-6 lg:sticky lg:top-6">
            <MessageComposer recipientCount={s.memberCount} />

            <Card className="border-forest-900/10 bg-paper py-0 shadow-soft">
              <CardHeader className="p-6 pb-0">
                <CardTitle className="font-black font-display text-forest-900 text-lg">
                  Sendte meldinger
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-4">
                {group.messages.length === 0 ? (
                  <p className="bb-muted text-sm">
                    Ingen meldinger sendt ennå.
                  </p>
                ) : (
                  <ul className="space-y-4">
                    {group.messages.map((message) => (
                      <li
                        className="border-forest-900/10 border-l-2 pl-4"
                        key={message.id}
                      >
                        <div className="flex items-center gap-2">
                          <Badge
                            className={
                              message.channel === "sms"
                                ? "bg-sky-100 text-forest-900"
                                : "bg-sage-100 text-forest-900"
                            }
                          >
                            {message.channel === "sms" ? "SMS" : "E-post"}
                          </Badge>
                          <span className="text-ink/45 text-xs">
                            {formatDateTime(message.sentAt)} · {message.sentBy}
                          </span>
                        </div>
                        {message.subject && (
                          <p className="mt-1.5 font-bold text-forest-950 text-sm">
                            {message.subject}
                          </p>
                        )}
                        <p className="mt-1 text-ink/70 text-sm leading-6">
                          {message.body}
                        </p>
                        <p className="mt-1 text-ink/40 text-xs">
                          Sendt til {message.recipients} deltakere
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
