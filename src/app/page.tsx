import Image from "next/image";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";

const readingMarkers = [
	{ label: "Leseperiode", value: "5 måneder" },
	{ label: "Tekst", value: "Det nye testamentet" },
	{ label: "Rytme", value: "Dag for dag" },
];

export default function HomePage() {
	return (
		<main className="min-h-screen overflow-hidden bg-surface text-ink">
			<section className="relative flex min-h-[88svh] flex-col overflow-hidden bg-sage-100">
				<div className="absolute inset-0">
					<Image
						alt="Boken Hjelp meg å lese Bibelen holdt foran en lys bakgrunn"
						className="h-full w-full object-cover object-[64%_center] opacity-45"
						fill
						priority
						sizes="100vw"
						src="/brand/book-hand.png"
					/>
					<div className="absolute inset-0 bg-paper/80" />
				</div>

				<header className="bb-container relative z-10 flex items-center justify-between gap-6 py-6">
					<Image
						alt="Hjelp meg å lese Bibelen"
						className="h-14 w-auto"
						height={82}
						priority
						src="/brand/hjelp-meg-lese-bibelen-wordmark.svg"
						width={267}
					/>
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

				<div className="bb-container relative z-10 flex flex-1 items-center py-12">
					<div className="max-w-2xl py-8">
						<p className="bb-kicker">Bibelbølgen</p>
						<h1 className="mt-5 max-w-2xl text-balance font-black font-display text-5xl text-forest-900 leading-[0.92] sm:text-7xl lg:text-8xl">
							Hjelp meg å lese Bibelen
						</h1>
						<p className="mt-6 max-w-xl font-medium text-forest-950/80 text-xl leading-8 sm:text-2xl">
							En konkret leseplan for Det nye testamentet, laget for jevn rytme,
							tydelig progresjon og fem måneder med retning.
						</p>
						<div className="mt-8 flex flex-col gap-3 sm:flex-row">
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
							<Card
								className="border-white/15 bg-white/8 py-0 text-white shadow-pressed"
								key={marker.label}
							>
								<CardContent className="p-5">
									<p className="font-black text-3xl text-sage-200 leading-none">
										{marker.value}
									</p>
									<p className="mt-3 font-semibold text-sm text-white/72">
										{marker.label}
									</p>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			<section className="bg-surface py-16">
				<div className="bb-container grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
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
