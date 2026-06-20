import type { CSSProperties } from "react";

export type GroupTimelineEntry = {
  day: number;
  id: string;
  members: number;
  name: string;
};

const timelineWidth = 1000;
const timelineInset = 28;
const trackWidth = timelineWidth - timelineInset * 2;
const clusterOffsets = [-34, -64, -17, -88, -48, -108];
const dotColors = [
  "var(--color-sage-300)",
  "var(--color-sage-400)",
  "var(--color-forest-500)",
  "var(--color-forest-700)",
  "var(--color-forest-900)",
];
const xJitter = [-9, 11, -4, 8, -13, 6];
const yJitter = [-3, 5, -7, 2, 8, -5];

function waveY(x: number) {
  return 250 - Math.sin((x / timelineWidth) * Math.PI * 6) * 16;
}

function wavePoints() {
  return Array.from({ length: Math.ceil(timelineWidth / 24) + 1 }, (_, i) => {
    const x = Math.min(i * 24, timelineWidth);

    return `${x},${waveY(x) - 196}`;
  }).join(" ");
}

function groupColor(members: number, minMembers: number, maxMembers: number) {
  const amount = (members - minMembers) / (maxMembers - minMembers || 1);
  const colorIndex = Math.min(
    dotColors.length - 1,
    Math.floor(amount * dotColors.length),
  );

  return dotColors[colorIndex] ?? "var(--color-forest-900)";
}

function getDotStyle({
  group,
  groups,
  index,
  maxMembers,
  minMembers,
  totalDays,
}: {
  group: GroupTimelineEntry;
  groups: GroupTimelineEntry[];
  index: number;
  maxMembers: number;
  minMembers: number;
  totalDays: number;
}) {
  const sameDay = groups
    .filter((candidate) => Math.abs(candidate.day - group.day) <= 1)
    .sort((a, b) => a.day - b.day);
  const dayIndex = sameDay.indexOf(group);
  const laneWidth = Math.min(34, trackWidth / totalDays);
  const slot = sameDay.length === 1 ? 0.5 : (dayIndex + 0.5) / sameDay.length;
  const groupXJitter = xJitter[index % xJitter.length] ?? 0;
  const groupYJitter = yJitter[index % yJitter.length] ?? 0;
  const clusterOffset = clusterOffsets[index % clusterOffsets.length] ?? 0;
  const x =
    timelineInset +
    (group.day / totalDays) * trackWidth -
    laneWidth * 0.5 +
    laneWidth * slot +
    groupXJitter;
  const y = waveY(x) + clusterOffset + groupYJitter;
  const size =
    22 +
    Math.round(
      ((group.members - minMembers) / (maxMembers - minMembers || 1)) * 7,
    );

  return {
    "--dot": groupColor(group.members, minMembers, maxMembers),
    "--size": `${size}px`,
    "--x": `${
      (Math.max(timelineInset, Math.min(timelineWidth - timelineInset, x)) /
        timelineWidth) *
      100
    }%`,
    "--y": `${Math.max(34, y)}px`,
  } as CSSProperties;
}

function markerX(day: number, totalDays: number) {
  return timelineInset + (day / totalDays) * trackWidth;
}

function getVisibleMarkerDays(totalDays: number) {
  const markers = Array.from({ length: 6 }, (_, index) =>
    index === 0 ? 1 : Math.round((totalDays / 5) * index),
  );

  return [...new Set(markers.filter((day) => day >= 1 && day <= totalDays))];
}

type GroupTimelineProps = {
  className?: string;
  groups: GroupTimelineEntry[];
  totalDays: number;
};

export function GroupTimeline({
  className,
  groups,
  totalDays,
}: GroupTimelineProps) {
  const timelineTotalDays = Math.max(1, totalDays);
  const visibleGroups = groups
    .filter((group) => group.day > 0 && group.day <= timelineTotalDays)
    .sort((a, b) => a.day - b.day);
  const minMembers =
    visibleGroups.length > 0
      ? Math.min(...visibleGroups.map((group) => group.members))
      : 0;
  const maxMembers =
    visibleGroups.length > 0
      ? Math.max(...visibleGroups.map((group) => group.members))
      : 0;
  const visibleMarkerDays = getVisibleMarkerDays(timelineTotalDays);

  return (
    <section aria-labelledby="timeline-title" className={className} id="bolgen">

      <div className="overflow-hidden border border-forest-900/15 bg-paper/70 shadow-soft backdrop-blur-sm">
        <div className="px-0 pt-8 pb-4">
          <div className="relative h-[350px] w-full">
            {visibleGroups.length === 0 && (
              <p className="absolute top-1/2 right-8 left-8 z-10 mx-auto max-w-md -translate-y-1/2 text-center font-semibold text-forest-950/60 text-sm leading-6">
                Tidslinjen fylles når åpne grupper starter leseplanen.
              </p>
            )}
            <svg
              aria-hidden="true"
              className="absolute top-[196px] left-0 h-[120px] w-full"
              preserveAspectRatio="none"
              viewBox={`0 0 ${timelineWidth} 120`}
            >
              <polyline
                className="fill-none stroke-forest-700 [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:7]"
                points={wavePoints()}
              />
            </svg>

            <div aria-hidden="true">
              {visibleGroups.map((group, index) => (
                <span
                  className="bb-person-dot"
                  data-label={`${group.name}: ${group.members} personer, dag ${group.day}`}
                  key={group.id}
                  style={getDotStyle({
                    group,
                    groups: visibleGroups,
                    index,
                    maxMembers,
                    minMembers,
                    totalDays: timelineTotalDays,
                  })}
                  title={`${group.name}: ${group.members} personer, dag ${group.day}`}
                />
              ))}
            </div>

            <div
              aria-hidden="true"
              className="absolute right-0 bottom-0 left-0"
            >
              {visibleMarkerDays.map((day) => (
                <div
                  className="absolute bottom-0 text-center font-bold text-forest-950 text-xs"
                  key={day}
                  style={{
                    left: `${(markerX(day, timelineTotalDays) / timelineWidth) * 100}%`,
                    transform:
                      day === timelineTotalDays
                        ? "translateX(-100%)"
                        : "translateX(-50%)",
                  }}
                >
                  <span className="mx-auto mb-2 block h-7 w-px bg-forest-900/20" />
                  Dag {day}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
