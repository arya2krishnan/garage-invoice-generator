import type {
  CategoryAttribute,
  Listing,
  ShippingQuoteResponse,
  WarrantyDuration,
  WarrantyQuoteResponse,
} from "./types";

const API_BASE = "https://garage-backend.onrender.com";

function authHeaders(): Record<string, string> {
  const token = process.env.GARAGE_API_TOKEN;
  return token ? { authorization: `Bearer ${token}` } : {};
}

export class ListingNotFoundError extends Error {
  constructor(uuid: string) {
    super(`Listing not found: ${uuid}`);
    this.name = "ListingNotFoundError";
  }
}

export class ListingFetchError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ListingFetchError";
  }
}

export async function fetchListing(uuid: string): Promise<Listing> {
  const res = await fetch(`${API_BASE}/listings/${uuid}`, {
    headers: { accept: "application/json" },
    cache: "no-store",
  });
  if (res.status === 404) {
    throw new ListingNotFoundError(uuid);
  }
  if (!res.ok) {
    throw new ListingFetchError(
      `Listing API returned ${res.status}`,
      res.status
    );
  }
  return (await res.json()) as Listing;
}

export async function fetchCategoryAttributes(
  categoryId: string
): Promise<CategoryAttribute[]> {
  try {
    const res = await fetch(
      `${API_BASE}/categories/${categoryId}/attributes`,
      { headers: { accept: "application/json" }, cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = (await res.json()) as { attributes?: CategoryAttribute[] };
    return data.attributes ?? [];
  } catch {
    return [];
  }
}

/**
 * Freight shipping quote. Requires GARAGE_API_TOKEN (which is sign-in token). 
 * Returns null if endpoint fails
 * Treaded as unavailable in that case.
 */
export async function fetchShippingQuote(
  listingId: string,
  destinationZip: string
): Promise<number | null> {
  if (!process.env.GARAGE_API_TOKEN) return null;
  if (!/^\d{5}(-\d{4})?$/.test(destinationZip)) return null;
  try {
    const res = await fetch(`${API_BASE}/shipment/freight/quote`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        ...authHeaders(),
      },
      cache: "no-store",
      body: JSON.stringify({ listingId, destinationZip }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as ShippingQuoteResponse;
    return data.quote?.price ?? null;
  } catch {
    return null;
  }
}

/**
 * Warranty quote for one duration. Returns both tier prices standard or premium
 * so the caller can pick. Requires GARAGE_API_TOKEN.
 */
export async function fetchWarrantyQuote(
  listingId: string,
  duration: WarrantyDuration,
  year: number
): Promise<{ standard: number; premium: number } | null> {
  if (!process.env.GARAGE_API_TOKEN) return null;
  try {
    const res = await fetch(`${API_BASE}/warranty/quote`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        ...authHeaders(),
      },
      cache: "no-store",
      body: JSON.stringify({ listingId, duration, year }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as WarrantyQuoteResponse;
    const prices = data.quote?.prices;
    if (!prices) return null;
    return { standard: prices.squad, premium: prices.battalion };
  } catch {
    return null;
  }
}
