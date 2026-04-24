import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { Invoice } from "./Invoice";
import { fetchCategoryAttributes } from "./fetchListing";
import { decodeSpecs } from "./decodeSpecs";
import type { Listing } from "./types";

// Supabase stores original images; for the hero we want a reasonable size.
// The `/storage/v1/render/image/public/` endpoint serves resized variants.
function resizedSupabaseUrl(url: string): string {
  const resized = url.replace(
    "/storage/v1/object/public/",
    "/storage/v1/render/image/public/"
  );
  if (resized === url) return url;
  const sep = resized.includes("?") ? "&" : "?";
  return `${resized}${sep}width=1200&height=800&resize=cover&quality=75`;
}

async function fetchImageBuffer(url: string): Promise<Buffer | undefined> {
  const target = resizedSupabaseUrl(url);
  const tryFetch = async (u: string) => {
    const res = await fetch(u, { cache: "no-store" });
    if (!res.ok) return undefined;
    const arr = await res.arrayBuffer();
    return Buffer.from(arr);
  };
  try {
    const buf = await tryFetch(target);
    if (buf) return buf;
    if (target !== url) return await tryFetch(url);
    return undefined;
  } catch {
    return undefined;
  }
}

export interface RenderInvoiceOptions {
  billTo?: string;
  listingUrl?: string;
}

export async function renderInvoicePdf(
  listing: Listing,
  { billTo, listingUrl }: RenderInvoiceOptions = {}
): Promise<Buffer> {
  const hero = [...listing.listingImages].sort((a, b) => a.order - b.order)[0];

  const [heroImage, attributes] = await Promise.all([
    hero ? fetchImageBuffer(hero.url) : Promise.resolve(undefined),
    listing.category?.id
      ? fetchCategoryAttributes(listing.category.id)
      : Promise.resolve([]),
  ]);

  const specs = decodeSpecs(listing, attributes);

  const element = (
    <Invoice
      listing={listing}
      billTo={billTo}
      heroImage={heroImage}
      listingUrl={listingUrl}
      specs={specs}
    />
  ) as unknown as ReactElement<DocumentProps>;

  return renderToBuffer(element);
}
