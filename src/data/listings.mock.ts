export const LISTINGS: Record<string, { type: 'SALE' | 'LEASE'; price_kes?: number; active: boolean }> = {
  'TH-0002': { type: 'LEASE', price_kes: 45000, active: true },
  'TH-0004': { type: 'SALE', price_kes: 12500000, active: true },
};
