"use client";

import { CheckCircle2, KeyRound, Plus, UserPlus } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import {
  type AdminGroupActionState,
  addGroupAdminAction,
  createAdminGroupAction,
  createInviteAction,
} from "~/app/admin/grupper/actions";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "~/components/ui/native-select";
import { Textarea } from "~/components/ui/textarea";

function ActionFeedback({ state }: { state: AdminGroupActionState }) {
  if (!state.message) {
    return null;
  }

  return (
    <Alert
      className={
        state.ok
          ? "border-forest-500/30 bg-sage-100 text-forest-900"
          : "border-stone-500/40 bg-stone-100 text-stone-800"
      }
    >
      {state.ok && <CheckCircle2 />}
      <AlertDescription className="font-semibold text-current">
        {state.message}
      </AlertDescription>
    </Alert>
  );
}

export function AdminCreateGroupForm() {
  const [state, formAction, isPending] = useActionState<
    AdminGroupActionState,
    FormData
  >(createAdminGroupAction, {});

  return (
    <form action={formAction} className="grid gap-5">
      <ActionFeedback state={state} />

      {state.groupHref && (
        <Button asChild className="w-fit" variant="secondary">
          <Link href={state.groupHref}>Gå til gruppeadmin</Link>
        </Button>
      )}

      {state.inviteHref && (
        <div className="rounded-lg border border-forest-900/10 bg-surface p-4">
          <Label className="text-forest-950/80" htmlFor="created-invite">
            Privat invitasjonslenke
          </Label>
          <Input
            className="mt-1.5 min-h-11 bg-paper font-medium"
            id="created-invite"
            readOnly
            value={state.inviteHref}
          />
          {state.code && (
            <p className="mt-2 font-semibold text-forest-900 text-sm">
              Kode: {state.code}
            </p>
          )}
        </div>
      )}

      <div>
        <Label className="text-forest-950/80" htmlFor="name">
          Gruppenavn
        </Label>
        <Input
          className="mt-1.5 min-h-11 bg-surface font-medium"
          id="name"
          name="name"
          required
          type="text"
        />
      </div>

      <div>
        <Label className="text-forest-950/80" htmlFor="description">
          Beskrivelse
        </Label>
        <Textarea
          className="mt-1.5 min-h-28 bg-surface font-medium"
          id="description"
          name="description"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label className="text-forest-950/80" htmlFor="city">
            Sted
          </Label>
          <Input
            className="mt-1.5 min-h-11 bg-surface font-medium"
            id="city"
            name="city"
            type="text"
          />
        </div>
        <div>
          <Label className="text-forest-950/80" htmlFor="starts-on">
            Startdato
          </Label>
          <Input
            className="mt-1.5 min-h-11 bg-surface font-medium"
            id="starts-on"
            name="startsOn"
            required
            type="date"
          />
        </div>
      </div>

      <div>
        <Label className="text-forest-950/80" htmlFor="visibility">
          Tilgang
        </Label>
        <NativeSelect
          className="mt-1.5 w-full"
          id="visibility"
          name="visibility"
        >
          <NativeSelectOption value="PUBLIC">Åpen gruppe</NativeSelectOption>
          <NativeSelectOption value="PRIVATE">Privat gruppe</NativeSelectOption>
        </NativeSelect>
      </div>

      <Button className="min-h-11" disabled={isPending} type="submit">
        <Plus />
        {isPending ? "Oppretter ..." : "Opprett gruppe"}
      </Button>
    </form>
  );
}

export function AddGroupAdminForm({
  groupId,
  groupSlug,
}: {
  groupId: string;
  groupSlug: string;
}) {
  const [state, formAction, isPending] = useActionState<
    AdminGroupActionState,
    FormData
  >(addGroupAdminAction, {});

  return (
    <form action={formAction} className="grid gap-5">
      <input name="groupId" type="hidden" value={groupId} />
      <input name="groupSlug" type="hidden" value={groupSlug} />

      <ActionFeedback state={state} />

      <div>
        <Label className="text-forest-950/80" htmlFor="admin-name">
          Navn
        </Label>
        <Input
          autoComplete="name"
          className="mt-1.5 min-h-11 bg-surface font-medium"
          id="admin-name"
          name="name"
          required
          type="text"
        />
      </div>

      <div>
        <Label className="text-forest-950/80" htmlFor="admin-phone">
          Telefonnummer
        </Label>
        <Input
          autoComplete="tel"
          className="mt-1.5 min-h-11 bg-surface font-medium"
          id="admin-phone"
          name="phoneNumber"
          placeholder="+47 900 00 000"
          required
          type="tel"
        />
      </div>

      <div>
        <Label className="text-forest-950/80" htmlFor="admin-email">
          E-post
        </Label>
        <Input
          autoComplete="email"
          className="mt-1.5 min-h-11 bg-surface font-medium"
          id="admin-email"
          name="email"
          placeholder="navn@example.no"
          required
          type="email"
        />
      </div>

      <Button className="min-h-11" disabled={isPending} type="submit">
        <UserPlus />
        {isPending ? "Legger til ..." : "Legg til admin"}
      </Button>
    </form>
  );
}

export function CreateInviteForm({
  groupId,
  groupSlug,
}: {
  groupId: string;
  groupSlug: string;
}) {
  const [state, formAction, isPending] = useActionState<
    AdminGroupActionState,
    FormData
  >(createInviteAction, {});

  return (
    <form action={formAction} className="grid gap-5">
      <input name="groupId" type="hidden" value={groupId} />
      <input name="groupSlug" type="hidden" value={groupSlug} />

      <ActionFeedback state={state} />

      {state.inviteHref && (
        <div>
          <Label className="text-forest-950/80" htmlFor="invite-url">
            Invitasjonslenke
          </Label>
          <Input
            className="mt-1.5 min-h-11 bg-surface font-medium"
            id="invite-url"
            readOnly
            value={state.inviteHref}
          />
        </div>
      )}

      {state.code && (
        <div>
          <Label className="text-forest-950/80" htmlFor="invite-code">
            Kode
          </Label>
          <Input
            className="mt-1.5 min-h-11 bg-surface font-medium"
            id="invite-code"
            readOnly
            value={state.code}
          />
        </div>
      )}

      <Button className="min-h-11" disabled={isPending} type="submit">
        <KeyRound />
        {isPending ? "Lager ..." : "Lag ny invitasjon"}
      </Button>
    </form>
  );
}
