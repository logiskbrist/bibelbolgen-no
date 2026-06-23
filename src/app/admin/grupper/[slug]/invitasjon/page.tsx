import Link from "next/link";
import { notFound } from "next/navigation";
import { CreateInviteForm } from "~/components/admin-forms";
import { SiteHeader } from "~/components/site-header";
import { PageHeader } from "~/components/ui";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { requireAdminUserForPage } from "~/server/auth/page-guards";
import { listGroupInvitesForAdmin } from "~/server/groups/invites";
import { getAdminGroupBySlug } from "~/server/groups/queries";

export const metadata = {
  title: "Invitasjon · Admin · Bibelbølgen",
};

export const dynamic = "force-dynamic";

export default async function GruppeinvitasjonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const admin = await requireAdminUserForPage(
    `/admin/grupper/${slug}/invitasjon`,
  );
  const group = await getAdminGroupBySlug(slug, admin.id);

  if (!group) {
    notFound();
  }

  const invites = await listGroupInvitesForAdmin({
    adminUserId: admin.id,
    groupId: group.id,
  });

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
            lead="Lag en ny lenke eller kode og del den med personer som skal inn i gruppa."
            title="Invitasjon"
          />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[0.85fr_1fr]">
          <Card className="border-forest-900/10 bg-paper py-0 shadow-soft">
            <CardHeader className="border-forest-900/10 border-b p-6">
              <CardTitle className="font-black font-display text-forest-900 text-lg">
                Ny privat lenke og kode
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <CreateInviteForm groupId={group.id} groupSlug={group.slug} />
              <p className="bb-muted mt-4 text-xs leading-5">
                Av sikkerhetsgrunner lagres bare hasher av lenker og koder.
                Kopier ny invitasjon når den vises her.
              </p>
            </CardContent>
          </Card>

          <Card className="border-forest-900/10 bg-paper py-0 shadow-soft">
            <CardHeader className="border-forest-900/10 border-b p-6">
              <CardTitle className="font-black font-display text-forest-900 text-lg">
                Aktive invitasjoner
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {invites.length === 0 ? (
                <div className="p-6">
                  <p className="bb-muted text-sm leading-6">
                    Det finnes ingen aktive invitasjoner for denne gruppa ennå.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-forest-900/10">
                  {invites.map((invite) => (
                    <li className="flex items-center gap-4 p-6" key={invite.id}>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-forest-950">
                          Opprettet{" "}
                          {invite.createdAt.toLocaleDateString("nb-NO", {
                            day: "numeric",
                            month: "long",
                          })}
                        </p>
                        <p className="text-ink/55 text-xs">
                          {invite.createdBy?.name ?? "Ukjent admin"} · brukt{" "}
                          {invite.usedCount}
                          {invite.maxUses ? ` av ${invite.maxUses}` : ""}
                        </p>
                      </div>
                      <Badge className="bg-sage-100 text-forest-900">
                        Aktiv
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
