import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import {
  fetchCategoryAttributes,
  fetchShippingQuote,
  fetchWarrantyQuote,
} from "@/lib/garage";
import { fetchSalesTax } from "@/lib/salesTax";
import type {
  BillTo,
  InvoiceLineItem,
  Listing,
  WarrantyDuration,
  WarrantyTier,
} from "@/lib/types";
import { Invoice } from "../Invoice";
import { decodeSpecs } from "./decodeSpecs";

function resizedSupabaseUrl(url: string): string {
  const resized = url.replace(
    "/storage/v1/object/public/",
    "/storage/v1/render/image/public/"
  );
  if (resized === url) return url;
  const sep = resized.includes("?") ? "&" : "?";
  return `${resized}${sep}width=1400&height=900&resize=contain&quality=75`;
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

export async function renderInvoicePdf(
  listing: Listing,
  { billTo, listingUrl, warranty }: RenderInvoiceOptions = {}
): Promise<Buffer> {
  const hero = [...listing.listingImages].sort((a, b) => a.order - b.order)[0];
  const destinationZip = billTo?.zip?.trim();
  const shouldQuoteShipping = Boolean(destinationZip);
  const shouldQuoteWarranty = Boolean(warranty && listing.itemAge);
  const shouldQuoteTax = Boolean(destinationZip);

  const [heroImage, attributes, shippingPrice, warrantyPrices, salesTax] =
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
      shouldQuoteTax ? fetchSalesTax(destinationZip!) : Promise.resolve(null),
    ]);

  const specs = decodeSpecs(listing, attributes);

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
    const tierLabel = warranty.tier === "premium" ? "Premium" : "Standard";
    lineItems.push({
      label: `Estimated extended warranty — ${warranty.duration}`,
      sublabel: `${tierLabel} tier`,
      qty: 1,
      unitPrice: warrantyPrice,
      note: "estimated",
    });
  }

  // Tax is estimated on the vehicle price only — warranty is a service and
  // shipping is not a taxable item. Prefer total_rate (premium) if present,
  // else the free-tier state_rate.
  const taxRate = salesTax
    ? salesTax.totalRate ?? salesTax.stateRate
    : null;
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
        taxAmount != null && taxRate != null && salesTax
          ? {
              amount: taxAmount,
              rate: taxRate,
              label: `ZIP ${salesTax.zipCode}`,
            }
          : null
      }
    />
  ) as unknown as ReactElement<DocumentProps>;

  return renderToBuffer(element);
}
