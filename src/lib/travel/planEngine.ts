import {
  CountryCode,
  DESTINATION_RULES,
  ORIGIN_RULES,
  getCorridorSteps,
  isBreedBanned,
  isSnubNosedBreed,
  DestinationRule,
} from '@/data/travelRules';
import { formatMultiCurrency } from '@/lib/travel/currency';

export type TaskStatus = 'pending' | 'done' | 'blocked' | 'warning';

export interface ChecklistItem {
  id: string;
  title: string;
  category: 'origin' | 'destination' | 'document' | 'health' | 'travel' | 'cost';
  status: TaskStatus;
  dueDate?: string;
  detail?: string;
  officialUrl?: string;
  blocksTravel?: boolean;
}

export interface TimelineItem {
  id: string;
  label: string;
  daysBefore: number;
  text: string;
  urgency: 'now' | 'soon' | 'later' | 'before';
  dueDate?: string;
}

export interface VaccineGap {
  type: 'rabies_missing' | 'rabies_wait' | 'titre_required' | 'microchip';
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface TravelPlanResult {
  readinessScore: number;
  checklist: ChecklistItem[];
  timeline: TimelineItem[];
  gaps: VaccineGap[];
  warnings: string[];
  destRule: DestinationRule;
  originName: string;
  destName: string;
  corridorSteps: string[];
  isBannedBreed: boolean;
  isSnubNosed: boolean;
}

export interface PetVaccineRecord {
  vaccine_name: string;
  date_given: string;
  next_due_date?: string | null;
}

export interface GeneratePlanInput {
  from: CountryCode;
  to: CountryCode;
  travelDate: string | null;
  petName: string;
  breed: string;
  species: string;
  microchip?: string | null;
  vaccines: PetVaccineRecord[];
  snubNosed?: boolean;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function findRabies(vaccines: PetVaccineRecord[]): PetVaccineRecord | undefined {
  return vaccines.find(v =>
    v.vaccine_name.toLowerCase().includes('rabies')
  );
}

function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

export function generateTravelPlan(input: GeneratePlanInput): TravelPlanResult | null {
  const dest = DESTINATION_RULES[input.to];
  const origin = ORIGIN_RULES[input.from];
  if (!dest || !origin) return null;

  const travel = input.travelDate
    ? new Date(input.travelDate)
    : addDays(new Date(), 90);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysLeft = Math.max(0, daysBetween(today, travel));

  const snub = input.snubNosed ?? isSnubNosedBreed(input.breed);
  const banned = isBreedBanned(input.breed, dest.bannedBreeds);
  const corridorSteps = getCorridorSteps(input.from, input.to);
  const checklist: ChecklistItem[] = [];
  const gaps: VaccineGap[] = [];
  const warnings: string[] = [];

  if (banned) {
    warnings.push(`${input.breed} may be banned or restricted in ${dest.name}. Verify with the embassy before booking.`);
  }
  if (snub) {
    warnings.push('Snub-nosed breed: prefer cabin travel where possible and obtain a fitness-to-fly certificate.');
  }

  // Origin export tasks
  checklist.push({
    id: 'origin-endorsement',
    title: `Health certificate endorsement (${origin.exportAuthority})`,
    category: 'origin',
    status: 'pending',
    detail: origin.healthCertEndorsement,
    blocksTravel: true,
  });

  if (origin.exportPermitRequired) {
    checklist.push({
      id: 'origin-export-permit',
      title: 'Export permit from origin country',
      category: 'origin',
      status: 'pending',
      dueDate: toDateStr(addDays(travel, -60)),
      detail: origin.exportPermitNotes || `Apply via ${origin.exportAuthority}`,
      blocksTravel: true,
    });
  }

  corridorSteps.forEach((step, i) => {
    checklist.push({
      id: `corridor-${i}`,
      title: step.length > 80 ? step.slice(0, 77) + '…' : step,
      category: 'origin',
      status: 'pending',
      detail: step,
    });
  });

  // Destination requirements
  if (dest.microchip) {
    const hasChip = Boolean(input.microchip?.trim());
    checklist.push({
      id: 'dest-microchip',
      title: 'ISO 11784/11785 microchip',
      category: 'health',
      status: hasChip ? 'done' : 'pending',
      detail: hasChip ? `On file: ${input.microchip}` : 'Register microchip number in pet profile',
      blocksTravel: true,
    });
    if (!hasChip) {
      gaps.push({ type: 'microchip', message: 'No microchip on file — required before vaccinations count.', severity: 'error' });
    }
  }

  const rabiesRecord = findRabies(input.vaccines);
  if (dest.rabies) {
    checklist.push({
      id: 'dest-rabies',
      title: 'Valid rabies vaccination (after microchip)',
      category: 'health',
      status: rabiesRecord ? 'done' : 'pending',
      detail: rabiesRecord
        ? `Last given: ${rabiesRecord.date_given}`
        : 'Add rabies record in Vaccine Calendar',
      blocksTravel: true,
    });
    if (!rabiesRecord) {
      gaps.push({ type: 'rabies_missing', message: 'No rabies vaccination on file.', severity: 'error' });
    } else if (dest.rabiesWait > 0 && rabiesRecord.date_given) {
      const waitEnd = addDays(new Date(rabiesRecord.date_given), dest.rabiesWait);
      if (waitEnd > travel) {
        gaps.push({
          type: 'rabies_wait',
          message: `Rabies wait period ends ${toDateStr(waitEnd)} — after your travel date.`,
          severity: 'error',
        });
        checklist.find(c => c.id === 'dest-rabies')!.status = 'blocked';
      }
    }
  }

  if (dest.titreTest) {
    const hasTitre = input.vaccines.some(v => /titre|titer|antibody/i.test(v.vaccine_name));
    checklist.push({
      id: 'dest-titre',
      title: 'Rabies titre (antibody) blood test',
      category: 'health',
      status: hasTitre ? 'done' : 'pending',
      detail: 'Blood sample after microchip; 180-day wait for AU/NZ/JP',
      blocksTravel: true,
    });
    if (!hasTitre) {
      gaps.push({
        type: 'titre_required',
        message: `${dest.name} requires a rabies titre test — plan 6+ months ahead.`,
        severity: 'error',
      });
    }
  }

  if (dest.importPermit) {
    checklist.push({
      id: 'dest-import-permit',
      title: `${dest.name} import permit`,
      category: 'document',
      status: 'pending',
      dueDate: toDateStr(addDays(travel, -60)),
      detail: 'Apply months in advance',
      blocksTravel: true,
      officialUrl: dest.officialLinks?.[0]?.url,
    });
  }

  if (dest.healthCert) {
    checklist.push({
      id: 'dest-health-cert',
      title: 'Official health certificate',
      category: 'document',
      status: 'pending',
      dueDate: toDateStr(addDays(travel, -(dest.healthCertDays > 0 ? dest.healthCertDays - 1 : 7))),
      detail: dest.healthCertDays > 0
        ? `Valid ${dest.healthCertDays} days before entry — schedule close to departure`
        : 'Issued by accredited veterinarian',
      blocksTravel: true,
    });
  }

  if (dest.tapeworm) {
    checklist.push({
      id: 'dest-tapeworm',
      title: 'Tapeworm treatment (vet-administered)',
      category: 'health',
      status: 'pending',
      dueDate: toDateStr(addDays(travel, -3)),
      detail: '1–5 days before entry — must be recorded by a vet',
      blocksTravel: true,
    });
  }

  if (dest.quarantine && dest.quarantineCost) {
    const costStr = formatMultiCurrency(dest.quarantineCost.amount, dest.quarantineCost.currency);
    checklist.push({
      id: 'dest-quarantine-cost',
      title: `Quarantine (~${dest.quarantineDays} days) — budget`,
      category: 'cost',
      status: 'warning',
      detail: `Estimated: ${costStr} (indicative only)`,
    });
  }

  dest.officialLinks?.forEach((link, i) => {
    checklist.push({
      id: `official-${i}`,
      title: `Verify: ${link.label}`,
      category: 'document',
      status: 'pending',
      officialUrl: link.url,
    });
  });

  // Timeline
  const timeline: TimelineItem[] = [];
  const pet = input.petName || 'Your pet';

  if (dest.titreTest) {
    timeline.push({
      id: 'tl-titre',
      label: 'As early as possible',
      daysBefore: daysLeft,
      text: `Schedule rabies titre test for ${pet} — starts mandatory waiting period.`,
      urgency: 'now',
      dueDate: toDateStr(addDays(travel, -200)),
    });
  }
  if (dest.rabies) {
    timeline.push({
      id: 'tl-rabies',
      label: `~${Math.max(dest.rabiesWait + 14, 90)} days before`,
      daysBefore: daysLeft - Math.max(dest.rabiesWait + 14, 90),
      text: `Rabies vaccination after microchip. Wait ${dest.rabiesWait} days before entry.`,
      urgency: 'now',
    });
  }
  if (dest.importPermit || origin.exportPermitRequired) {
    timeline.push({
      id: 'tl-permit',
      label: '~60 days before',
      daysBefore: 60,
      text: 'Apply for import/export permits — can take 6–8 weeks.',
      urgency: 'soon',
      dueDate: toDateStr(addDays(travel, -60)),
    });
  }
  timeline.push({
    id: 'tl-accommodation',
    label: '30 days before',
    daysBefore: 30,
    text: 'Book pet-friendly accommodation; locate a 24-hour vet near destination.',
    urgency: 'later',
    dueDate: toDateStr(addDays(travel, -30)),
  });
  timeline.push({
    id: 'tl-airline',
    label: '14 days before',
    daysBefore: 14,
    text: 'Confirm airline pet booking and IATA-compliant crate.',
    urgency: 'later',
    dueDate: toDateStr(addDays(travel, -14)),
  });
  if (dest.tapeworm) {
    timeline.push({
      id: 'tl-tapeworm',
      label: '1–5 days before',
      daysBefore: 4,
      text: 'Tapeworm treatment by registered vet with certificate.',
      urgency: 'before',
      dueDate: toDateStr(addDays(travel, -3)),
    });
  }
  if (dest.healthCert) {
    const certDays = dest.healthCertDays > 0 ? dest.healthCertDays : 10;
    timeline.push({
      id: 'tl-health-cert',
      label: `${certDays} days before`,
      daysBefore: certDays,
      text: 'Official health certificate — get this last due to short validity.',
      urgency: 'before',
      dueDate: toDateStr(addDays(travel, -(certDays - 1))),
    });
  }
  timeline.push({
    id: 'tl-final',
    label: 'Day before',
    daysBefore: 1,
    text: 'Final check: microchip, certificates, permits, crate, food & water bowls.',
    urgency: 'before',
    dueDate: toDateStr(addDays(travel, -1)),
  });

  timeline.sort((a, b) => b.daysBefore - a.daysBefore);

  // Readiness score
  const blockers = checklist.filter(c => c.blocksTravel);
  const done = blockers.filter(c => c.status === 'done').length;
  const blocked = blockers.filter(c => c.status === 'blocked').length;
  let score = blockers.length > 0
    ? Math.round((done / blockers.length) * 70)
    : 40;
  if (gaps.some(g => g.severity === 'error')) score = Math.min(score, 35);
  if (blocked > 0) score = Math.min(score, 25);
  if (daysLeft < 30 && dest.titreTest) score = Math.min(score, 20);
  score = Math.max(0, Math.min(100, score + (daysLeft > 120 ? 15 : daysLeft > 60 ? 8 : 0)));

  return {
    readinessScore: score,
    checklist,
    timeline,
    gaps,
    warnings,
    destRule: dest,
    originName: origin.name,
    destName: dest.name,
    corridorSteps,
    isBannedBreed: banned,
    isSnubNosed: snub,
  };
}

export function calcIataCrate(lengthCm: number, heightCm: number, widthCm: number) {
  return {
    length: Math.round(lengthCm * 1.5),
    height: Math.round(heightCm + 15),
    width: Math.round(widthCm * 2),
  };
}
