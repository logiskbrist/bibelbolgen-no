import Link from "next/link";
import { notFound } from "next/navigation";
import { FeedbackWidget } from "~/components/feedback-widget";
import { SiteHeader } from "~/components/site-header";
import { ProgressBar, StatusBadge } from "~/components/ui";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { getCurrentUser } from "~/server/auth/permissions";
import { getGroupBySlugForViewer } from "~/server/groups/queries";
import { MembershipStatus } from "../../../../generated/prisma/client";

export const dynamic = "force-dynamic";

function dayLabel(dayNumber: number, totalDays: number) {
  if (dayNumber <= 0) {
    return "Ikke startet";
  }

  return `Dag ${dayNumber} av ${totalDays}`;
}

export default async function GruppesidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const viewer = await getCurrentUser();
  const group = await getGroupBySlugForViewer(slug, viewer?.id);

  if (!group) {
    notFound();
  }

  const currentDay = group.progress.currentDay;
  const totalDays = group.progress.totalDays;
  const averageMemberDay = group.memberProgress?.averageDay;
  const currentReading = group.readingPlan.days.find(
    (day) => day.dayNumber === currentDay,
  );
  const currentSection = group.readingPlan.sections.find(
    (section) =>
      section.startDayNumber <= currentDay &&
      section.endDayNumber >= currentDay,
  );
  const isMember = group.viewerMembershipStatus === MembershipStatus.ACTIVE;

  return (
    <div className="min-h-screen bg-surface text-ink">
      <SiteHeader active="/grupper" />

      <main className="bb-container py-12">
        <Button
          asChild
          className="-ml-2 font-semibold text-forest-700 hover:text-forest-900"
          size="sm"
          variant="ghost"
        >
          <Link href="/grupper">← Alle grupper</Link>
        </Button>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="bb-kicker">{group.visibility}</p>
            <h1 className="mt-2 font-black font-display text-4xl text-forest-900 leading-[0.95] sm:text-5xl">
              {group.name}
            </h1>
            {group.description && (
              <p className="bb-muted mt-3 max-w-xl font-medium text-lg leading-7">
                {group.description}
              </p>
            )}
          </div>
          <StatusBadge status={currentDay > 0 ? "on-track" : "not-started"} />
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-start">
          <div className="space-y-8">
            <Card className="border-forest-900/10 bg-paper py-0">
              <CardContent className="p-6">
                <div className="flex items-end justify-between gap-6">
                  <div>
                    <p className="bb-kicker">Gruppas fremdrift</p>
                    <p className="mt-2 font-black font-display text-3xl text-forest-900">
                      {dayLabel(currentDay, totalDays)}
                    </p>
                    <p className="mt-1 font-semibold text-forest-700">
                      {currentSection?.name ?? group.readingPlan.title}
                    </p>
                  </div>
                  <p className="font-black text-5xl text-forest-900 leading-none">
                    {group.progress.percent}%
                  </p>
                </div>

                <div className="mt-5">
                  <ProgressBar value={group.progress.percent} />
                  <div className="mt-2 flex justify-between text-ink/50 text-xs">
                    <span>Start</span>
                    <span>Fullført</span>
                  </div>
                  {typeof averageMemberDay === "number" && (
                    <p className="mt-3 font-semibold text-forest-950/70 text-sm">
                      Deltakernes innmeldte snitt er dag{" "}
                      {averageMemberDay.toLocaleString("nb-NO")} av {totalDays}.
                      Det øker automatisk dag for dag.
                    </p>
                  )}
                </div>

                <ol className="mt-6 flex flex-wrap gap-2">
                  {group.readingPlan.sections.map((section) => {
                    const reached = currentDay >= section.startDayNumber;

                    return (
                      <li key={section.id}>
                        <Badge
                          className={
                            reached
                              ? "border-forest-500/30 bg-sage-100 text-forest-900"
                              : "border-ink/10 bg-surface text-ink/40"
                          }
                          variant="outline"
                        >
                          {section.name}
                        </Badge>
                      </li>
                    );
                  })}
                </ol>
              </CardContent>
            </Card>

            <Card className="border-forest-900/10 bg-paper py-0">
              <CardHeader className="p-6 pb-0">
                <CardTitle className="font-black font-display text-forest-900 text-xl">
                  Dagens lesing
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-4">
                {currentReading ? (
                  <>
                    <p className="font-black font-display text-2xl text-forest-900">
                      {currentReading.title ?? currentSection?.name}
                    </p>
                    <p className="mt-2 font-semibold text-forest-700">
                      {currentReading.readingText}
                    </p>
                    {currentReading.introIncluded && (
                      <Badge className="mt-4 bg-sage-100 text-forest-900">
                        Inkluderer introduksjon
                      </Badge>
                    )}
                  </>
                ) : (
                  <p className="bb-muted text-sm leading-6">
                    Gruppa har ikke startet leseplanen ennå.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6 lg:sticky lg:top-6">
            {isMember ? (
              <FeedbackWidget
                groupId={group.id}
                groupSlug={group.slug}
                suggestedDay={Math.max(1, currentDay)}
              />
            ) : (
              <Card className="border-forest-900/10 bg-paper py-0">
                <CardContent className="p-6">
                  <h3 className="font-black font-display text-forest-900 text-xl">
                    Bli med i gruppa
                  </h3>
                  <p className="bb-muted mt-2 text-sm leading-6">
                    Meld deg på for å lagre denne gruppa på enheten din og sende
                    inn hvilken dag du selv er på.
                  </p>
                  <Button asChild className="mt-5 w-full">
                    <Link href={`/bli-med?group=${group.slug}`}>Bli med</Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card className="border-forest-900/10 bg-paper py-0">
              <CardContent className="p-6">
                <h3 className="font-black font-display text-forest-900 text-lg">
                  Deltakere
                </h3>
                <p className="mt-2 font-black text-4xl text-forest-900">
                  {group._count.memberships}
                </p>
                <p className="bb-muted mt-2 text-sm leading-6">
                  Av personvernhensyn vises medlemslisten bare for
                  gruppeadministratorer.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
