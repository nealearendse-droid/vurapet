/** Approximate FX for cost estimates — refresh periodically in production */
const RATES_TO_USD: Record<string, number> = {
  USD: 1,
  ZAR: 0.055,
  AUD: 0.65,
  NZD: 0.6,
  GBP: 1.27,
  EUR: 1.08,
  SGD: 0.74,
  JPY: 0.0067,
};

export function formatMultiCurrency(amount: number, currency: string): string {
  const usd = amount * (RATES_TO_USD[currency] ?? 1);
  const zar = usd / RATES_TO_USD.ZAR;
  const parts = [
    `${currency} ${amount.toLocaleString()}`,
    `≈ USD ${Math.round(usd).toLocaleString()}`,
    `≈ ZAR ${Math.round(zar).toLocaleString()}`,
  ];
  return parts.join(' · ');
}
