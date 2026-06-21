import Image from "next/image";
import { BookOrderForm } from "~/components/book-order-form";
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

        <div className="bb-container relative z-10 flex flex-1 flex-col items-center justify-center py-1 text-center">
          <div className="mx-auto max-w-4xl py-1">
            <h1 className="mx-auto max-w-4xl">
              <span className="sr-only">Hjelp meg å lese Bibelen</span>
              <Image
                alt=""
                className="mx-auto h-auto w-full max-w-[60rem]"
                height={64}
                priority
                src="/brand/hjelp-meg-lese-bibelen-wordmark.svg"
                width={100}
              />
            </h1>
            <p className="mx-auto mt-1 max-w-xl font-display font-medium text-forest-950/70 text-sm uppercase leading-tight sm:text-base">
              Det nye testamentet på fem måneder
            </p>
          </div>
          <div className="mx-auto mt-1 flex flex-col items-center gap-4">
            <h2 className="mx-auto mt-10 mb-2 text-center font-black font-display text-7xl text-black sm:text-7xl">
              Bli med på bølgen
            </h2>
            <p className="max-w-2xl text-forest-950/80 text-lg leading-7">
              Bli med tusenvis av andre på en felles reise gjennom det nye
              testamentet. Følg en enkel plan, og hold tråden sammen med andre
              lesere.
            </p>

            <div className="mt-2 flex flex-row justify-center gap-2">
              <Button asChild className="min-h-11">
                <a href="/bli-med">Bli med</a>
              </Button>
              <Button asChild className="min-h-11" variant="secondary">
                <a href="#bok">Se boken</a>
              </Button>
            </div>
          </div>

          <GroupTimeline
            className="mt-1 w-full pb-10"
            groups={timelineGroups}
            totalDays={timelineTotalDays}
          />
        </div>
      </section>

      <section className="relative overflow-hidden py-16" id="bok">
        <Image
          alt=""
          aria-hidden="true"
          className="absolute right-1/2 bottom-0 z-0 w-[min(1500px,150vw)] translate-x-1/2 object-contain opacity-200 mix-blend-multiply"
          height={1152}
          src="/brand/rome-colosseum.png"
          width={2400}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-sage-50/72 to-sage-50/92" />

        <div className="bb-container relative z-10 grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-center">
          <div>
            <Image
              alt="To eksemplarer av Hjelp meg å lese Bibelen"
              className="w-full rounded-card object-cover"
              height={2000}
              src="/brand/book-stack.png"
              width={3000}
            />
          </div>
          <BookOrderForm />
        </div>
      </section>
    </main>
  );
}
