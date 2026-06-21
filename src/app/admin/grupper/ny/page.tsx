import { AdminCreateGroupForm } from "~/components/admin-forms";
import { SiteHeader } from "~/components/site-header";
import { PageHeader } from "~/components/ui";
import { Card, CardContent } from "~/components/ui/card";
import { requireAdminUserForPage } from "~/server/auth/page-guards";

export const metadata = {
  title: "Ny gruppe · Admin · Bibelbølgen",
};

export const dynamic = "force-dynamic";

export default async function NyGruppePage() {
  await requireAdminUserForPage("/admin/grupper/ny");

  return (
    <div className="min-h-screen bg-surface text-ink">
      <SiteHeader variant="admin" />

      <main className="bb-container py-10">
        <PageHeader
          kicker="Admin"
          lead="Opprett en lesegruppe og legg til flere administratorer etterpå."
          title="Ny gruppe"
        />

        <Card className="mt-8 max-w-3xl border-forest-900/10 bg-paper py-0">
          <CardContent className="p-6">
            <AdminCreateGroupForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
