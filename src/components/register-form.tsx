"use client";

import { CheckCircle2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";
import type { RegisterFormState } from "~/app/bli-med/actions";
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
  name: string;
  slug: string;
}

type RegisterFormAction = (
  state: RegisterFormState,
  formData: FormData,
) => Promise<RegisterFormState>;

const initialState: RegisterFormState = {
  status: "idle",
};

export function RegisterForm({
  action,
  groupOptions,
  defaultGroup,
  inviteSecret,
}: {
  action: RegisterFormAction;
  groupOptions: GroupOption[];
  defaultGroup?: string;
  inviteSecret?: string;
}) {
  const [group, setGroup] = useState(defaultGroup ?? "");
  const [consent, setConsent] = useState(false);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const hasGroups = groupOptions.length > 0;

  if (state.status === "success") {
    return (
      <Card className="border-forest-500/30 bg-sage-100 py-0 text-center">
        <CardContent className="p-8">
          <CheckCircle2 className="mx-auto size-10 text-forest-700" />
          <h2 className="mt-3 font-black font-display text-2xl text-forest-900">
            Du er påmeldt!
          </h2>
          <p className="bb-muted mt-2">
            {state.message ?? "Velkommen! Lederen tar kontakt med deg."}
          </p>
          {state.groupSlug && (
            <Button asChild className="mt-5" variant="secondary">
              <Link href={`/grupper/${state.groupSlug}`}>Gå til gruppa</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-forest-900/10 bg-paper py-0">
      <CardContent className="p-6 sm:p-8">
        <form action={formAction} className="space-y-5">
          {inviteSecret && (
            <input name="inviteSecret" type="hidden" value={inviteSecret} />
          )}
          <input
            name="smsOptIn"
            type="hidden"
            value={consent ? "true" : "false"}
          />
          <input
            name="emailOptIn"
            type="hidden"
            value={consent ? "true" : "false"}
          />

          <Field label="Fullt navn" name="name">
            <Input
              autoComplete="name"
              className="min-h-11 bg-surface font-medium"
              id="name"
              name="name"
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
                name="phoneNumber"
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
                name="email"
                placeholder="ola@example.no"
                required
                type="email"
              />
            </Field>
          </div>

          <Field
            hint="Du kan velge en åpen gruppe som passer deg."
            label="Hvilken gruppe vil du bli med i?"
            name="group"
          >
            <NativeSelect
              className="w-full"
              id="group"
              name="groupSlug"
              onChange={(event) => setGroup(event.target.value)}
              required
              value={group}
            >
              <NativeSelectOption disabled value="">
                {hasGroups ? "Velg gruppe ..." : "Ingen åpne grupper ennå"}
              </NativeSelectOption>
              {groupOptions.map((option) => (
                <NativeSelectOption key={option.slug} value={option.slug}>
                  {option.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>

          {!hasGroups && !inviteSecret && (
            <p className="rounded-md border border-forest-900/10 bg-surface p-3 text-ink/65 text-sm leading-6">
              Det finnes ingen åpne grupper i databasen ennå. Start en gruppe
              først, eller bruk en privat invitasjonslenke.
            </p>
          )}

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

          {state.status === "error" && (
            <p className="rounded-md border border-stone-500/30 bg-stone-100 p-3 font-semibold text-sm text-stone-800">
              {state.message}
            </p>
          )}

          <Button
            className="min-h-11 w-full"
            disabled={isPending || !consent || (!group && !inviteSecret)}
            type="submit"
          >
            <UserPlus />
            {isPending ? "Melder på ..." : "Meld meg på"}
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
