import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddGroupAdminForm } from "~/components/admin-forms";
import { SiteHeader } from "~/components/site-header";
import { Avatar, PageHeader } from "~/components/ui";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { requireAdminUserForPage } from "~/server/auth/page-guards";
import { getAdminGroupBySlug } from "~/server/groups/queries";
import { GroupAdminRole } from "../../../../../../generated/prisma/client";

export const metadata = {
  title: "Administratorer · Admin · Bibelbølgen",
};

export const dynamic = "force-dynamic";

export default async function GruppeadministratorerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const admin = await requireAdminUserForPage(`/admin/grupper/${slug}/admins`);
  const group = await getAdminGroupBySlug(slug, admin.id);

  if (!group) {
    notFound();
  }

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
            lead="Legg til flere administratorer som får tilgang til adminsidene for denne gruppa."
            title="Administratorer"
          />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.8fr]">
          <Card className="border-forest-900/10 bg-paper py-0 shadow-soft">
            <CardHeader className="border-forest-900/10 border-b p-6">
              <CardTitle className="font-black font-display text-forest-900 text-lg">
                Nåværende administratorer
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y divide-forest-900/10">
                {group.admins.map((assignment) => (
                  <li
                    className="flex items-center gap-3 px-6 py-4"
                    key={assignment.id}
                  >
                    <Avatar name={assignment.user.name} />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-forest-950">
                        {assignment.user.name}
                      </p>
                      <p className="text-ink/55 text-xs">
                        {assignment.user.phoneNumber} · {assignment.user.email}
                      </p>
                    </div>
                    <Badge className="bg-sage-100 text-forest-900">
                      <ShieldCheck className="size-3" />
                      {assignment.role === GroupAdminRole.OWNER
                        ? "Eier"
                        : "Admin"}
                    </Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-forest-900/10 bg-paper py-0 shadow-soft">
            <CardHeader className="p-6 pb-0">
              <CardTitle className="font-black font-display text-forest-900 text-lg">
                Legg til admin
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <AddGroupAdminForm groupId={group.id} groupSlug={group.slug} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
