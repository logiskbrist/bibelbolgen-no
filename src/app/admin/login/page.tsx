import { redirect } from "next/navigation";
import { AdminLoginForm } from "~/components/admin-login-form";
import { SiteHeader } from "~/components/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { getCurrentUser } from "~/server/auth/permissions";
import { SessionKind } from "../../../../generated/prisma/client";

export const metadata = {
  title: "Admin-login · Bibelbølgen",
};

export const dynamic = "force-dynamic";

function safeNextPath(nextPath?: string | string[]) {
  const value = Array.isArray(nextPath) ? nextPath[0] : nextPath;

  if (!value?.startsWith("/admin") || value.startsWith("//")) {
    return "/admin";
  }

  return value;
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;
  const nextPath = safeNextPath(next);
  const admin = await getCurrentUser(SessionKind.ADMIN);

  if (admin) {
    redirect(nextPath);
  }

  return (
    <div className="min-h-screen bg-surface text-ink">
      <SiteHeader showAdminSessionActions={false} variant="admin" />

      <main className="bb-container flex min-h-[calc(100svh-4rem)] items-center py-12">
        <Card className="mx-auto w-full max-w-md border-forest-900/10 bg-paper py-0">
          <CardHeader className="p-6 pb-0">
            <CardTitle className="font-black font-display text-2xl text-forest-900">
              Logg inn som admin
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <AdminLoginForm nextPath={nextPath} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
