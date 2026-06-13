import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient, ReadingDayKind } from "../generated/prisma/client";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Missing required environment variable: DATABASE_URL");
}

const adapter = new PrismaMariaDb(databaseUrl);
const prisma = new PrismaClient({ adapter });

const planSeed = {
  slug: "hjelp-meg-a-lese-bibelen-2026",
  title: "Hjelp meg å lese Bibelen",
  totalDays: 150,
};

type SectionSeed = {
  sortOrder: number;
  name: string;
  subtitle: string;
  startDayNumber: number;
  endDayNumber: number;
};

type DaySeed = {
  dayNumber: number;
  readingText: string;
};

const sections = [
  {
    sortOrder: 1,
    name: "Matteusevangeliet",
    subtitle: "Jesus er jødenes konge",
    startDayNumber: 1,
    endDayNumber: 16,
  },
  {
    sortOrder: 2,
    name: "Romerne",
    subtitle: "Det er mer nåde i Jesus enn synd i deg!",
    startDayNumber: 17,
    endDayNumber: 24,
  },
  {
    sortOrder: 3,
    name: "Første Korinterbrev",
    subtitle: "Når de kristne ikke viser Guds godhet",
    startDayNumber: 25,
    endDayNumber: 32,
  },
  {
    sortOrder: 4,
    name: "Andre Korinterbrev",
    subtitle: "Gud ser deg når du er svak",
    startDayNumber: 33,
    endDayNumber: 38,
  },
  {
    sortOrder: 5,
    name: "Lukas",
    subtitle: "Jesus er for absolutt alle",
    startDayNumber: 39,
    endDayNumber: 54,
  },
  {
    sortOrder: 6,
    name: "Apostlenes gjerninger",
    subtitle: "Evangeliet går ut til hele verden",
    startDayNumber: 55,
    endDayNumber: 71,
  },
  {
    sortOrder: 7,
    name: "Galaterne",
    subtitle: "Gode gjerninger kan ikke frelse, men Jesus kan",
    startDayNumber: 72,
    endDayNumber: 74,
  },
  {
    sortOrder: 8,
    name: "Efeserne",
    subtitle: "Frykt ikke, du har en enorm rikdom i Gud",
    startDayNumber: 75,
    endDayNumber: 79,
  },
  {
    sortOrder: 9,
    name: "Filipperne",
    subtitle: "Det kristne livet er et kall til ydmykhet og vennskap",
    startDayNumber: 80,
    endDayNumber: 82,
  },
  {
    sortOrder: 10,
    name: "Kolosserne",
    subtitle: "Jesus er universets sentrum",
    startDayNumber: 83,
    endDayNumber: 86,
  },
  {
    sortOrder: 11,
    name: "Markus",
    subtitle:
      "Jesus er den med ekte autoritet, og inviterer oss til å følge ham",
    startDayNumber: 87,
    endDayNumber: 96,
  },
  {
    sortOrder: 12,
    name: "Første Tessaloniker",
    subtitle: "Lev i kjærlighet mens dere venter på Jesus",
    startDayNumber: 97,
    endDayNumber: 99,
  },
  {
    sortOrder: 13,
    name: "Andre Tessaloniker",
    subtitle: "Vær trofaste til Jesus kommer igjen",
    startDayNumber: 100,
    endDayNumber: 101,
  },
  {
    sortOrder: 14,
    name: "Første Timoteus",
    subtitle: "Lev et liv med integritet og ærlighet",
    startDayNumber: 102,
    endDayNumber: 105,
  },
  {
    sortOrder: 15,
    name: "Andre Timoteus",
    subtitle: "Stafettpinnen gis videre",
    startDayNumber: 106,
    endDayNumber: 107,
  },
  {
    sortOrder: 16,
    name: "Titus",
    subtitle: "Guds nåde skaper forandring",
    startDayNumber: 108,
    endDayNumber: 109,
  },
  {
    sortOrder: 17,
    name: "Filemon",
    subtitle: "Ta imot hverandre med tilgivelse og kjærlighet",
    startDayNumber: 110,
    endDayNumber: 110,
  },
  {
    sortOrder: 18,
    name: "Hebreerne",
    subtitle: "Jesus er større og bedre",
    startDayNumber: 111,
    endDayNumber: 116,
  },
  {
    sortOrder: 19,
    name: "Jakob",
    subtitle: "Jesus er sann - lev deretter!",
    startDayNumber: 117,
    endDayNumber: 120,
  },
  {
    sortOrder: 20,
    name: "Første Peter",
    subtitle: "Jesus er et solid håp i lidelse",
    startDayNumber: 121,
    endDayNumber: 123,
  },
  {
    sortOrder: 21,
    name: "Andre Peter",
    subtitle: "Voks i kjennskap og kjærlighet til Jesus",
    startDayNumber: 124,
    endDayNumber: 126,
  },
  {
    sortOrder: 22,
    name: "Judas",
    subtitle: "Bli i Guds kjærlighet",
    startDayNumber: 127,
    endDayNumber: 127,
  },
  {
    sortOrder: 23,
    name: "Johannes",
    subtitle: "Jesus er sant menneske og sann Gud",
    startDayNumber: 128,
    endDayNumber: 138,
  },
  {
    sortOrder: 24,
    name: "Første Johannesbrev",
    subtitle: "La hjertet falle til ro hos Gud",
    startDayNumber: 139,
    endDayNumber: 141,
  },
  {
    sortOrder: 25,
    name: "Andre Johannesbrev",
    subtitle: "Beskytt sannheten om Jesus",
    startDayNumber: 142,
    endDayNumber: 142,
  },
  {
    sortOrder: 26,
    name: "Tredje Johannesbrev",
    subtitle: "Vær en medarbeider for sannheten",
    startDayNumber: 143,
    endDayNumber: 143,
  },
  {
    sortOrder: 27,
    name: "Johannes' åpenbaring",
    subtitle: "Hold ut - Jesus vinner!",
    startDayNumber: 144,
    endDayNumber: 150,
  },
] satisfies SectionSeed[];

const days = [
  { dayNumber: 1, readingText: "Intro + Matt 1,1-17" },
  { dayNumber: 2, readingText: "Matt 1,18-4,25" },
  { dayNumber: 3, readingText: "Matt 5 + 6" },
  { dayNumber: 4, readingText: "Matt 7 + 8" },
  { dayNumber: 5, readingText: "Matt 9 + 10" },
  { dayNumber: 6, readingText: "Matt 11 + 12" },
  { dayNumber: 7, readingText: "Ingen lesing" },
  { dayNumber: 8, readingText: "Matt 13 + 14" },
  { dayNumber: 9, readingText: "Matt 15 + 16" },
  { dayNumber: 10, readingText: "Matt 17 + 18 + 19" },
  { dayNumber: 11, readingText: "Matt 20 + 21" },
  { dayNumber: 12, readingText: "Matt 22 + 23" },
  { dayNumber: 13, readingText: "Matt 24 + 25" },
  { dayNumber: 14, readingText: "Ingen lesing" },
  { dayNumber: 15, readingText: "Matt 26" },
  { dayNumber: 16, readingText: "Matt 27 + 28" },
  { dayNumber: 17, readingText: "Intro + Rom 1,1-17" },
  { dayNumber: 18, readingText: "Rom 1,18-3,31" },
  { dayNumber: 19, readingText: "Rom 4 + 5 + 6" },
  { dayNumber: 20, readingText: "Rom 7 + 8" },
  { dayNumber: 21, readingText: "Ingen lesing" },
  { dayNumber: 22, readingText: "Rom 9 + 10 + 11" },
  { dayNumber: 23, readingText: "Rom 12 + 13 + 14" },
  { dayNumber: 24, readingText: "Rom 15 + 16" },
  { dayNumber: 25, readingText: "Intro + 1 Kor 1,1-17" },
  { dayNumber: 26, readingText: "1 Kor 1,18-4,21" },
  { dayNumber: 27, readingText: "1 Kor 5 + 6 + 7" },
  { dayNumber: 28, readingText: "Ingen lesing" },
  { dayNumber: 29, readingText: "1 Kor 8 + 9 + 10" },
  { dayNumber: 30, readingText: "1 Kor 11 + 12" },
  { dayNumber: 31, readingText: "1 Kor 13 + 14" },
  { dayNumber: 32, readingText: "1 Kor 15 + 16" },
  { dayNumber: 33, readingText: "Intro + 2 Kor 1,1-11" },
  { dayNumber: 34, readingText: "2 Kor 1,12-3,18" },
  { dayNumber: 35, readingText: "Ingen lesing" },
  { dayNumber: 36, readingText: "2 Kor 4 + 5 + 6 + 7" },
  { dayNumber: 37, readingText: "2 Kor 8 + 9 + 10" },
  { dayNumber: 38, readingText: "2 Kor 11 + 12 + 13" },
  { dayNumber: 39, readingText: "Intro + Luk 1,1-25" },
  { dayNumber: 40, readingText: "Luk 1,26-80" },
  { dayNumber: 41, readingText: "Luk 2 + 3" },
  { dayNumber: 42, readingText: "Ingen lesing" },
  { dayNumber: 43, readingText: "Luk 4 + 5" },
  { dayNumber: 44, readingText: "Luk 6 + 7" },
  { dayNumber: 45, readingText: "Luk 8 + 9" },
  { dayNumber: 46, readingText: "Luk 10 + 11" },
  { dayNumber: 47, readingText: "Luk 12 + 13" },
  { dayNumber: 48, readingText: "Luk 14 + 15 + 16" },
  { dayNumber: 49, readingText: "Ingen lesing" },
  { dayNumber: 50, readingText: "Luk 17 + 18" },
  { dayNumber: 51, readingText: "Luk 19 + 20" },
  { dayNumber: 52, readingText: "Luk 21,1-22,38" },
  { dayNumber: 53, readingText: "Luk 22,39-23,56" },
  { dayNumber: 54, readingText: "Luk 24" },
  { dayNumber: 55, readingText: "Intro + Apg 1,1-14" },
  { dayNumber: 56, readingText: "Ingen lesing" },
  { dayNumber: 57, readingText: "Apg 1,15-3,26" },
  { dayNumber: 58, readingText: "Apg 4 + 5" },
  { dayNumber: 59, readingText: "Apg 6 + 7" },
  { dayNumber: 60, readingText: "Apg 8 + 9" },
  { dayNumber: 61, readingText: "Apg 10 + 11" },
  { dayNumber: 62, readingText: "Apg 12 + 13" },
  { dayNumber: 63, readingText: "Ingen lesing" },
  { dayNumber: 64, readingText: "Apg 14 + 15" },
  { dayNumber: 65, readingText: "Apg 16 + 17" },
  { dayNumber: 66, readingText: "Apg 18 + 19" },
  { dayNumber: 67, readingText: "Apg 20 + 21" },
  { dayNumber: 68, readingText: "Apg 22 + 23 + 24" },
  { dayNumber: 69, readingText: "Apg 25 + 26" },
  { dayNumber: 70, readingText: "Ingen lesing" },
  { dayNumber: 71, readingText: "Apg 27 + 28" },
  { dayNumber: 72, readingText: "Intro + Gal 1,1-9" },
  { dayNumber: 73, readingText: "Gal 1,10-3,29" },
  { dayNumber: 74, readingText: "Gal 4 + 5 + 6" },
  { dayNumber: 75, readingText: "Intro + Ef 1,1-14" },
  { dayNumber: 76, readingText: "Ef 1,15-3,13" },
  { dayNumber: 77, readingText: "Ingen lesing" },
  { dayNumber: 78, readingText: "Ef 3,14-4,31" },
  { dayNumber: 79, readingText: "Ef 5 + 6" },
  { dayNumber: 80, readingText: "Intro + Fil 1,1-11" },
  { dayNumber: 81, readingText: "Fil 1,12-2,30" },
  { dayNumber: 82, readingText: "Fil 3 + 4" },
  { dayNumber: 83, readingText: "Introduksjon + Kol 1,1-14" },
  { dayNumber: 84, readingText: "Ingen lesing" },
  { dayNumber: 85, readingText: "Kol 1,15-2,23" },
  { dayNumber: 86, readingText: "Kol 3 + 4" },
  { dayNumber: 87, readingText: "Intro + Mark 1,1-13" },
  { dayNumber: 88, readingText: "Mark 1,14-2,28" },
  { dayNumber: 89, readingText: "Mark 3 + 4" },
  { dayNumber: 90, readingText: "Mark 5 + 6" },
  { dayNumber: 91, readingText: "Ingen lesing" },
  { dayNumber: 92, readingText: "Mark 7 + 8" },
  { dayNumber: 93, readingText: "Mark 9 + 10" },
  { dayNumber: 94, readingText: "Mark 11 + 12" },
  { dayNumber: 95, readingText: "Mark 13 + 14" },
  { dayNumber: 96, readingText: "Mark 15 + 16" },
  { dayNumber: 97, readingText: "Introduksjon + 1 Tess 1" },
  { dayNumber: 98, readingText: "Ingen lesing" },
  { dayNumber: 99, readingText: "1 Tess 2 + 3 + 4 + 5" },
  { dayNumber: 100, readingText: "Intro + 2 Tess 1" },
  { dayNumber: 101, readingText: "2 Tess 2 + 3" },
  { dayNumber: 102, readingText: "Intro + 1 Tim 1,1-11" },
  { dayNumber: 103, readingText: "1 Tim 1,12-3,15" },
  { dayNumber: 104, readingText: "1 Tim 4 + 5 + 6" },
  { dayNumber: 105, readingText: "Ingen lesing" },
  { dayNumber: 106, readingText: "Intro + 2 Tim 1" },
  { dayNumber: 107, readingText: "2 Tim 2 + 3 + 4" },
  { dayNumber: 108, readingText: "Intro + Tit 1,1-9" },
  { dayNumber: 109, readingText: "Tit 1,10-3,15" },
  { dayNumber: 110, readingText: "Intro + hele Filemon" },
  { dayNumber: 111, readingText: "Intro + Hebr 1" },
  { dayNumber: 112, readingText: "Ingen lesing" },
  { dayNumber: 113, readingText: "Hebr 2 + 3 + 4 + 5" },
  { dayNumber: 114, readingText: "Hebr 6 + 7 + 8" },
  { dayNumber: 115, readingText: "Hebr 9 + 10" },
  { dayNumber: 116, readingText: "Hebr 11 + 12 + 13" },
  { dayNumber: 117, readingText: "Intro + Jak 1,1-18" },
  { dayNumber: 118, readingText: "Jak 1,19-3,18" },
  { dayNumber: 119, readingText: "Ingen lesing" },
  { dayNumber: 120, readingText: "Jak 4 + 5" },
  { dayNumber: 121, readingText: "Introduksjon + 1 Pet 1,1-12" },
  { dayNumber: 122, readingText: "1 Pet 1,13-3,22" },
  { dayNumber: 123, readingText: "1 Pet 4 + 5" },
  { dayNumber: 124, readingText: "Intro + 2 Pet 1,1-11" },
  { dayNumber: 125, readingText: "2 Pet 1,12-3,18" },
  { dayNumber: 126, readingText: "Ingen lesing" },
  { dayNumber: 127, readingText: "Intro + hele Judas" },
  { dayNumber: 128, readingText: "Intro + Joh 1,1-18" },
  { dayNumber: 129, readingText: "Joh 1,19-2,25" },
  { dayNumber: 130, readingText: "Joh 3 + 4" },
  { dayNumber: 131, readingText: "Joh 5 + 6" },
  { dayNumber: 132, readingText: "Joh 7 + 8" },
  { dayNumber: 133, readingText: "Ingen lesing" },
  { dayNumber: 134, readingText: "Joh 9 + 10" },
  { dayNumber: 135, readingText: "Joh 11 + 12" },
  { dayNumber: 136, readingText: "Joh 13 + 14 + 15" },
  { dayNumber: 137, readingText: "Joh 16 + 17 + 18" },
  { dayNumber: 138, readingText: "Joh 19 + 20 + 21" },
  { dayNumber: 139, readingText: "Intro + 1 Joh 1" },
  { dayNumber: 140, readingText: "Ingen lesing" },
  { dayNumber: 141, readingText: "1 Joh 2 + 3 + 4 + 5" },
  { dayNumber: 142, readingText: "Intro + hele 2 Johannesbrev" },
  { dayNumber: 143, readingText: "Intro + hele 3. Johannesbrev" },
  { dayNumber: 144, readingText: "Intro + Åp 1,1-8" },
  { dayNumber: 145, readingText: "Åp 1,9-5,14" },
  { dayNumber: 146, readingText: "Åp 6 + 7 + 8 + 9 + 10" },
  { dayNumber: 147, readingText: "Ingen lesing" },
  { dayNumber: 148, readingText: "Åp 11 + 12 + 13 + 14 + 15" },
  { dayNumber: 149, readingText: "Åp 16 + 17 + 18 + 19" },
  { dayNumber: 150, readingText: "Åp 20 + 21 + 22" },
] satisfies DaySeed[];

function assertSeedShape() {
  if (sections.length !== 27) {
    throw new Error(
      `Expected 27 reading plan sections, got ${sections.length}.`,
    );
  }

  if (days.length !== planSeed.totalDays) {
    throw new Error(
      `Expected ${planSeed.totalDays} reading days, got ${days.length}.`,
    );
  }

  for (const [index, day] of days.entries()) {
    const expectedDayNumber = index + 1;

    if (day.dayNumber !== expectedDayNumber) {
      throw new Error(
        `Expected day ${expectedDayNumber}, got day ${day.dayNumber}.`,
      );
    }
  }
}

function getSectionForDay(dayNumber: number) {
  const section = sections.find(
    (candidate) =>
      candidate.startDayNumber <= dayNumber &&
      candidate.endDayNumber >= dayNumber,
  );

  if (!section) {
    throw new Error(`No reading plan section found for day ${dayNumber}.`);
  }

  return section;
}

function isRestDay(readingText: string) {
  return readingText === "Ingen lesing";
}

function includesIntro(readingText: string) {
  return (
    readingText.startsWith("Intro") || readingText.startsWith("Introduksjon")
  );
}

async function main() {
  assertSeedShape();

  await prisma.$transaction(async (tx) => {
    const plan = await tx.readingPlan.upsert({
      where: { slug: planSeed.slug },
      create: {
        ...planSeed,
        active: true,
      },
      update: {
        title: planSeed.title,
        totalDays: planSeed.totalDays,
        active: true,
      },
    });

    const sectionRecords = new Map<number, { id: string }>();

    for (const section of sections) {
      const record = await tx.readingPlanSection.upsert({
        where: {
          planId_sortOrder: {
            planId: plan.id,
            sortOrder: section.sortOrder,
          },
        },
        create: {
          planId: plan.id,
          ...section,
        },
        update: {
          name: section.name,
          subtitle: section.subtitle,
          startDayNumber: section.startDayNumber,
          endDayNumber: section.endDayNumber,
        },
      });

      sectionRecords.set(section.sortOrder, record);
    }

    for (const day of days) {
      const section = getSectionForDay(day.dayNumber);
      const sectionRecord = sectionRecords.get(section.sortOrder);

      if (!sectionRecord) {
        throw new Error(`No saved section found for day ${day.dayNumber}.`);
      }

      const dayData = {
        planId: plan.id,
        sectionId: sectionRecord.id,
        dayNumber: day.dayNumber,
        kind: isRestDay(day.readingText)
          ? ReadingDayKind.REST
          : ReadingDayKind.READING,
        title: isRestDay(day.readingText) ? "Ingen lesing" : section.name,
        readingText: day.readingText,
        introIncluded: includesIntro(day.readingText),
      };

      await tx.readingPlanDay.upsert({
        where: {
          planId_dayNumber: {
            planId: plan.id,
            dayNumber: day.dayNumber,
          },
        },
        create: dayData,
        update: {
          sectionId: dayData.sectionId,
          kind: dayData.kind,
          title: dayData.title,
          readingText: dayData.readingText,
          introIncluded: dayData.introIncluded,
        },
      });
    }
  });

  console.info(
    `Seeded "${planSeed.title}" with ${sections.length} sections and ${days.length} days.`,
  );
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
