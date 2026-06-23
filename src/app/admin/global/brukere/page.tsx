import { SiteHeader } from "~/components/site-header";
import { PageHeader } from "~/components/ui";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import { listUsersForGlobalAdmin } from "~/server/admin/queries";
import { requireGlobalAdminForPage } from "~/server/auth/page-guards";
import {
  GroupAdminRole,
  SystemRole,
} from "../../../../../generated/prisma/client";

export const metadata = {
  title: "Brukere · Global admin · Bibelbølgen",
};

export const dynamic = "force-dynamic";

export default async function GlobaleBrukerePage() {
  const admin = await requireGlobalAdminForPage("/admin/global/brukere");
  const users = await listUsersForGlobalAdmin(admin.id);
  const globalAdmins = users.filter(
    (user) => user.systemRole === SystemRole.GLOBAL_ADMIN,
  );
  const groupAdmins = users.flatMap((user) =>
    user.adminAssignments.map((assignment) => ({
      assignment,
      user,
    })),
  );

  return (
    <div className="min-h-screen bg-surface text-ink">
      <SiteHeader variant="admin" />

      <main className="bb-container py-10">
        <PageHeader
          kicker="Global admin"
          lead="Se globale administratorer og lokale gruppeadministratorer."
          title="Brukere og roller"
        />

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <Card className="border-forest-900/10 bg-paper py-0 shadow-soft">
            <CardContent className="p-6">
              <h2 className="font-black font-display text-forest-900 text-xl">
                Globale administratorer
              </h2>
              {globalAdmins.length === 0 ? (
                <p className="bb-muted mt-4 text-sm leading-6">
                  Ingen globale administratorer registrert.
                </p>
              ) : (
                <ul className="mt-4 divide-y divide-forest-900/10">
                  {globalAdmins.map((globalAdmin) => (
                    <li
                      className="flex items-center justify-between gap-4 py-3"
                      key={globalAdmin.id}
                    >
                      <div>
                        <p className="font-bold text-forest-950">
                          {globalAdmin.name}
                        </p>
                        <p className="text-ink/55 text-xs">
                          {globalAdmin.email}
                        </p>
                      </div>
                      <Badge className="bg-forest-900 text-white">Global</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="border-forest-900/10 bg-paper py-0 shadow-soft">
            <CardContent className="p-6">
              <h2 className="font-black font-display text-forest-900 text-xl">
                Gruppeadministratorer
              </h2>
              {groupAdmins.length === 0 ? (
                <p className="bb-muted mt-4 text-sm leading-6">
                  Ingen gruppeadministratorer registrert.
                </p>
              ) : (
                <ul className="mt-4 divide-y divide-forest-900/10">
                  {groupAdmins.map(({ assignment, user }) => (
                    <li
                      className="flex items-center justify-between gap-4 py-3"
                      key={assignment.id}
                    >
                      <div>
                        <p className="font-bold text-forest-950">{user.name}</p>
                        <p className="text-ink/55 text-xs">
                          {assignment.group.name}
                        </p>
                      </div>
                      <Badge className="bg-sage-100 text-forest-900">
                        {assignment.role === GroupAdminRole.OWNER
                          ? "Eier"
                          : "Gruppe"}
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
