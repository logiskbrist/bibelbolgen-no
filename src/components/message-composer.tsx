"use client";

import { CheckCircle2, Send } from "lucide-react";
import { useActionState, useState } from "react";
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
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Textarea } from "~/components/ui/textarea";

export function MessageComposer({
  emailRecipientCount,
  groupId,
  groupSlug,
  smsRecipientCount,
}: {
  emailRecipientCount: number;
  groupId: string;
  groupSlug: string;
  smsRecipientCount: number;
}) {
  const [state, formAction, isPending] = useActionState<
    AdminGroupActionState,
    FormData
  >(sendAdminGroupMessageAction, {});
  const [channel, setChannel] = useState<"SMS" | "EMAIL">("SMS");
  const [body, setBody] = useState("");
  const [subject, setSubject] = useState("");

  const maxSms = 160;
  const recipientCount =
    channel === "SMS" ? smsRecipientCount : emailRecipientCount;
  const canSend =
    body.trim().length > 0 &&
    recipientCount > 0 &&
    (channel === "SMS" || subject.trim().length > 0);

  return (
    <Card className="border-forest-900/10 bg-paper py-0">
      <CardHeader className="p-6 pb-0">
        <CardTitle className="font-black font-display text-forest-900 text-xl">
          Send melding til gruppa
        </CardTitle>
        <CardDescription>
          Når til {recipientCount} deltakere på en gang.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form action={formAction}>
          <input name="channel" type="hidden" value={channel} />
          <input name="groupId" type="hidden" value={groupId} />
          <input name="groupSlug" type="hidden" value={groupSlug} />

          <Tabs
            className="gap-0"
            onValueChange={(value) => {
              setChannel(value as "SMS" | "EMAIL");
            }}
            value={channel}
          >
            <TabsList className="bg-surface">
              <TabsTrigger value="SMS">SMS</TabsTrigger>
              <TabsTrigger value="EMAIL">E-post</TabsTrigger>
            </TabsList>
          </Tabs>

          {channel === "EMAIL" && (
            <div className="mt-4">
              <Label className="text-forest-950/80" htmlFor="message-subject">
                Emne
              </Label>
              <Input
                className="mt-1.5 min-h-11 bg-surface font-medium"
                id="message-subject"
                name="subject"
                onChange={(event) => {
                  setSubject(event.target.value);
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
              maxLength={channel === "SMS" ? maxSms : undefined}
              name="body"
              onChange={(event) => {
                setBody(event.target.value);
              }}
              placeholder={
                channel === "SMS"
                  ? "Husk samling i kveld kl 19 ..."
                  : "Hei alle sammen! Her er refleksjonsspørsmålene ..."
              }
              value={body}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-ink/50 text-xs">
            <span>
              {channel === "SMS"
                ? `${body.length}/${maxSms} tegn`
                : `${body.length} tegn`}
            </span>
            <span>Sendes til {recipientCount} deltakere</span>
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
            {isPending
              ? "Sender ..."
              : `Send ${channel === "SMS" ? "SMS" : "e-post"}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
