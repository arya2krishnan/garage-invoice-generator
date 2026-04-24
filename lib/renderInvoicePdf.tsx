import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { Invoice } from "./Invoice";
import {
  fetchCategoryAttributes,
  fetchShippingQuote,
  fetchWarrantyQuote,
} from "./fetchListing";
import { decodeSpecs } from "./decodeSpecs";
import { getStateTaxRate, resolveStateFromZip } from "./salesTax";
import type {
  BillTo,
  InvoiceLineItem,
  Listing,
  WarrantyDuration,
  WarrantyTier,
} from "./types";

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
  billTo?: BillTo;
  listingUrl?: string;
  warranty?: {
    duration: WarrantyDuration;
    tier: WarrantyTier;
  };
}

export interface RenderInvoiceResult {
  pdf: Buffer;
  shippingAttempted: boolean;
  shippingPrice: number | null;
  warrantyAttempted: boolean;
  warrantyPrice: number | null;
  taxState: string | null;
  taxRate: number | null;
  taxAmount: number | null;
}

export async function renderInvoicePdf(
  listing: Listing,
  { billTo, listingUrl, warranty }: RenderInvoiceOptions = {}
): Promise<RenderInvoiceResult> {
  const hero = [...listing.listingImages].sort((a, b) => a.order - b.order)[0];

  const destinationZip = billTo?.zip?.trim();
  const shouldQuoteShipping = Boolean(destinationZip);
  const shouldQuoteWarranty = Boolean(warranty && listing.itemAge);

  const [heroImage, attributes, shippingPrice, warrantyPrices] =
    await Promise.all([
      hero ? fetchImageBuffer(hero.url) : Promise.resolve(undefined),
      listing.category?.id
        ? fetchCategoryAttributes(listing.category.id)
        : Promise.resolve([]),
      shouldQuoteShipping
        ? fetchShippingQuote(listing.id, destinationZip!)
        : Promise.resolve(null),
      shouldQuoteWarranty
        ? fetchWarrantyQuote(listing.id, warranty!.duration, listing.itemAge!)
        : Promise.resolve(null),
    ]);

  const specs = decodeSpecs(listing, attributes);

  // Resolve state for tax: prefer the explicit form state; fall back to zip lookup.
  let taxState: string | null = billTo?.state?.trim().toUpperCase() || null;
  if (!taxState && destinationZip) {
    taxState = await resolveStateFromZip(destinationZip);
  }
  const taxRate = getStateTaxRate(taxState);

  const lineItems: InvoiceLineItem[] = [
    {
      label: listing.listingTitle,
      sublabel: listing.category?.name,
      qty: 1,
      unitPrice: listing.sellingPrice,
    },
  ];
  const warrantyPrice =
    warranty && warrantyPrices ? warrantyPrices[warranty.tier] : null;
  if (warranty && warrantyPrice != null) {
    const tierLabel = warranty.tier === "battalion" ? "Battalion" : "Squad";
    lineItems.push({
      label: `Estimated extended warranty — ${warranty.duration}`,
      sublabel: `${tierLabel} tier`,
      qty: 1,
      unitPrice: warrantyPrice,
      note: "estimated",
    });
  }

  // Tax is estimated on the vehicle price only — warranty is a service and
  // shipping is not a taxable item.
  const taxAmount =
    taxRate != null
      ? Number((listing.sellingPrice * taxRate).toFixed(2))
      : null;

  const element = (
    <Invoice
      listing={listing}
      billTo={billTo}
      heroImage={heroImage}
      listingUrl={listingUrl}
      specs={specs}
      lineItems={lineItems}
      shipping={
        shippingPrice != null
          ? { price: shippingPrice, destinationZip: destinationZip! }
          : null
      }
      tax={
        taxAmount != null
          ? { amount: taxAmount, rate: taxRate!, state: taxState! }
          : null
      }
    />
  ) as unknown as ReactElement<DocumentProps>;

  const pdf = await renderToBuffer(element);
  return {
    pdf,
    shippingAttempted: shouldQuoteShipping,
    shippingPrice,
    warrantyAttempted: shouldQuoteWarranty,
    warrantyPrice,
    taxState,
    taxRate,
    taxAmount,
  };
}
