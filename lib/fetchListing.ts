import type { Listing } from "./types";

const API_BASE = "https://garage-backend.onrender.com";

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
