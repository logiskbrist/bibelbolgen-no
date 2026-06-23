import "server-only";

export type EmailRecipient = {
  email: string;
  name: string;
};

export async function sendEmailBatch({
  body,
  recipients,
  subject,
}: {
  body: string;
  recipients: EmailRecipient[];
  subject: string;
}) {
  if (recipients.length === 0) {
    return null;
  }

  if (!subject.trim() || !body.trim()) {
    throw new Error("E-post må ha både emne og innhold.");
  }

  // TODO: Koble til valgt e-post-provider. Ikke logg eller lagre body her.
  return `local-email-${Date.now()}`;
}
