import { CheckCircle2 } from "lucide-react";
import { RegisterForm } from "~/components/register-form";
import { SiteHeader } from "~/components/site-header";
import { Badge } from "~/components/ui/badge";
import { groups } from "~/lib/mock-data";

export const metadata = {
	title: "Bli med · Bibelbølgen",
};

export default function BliMedPage() {
	const groupOptions = groups.map((group) => ({
		slug: group.slug,
		name: group.name,
		city: group.city,
	}));

	return (
		<div className="min-h-screen bg-surface text-ink">
			<SiteHeader active="/bli-med" />

			<main className="bb-container py-12">
				<div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
					<div className="lg:sticky lg:top-12">
						<p className="bb-kicker">Bli med</p>
						<h1 className="mt-3 text-balance font-black font-display text-4xl text-forest-900 leading-[0.95] sm:text-5xl">
							Les Det nye testamentet sammen med en gruppe
						</h1>
						<p className="bb-muted mt-4 max-w-md font-medium text-lg leading-7">
							Meld deg på en lesegruppe, så holder dere rytmen sammen gjennom
							fem måneder. Du trenger bare navn, telefon og e-post.
						</p>

						<ul className="mt-8 space-y-4">
							{[
								"Få påminnelser og oppmuntring fra lederen din",
								"Se hvor gruppa di er i leseplanen",
								"Gi beskjed hvis du henger litt etter",
							].map((point) => (
								<li className="flex items-start gap-3" key={point}>
									<Badge className="mt-0.5 size-6 shrink-0 rounded-full bg-sage-100 p-0 text-forest-900">
										<CheckCircle2 className="size-4" />
									</Badge>
									<span className="font-medium text-forest-950/80">
										{point}
									</span>
								</li>
							))}
						</ul>
					</div>

					<RegisterForm groupOptions={groupOptions} />
				</div>
			</main>
		</div>
	);
}
