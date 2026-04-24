import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Listing } from "./types";

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
    height: 280,
    objectFit: "cover",
    marginBottom: 20,
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
    marginTop: 32,
  },
  termsLabel: {
    fontFamily: "Helvetica-Bold",
    color: ORANGE,
    marginBottom: 6,
  },
  termsLine: {
    color: DARK,
    marginBottom: 2,
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
    marginBottom: 24,
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
    marginTop: 20,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottom: `1px solid ${BORDER}`,
  },
  specsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  specItem: {
    width: "50%",
    flexDirection: "row",
    paddingVertical: 5,
    paddingRight: 8,
  },
  specLabel: {
    color: MUTED,
    width: 90,
    fontSize: 9,
  },
  specValue: {
    flex: 1,
    fontSize: 10,
  },
  description: {
    color: DARK,
    lineHeight: 1.6,
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
  billTo?: string;
  heroImage?: Buffer | string;
  listingUrl?: string;
}

export function Invoice({
  listing,
  billTo,
  heroImage,
  listingUrl,
}: InvoiceProps) {
  const price = listing.sellingPrice;
  const invoiceNumber = formatInvoiceNumber(listing.secondaryId);
  const now = new Date();
  const due = new Date(now);
  due.setDate(due.getDate() + 14);
  const invoiceDate = formatDate(now);
  const dueDate = formatDate(due);

  const billLines = (billTo ?? "").split("\n").filter(Boolean);
  const billName = billLines[0] ?? "[Recipient name]";
  const billRest = billLines.slice(1);

  const specs: Array<[string, string]> = [];
  if (listing.itemBrand) specs.push(["Brand", listing.itemBrand]);
  if (listing.itemAge) specs.push(["Year", String(listing.itemAge)]);
  if (listing.category?.name)
    specs.push(["Category", listing.category.name]);
  if (listing.vin) specs.push(["VIN", listing.vin]);
  if (listing.address?.state)
    specs.push(["Location", listing.address.state]);
  const dims = [
    listing.itemLength && `L ${listing.itemLength}"`,
    listing.itemWidth && `W ${listing.itemWidth}"`,
    listing.itemHeight && `H ${listing.itemHeight}"`,
  ]
    .filter(Boolean)
    .join(" × ");
  if (dims) specs.push(["Dimensions", dims]);
  if (listing.deliveryMethod)
    specs.push(["Delivery", listing.deliveryMethod.replace(/_/g, " ")]);
  if (listing.isPickupAvailable != null)
    specs.push([
      "Pickup",
      listing.isPickupAvailable ? "Available" : "Not available",
    ]);
  if (listing.appraisedPrice)
    specs.push(["Appraised value", formatUsd(listing.appraisedPrice)]);

  const categoryName = listing.category?.name ?? "Vehicle";

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
        <View style={styles.tableRow}>
          <Text style={styles.cellQty}>1.00</Text>
          <View style={styles.cellDesc}>
            <Text style={styles.descTitle}>{listing.listingTitle}</Text>
            <Text style={styles.descSub}>{categoryName}</Text>
          </View>
          <Text style={styles.cellUnit}>{formatUsd(price)}</Text>
          <Text style={styles.cellAmount}>{formatUsd(price)}</Text>
        </View>

        <View style={styles.totalsWrap}>
          <View style={styles.totalsInner}>
            <View style={styles.totalsRow}>
              <Text style={{ color: MUTED }}>Subtotal</Text>
              <Text>{formatUsd(price)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={{ color: MUTED }}>Tax</Text>
              <Text>—</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={{ color: MUTED }}>Shipping</Text>
              <Text>To be quoted</Text>
            </View>
            <View style={styles.totalsRowFinal}>
              <Text style={styles.grandLabel}>Total (USD)</Text>
              <Text style={styles.grandValue}>{formatUsd(price)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.terms}>
          <Text style={styles.termsLabel}>Terms and Conditions</Text>
          <Text style={styles.termsLine}>
            This is a quote for board approval. Final pricing, taxes, and
            shipping will be confirmed on order.
          </Text>
          <Text style={styles.termsLine}>
            Please make checks payable to: Garage Technologies Inc.
          </Text>
          <Text style={styles.termsLine}>
            Questions: sales@withgarage.com
          </Text>
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
              {specs.map(([label, value]) => (
                <View key={label} style={styles.specItem}>
                  <Text style={styles.specLabel}>{label}</Text>
                  <Text style={styles.specValue}>{value}</Text>
                </View>
              ))}
            </View>
          </>
        ) : null}

        {listing.listingDescription ? (
          <>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>
              {listing.listingDescription}
            </Text>
          </>
        ) : null}

        {listingUrl ? (
          <>
            <Text style={styles.sectionTitle}>Source listing</Text>
            <Text style={{ color: ORANGE }}>{listingUrl}</Text>
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
