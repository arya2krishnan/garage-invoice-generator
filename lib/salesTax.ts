// Sales tax lookup via api.api-ninjas.com/v1/salestax.
// Free tier returns { zip_code, state_rate }; premium also returns city_rate,
// county_rate, additional_rate, total_rate. We read total_rate if present and
// fall back to state_rate. Missing key, malformed ZIP, or a non-200 response
// all return null — the caller hides the tax line item in that case.

const API_URL = "https://api.api-ninjas.com/v1/salestax";

export interface SalesTaxRate {
  zipCode: string;
  stateRate: number;
  totalRate: number | null;
}

interface ApiNinjasRow {
  zip_code: string;
  // Free tier returns rates as strings ("0.0625"); premium-only fields come
  // back as the literal string "This field is for premium subscribers only".
  state_rate: string | number;
  total_rate?: string | number;
}

function parseRate(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export async function fetchSalesTax(zip: string): Promise<SalesTaxRate | null> {
  const key = process.env.API_NINJAS_KEY;
  if (!key) return null;
  if (!/^\d{5}$/.test(zip)) return null;
  try {
    const res = await fetch(`${API_URL}?zip_code=${zip}`, {
      headers: { "X-Api-Key": key, accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const arr = (await res.json()) as ApiNinjasRow[];
    const row = arr[0];
    if (!row) return null;
    const stateRate = parseRate(row.state_rate);
    if (stateRate == null) return null;
    return {
      zipCode: row.zip_code,
      stateRate,
      totalRate: parseRate(row.total_rate),
    };
  } catch {
    return null;
  }
}
