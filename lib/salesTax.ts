// State-level sales tax rates (2026 baseline; statewide portion only).
// Actual rate to a buyer includes local/county/city add-ons that can swing
// the total by 1-4%. Fire/emergency apparatus purchases by government
// agencies are typically tax-exempt — we surface this as an *estimate* and
// call that out in the invoice disclaimer.

const STATE_TAX_RATES: Record<string, number> = {
  AL: 0.04, AK: 0, AZ: 0.056, AR: 0.065, CA: 0.0725, CO: 0.029,
  CT: 0.0635, DE: 0, DC: 0.06, FL: 0.06, GA: 0.04, HI: 0.04,
  ID: 0.06, IL: 0.0625, IN: 0.07, IA: 0.06, KS: 0.065, KY: 0.06,
  LA: 0.0445, ME: 0.055, MD: 0.06, MA: 0.0625, MI: 0.06, MN: 0.06875,
  MS: 0.07, MO: 0.04225, MT: 0, NE: 0.055, NV: 0.0685, NH: 0,
  NJ: 0.06625, NM: 0.05125, NY: 0.04, NC: 0.0475, ND: 0.05, OH: 0.0575,
  OK: 0.045, OR: 0, PA: 0.06, RI: 0.07, SC: 0.06, SD: 0.045,
  TN: 0.07, TX: 0.0625, UT: 0.061, VT: 0.06, VA: 0.053, WA: 0.065,
  WV: 0.06, WI: 0.05, WY: 0.04,
};

export function getStateTaxRate(stateCode: string | undefined | null): number | null {
  if (!stateCode) return null;
  const code = stateCode.trim().toUpperCase();
  const rate = STATE_TAX_RATES[code];
  return rate === undefined ? null : rate;
}

/** Resolve state code from a 5-digit US ZIP via the free zippopotam.us API. */
export async function resolveStateFromZip(zip: string): Promise<string | null> {
  if (!/^\d{5}$/.test(zip)) return null;
  try {
    const res = await fetch(`https://api.zippopotam.us/us/${zip}`, {
      headers: { accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      places?: Array<{ ["state abbreviation"]?: string }>;
    };
    const abbr = data.places?.[0]?.["state abbreviation"];
    return abbr ? abbr.toUpperCase() : null;
  } catch {
    return null;
  }
}
