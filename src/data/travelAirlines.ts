export interface AirlineRule {
  name: string;
  cabinKg: number;
  cargoKg: number;
  snubNosed: boolean;
  notes: string;
  policyUrl?: string;
  lastVerified: string;
}

export const AIRLINES: AirlineRule[] = [
  { name: 'Emirates', cabinKg: 0, cargoKg: 50, snubNosed: false, lastVerified: '2025-01', policyUrl: 'https://www.emirates.com/ae/english/help/faqs/FAQTopic/35226/', notes: 'Pets in cargo only. Snub-nosed breeds not accepted in cargo due to heat risk.' },
  { name: 'British Airways', cabinKg: 0, cargoKg: 50, snubNosed: false, lastVerified: '2025-01', policyUrl: 'https://www.britishairways.com/en-gb/information/travel-assistance/travelling-with-pets', notes: 'Pets as cargo only. Snub-nosed breeds may only fly in cooler months with vet certificate.' },
  { name: 'Lufthansa', cabinKg: 8, cargoKg: 50, snubNosed: false, lastVerified: '2025-01', policyUrl: 'https://www.lufthansa.com/xx/en/travelling-with-animals', notes: 'Up to 8kg (pet + carrier) in cabin. Snub-nosed require vet clearance for cargo.' },
  { name: 'KLM', cabinKg: 8, cargoKg: 50, snubNosed: true, lastVerified: '2025-01', policyUrl: 'https://www.klm.com/travel/nl_en/prepare_for_travel/baggage/special_baggage/pets.htm', notes: 'Cabin up to 8kg. Snub-nosed accepted with fitness-to-fly certificate.' },
  { name: 'Air France', cabinKg: 8, cargoKg: 50, snubNosed: false, lastVerified: '2025-01', notes: '8kg cabin limit including carrier. Snub-nosed in cabin only, not cargo.' },
  { name: 'Qatar Airways', cabinKg: 0, cargoKg: 50, snubNosed: false, lastVerified: '2025-01', notes: 'Cargo only. Snub-nosed breeds not accepted.' },
  { name: 'Singapore Airlines', cabinKg: 0, cargoKg: 50, snubNosed: false, lastVerified: '2025-01', notes: 'Cargo only. Contact airline for snub-nosed restrictions.' },
  { name: 'United Airlines', cabinKg: 10, cargoKg: 45, snubNosed: false, lastVerified: '2025-01', notes: 'Cabin up to 10kg. Snub-nosed not accepted in cargo.' },
  { name: 'Delta Airlines', cabinKg: 10, cargoKg: 45, snubNosed: false, lastVerified: '2025-01', notes: 'Cabin up to 10kg. Snub-nosed not accepted in cargo.' },
  { name: 'South African Airways', cabinKg: 0, cargoKg: 45, snubNosed: false, lastVerified: '2025-01', notes: 'Cargo only on most routes. Snub-nosed require vet certificate.' },
];
