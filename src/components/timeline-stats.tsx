type TimelineStatsProps = {
  completed150Days: number;
  peopleReading: number;
  waves: number;
};

function formatStat(value: number) {
  return new Intl.NumberFormat("nb-NO").format(value);
}

function TimelineStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex min-h-16 flex-col items-center justify-center gap-4 rounded-card bg-sage-50 px-3 py-2 text-center">
      <span className="font-black font-display text-2xl text-forest-900 leading-none sm:text-3xl">
        {formatStat(value)}
      </span>
      <span className="font-bold text-[0.68rem] text-forest-950/62 uppercase leading-tight">
        {label}
      </span>
    </div>
  );
}

export function TimelineStats({
  completed150Days,
  peopleReading,
  waves,
}: TimelineStatsProps) {
  return (
    <div className="mx-auto mt-15 grid w-full max-w-100 grid-cols-3 gap-5 sm:max-w-150 sm:justify-center sm:gap-8">
      <TimelineStat label="Bølger" value={waves} />
      <TimelineStat label="Mennesker som leser" value={peopleReading} />
      <TimelineStat
        label="Bølger fullført 150 dager"
        value={completed150Days}
      />
    </div>
  );
}
