import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type { BillTo, DecodedSpec, InvoiceLineItem, Listing } from "./types";

const ORANGE = "#f97316";
const ORANGE_SOFT = "#fff7ed";
const DARK = "#1a1a1a";
const MUTED = "#6b7280";
const BORDER = "#e5e7eb";

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 56,
    fontSize: 10,
    color: DARK,
    fontFamily: "Helvetica",
    lineHeight: 1.5,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
  },
  fromBlock: {
    maxWidth: 260,
  },
  fromName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  fromLine: {
    color: MUTED,
  },
  invoiceTitle: {
    fontSize: 36,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 4,
    color: ORANGE,
    marginTop: 20,
  },

  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
  },
  billTo: {
    maxWidth: 260,
  },
  billToLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: ORANGE,
    marginBottom: 6,
  },
  billToName: {
    fontSize: 12,
    marginBottom: 2,
  },
  billToLine: {
    color: MUTED,
  },
  metaCol: {
    width: 220,
  },
  metaRowItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  metaLabel: {
    fontFamily: "Helvetica-Bold",
    color: ORANGE,
  },
  metaValue: {
    color: DARK,
  },

  heroImage: {
    width: "100%",
    height: 150,
    objectFit: "cover",
    marginBottom: 12,
    borderRadius: 4,
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: ORANGE,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottom: `1px solid ${BORDER}`,
    alignItems: "flex-start",
  },
  cellQty: { width: 50 },
  cellDesc: { flex: 1, paddingRight: 12 },
  cellUnit: { width: 90, textAlign: "right" },
  cellAmount: { width: 90, textAlign: "right" },
  descTitle: {
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  descSub: { color: MUTED, fontSize: 9 },

  totalsWrap: {
    marginTop: 8,
    alignItems: "flex-end",
  },
  totalsInner: {
    width: 260,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  totalsRowFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: ORANGE_SOFT,
    borderTop: `2px solid ${ORANGE}`,
    borderBottom: `2px solid ${ORANGE}`,
  },
  grandLabel: {
    fontFamily: "Helvetica-Bold",
    color: ORANGE,
    fontSize: 11,
  },
  grandValue: {
    fontFamily: "Helvetica-Bold",
    color: ORANGE,
    fontSize: 11,
  },

  terms: {
    marginTop: 20,
  },
  termsLabel: {
    fontFamily: "Helvetica-Bold",
    color: ORANGE,
    marginBottom: 8,
  },
  termsItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
    paddingRight: 8,
  },
  termsBullet: {
    color: ORANGE,
    fontFamily: "Helvetica-Bold",
    width: 10,
    flexShrink: 0,
  },
  termsText: {
    color: DARK,
    flex: 1,
  },
  footnoteMarker: {
    fontSize: 7,
    color: ORANGE,
    fontFamily: "Helvetica-Bold",
  },
  notesWrap: {
    marginTop: 10,
  },
  notesLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 3,
  },
  notesItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 1,
    fontSize: 8,
    color: MUTED,
  },
  notesMarker: {
    width: 10,
    color: ORANGE,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
  },
  notesText: {
    flex: 1,
    color: MUTED,
    fontSize: 8,
  },
  sourceLine: {
    marginTop: 8,
    fontSize: 8,
    color: MUTED,
  },
  sourceUrl: {
    color: ORANGE,
  },

  pageFooter: {
    position: "absolute",
    bottom: 24,
    left: 56,
    right: 56,
    fontSize: 8,
    color: MUTED,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  // Page 2 — Vehicle details
  detailsHeader: {
    marginBottom: 16,
  },
  detailsEyebrow: {
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 2,
    color: ORANGE,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
  },
  detailsTitle: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  detailsCategory: {
    color: MUTED,
    fontSize: 11,
  },

  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: ORANGE,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginTop: 8,
    marginBottom: 6,
    paddingBottom: 4,
    borderBottom: `1px solid ${BORDER}`,
  },
  specsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  specItem: {
    width: "50%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderBottom: `1px solid ${BORDER}`,
  },
  specItemRight: {
    borderLeft: `1px solid ${BORDER}`,
  },
  specLabel: {
    color: DARK,
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  specValue: {
    color: MUTED,
    fontSize: 10,
    textAlign: "right",
    maxWidth: "60%",
  },
});

function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatInvoiceNumber(secondaryId: number): string {
  return String(secondaryId).padStart(7, "0");
}

function formatDate(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
}

export interface InvoiceProps {
  listing: Listing;
  billTo?: BillTo;
  heroImage?: Buffer | string;
  listingUrl?: string;
  specs: DecodedSpec[];
  lineItems: InvoiceLineItem[];
  shipping: { price: number; destinationZip: string } | null;
  tax: { amount: number; rate: number; state: string } | null;
}

function renderBillToLines(billTo: BillTo | undefined): {
  name: string;
  rest: string[];
} {
  if (!billTo) return { name: "[Recipient name]", rest: [] };
  const name = billTo.name?.trim() || "[Recipient name]";
  const rest: string[] = [];
  if (billTo.line1?.trim()) rest.push(billTo.line1.trim());
  if (billTo.line2?.trim()) rest.push(billTo.line2.trim());
  const city = billTo.city?.trim();
  const state = billTo.state?.trim();
  const zip = billTo.zip?.trim();
  const cityLine = [
    [city, state].filter(Boolean).join(", "),
    zip,
  ]
    .filter(Boolean)
    .join(" ");
  if (cityLine) rest.push(cityLine);
  return { name, rest };
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
  const now = new Date();
  const due = new Date(now);
  due.setDate(due.getDate() + 14);
  const invoiceDate = formatDate(now);
  const dueDate = formatDate(due);

  const { name: billName, rest: billRest } = renderBillToLines(billTo);

  const subtotal = lineItems.reduce((s, li) => s + li.qty * li.unitPrice, 0);
  const shippingAmt = shipping?.price ?? 0;
  const taxAmt = tax?.amount ?? 0;
  const total = subtotal + shippingAmt + taxAmt;
  const categoryName = listing.category?.name ?? "Vehicle";

  // Assign footnote markers in document order: warranty (line item) →
  // shipping (totals) → tax (totals). Store as strings so we can swap to
  // unicode superscripts later if desired.
  const footnotes: Array<{ marker: string; text: string }> = [];
  const warrantyLineIndex = lineItems.findIndex((li) =>
    li.label.toLowerCase().includes("warranty")
  );
  let warrantyMarker: string | undefined;
  if (warrantyLineIndex !== -1) {
    warrantyMarker = String(footnotes.length + 1);
    footnotes.push({
      marker: warrantyMarker,
      text: "Warranty quoted via Garage's /warranty/quote endpoint. Final pricing confirmed on order.",
    });
  }
  let shippingMarker: string | undefined;
  if (shipping) {
    shippingMarker = String(footnotes.length + 1);
    footnotes.push({
      marker: shippingMarker,
      text: `Freight shipping estimated to ZIP ${shipping.destinationZip} via Garage's /shipment/freight/quote endpoint. Prices subject to change.`,
    });
  }
  let taxMarker: string | undefined;
  if (tax) {
    taxMarker = String(footnotes.length + 1);
    footnotes.push({
      marker: taxMarker,
      text: `Sales tax estimated at ${tax.state} state rate (${(tax.rate * 100).toFixed(2)}%). Local rates and government tax-exemption may apply.`,
    });
  }

  return (
    <Document
      title={`Invoice ${invoiceNumber} — ${listing.listingTitle}`}
      author="Garage Technologies Inc."
    >
      {/* ========================= PAGE 1 — INVOICE ========================= */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.topRow}>
          <View style={styles.fromBlock}>
            <Text style={styles.fromName}>Garage Technologies Inc.</Text>
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
                  ? `Estimated tax (${tax.state} ${(tax.rate * 100).toFixed(
                      2
                    )}%)`
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

      {/* ========================= PAGE 2 — DETAILS ========================= */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.detailsHeader}>
          <Text style={styles.detailsEyebrow}>Vehicle details</Text>
          <Text style={styles.detailsTitle}>{listing.listingTitle}</Text>
          <Text style={styles.detailsCategory}>{categoryName}</Text>
        </View>

        {heroImage ? (
          <Image style={styles.heroImage} src={heroImage} />
        ) : null}

        {specs.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Specifications</Text>
            <View style={styles.specsGrid}>
              {specs.map((spec, i) => (
                <View
                  key={`${spec.label}-${i}`}
                  style={[
                    styles.specItem,
                    i % 2 === 1 ? styles.specItemRight : {},
                  ]}
                >
                  <Text style={styles.specLabel}>{spec.label}</Text>
                  <Text style={styles.specValue}>{spec.value}</Text>
                </View>
              ))}
            </View>
          </>
        ) : null}

        <View style={styles.pageFooter} fixed>
          <Text>Invoice {invoiceNumber}</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
