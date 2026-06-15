import type { CSSProperties } from "react";
import { PLAN_TOTAL_DAYS } from "~/lib/mock-data";

const groups = [
  { day: 1, members: 22, name: "Morgenbølgen" },
  { day: 2, members: 9, name: "Familiegruppe Nord" },
  { day: 3, members: 14, name: "Kveldsgjengen" },
  { day: 8, members: 6, name: "Markus 1" },
  { day: 9, members: 17, name: "Søndagsgruppa" },
  { day: 10, members: 4, name: "To hjem" },
  { day: 15, members: 19, name: "Lukasringen" },
  { day: 16, members: 8, name: "Etter skoletid" },
  { day: 17, members: 11, name: "Nabolaget" },
  { day: 22, members: 24, name: "Johannesgruppen" },
  { day: 23, members: 13, name: "Bønn og bibel" },
  { day: 24, members: 5, name: "Tre familier" },
  { day: 30, members: 20, name: "Apg-fellesskapet" },
  { day: 31, members: 7, name: "Studentene" },
  { day: 39, members: 16, name: "Romerbrevet" },
  { day: 40, members: 10, name: "Torsdag kveld" },
  { day: 47, members: 12, name: "Korint A" },
  { day: 48, members: 3, name: "Liten gruppe" },
  { day: 54, members: 8, name: "Korint B" },
  { day: 60, members: 15, name: "Galaterne" },
  { day: 65, members: 6, name: "Efeserbrevet" },
  { day: 69, members: 18, name: "Filipperne" },
  { day: 73, members: 9, name: "Kolosserne" },
  { day: 78, members: 11, name: "Tess 1" },
  { day: 82, members: 5, name: "Tess 2" },
  { day: 87, members: 7, name: "Timoteus 1" },
  { day: 91, members: 4, name: "Timoteus 2" },
  { day: 102, members: 21, name: "Hebreerne" },
  { day: 103, members: 12, name: "Langleserne" },
  { day: 108, members: 10, name: "Jakobs brev" },
  { day: 113, members: 14, name: "Peter 1" },
  { day: 117, members: 5, name: "Peter 2" },
  { day: 121, members: 8, name: "Johannes 1" },
  { day: 124, members: 3, name: "Johannes 2" },
  { day: 126, members: 4, name: "Johannes 3" },
  { day: 128, members: 6, name: "Judas" },
  { day: 134, members: 13, name: "Åpenbaringen" },
  { day: 135, members: 7, name: "Målstreken" },
];

const timelineWidth = 1000;
const scrollableTimelineWidth = 4590;
const timelineInset = 28;
const trackWidth = timelineWidth - timelineInset * 2;
const visibleMarkerDays = [1, 30, 60, 90, 120, 150];
const minMembers = Math.min(...groups.map((group) => group.members));
const maxMembers = Math.max(...groups.map((group) => group.members));
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
  return 250 - Math.sin((x / scrollableTimelineWidth) * Math.PI * 24) * 16;
}

function wavePoints() {
  return Array.from({ length: Math.ceil(timelineWidth / 24) + 1 }, (_, i) => {
    const x = Math.min(i * 24, timelineWidth);

    return `${x},${waveY(x) - 196}`;
  }).join(" ");
}

function groupColor(members: number) {
  const amount = (members - minMembers) / (maxMembers - minMembers || 1);
  const colorIndex = Math.min(
    dotColors.length - 1,
    Math.floor(amount * dotColors.length),
  );

  return dotColors[colorIndex] ?? "var(--color-forest-900)";
}

function getDotStyle(group: (typeof groups)[number], index: number) {
  const sameDay = groups
    .filter((candidate) => Math.abs(candidate.day - group.day) <= 1)
    .sort((a, b) => a.day - b.day);
  const dayIndex = sameDay.indexOf(group);
  const laneWidth = Math.min(34, trackWidth / PLAN_TOTAL_DAYS);
  const slot = sameDay.length === 1 ? 0.5 : (dayIndex + 0.5) / sameDay.length;
  const groupXJitter = xJitter[index % xJitter.length] ?? 0;
  const groupYJitter = yJitter[index % yJitter.length] ?? 0;
  const clusterOffset = clusterOffsets[index % clusterOffsets.length] ?? 0;
  const x =
    timelineInset +
    (group.day / PLAN_TOTAL_DAYS) * trackWidth -
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
    "--dot": groupColor(group.members),
    "--size": `${size}px`,
    "--x": `${
      (Math.max(timelineInset, Math.min(timelineWidth - timelineInset, x)) /
        timelineWidth) *
      100
    }%`,
    "--y": `${Math.max(34, y)}px`,
  } as CSSProperties;
}

function markerX(day: number) {
  return timelineInset + (day / PLAN_TOTAL_DAYS) * trackWidth;
}

type BibleTimelineProps = {
  className?: string;
};

export function BibleTimeline({ className }: BibleTimelineProps) {
  return (
    <section aria-labelledby="timeline-title" className={className} id="bolgen">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="bb-kicker">Levende tidslinje</p>
          <h2
            className="mt-3 max-w-3xl text-balance font-black font-display text-3xl text-forest-900 leading-none sm:text-5xl"
            id="timeline-title"
          >
            Hvor er folk i Det nye testamentet?
          </h2>
        </div>
      </div>

      <div className="overflow-hidden border border-forest-900/15 bg-paper/70 shadow-soft backdrop-blur-sm">
        <div className="px-0 pt-8 pb-4">
          <div className="relative h-[350px] w-full">
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
              {groups
                .slice()
                .sort((a, b) => a.day - b.day)
                .map((group, index) => (
                  <span
                    className="bb-person-dot"
                    key={`${group.name}-${group.day}`}
                    style={getDotStyle(group, index)}
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
                    left: `${(markerX(day) / timelineWidth) * 100}%`,
                    transform:
                      day === PLAN_TOTAL_DAYS
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
