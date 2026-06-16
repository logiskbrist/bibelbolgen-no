"use client";

import { CheckCircle2, KeyRound, Users } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";
import {
  type StartGroupFormState,
  startGroupAction,
} from "~/app/start-gruppe/actions";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "~/components/ui/native-select";
import { Textarea } from "~/components/ui/textarea";

const initialState: StartGroupFormState = {
  status: "idle",
};

export function StartGroupForm() {
  const [contactOptIn, setContactOptIn] = useState(false);
  const [state, formAction, isPending] = useActionState(
    startGroupAction,
    initialState,
  );

  if (state.status === "success") {
    return (
      <Card className="border-forest-500/30 bg-sage-100 py-0 shadow-soft">
        <CardContent className="p-8">
          <CheckCircle2 className="size-10 text-forest-700" />
          <h2 className="mt-3 font-black font-display text-2xl text-forest-900">
            Gruppa er opprettet
          </h2>
          <p className="bb-muted mt-2">
            {state.message ?? "Du er satt som admin for gruppa."}
          </p>

          {state.inviteHref && (
            <div className="mt-5 rounded-md border border-forest-500/25 bg-paper p-4">
              <div className="flex items-center gap-2 font-bold text-forest-900">
                <KeyRound className="size-4" />
                Privat invitasjon
              </div>
              <p className="mt-2 break-all font-semibold text-forest-800 text-sm">
                {state.inviteHref}
              </p>
              {state.inviteCode && (
                <p className="mt-1 font-semibold text-forest-800 text-sm">
                  Kode: {state.inviteCode}
                </p>
              )}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {state.groupSlug && (
              <Button asChild>
                <Link href={`/grupper/${state.groupSlug}`}>Se gruppa</Link>
              </Button>
            )}
            <Button asChild variant="secondary">
              <Link href="/grupper">Alle grupper</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-forest-900/10 bg-paper py-0 shadow-soft">
      <CardHeader className="border-forest-900/10 border-b p-6">
        <CardTitle className="font-black font-display text-forest-900 text-xl">
          Gruppeinformasjon
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form action={formAction} className="grid gap-5">
          <input
            name="contactOptIn"
            type="hidden"
            value={contactOptIn ? "true" : "false"}
          />

          <Field label="Gruppenavn" name="group-name">
            <Input
              className="min-h-11 bg-surface font-medium"
              id="group-name"
              name="name"
              placeholder="Markus-gruppen"
              required
              type="text"
            />
          </Field>

          <Field label="Kort beskrivelse" name="description">
            <Textarea
              className="min-h-28 bg-surface font-medium"
              id="description"
              name="description"
              placeholder="Hvem gruppa er for, og hvordan dere leser sammen."
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Sted" name="city">
              <Input
                className="min-h-11 bg-surface font-medium"
                id="city"
                name="city"
                placeholder="Oslo"
                type="text"
              />
            </Field>
            <Field label="Startdato" name="starts-on">
              <Input
                className="min-h-11 bg-surface font-medium"
                id="starts-on"
                name="startsOn"
                required
                type="date"
              />
            </Field>
          </div>

          <Field label="Tilgang" name="visibility">
            <NativeSelect className="w-full" id="visibility" name="visibility">
              <NativeSelectOption value="PUBLIC">
                Åpen gruppe
              </NativeSelectOption>
              <NativeSelectOption value="PRIVATE">
                Privat gruppe med invitasjonskode
              </NativeSelectOption>
            </NativeSelect>
          </Field>

          <div className="border-forest-900/10 border-t pt-5">
            <h3 className="font-black font-display text-forest-900 text-lg">
              Deg som gruppeleder
            </h3>
            <p className="bb-muted mt-1 text-sm leading-6">
              Du blir owner/admin for gruppa og kan legge til flere admins
              senere.
            </p>
          </div>

          <Field label="Fullt navn" name="owner-name">
            <Input
              autoComplete="name"
              className="min-h-11 bg-surface font-medium"
              id="owner-name"
              name="ownerName"
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

          <div className="flex items-start gap-3">
            <Checkbox
              checked={contactOptIn}
              className="mt-1"
              id="contactOptIn"
              onCheckedChange={(checked) => setContactOptIn(checked === true)}
            />
            <Label
              className="block text-ink/70 text-sm leading-5"
              htmlFor="contactOptIn"
            >
              Jeg samtykker til å kunne kontaktes på SMS og e-post om denne
              lesegruppa.
            </Label>
          </div>

          {state.status === "error" && (
            <p className="rounded-md border border-stone-500/30 bg-stone-100 p-3 font-semibold text-sm text-stone-800">
              {state.message}
            </p>
          )}

          <Button
            className="min-h-11"
            disabled={isPending || !contactOptIn}
            type="submit"
          >
            <Users />
            {isPending ? "Oppretter ..." : "Opprett gruppe"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  name,
  children,
}: {
  label: string;
  name: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="text-forest-950/80" htmlFor={name}>
        {label}
      </Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
