import { Page, Text, View } from "@react-pdf/renderer";
import type { BillTo, InvoiceLineItem, Listing } from "@/lib/types";
import { Logo } from "./Logo";
import { styles, MUTED } from "./styles";
import {
  formatDate,
  formatInvoiceNumber,
  formatUsd,
  renderBillToLines,
} from "./utils/formatters";

interface Footnote {
  marker: string;
  text: string;
}

interface Props {
  listing: Listing;
  billTo?: BillTo;
  listingUrl?: string;
  lineItems: InvoiceLineItem[];
  shipping: { price: number; destinationZip: string } | null;
  tax: { amount: number; rate: number; label: string } | null;
}

export function InvoicePage({
  listing,
  billTo,
  listingUrl,
  lineItems,
  shipping,
  tax,
}: Props) {
  const invoiceNumber = formatInvoiceNumber(listing.secondaryId);
  const now = new Date();
  const due = new Date(now);
  due.setDate(due.getDate() + 14);
  const invoiceDate = formatDate(now);
  const dueDate = formatDate(due);

  const { name: billName, rest: billRest } = renderBillToLines(billTo);

  const subtotal = lineItems.reduce((s, li) => s + li.qty * li.unitPrice, 0);
  const total = subtotal + (shipping?.price ?? 0) + (tax?.amount ?? 0);

  // Footnote markers assigned in document order: warranty → shipping → tax.
  const footnotes: Footnote[] = [];
  const warrantyLineIndex = lineItems.findIndex((li) =>
    li.label.toLowerCase().includes("warranty")
  );
  const warrantyMarker =
    warrantyLineIndex !== -1 ? String(footnotes.length + 1) : undefined;
  if (warrantyMarker) {
    footnotes.push({
      marker: warrantyMarker,
      text: "Warranty quoted via Garage's /warranty/quote endpoint. Final pricing confirmed on order.",
    });
  }
  const shippingMarker = shipping ? String(footnotes.length + 1) : undefined;
  if (shippingMarker && shipping) {
    footnotes.push({
      marker: shippingMarker,
      text: `Freight shipping estimated to ZIP ${shipping.destinationZip} via Garage's /shipment/freight/quote endpoint. Prices subject to change.`,
    });
  }
  const taxMarker = tax ? String(footnotes.length + 1) : undefined;
  if (taxMarker && tax) {
    footnotes.push({
      marker: taxMarker,
      text: `Sales tax estimated via api-ninjas salestax at ${tax.label} (${(tax.rate * 100).toFixed(2)}%). Local rates and government tax-exemption may apply.`,
    });
  }

  return (
    <Page size="LETTER" style={styles.page}>
      <View style={styles.topRow}>
        <View style={styles.fromBlock}>
          <View style={{ marginBottom: 4 }}>
            <Logo width={90} />
          </View>
          <Text style={styles.fromLine}>Garage Technologies Inc.</Text>
          <Text style={styles.fromLine}>sales@withgarage.com</Text>
          <Text style={styles.fromLine}>shopgarage.com</Text>
        </View>
        <Text style={styles.invoiceTitle}>INVOICE</Text>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.billTo}>
          <Text style={styles.billToLabel}>Bill To</Text>
          <Text style={styles.billToName}>{billName}</Text>
          {billRest.map((line, i) => (
            <Text key={i} style={styles.billToLine}>
              {line}
            </Text>
          ))}
        </View>
        <View style={styles.metaCol}>
          <View style={styles.metaRowItem}>
            <Text style={styles.metaLabel}>Invoice #</Text>
            <Text style={styles.metaValue}>{invoiceNumber}</Text>
          </View>
          <View style={styles.metaRowItem}>
            <Text style={styles.metaLabel}>Invoice date</Text>
            <Text style={styles.metaValue}>{invoiceDate}</Text>
          </View>
          <View style={styles.metaRowItem}>
            <Text style={styles.metaLabel}>Due date</Text>
            <Text style={styles.metaValue}>{dueDate}</Text>
          </View>
        </View>
      </View>

      <View style={styles.tableHeader}>
        <Text style={styles.cellQty}>QTY</Text>
        <Text style={styles.cellDesc}>Description</Text>
        <Text style={styles.cellUnit}>Unit Price</Text>
        <Text style={styles.cellAmount}>Amount</Text>
      </View>
      {lineItems.map((li, i) => {
        const marker = i === warrantyLineIndex ? warrantyMarker : undefined;
        return (
          <View key={i} style={styles.tableRow}>
            <Text style={styles.cellQty}>{li.qty}</Text>
            <View style={styles.cellDesc}>
              <Text style={styles.descTitle}>
                {li.label}
                {marker ? (
                  <Text style={styles.footnoteMarker}> {marker}</Text>
                ) : null}
              </Text>
              {li.sublabel ? (
                <Text style={styles.descSub}>{li.sublabel}</Text>
              ) : null}
            </View>
            <Text style={styles.cellUnit}>{formatUsd(li.unitPrice)}</Text>
            <Text style={styles.cellAmount}>
              {formatUsd(li.qty * li.unitPrice)}
            </Text>
          </View>
        );
      })}

      <View style={styles.totalsWrap}>
        <View style={styles.totalsInner}>
          <View style={styles.totalsRow}>
            <Text style={{ color: MUTED }}>Subtotal</Text>
            <Text>{formatUsd(subtotal)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={{ color: MUTED }}>
              {shipping
                ? `Estimated shipping (ZIP ${shipping.destinationZip})`
                : "Shipping"}
              {shippingMarker ? (
                <Text style={styles.footnoteMarker}> {shippingMarker}</Text>
              ) : null}
            </Text>
            <Text>{shipping ? formatUsd(shipping.price) : "—"}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={{ color: MUTED }}>
              {tax
                ? `Estimated tax (${tax.label}, ${(tax.rate * 100).toFixed(2)}%)`
                : "Tax"}
              {taxMarker ? (
                <Text style={styles.footnoteMarker}> {taxMarker}</Text>
              ) : null}
            </Text>
            <Text>{tax ? formatUsd(tax.amount) : "—"}</Text>
          </View>
          <View style={styles.totalsRowFinal}>
            <Text style={styles.grandLabel}>Total (USD)</Text>
            <Text style={styles.grandValue}>{formatUsd(total)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.terms}>
        <Text style={styles.termsLabel}>Terms and Conditions</Text>
        {[
          "This is a quote for board approval. Final pricing, taxes, and shipping will be confirmed on order.",
          "Please make checks payable to: Garage Technologies Inc.",
          "Questions: sales@withgarage.com",
        ].map((text, i) => (
          <View key={i} style={styles.termsItem}>
            <Text style={styles.termsBullet}>•</Text>
            <Text style={styles.termsText}>{text}</Text>
          </View>
        ))}

        {footnotes.length > 0 && (
          <View style={styles.notesWrap}>
            <Text style={styles.notesLabel}>Notes</Text>
            {footnotes.map((fn) => (
              <View key={fn.marker} style={styles.notesItem}>
                <Text style={styles.notesMarker}>{fn.marker}</Text>
                <Text style={styles.notesText}>{fn.text}</Text>
              </View>
            ))}
          </View>
        )}

        {listingUrl ? (
          <Text style={styles.sourceLine}>
            Source listing:{" "}
            <Text style={styles.sourceUrl}>{listingUrl}</Text>
          </Text>
        ) : null}
      </View>

      <View style={styles.pageFooter} fixed>
        <Text>Invoice {invoiceNumber}</Text>
        <Text
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
        />
      </View>
    </Page>
  );
}
