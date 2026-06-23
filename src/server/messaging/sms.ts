import "server-only";

export type SmsRecipient = {
  name: string;
  phoneNumber: string;
};

export async function sendSmsBatch({
  body,
  recipients,
}: {
  body: string;
  recipients: SmsRecipient[];
}) {
  if (recipients.length === 0) {
    return null;
  }

  if (!body.trim()) {
    throw new Error("SMS-meldingen kan ikke være tom.");
  }

  // TODO: Koble til valgt SMS-provider. Ikke logg eller lagre body her.
  return `local-sms-${Date.now()}`;
}
