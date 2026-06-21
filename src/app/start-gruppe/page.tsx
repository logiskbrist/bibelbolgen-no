import { CalendarDays, Lock, Users } from "lucide-react";
import { SiteHeader } from "~/components/site-header";
import { StartGroupForm } from "~/components/start-group-form";
import { PageHeader } from "~/components/ui";
import { Card, CardContent } from "~/components/ui/card";

export const metadata = {
  title: "Start gruppe · Bibelbølgen",
};

export default function StartGruppePage() {
  return (
    <div className="min-h-screen bg-surface text-ink">
      <SiteHeader active="/start-gruppe" />

      <main className="bb-container py-12">
        <PageHeader
          kicker="Ny gruppe"
          lead="Start en lesegruppe, velg om den skal være åpen eller privat, og inviter deltakere inn med lenke eller kode."
          title="Start en gruppe"
        />

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-start">
          <StartGroupForm />

          <div className="grid gap-4">
            <InfoCard
              icon={<Users className="size-5" />}
              title="Den som starter gruppa blir admin"
            />
            <InfoCard
              icon={<Lock className="size-5" />}
              title="Private grupper kan deles med kode eller lenke"
            />
            <InfoCard
              icon={<CalendarDays className="size-5" />}
              title="Gruppas dag regnes fra valgt startdato"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function InfoCard({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <Card className="border-forest-900/10 bg-paper py-0">
      <CardContent className="flex items-center gap-3 p-5">
        <div className="flex size-10 items-center justify-center rounded-md bg-sage-100 text-forest-900">
          {icon}
        </div>
        <p className="font-bold text-forest-950">{title}</p>
      </CardContent>
    </Card>
  );
}
