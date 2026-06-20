import Image from "next/image";
import { GroupTimeline } from "~/components/group-timeline";
import { SiteHeader } from "~/components/site-header";
import { Button } from "~/components/ui/button";
import { listPublicGroupTimelineEntries } from "~/server/groups/queries";
import { getActiveReadingPlan } from "~/server/reading-plan/queries";

export const metadata = {
  title: "Forside · Bibelbølgen",
};

export const dynamic = "force-dynamic";

export default async function ForsidePage() {
  const [timelineGroups, readingPlan] = await Promise.all([
    listPublicGroupTimelineEntries(),
    getActiveReadingPlan(),
  ]);
  const timelineTotalDays =
    timelineGroups.length > 0
      ? Math.max(...timelineGroups.map((group) => group.totalDays))
      : (readingPlan?.totalDays ?? 150);

  return (
    <main className="min-h-screen overflow-hidden text-ink">
      <section className="relative flex min-h-screen flex-col overflow-hidden">
        <SiteHeader />

        <div className="bb-container relative z-10 flex flex-1 flex-col items-center justify-center py-12 text-center">
          <div className="mx-auto max-w-4xl py-8">
            <h1 className="mx-auto max-w-4xl">
              <span className="sr-only">Hjelp meg å lese Bibelen</span>
              <Image
                alt=""
                className="mx-auto h-auto w-full max-w-[60rem]"
                height={82}
                priority
                src="/brand/hjelp-meg-lese-bibelen-wordmark.svg"
                width={267}
              />
            </h1>
            <p className="mx-auto mt-3 max-w-xl font-display font-medium text-forest-950/70 text-sm uppercase leading-tight sm:text-base">
              Det nye testamentet på fem måneder
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild className="min-h-11">
                <a href="/bli-med">Bli med</a>
              </Button>
              <Button asChild className="min-h-11" variant="secondary">
                <a href="#bok">Se boken</a>
              </Button>
            </div>
          </div>

          <GroupTimeline
            className="mt-2 w-full pb-10"
            groups={timelineGroups}
            totalDays={timelineTotalDays}
          />
        </div>
      </section>

      <section className="relative overflow-hidden bg-surface py-20">
        <Image
          alt=""
          aria-hidden="true"
          className="absolute right-1/2 bottom-0 z-0 w-[min(1500px,150vw)] translate-x-1/2 object-contain opacity-18 mix-blend-multiply"
          height={1152}
          src="/brand/rome-colosseum.png"
          width={2400}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-surface via-surface/88 to-sage-50/92" />

        <div className="bb-container relative z-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="order-2 lg:order-1">
            <Image
              alt="To eksemplarer av Hjelp meg å lese Bibelen"
              className="w-full rounded-card object-cover shadow-soft"
              height={2000}
              src="/brand/book-stack.png"
              width={3000}
            />
          </div>
          <div className="order-1 lg:order-2">
            <p className="bb-kicker">Hjelp i hverdagen</p>
            <h2 className="mt-4 max-w-lg text-balance font-black font-display text-4xl text-forest-900 leading-none sm:text-5xl">
              Les litt hver dag og hold tråden gjennom hele testamentet.
            </h2>
            <p className="bb-muted mt-5 max-w-lg font-medium text-lg leading-8">
              Planen deler lesingen i overkommelige etapper, så du kan bygge en
              rytme uten å miste oversikten.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
