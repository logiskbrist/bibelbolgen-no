"use client";

import { CheckCircle2, RotateCcw, UserPlus } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
	NativeSelect,
	NativeSelectOption,
} from "~/components/ui/native-select";

interface GroupOption {
	slug: string;
	name: string;
	city: string;
}

export function RegisterForm({
	groupOptions,
	defaultGroup,
}: {
	groupOptions: GroupOption[];
	defaultGroup?: string;
}) {
	const [submitted, setSubmitted] = useState(false);
	const [group, setGroup] = useState(defaultGroup ?? "");
	const [consent, setConsent] = useState(false);

	if (submitted) {
		const chosen = groupOptions.find((g) => g.slug === group);

		return (
			<Card className="border-forest-500/30 bg-sage-100 py-0 text-center">
				<CardContent className="p-8">
					<CheckCircle2 className="mx-auto size-10 text-forest-700" />
					<h2 className="mt-3 font-black font-display text-2xl text-forest-900">
						Du er påmeldt!
					</h2>
					<p className="bb-muted mt-2">
						{chosen
							? `Velkommen til ${chosen.name}. Lederen tar kontakt med deg.`
							: "Velkommen! Lederen tar kontakt med deg."}
					</p>
					<Button
						className="mt-5"
						onClick={() => {
							setSubmitted(false);
							setConsent(false);
						}}
						type="button"
						variant="secondary"
					>
						<RotateCcw />
						Meld på en til
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="border-forest-900/10 bg-paper py-0 shadow-soft">
			<CardContent className="p-6 sm:p-8">
				<form
					className="space-y-5"
					onSubmit={(event) => {
						event.preventDefault();
						if (!consent || !group) {
							return;
						}
						setSubmitted(true);
					}}
				>
					<Field label="Fullt navn" name="name">
						<Input
							autoComplete="name"
							className="min-h-11 bg-surface font-medium"
							id="name"
							placeholder="Ola Nordmann"
							required
							type="text"
						/>
					</Field>

					<div className="grid gap-5 sm:grid-cols-2">
						<Field label="Telefonnummer" name="phone">
							<Input
								autoComplete="tel"
								className="min-h-11 bg-surface font-medium"
								id="phone"
								placeholder="+47 900 00 000"
								required
								type="tel"
							/>
						</Field>
						<Field label="E-post" name="email">
							<Input
								autoComplete="email"
								className="min-h-11 bg-surface font-medium"
								id="email"
								placeholder="ola@example.no"
								required
								type="email"
							/>
						</Field>
					</div>

					<Field
						hint="Du kan velge en eksisterende gruppe nær deg."
						label="Hvilken gruppe vil du bli med i?"
						name="group"
					>
						<NativeSelect
							className="w-full"
							id="group"
							onChange={(event) => setGroup(event.target.value)}
							required
							value={group}
						>
							<NativeSelectOption disabled value="">
								Velg gruppe ...
							</NativeSelectOption>
							{groupOptions.map((option) => (
								<NativeSelectOption key={option.slug} value={option.slug}>
									{option.name} - {option.city}
								</NativeSelectOption>
							))}
						</NativeSelect>
					</Field>

					<div className="flex items-start gap-3">
						<Checkbox
							checked={consent}
							className="mt-1"
							id="consent"
							onCheckedChange={(checked) => setConsent(checked === true)}
						/>
						<Label
							className="block text-ink/70 text-sm leading-5"
							htmlFor="consent"
						>
							Jeg samtykker til at lederen kan kontakte meg på SMS og e-post om
							leseplanen.
						</Label>
					</div>

					<Button
						className="min-h-11 w-full"
						disabled={!consent || !group}
						type="submit"
					>
						<UserPlus />
						Meld meg på
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}

function Field({
	label,
	name,
	hint,
	children,
}: {
	label: string;
	name: string;
	hint?: string;
	children: React.ReactNode;
}) {
	return (
		<div className="block">
			<Label className="text-forest-950/80" htmlFor={name}>
				{label}
			</Label>
			<div className="mt-1.5">{children}</div>
			{hint && <span className="mt-1 block text-ink/50 text-xs">{hint}</span>}
		</div>
	);
}
