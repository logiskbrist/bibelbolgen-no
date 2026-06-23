"use client";

import { CheckCircle2, Clock3, Send, TrendingUp } from "lucide-react";
import { useActionState, useState } from "react";
import {
  type CheckInFormState,
  recordMemberCheckInAction,
} from "~/app/grupper/actions";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { cn } from "~/lib/utils";

const options = [
  { value: "ahead", label: "Foran planen", Icon: TrendingUp },
  { value: "on-track", label: "I rute", Icon: CheckCircle2 },
  { value: "behind", label: "Litt bak", Icon: Clock3 },
] as const;

const initialState: CheckInFormState = {
  status: "idle",
};

export function FeedbackWidget({
  groupId,
  groupSlug,
  suggestedDay,
}: {
  groupId: string;
  groupSlug: string;
  suggestedDay: number;
}) {
  const [day, setDay] = useState(suggestedDay);
  const [choice, setChoice] = useState<string | null>(null);
  const [state, formAction, isPending] = useActionState(
    recordMemberCheckInAction,
    initialState,
  );

  if (state.status === "success") {
    return (
      <Card className="border-forest-500/30 bg-sage-100 py-0 text-center">
        <CardContent className="p-6">
          <CheckCircle2 className="mx-auto size-8 text-forest-700" />
          <p className="mt-2 font-bold text-forest-900">
            Takk for tilbakemeldingen!
          </p>
          <p className="bb-muted mt-1 text-sm">
            {state.message ??
              `Du er registrert på dag ${state.reportedDayNumber ?? day}.`}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-forest-900/10 bg-paper py-0 shadow-soft">
      <CardContent className="p-6">
        <h3 className="font-black font-display text-forest-900 text-xl">
          Hvordan ligger du an?
        </h3>
        <p className="bb-muted mt-1 text-sm">
          Gi en rask tilbakemelding så lederen vet om gruppa trenger en
          oppmuntring.
        </p>

        <form action={formAction}>
          <input name="groupId" type="hidden" value={groupId} />
          <input name="groupSlug" type="hidden" value={groupSlug} />

          <RadioGroup
            className="mt-4 grid grid-cols-3 gap-2"
            onValueChange={(value) => setChoice(value)}
            value={choice ?? ""}
          >
            {options.map((option) => {
              const Icon = option.Icon;
              const inputId = `feedback-${option.value}`;

              return (
                <div key={option.value}>
                  <RadioGroupItem
                    className="sr-only"
                    id={inputId}
                    value={option.value}
                  />
                  <Label
                    className={cn(
                      "flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-md border px-3 py-3 text-center font-bold text-sm transition-colors",
                      choice === option.value
                        ? "border-forest-700 bg-sage-100 text-forest-900"
                        : "border-forest-900/15 bg-surface text-forest-950/70 hover:border-forest-500",
                    )}
                    htmlFor={inputId}
                  >
                    <Icon className="size-5" />
                    <span className="mt-2">{option.label}</span>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>

          <div className="mt-5">
            <Label className="text-forest-950/80" htmlFor="plan-day">
              Hvilken dag i planen er du på?
            </Label>
            <Input
              className="mt-1.5 min-h-11 bg-surface font-medium"
              id="plan-day"
              max={150}
              min={0}
              name="reportedDayNumber"
              onChange={(event) => setDay(Number(event.target.value))}
              type="number"
              value={day}
            />
          </div>

          {state.status === "error" && (
            <p className="mt-4 rounded-md border border-stone-500/30 bg-stone-100 p-3 font-semibold text-sm text-stone-800">
              {state.message}
            </p>
          )}

          <Button
            className="mt-5 min-h-11 w-full"
            disabled={isPending || !choice}
            type="submit"
          >
            <Send />
            {isPending ? "Sender ..." : "Send tilbakemelding"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
