"use client";

import { CheckCircle2, Send } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Textarea } from "~/components/ui/textarea";

export function MessageComposer({
	recipientCount,
}: {
	recipientCount: number;
}) {
	const [channel, setChannel] = useState<"sms" | "email">("sms");
	const [body, setBody] = useState("");
	const [subject, setSubject] = useState("");
	const [sent, setSent] = useState(false);

	const maxSms = 160;

	return (
		<Card className="border-forest-900/10 bg-paper py-0 shadow-soft">
			<CardHeader className="p-6 pb-0">
				<CardTitle className="font-black font-display text-forest-900 text-xl">
					Send melding til gruppa
				</CardTitle>
				<CardDescription>
					Når til {recipientCount} deltakere på en gang.
				</CardDescription>
			</CardHeader>
			<CardContent className="p-6">
				<Tabs
					className="gap-0"
					onValueChange={(value) => {
						setChannel(value as "sms" | "email");
						setSent(false);
					}}
					value={channel}
				>
					<TabsList className="bg-surface">
						<TabsTrigger value="sms">SMS</TabsTrigger>
						<TabsTrigger value="email">E-post</TabsTrigger>
					</TabsList>
				</Tabs>

				{channel === "email" && (
					<div className="mt-4">
						<Label className="text-forest-950/80" htmlFor="message-subject">
							Emne
						</Label>
						<Input
							className="mt-1.5 min-h-11 bg-surface font-medium"
							id="message-subject"
							onChange={(event) => {
								setSubject(event.target.value);
								setSent(false);
							}}
							placeholder="Ukens lesing"
							type="text"
							value={subject}
						/>
					</div>
				)}

				<div className="mt-4">
					<Label className="text-forest-950/80" htmlFor="message-body">
						Melding
					</Label>
					<Textarea
						className="mt-1.5 min-h-32 resize-y bg-surface font-medium"
						id="message-body"
						maxLength={channel === "sms" ? maxSms : undefined}
						onChange={(event) => {
							setBody(event.target.value);
							setSent(false);
						}}
						placeholder={
							channel === "sms"
								? "Husk samling i kveld kl 19 ..."
								: "Hei alle sammen! Her er refleksjonsspørsmålene ..."
						}
						value={body}
					/>
				</div>

				<div className="mt-2 flex items-center justify-between text-ink/50 text-xs">
					<span>
						{channel === "sms"
							? `${body.length}/${maxSms} tegn`
							: `${body.length} tegn`}
					</span>
					<span>Sendes til {recipientCount} deltakere</span>
				</div>

				{sent ? (
					<Alert className="mt-4 border-forest-500/30 bg-sage-100 text-forest-900">
						<CheckCircle2 />
						<AlertDescription className="font-semibold text-forest-900">
							Meldingen er lagt i kø og sendes til {recipientCount} deltakere.
						</AlertDescription>
					</Alert>
				) : (
					<Button
						className="mt-4 min-h-11 w-full"
						disabled={!body.trim()}
						onClick={() => setSent(true)}
						type="button"
					>
						<Send />
						Send {channel === "sms" ? "SMS" : "e-post"}
					</Button>
				)}
			</CardContent>
		</Card>
	);
}
