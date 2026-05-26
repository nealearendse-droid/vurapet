export type CountryCode =
  | 'ZA' | 'US' | 'GB' | 'AU' | 'NZ' | 'DE' | 'FR' | 'CA'
  | 'JP' | 'AE' | 'SG' | 'NL' | 'IT' | 'ES' | 'PT';

export interface DestinationRule {
  name: string;
  microchip: boolean;
  rabies: boolean;
  rabiesWait: number;
  titreTest: boolean;
  healthCert: boolean;
  healthCertDays: number;
  tapeworm: boolean;
  importPermit: boolean;
  quarantine: boolean;
  quarantineDays?: number;
  quarantineCost?: { amount: number; currency: 'AUD' | 'NZD' | 'SGD' | 'JPY' | 'ZAR' | 'GBP' | 'USD' };
  bannedBreeds: string[];
  notes: string[];
  commonMistake: string;
  officialLinks?: { label: string; url: string }[];
}

export interface OriginRule {
  name: string;
  exportAuthority: string;
  healthCertEndorsement: string;
  exportPermitRequired: boolean;
  exportPermitNotes?: string;
  approvedLabsNote?: string;
  notes: string[];
}

export const COUNTRY_OPTIONS: { code: CountryCode; label: string }[] = [
  { code: 'ZA', label: 'South Africa' },
  { code: 'US', label: 'United States' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'AU', label: 'Australia' },
  { code: 'DE', label: 'Germany' },
  { code: 'FR', label: 'France' },
  { code: 'CA', label: 'Canada' },
  { code: 'NZ', label: 'New Zealand' },
  { code: 'NL', label: 'Netherlands' },
  { code: 'IT', label: 'Italy' },
  { code: 'ES', label: 'Spain' },
  { code: 'PT', label: 'Portugal' },
  { code: 'JP', label: 'Japan' },
  { code: 'AE', label: 'UAE (Dubai)' },
  { code: 'SG', label: 'Singapore' },
];

export const DESTINATION_OPTIONS = COUNTRY_OPTIONS.filter(c =>
  ['GB', 'US', 'AU', 'NZ', 'DE', 'FR', 'JP', 'AE', 'SG', 'CA', 'ZA', 'NL', 'IT', 'ES', 'PT'].includes(c.code)
);

export const DESTINATION_RULES: Record<CountryCode, DestinationRule> = {
  GB: {
    name: 'United Kingdom',
    microchip: true, rabies: true, rabiesWait: 21, titreTest: false,
    healthCert: true, healthCertDays: 10, tapeworm: true, importPermit: false, quarantine: false,
    bannedBreeds: ['Pit Bull Terrier', 'Japanese Tosa', 'Dogo Argentino', 'Fila Brasileiro'],
    notes: [
      'Tapeworm treatment required 1–5 days before entry (vet-administered, with certificate)',
      'Use an approved PETS route — not all entry ports accept pets',
      'Book ferry/Eurostar pet space early — limited capacity',
    ],
    commonMistake: 'Tapeworm treatment must be recorded in the pet passport by a vet — home treatment is not accepted.',
    officialLinks: [
      { label: 'UK pet travel (gov.uk)', url: 'https://www.gov.uk/bring-pet-to-great-britain' },
    ],
  },
  AU: {
    name: 'Australia',
    microchip: true, rabies: true, rabiesWait: 180, titreTest: true,
    healthCert: true, healthCertDays: 10, tapeworm: true, importPermit: true, quarantine: true, quarantineDays: 10,
    quarantineCost: { amount: 2200, currency: 'AUD' },
    bannedBreeds: ['Pit Bull Terrier', 'Dogo Argentino', 'Fila Brasileiro', 'Japanese Tosa', 'Perro de Presa Canario'],
    notes: [
      '10-day government quarantine at importer expense',
      'Apply for import permit months ahead — approval often takes 6–8 weeks',
      'Rabies titre blood sample must be taken after microchip implantation',
    ],
    commonMistake: 'The 180-day wait starts from the titre test blood sample date, not the vaccination date.',
    officialLinks: [
      { label: 'DAFF import conditions', url: 'https://www.agriculture.gov.au/biosecurity-trade/cats-dogs' },
    ],
  },
  NZ: {
    name: 'New Zealand',
    microchip: true, rabies: true, rabiesWait: 180, titreTest: true,
    healthCert: true, healthCertDays: 5, tapeworm: true, importPermit: true, quarantine: true, quarantineDays: 10,
    quarantineCost: { amount: 2000, currency: 'NZD' },
    bannedBreeds: ['Pit Bull Terrier', 'Dogo Argentino', 'Brazilian Fila', 'Japanese Tosa'],
    notes: [
      'Very strict biosecurity — verify your departure country is on the approved list',
      'Apply for import permit at least 6 months before travel',
      'Only approved airlines and routes are allowed',
    ],
    commonMistake: 'New Zealand only accepts pets from approved countries — check before you book flights.',
    officialLinks: [
      { label: 'MPI bringing pets to NZ', url: 'https://www.mpi.govt.nz/bring-send-or-advise/bring-to-nz/animals' },
    ],
  },
  JP: {
    name: 'Japan',
    microchip: true, rabies: true, rabiesWait: 180, titreTest: true,
    healthCert: true, healthCertDays: 10, tapeworm: false, importPermit: false, quarantine: true, quarantineDays: 12,
    quarantineCost: { amount: 120000, currency: 'JPY' },
    bannedBreeds: [],
    notes: [
      '180-day wait from blood sample date, not vaccination',
      'Pre-arrival inspection with Japan Animal Quarantine Service',
      'Advance notification required 40 days before arrival',
    ],
    commonMistake: 'Japan counts the 180-day wait from the blood sample date.',
    officialLinks: [
      { label: 'Japan AQS', url: 'https://www.maff.go.jp/aqs/english/animal/im_index.html' },
    ],
  },
  AE: {
    name: 'UAE (Dubai)',
    microchip: true, rabies: true, rabiesWait: 30, titreTest: false,
    healthCert: true, healthCertDays: 14, tapeworm: false, importPermit: true, quarantine: false,
    bannedBreeds: ['Pit Bull Terrier', 'Rottweiler', 'Doberman Pinscher'],
    notes: [
      'Import permit from UAE Ministry of Climate Change',
      'Health certificate must be attested by your country\'s government authority',
      'Some Emirates have additional restrictions',
    ],
    commonMistake: 'Certificates from South Africa typically need DAFF endorsement and possible embassy attestation.',
    officialLinks: [
      { label: 'UAE pet import', url: 'https://www.moce.gov.ae/en/services/import-of-pets' },
    ],
  },
  SG: {
    name: 'Singapore',
    microchip: true, rabies: true, rabiesWait: 30, titreTest: false,
    healthCert: true, healthCertDays: 7, tapeworm: false, importPermit: true, quarantine: true, quarantineDays: 30,
    quarantineCost: { amount: 3000, currency: 'SGD' },
    bannedBreeds: ['Pit Bull', 'Bull Terrier', 'Neapolitan Mastiff', 'Dogo Argentino', 'Fila Brasileiro', 'American Staffordshire'],
    notes: [
      'Import licence from AVS — apply months in advance',
      '30-day quarantine at an approved facility',
      'Only dogs and cats are allowed as pets',
    ],
    commonMistake: 'Singapore\'s approved breed list is strict — mixed breeds with restricted genetics may be denied.',
    officialLinks: [
      { label: 'NParks AVS', url: 'https://www.nparks.gov.sg/avs/pets/import-export' },
    ],
  },
  DE: {
    name: 'Germany (EU)',
    microchip: true, rabies: true, rabiesWait: 21, titreTest: false,
    healthCert: true, healthCertDays: 10, tapeworm: false, importPermit: false, quarantine: false,
    bannedBreeds: [],
    notes: ['EU pet passport accepted within EU', 'Non-EU travellers need EU-approved health certificate (Annex IV)', 'Rabies vaccine must be after microchip'],
    commonMistake: 'Rabies vaccine must be given AFTER microchip implantation or the series must restart.',
    officialLinks: [{ label: 'EU pet travel', url: 'https://food.ec.europa.eu/animals/movement-pets_en' }],
  },
  FR: {
    name: 'France (EU)',
    microchip: true, rabies: true, rabiesWait: 21, titreTest: false,
    healthCert: true, healthCertDays: 10, tapeworm: false, importPermit: false, quarantine: false,
    bannedBreeds: [],
    notes: ['Same EU rules as Germany', 'Some breeds require muzzles in public'],
    commonMistake: 'Same EU microchip-before-vaccine rule applies.',
    officialLinks: [{ label: 'EU pet travel', url: 'https://food.ec.europa.eu/animals/movement-pets_en' }],
  },
  NL: {
    name: 'Netherlands (EU)',
    microchip: true, rabies: true, rabiesWait: 21, titreTest: false,
    healthCert: true, healthCertDays: 10, tapeworm: false, importPermit: false, quarantine: false,
    bannedBreeds: [],
    notes: ['Breed-neutral legislation', 'Non-EU health certificate must use official EU Annex IV format'],
    commonMistake: 'Ensure microchip before vaccination.',
    officialLinks: [{ label: 'EU pet travel', url: 'https://food.ec.europa.eu/animals/movement-pets_en' }],
  },
  IT: {
    name: 'Italy (EU)',
    microchip: true, rabies: true, rabiesWait: 21, titreTest: false,
    healthCert: true, healthCertDays: 10, tapeworm: false, importPermit: false, quarantine: false,
    bannedBreeds: [],
    notes: ['Some breeds require muzzle and leash in public'],
    commonMistake: 'EU microchip-first rule applies.',
    officialLinks: [{ label: 'EU pet travel', url: 'https://food.ec.europa.eu/animals/movement-pets_en' }],
  },
  ES: {
    name: 'Spain (EU)',
    microchip: true, rabies: true, rabiesWait: 21, titreTest: false,
    healthCert: true, healthCertDays: 10, tapeworm: false, importPermit: false, quarantine: false,
    bannedBreeds: ['Pit Bull Terrier', 'Rottweiler', 'Dogo Argentino', 'Fila Brasileiro', 'Tosa Inu'],
    notes: ['PPP (potentially dangerous) breeds require muzzle and leash in public'],
    commonMistake: 'Rottweilers are considered PPP in Spain — muzzle required in public.',
    officialLinks: [{ label: 'EU pet travel', url: 'https://food.ec.europa.eu/animals/movement-pets_en' }],
  },
  PT: {
    name: 'Portugal (EU)',
    microchip: true, rabies: true, rabiesWait: 21, titreTest: false,
    healthCert: true, healthCertDays: 10, tapeworm: false, importPermit: false, quarantine: false,
    bannedBreeds: [],
    notes: ['Pet-friendly — verify EU certificate format from non-EU countries'],
    commonMistake: 'EU microchip-first rule applies.',
    officialLinks: [{ label: 'EU pet travel', url: 'https://food.ec.europa.eu/animals/movement-pets_en' }],
  },
  US: {
    name: 'United States',
    microchip: false, rabies: true, rabiesWait: 0, titreTest: false,
    healthCert: true, healthCertDays: 10, tapeworm: false, importPermit: false, quarantine: false,
    bannedBreeds: [],
    notes: ['No federal microchip requirement (recommended)', 'USDA endorsement may be required for airline travel', 'Hawaii has separate strict quarantine rules'],
    commonMistake: 'Hawaii is not the same as US mainland — plan 6+ months for Hawaii direct release.',
    officialLinks: [
      { label: 'CDC dog import', url: 'https://www.cdc.gov/importation/bringing-an-animal-into-the-us/index.html' },
    ],
  },
  CA: {
    name: 'Canada',
    microchip: false, rabies: true, rabiesWait: 0, titreTest: false,
    healthCert: true, healthCertDays: 0, tapeworm: false, importPermit: false, quarantine: false,
    bannedBreeds: [],
    notes: ['Rabies certificate required', 'Check province-specific breed legislation'],
    commonMistake: 'Ontario bans Pit Bulls provincially — verify destination province.',
    officialLinks: [{ label: 'CFIA pets', url: 'https://inspection.canada.ca/en/animal-health/terrestrial-animals/imports/pets' }],
  },
  ZA: {
    name: 'South Africa',
    microchip: true, rabies: true, rabiesWait: 30, titreTest: false,
    healthCert: true, healthCertDays: 10, tapeworm: false, importPermit: true, quarantine: false,
    bannedBreeds: [],
    notes: ['Health certificate from DAFF-registered vet', 'DAFF import permit required for most animals', 'Permit can take several weeks'],
    commonMistake: 'DAFF import permit must be obtained before travel — not at the airport.',
    officialLinks: [{ label: 'DAFF pet imports', url: 'https://www.daff.gov.za' }],
  },
};

export const ORIGIN_RULES: Record<CountryCode, OriginRule> = {
  ZA: {
    name: 'South Africa',
    exportAuthority: 'DAFF (Department of Agriculture)',
    healthCertEndorsement: 'Official veterinary health certificate must be issued by a DAFF-accredited vet and endorsed by DAFF before export.',
    exportPermitRequired: true,
    exportPermitNotes: 'Apply for a DAFF export permit before booking travel — processing can take several weeks.',
    approvedLabsNote: 'Rabies titre tests for AU/NZ/JP must use a government-approved laboratory; confirm lab list with DAFF.',
    notes: [
      'Microchip must be ISO 11784/11785 and readable before export documentation',
      'Keep originals of all certificates — copies are often rejected',
    ],
  },
  US: {
    name: 'United States',
    exportAuthority: 'USDA APHIS',
    healthCertEndorsement: 'USDA-accredited veterinarian issues certificate; USDA APHIS endorsement required for most international destinations.',
    exportPermitRequired: false,
    notes: ['Endorsement timing varies by destination — check APHIS country requirements'],
  },
  GB: {
    name: 'United Kingdom',
    exportAuthority: 'APHA / Official Veterinarian',
    healthCertEndorsement: 'Export health certificate issued by Official Veterinarian (OV) for your destination country.',
    exportPermitRequired: false,
    notes: ['EU travel uses pet passport or EU health certificate depending on corridor'],
  },
  AU: {
    name: 'Australia',
    exportAuthority: 'Department of Agriculture, Fisheries and Forestry',
    healthCertEndorsement: 'Export certificate via approved vet and government endorsement for overseas destinations.',
    exportPermitRequired: true,
    exportPermitNotes: 'Export permit required for most countries — apply well in advance.',
    notes: ['Strict export biosecurity — approved routes and carriers only'],
  },
  DE: {
    name: 'Germany (EU)',
    exportAuthority: 'Official Veterinarian (EU)',
    healthCertEndorsement: 'EU pet passport for intra-EU travel; EU Annex IV certificate for exports outside EU.',
    exportPermitRequired: false,
    notes: ['Rabies vaccination must follow microchip implantation'],
  },
  FR: {
    name: 'France (EU)',
    exportAuthority: 'Official Veterinarian (EU)',
    healthCertEndorsement: 'EU pet passport or Annex IV health certificate for non-EU destinations.',
    exportPermitRequired: false,
    notes: ['Same EU export rules as Germany'],
  },
  CA: {
    name: 'Canada',
    exportAuthority: 'CFIA',
    healthCertEndorsement: 'CFIA-endorsed international health certificate from accredited veterinarian.',
    exportPermitRequired: false,
    notes: ['Contact CFIA for country-specific export requirements'],
  },
  NZ: {
    name: 'New Zealand',
    exportAuthority: 'MPI',
    healthCertEndorsement: 'MPI export certificate via approved veterinarian.',
    exportPermitRequired: true,
    notes: ['Only approved countries and routes for re-export — verify MPI list'],
  },
  NL: { name: 'Netherlands (EU)', exportAuthority: 'Official Veterinarian (EU)', healthCertEndorsement: 'EU pet passport or Annex IV for non-EU.', exportPermitRequired: false, notes: [] },
  IT: { name: 'Italy (EU)', exportAuthority: 'Official Veterinarian (EU)', healthCertEndorsement: 'EU pet passport or Annex IV for non-EU.', exportPermitRequired: false, notes: [] },
  ES: { name: 'Spain (EU)', exportAuthority: 'Official Veterinarian (EU)', healthCertEndorsement: 'EU pet passport or Annex IV for non-EU.', exportPermitRequired: false, notes: [] },
  PT: { name: 'Portugal (EU)', exportAuthority: 'Official Veterinarian (EU)', healthCertEndorsement: 'EU pet passport or Annex IV for non-EU.', exportPermitRequired: false, notes: [] },
  JP: {
    name: 'Japan',
    exportAuthority: 'Animal Quarantine Service (AQS)',
    healthCertEndorsement: 'Export inspection and certificate via AQS-approved procedures.',
    exportPermitRequired: false,
    notes: ['180-day waiting periods apply for imports to Japan — plan exports similarly for return trips'],
  },
  AE: {
    name: 'UAE',
    exportAuthority: 'MOCCAE',
    healthCertEndorsement: 'Health certificate attested by origin country authority and UAE embassy where required.',
    exportPermitRequired: false,
    notes: ['Embassy attestation may be required depending on origin country'],
  },
  SG: {
    name: 'Singapore',
    exportAuthority: 'NParks AVS',
    healthCertEndorsement: 'Export health certificate via AVS-approved veterinarian.',
    exportPermitRequired: true,
    notes: ['Strict export and import licensing'],
  },
};

/** Corridor-specific steps (origin → destination) */
export function getCorridorSteps(from: CountryCode, to: CountryCode): string[] {
  const steps: string[] = [];
  const origin = ORIGIN_RULES[from];
  const dest = DESTINATION_RULES[to];

  if (origin.exportPermitRequired) {
    steps.push(`Apply for export permit from ${origin.exportAuthority} before travel.`);
  }
  steps.push(`Health certificate endorsement: ${origin.healthCertEndorsement}`);

  if (from === 'ZA' && to === 'GB') {
    steps.push('Tapeworm treatment must be recorded by a vet in the pet passport 1–5 days before UK entry.');
    steps.push('Route must be an approved PETS entry point (not all ports accept pets).');
  }
  if (from === 'ZA' && (to === 'AU' || to === 'NZ')) {
    steps.push('Use a DAFF-approved rabies titre laboratory — confirm current lab list before blood draw.');
    steps.push('Start planning at least 9–12 months before travel due to titre wait and permits.');
  }
  if (from === 'ZA' && to === 'AE') {
    steps.push('Health certificate typically requires DAFF endorsement and possible UAE Embassy attestation.');
  }
  if (from === 'US' && to === 'GB') {
    steps.push('USDA APHIS endorsement required on health certificate within validity window.');
  }
  if ((from === 'DE' || from === 'FR' || from === 'NL') && to === 'GB') {
    steps.push('EU pet passport usually sufficient; tapeworm treatment still required for UK entry.');
  }
  if (dest.importPermit && from !== to) {
    steps.push(`Apply for ${dest.name} import permit as early as possible — delays are common.`);
  }

  return steps;
}

export const SNUB_NOSED_KEYWORDS = [
  'bulldog', 'pug', 'boxer', 'shih tzu', 'persian', 'pekinese', 'boston', 'french bull',
  'brachycephalic', 'british shorthair', 'himalayan',
];

export function isSnubNosedBreed(breed: string): boolean {
  const b = breed.toLowerCase();
  return SNUB_NOSED_KEYWORDS.some(k => b.includes(k));
}

export function isBreedBanned(breed: string, bannedList: string[]): boolean {
  if (!breed) return false;
  const b = breed.toLowerCase();
  return bannedList.some(banned => {
    const first = banned.toLowerCase().split(' ')[0];
    return b.includes(first) || b.includes(banned.toLowerCase());
  });
}
