import Image from "next/image";
import Link from "next/link";
import { BibleTimeline } from "~/components/bible-timeline";
import { Button } from "~/components/ui/button";

export const metadata = {
  title: "Forside · Bibelbølgen",
};

const readingMarkers = [
  { label: "Leseperiode", value: "5 måneder" },
  { label: "Tekst", value: "Det nye testamentet" },
  { label: "Rytme", value: "Dag for dag" },
];

export default function ForsidePage() {
  return (
    <main className="bb-concept-bg min-h-screen overflow-hidden text-ink">
      <section className="relative flex min-h-screen flex-col overflow-hidden">
        <header className="bb-container relative z-10 flex items-center justify-between gap-6 py-6">
          <Link
            className="font-bold text-forest-700 text-lg sm:text-xl"
            href="/"
          >
            Bibelbølgen
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <Button
              asChild
              className="hidden font-semibold text-forest-950/70 hover:bg-sage-50 hover:text-forest-900 sm:inline-flex"
              size="sm"
              variant="ghost"
            >
              <Link href="/grupper">Grupper</Link>
            </Button>
            <Button
              asChild
              className="hidden font-semibold text-forest-950/70 hover:bg-sage-50 hover:text-forest-900 md:inline-flex"
              size="sm"
              variant="ghost"
            >
              <Link href="/start-gruppe">Start gruppe</Link>
            </Button>
            <Button
              asChild
              className="hidden font-semibold text-forest-950/70 hover:bg-sage-50 hover:text-forest-900 sm:inline-flex"
              size="sm"
              variant="ghost"
            >
              <Link href="/admin">Admin</Link>
            </Button>
            <Button asChild className="min-h-11" variant="secondary">
              <Link href="/bli-med">Bli med</Link>
            </Button>
          </nav>
        </header>

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
                <a href="/brand/hjelp-meg-lese-bibelen.pdf">
                  Last ned leseplanen
                </a>
              </Button>
              <Button asChild className="min-h-11" variant="secondary">
                <a href="#bok">Se boken</a>
              </Button>
            </div>
          </div>

          <BibleTimeline className="mt-2 w-full pb-10" />
        </div>
      </section>

      <section className="bg-forest-900 py-14 text-white" id="bok">
        <div className="bb-container grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <Image
              alt=""
              className="mb-8 h-8 w-full object-cover opacity-35"
              height={43}
              src="/brand/wave-white.svg"
              width={845}
            />
            <p className="font-bold text-sage-300">Laget for leseflyt</p>
            <h2 className="mt-4 max-w-xl text-balance font-black font-display text-4xl leading-none sm:text-5xl">
              Fem måneder. En plan du faktisk kan holde.
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {readingMarkers.map((marker) => (
              <div
                className="border border-white/15 bg-white/8 p-5 shadow-pressed"
                key={marker.label}
              >
                <p className="font-black text-3xl text-sage-200 leading-none">
                  {marker.value}
                </p>
                <p className="mt-3 font-semibold text-sm text-white/72">
                  {marker.label}
                </p>
              </div>
            ))}
          </div>
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
