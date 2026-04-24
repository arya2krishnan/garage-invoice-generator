import { Document } from "@react-pdf/renderer";
import type {
  BillTo,
  DecodedSpec,
  InvoiceLineItem,
  Listing,
} from "@/lib/types";
import { InvoicePage } from "./InvoicePage";
import { DetailsPage } from "./DetailsPage";
import { formatInvoiceNumber } from "./utils/formatters";

export interface InvoiceProps {
  listing: Listing;
  billTo?: BillTo;
  heroImage?: Buffer | string;
  listingUrl?: string;
  specs: DecodedSpec[];
  lineItems: InvoiceLineItem[];
  shipping: { price: number; destinationZip: string } | null;
  tax: { amount: number; rate: number; label: string } | null;
}

export function Invoice({
  listing,
  billTo,
  heroImage,
  listingUrl,
  specs,
  lineItems,
  shipping,
  tax,
}: InvoiceProps) {
  const invoiceNumber = formatInvoiceNumber(listing.secondaryId);
  return (
    <Document
      title={`Invoice ${invoiceNumber} — ${listing.listingTitle}`}
      author="Garage Technologies Inc."
    >
      <InvoicePage
        listing={listing}
        billTo={billTo}
        listingUrl={listingUrl}
        lineItems={lineItems}
        shipping={shipping}
        tax={tax}
      />
      <DetailsPage listing={listing} heroImage={heroImage} specs={specs} />
    </Document>
  );
}
