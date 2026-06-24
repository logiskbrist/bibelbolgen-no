"use client";

import { CheckCircle2, Send } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import {
  type AdminGroupActionState,
  sendAdminGroupMessageAction,
} from "~/app/admin/grupper/actions";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

export function MessageComposer({
  groupId,
  groupSlug,
  smsRecipientCount,
}: {
  groupId: string;
  groupSlug: string;
  smsRecipientCount: number;
}) {
  const [state, formAction, isPending] = useActionState<
    AdminGroupActionState,
    FormData
  >(sendAdminGroupMessageAction, {});
  const [body, setBody] = useState("");

  const maxSms = 160;
  const recipientCount = smsRecipientCount;
  const canSend = body.trim().length > 0 && recipientCount > 0;

  useEffect(() => {
    if (state.ok) {
      setBody("");
    }
  }, [state.ok]);

  return (
    <Card className="border-forest-900/10 bg-paper py-0">
      <CardHeader className="p-6 pb-0">
        <CardTitle className="font-black font-display text-forest-900 text-xl">
          Send melding til gruppa
        </CardTitle>
        <CardDescription>
          Når til {recipientCount} personer på en gang.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-2">
        <form action={formAction}>
          <input name="channel" type="hidden" value="SMS" />
          <input name="groupId" type="hidden" value={groupId} />
          <input name="groupSlug" type="hidden" value={groupSlug} />

          <div className="mt-4">
            <Label className="text-forest-950/80" htmlFor="message-body">
              Melding
            </Label>
            <Textarea
              className="mt-1.5 min-h-32 resize-y bg-surface font-medium"
              id="message-body"
              maxLength={maxSms}
              name="body"
              onChange={(event) => {
                setBody(event.target.value);
              }}
              placeholder="Husk samling i kveld kl 19 ..."
              value={body}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-ink/50 text-xs">
            <span>
              {body.length}/{maxSms} tegn
            </span>
            <span>Sendes til {recipientCount} personer</span>
          </div>

          {state.message && (
            <Alert
              className={
                state.ok
                  ? "mt-4 border-forest-500/30 bg-sage-100 text-forest-900"
                  : "mt-4 border-stone-500/40 bg-stone-100 text-stone-800"
              }
            >
              {state.ok && <CheckCircle2 />}
              <AlertDescription className="font-semibold text-current">
                {state.message}
              </AlertDescription>
            </Alert>
          )}

          <Button
            className="mt-4 min-h-11 w-full"
            disabled={!canSend || isPending}
            type="submit"
          >
            <Send />
            {isPending ? "Sender ..." : "Send SMS"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
