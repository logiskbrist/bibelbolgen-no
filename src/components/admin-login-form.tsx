"use client";

import { CheckCircle2, KeyRound, LogIn } from "lucide-react";
import { useActionState } from "react";
import {
  type AdminLoginState,
  requestAdminLoginCodeAction,
  verifyAdminLoginCodeAction,
} from "~/app/admin/login/actions";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

function LoginFeedback({ state }: { state: AdminLoginState }) {
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

export function AdminLoginForm({ nextPath }: { nextPath: string }) {
  const [requestState, requestAction, isRequestPending] = useActionState<
    AdminLoginState,
    FormData
  >(requestAdminLoginCodeAction, { step: "phone" });
  const [verifyState, verifyAction, isVerifyPending] = useActionState<
    AdminLoginState,
    FormData
  >(verifyAdminLoginCodeAction, {});
  const phoneNumber = verifyState.phoneNumber ?? requestState.phoneNumber ?? "";
  const shouldShowCodeStep =
    requestState.step === "code" || Boolean(phoneNumber);

  return (
    <div className="grid gap-6">
      <form action={requestAction} className="grid gap-5">
        <LoginFeedback state={requestState} />

        <div>
          <Label className="text-forest-950/80" htmlFor="phoneNumber">
            Telefonnummer
          </Label>
          <Input
            autoComplete="tel"
            className="mt-1.5 min-h-11 bg-surface font-medium"
            defaultValue={phoneNumber}
            id="phoneNumber"
            name="phoneNumber"
            placeholder="+47 900 00 000"
            required
            type="tel"
          />
        </div>

        <Button className="min-h-11" disabled={isRequestPending} type="submit">
          <KeyRound />
          {isRequestPending ? "Sender ..." : "Send engangskode"}
        </Button>
      </form>

      {shouldShowCodeStep && (
        <form action={verifyAction} className="grid gap-5">
          <input name="next" type="hidden" value={nextPath} />
          <input name="phoneNumber" type="hidden" value={phoneNumber} />

          <LoginFeedback state={verifyState} />

          {requestState.devCode && (
            <div className="rounded-lg border border-forest-900/10 bg-surface p-4">
              <p className="font-semibold text-forest-950/70 text-xs uppercase">
                Lokal engangskode
              </p>
              <p className="mt-1 font-black text-2xl text-forest-900 tracking-wide">
                {requestState.devCode}
              </p>
            </div>
          )}

          <div>
            <Label className="text-forest-950/80" htmlFor="code">
              Engangskode
            </Label>
            <Input
              autoComplete="one-time-code"
              className="mt-1.5 min-h-11 bg-surface font-medium"
              id="code"
              inputMode="numeric"
              maxLength={6}
              name="code"
              placeholder="123456"
              required
              type="text"
            />
          </div>

          <Button className="min-h-11" disabled={isVerifyPending} type="submit">
            <LogIn />
            {isVerifyPending ? "Logger inn ..." : "Logg inn"}
          </Button>
        </form>
      )}
    </div>
  );
}
