import { KeyRound } from "lucide-react";
import { joinInviteGroupAction } from "~/app/bli-med/actions";
import { RegisterForm } from "~/components/register-form";
import { SiteHeader } from "~/components/site-header";
import { PageHeader } from "~/components/ui";
import { Badge } from "~/components/ui/badge";
import { findActiveInviteBySecret } from "~/server/groups/invites";

export const metadata = {
  title: "Invitasjon · Bibelbølgen",
};

export const dynamic = "force-dynamic";

function isShortInviteCode(code: string) {
  return /^\d{6}$/.test(code);
}

export default async function InvitasjonPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const invite = await findActiveInviteBySecret(code);
  const invitedGroup = invite?.group;
  const groupOptions = invitedGroup
    ? [
        {
          slug: invitedGroup.slug,
          name: invitedGroup.name,
          city: invitedGroup.city ?? "Digital gruppe",
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-surface text-ink">
      <SiteHeader active="/bli-med" />

      <main className="bb-container py-12">
        <PageHeader
          kicker="Privat invitasjon"
          lead="Bruk invitasjonslenken eller koden du har fått fra gruppelederen for å bli med i gruppa."
          title="Bli med i privat gruppe"
        >
          <Badge className="h-auto gap-2 bg-sage-100 px-3 py-2 text-forest-900">
            <KeyRound className="size-4" />
            {isShortInviteCode(code) ? `Kode: ${code}` : "Invitasjon"}
          </Badge>
        </PageHeader>

        <div className="mt-10 max-w-3xl">
          <RegisterForm
            action={joinInviteGroupAction}
            defaultGroup={invitedGroup?.slug}
            groupOptions={groupOptions}
            inviteSecret={code}
          />
        </div>
      </main>
    </div>
  );
}
