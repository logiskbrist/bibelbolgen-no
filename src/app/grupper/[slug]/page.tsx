import Link from "next/link";
import { notFound } from "next/navigation";
import { FeedbackWidget } from "~/components/feedback-widget";
import { SiteHeader } from "~/components/site-header";
import { Avatar, ProgressBar, StatusBadge } from "~/components/ui";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
	getGroup,
	groupSummary,
	groups,
	PLAN_MILESTONES,
	PLAN_TOTAL_DAYS,
	statusFor,
} from "~/lib/mock-data";

export function generateStaticParams() {
	return groups.map((group) => ({ slug: group.slug }));
}

export default async function GruppePage({
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
						<p className="bb-kicker">{group.city}</p>
						<h1 className="mt-2 font-black font-display text-4xl text-forest-900 leading-[0.95] sm:text-5xl">
							{group.name}
						</h1>
						<p className="bb-muted mt-3 max-w-xl font-medium text-lg leading-7">
							{group.description}
						</p>
					</div>
					<StatusBadge status={s.status} />
				</div>

				<div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-start">
					<div className="space-y-8">
						<Card className="border-forest-900/10 bg-paper py-0 shadow-soft">
							<CardContent className="p-6">
								<div className="flex items-end justify-between">
									<div>
										<p className="bb-kicker">Gruppas fremdrift</p>
										<p className="mt-2 font-black font-display text-3xl text-forest-900">
											Dag {group.currentDay}{" "}
											<span className="font-semibold text-forest-700 text-lg">
												av {PLAN_TOTAL_DAYS}
											</span>
										</p>
										<p className="mt-1 font-semibold text-forest-700">
											Nå i {s.currentLabel}
										</p>
									</div>
									<p className="font-black text-5xl text-forest-900 leading-none">
										{s.percent}%
									</p>
								</div>

								<div className="mt-5">
									<ProgressBar expected={s.expected} value={s.percent} />
									<div className="mt-2 flex justify-between text-ink/50 text-xs">
										<span>Start</span>
										<span className="font-semibold text-stone-700">
											| Forventet i dag (dag {s.expected})
										</span>
										<span>Fullført</span>
									</div>
								</div>

								<ol className="mt-6 flex flex-wrap gap-2">
									{PLAN_MILESTONES.filter((m) => m.day < PLAN_TOTAL_DAYS).map(
										(milestone) => {
											const reached = group.currentDay >= milestone.day;

											return (
												<li key={milestone.label}>
													<Badge
														className={
															reached
																? "border-forest-500/30 bg-sage-100 text-forest-900"
																: "border-ink/10 bg-surface text-ink/40"
														}
														variant="outline"
													>
														{milestone.label}
													</Badge>
												</li>
											);
										},
									)}
								</ol>
							</CardContent>
						</Card>

						<Card className="border-forest-900/10 bg-paper py-0 shadow-soft">
							<CardHeader className="p-6 pb-0">
								<CardTitle className="font-black font-display text-forest-900 text-xl">
									Deltakere ({s.memberCount})
								</CardTitle>
							</CardHeader>
							<CardContent className="p-6 pt-4">
								<ul className="divide-y divide-forest-900/10">
									{group.members.map((member) => {
										const memberStatus = statusFor(
											member.currentDay,
											s.expected,
										);

										return (
											<li
												className="flex items-center gap-3 py-3"
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
													<p className="text-ink/50 text-xs">
														Dag {member.currentDay}
													</p>
												</div>
												<StatusBadge status={memberStatus} />
											</li>
										);
									})}
								</ul>
							</CardContent>
						</Card>
					</div>

					<div className="space-y-6 lg:sticky lg:top-6">
						<FeedbackWidget suggestedDay={s.expected} />

						<Card className="border-forest-900/10 bg-paper py-0 shadow-soft">
							<CardContent className="p-6">
								<h3 className="font-black font-display text-forest-900 text-lg">
									Samlinger
								</h3>
								<p className="mt-2 font-semibold text-forest-700">
									{group.meetingRhythm}
								</p>
								<p className="bb-muted mt-3 text-sm leading-6">
									Lederen din sender ut påminnelser og refleksjonsspørsmål før
									hver samling.
								</p>
							</CardContent>
						</Card>
					</div>
				</div>
			</main>
		</div>
	);
}
