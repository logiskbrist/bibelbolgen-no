import { AvatarFallback, Avatar as ShadcnAvatar } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { cn } from "~/lib/utils";

export type ProgressStatus = "ahead" | "on-track" | "behind" | "not-started";

const statusMeta: Record<
  ProgressStatus,
  { label: string; tone: "ahead" | "ontrack" | "behind" | "neutral" }
> = {
  ahead: { label: "Foran planen", tone: "ahead" },
  "on-track": { label: "I rute", tone: "ontrack" },
  behind: { label: "Bak planen", tone: "behind" },
  "not-started": { label: "Ikke startet", tone: "neutral" },
};

const toneClasses: Record<string, string> = {
  ahead: "border-forest-500/30 bg-sky-100 text-forest-900",
  ontrack: "border-forest-500/30 bg-sage-100 text-forest-900",
  behind: "border-stone-500/40 bg-stone-200 text-stone-700",
  neutral: "border-ink/15 bg-surface text-ink/60",
};

export function StatusBadge({ status }: { status: ProgressStatus }) {
  const meta = statusMeta[status];

  return (
    <Badge
      className={cn(
        "h-auto rounded-md px-2.5 py-1 font-bold",
        toneClasses[meta.tone],
      )}
      variant="outline"
    >
      <span
        aria-hidden
        className="size-1.5 rounded-full bg-current opacity-70"
      />
      {meta.label}
    </Badge>
  );
}

export function ProgressBar({
  value,
  expected,
}: {
  value: number;
  expected?: number;
}) {
  const boundedValue = Math.min(100, Math.max(0, value));

  return (
    <div className="relative">
      <Progress
        aria-label={`Fremdrift ${boundedValue} prosent`}
        className="h-2.5 bg-sage-100 [&_[data-slot=progress-indicator]]:bg-forest-700"
        value={boundedValue}
      />
      {expected !== undefined && (
        <span
          aria-hidden
          className="absolute top-[-3px] bottom-[-3px] w-0.5 rounded bg-stone-500"
          style={{ left: `${Math.min(100, Math.max(0, expected))}%` }}
          title="Forventet fremdrift i dag"
        />
      )}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Card className="border-forest-900/10 bg-paper py-0 shadow-soft">
      <CardContent className="p-5">
        <p className="font-black text-4xl text-forest-900 leading-none">
          {value}
        </p>
        <p className="mt-2 font-semibold text-forest-950/70 text-sm">{label}</p>
        {hint && <p className="mt-1 text-ink/50 text-xs">{hint}</p>}
      </CardContent>
    </Card>
  );
}

export function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <ShadcnAvatar className="size-9">
      <AvatarFallback className="bg-forest-900 font-bold text-sm text-white">
        {initials}
      </AvatarFallback>
    </ShadcnAvatar>
  );
}

export function PageHeader({
  kicker,
  title,
  lead,
  children,
}: {
  kicker: string;
  title: string;
  lead?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className="bb-kicker">{kicker}</p>
        <h1 className="mt-3 text-balance font-black font-display text-4xl text-forest-900 leading-[0.95] sm:text-5xl">
          {title}
        </h1>
        {lead && (
          <p className="bb-muted mt-4 max-w-xl font-medium text-lg leading-7">
            {lead}
          </p>
        )}
      </div>
      {children && <div className="flex shrink-0 gap-3">{children}</div>}
    </div>
  );
}
