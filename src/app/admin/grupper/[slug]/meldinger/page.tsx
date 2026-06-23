import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageComposer } from "~/components/message-composer";
import { SiteHeader } from "~/components/site-header";
import { PageHeader } from "~/components/ui";
import { Button } from "~/components/ui/button";
import { requireAdminUserForPage } from "~/server/auth/page-guards";
import { getAdminGroupBySlug } from "~/server/groups/queries";

export const metadata = {
  title: "Send SMS · Admin · Bibelbølgen",
};

export const dynamic = "force-dynamic";

export default async function GruppemeldingerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const admin = await requireAdminUserForPage(
    `/admin/grupper/${slug}/meldinger`,
  );
  const group = await getAdminGroupBySlug(slug, admin.id);

  if (!group) {
    notFound();
  }

  const smsRecipientCount = group.memberships.filter(
    (membership) => membership.smsOptIn,
  ).length;
  const emailRecipientCount = group.memberships.filter(
    (membership) => membership.emailOptIn,
  ).length;

  return (
    <div className="min-h-screen bg-surface text-ink">
      <SiteHeader variant="admin" />

      <main className="bb-container py-10">
        <Button asChild className="-ml-2" size="sm" variant="ghost">
          <Link href={`/admin/grupper/${group.slug}`}>← Til gruppeadmin</Link>
        </Button>

        <div className="mt-6">
          <PageHeader
            kicker={group.name}
            lead="Send en SMS- eller e-postoppdatering til gruppa. Selve meldingen lagres ikke i databasen."
            title="Send melding"
          />
        </div>

        <div className="mt-8 max-w-xl">
          <MessageComposer
            emailRecipientCount={emailRecipientCount}
            groupId={group.id}
            groupSlug={group.slug}
            smsRecipientCount={smsRecipientCount}
          />
        </div>
      </main>
    </div>
  );
}
