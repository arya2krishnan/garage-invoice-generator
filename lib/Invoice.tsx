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
const DARK = "#1a1a1a";
const MUTED = "#525252";
const BORDER = "#e5e5e5";
const SOFT_BG = "#fafafa";

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 40,
    fontSize: 10,
    color: DARK,
    fontFamily: "Helvetica",
  },
  headerBar: {
    height: 6,
    backgroundColor: ORANGE,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 4,
  },
  wordmark: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 2,
  },
  wordmarkOrange: {
    color: ORANGE,
  },
  invoiceLabel: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 4,
    color: DARK,
  },
  subHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    color: MUTED,
  },
  partyBlock: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 20,
  },
  partyCol: {
    flex: 1,
  },
  partyLabel: {
    fontSize: 8,
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  partyBody: {
    lineHeight: 1.4,
  },
  heroImage: {
    width: "100%",
    height: 180,
    objectFit: "cover",
    marginBottom: 16,
    borderRadius: 4,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: SOFT_BG,
    borderBottom: `1px solid ${BORDER}`,
    borderTop: `1px solid ${BORDER}`,
    paddingVertical: 8,
    paddingHorizontal: 8,
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: MUTED,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: `1px solid ${BORDER}`,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "flex-start",
  },
  cellItem: { flex: 4, paddingRight: 8 },
  cellCategory: { flex: 2, paddingRight: 8, color: MUTED },
  cellYear: { flex: 1, textAlign: "right", paddingRight: 8 },
  cellQty: { flex: 1, textAlign: "right", paddingRight: 8 },
  cellPrice: { flex: 2, textAlign: "right", paddingRight: 8 },
  cellTotal: { flex: 2, textAlign: "right", fontFamily: "Helvetica-Bold" },
  itemTitle: { fontFamily: "Helvetica-Bold", marginBottom: 2 },
  itemSub: { color: MUTED, fontSize: 9 },
  totalsBlock: {
    marginTop: 12,
    marginLeft: "auto",
    width: 240,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  totalsRowFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    marginTop: 4,
    borderTop: `2px solid ${ORANGE}`,
  },
  totalLabel: { color: MUTED },
  totalValue: { fontFamily: "Helvetica-Bold" },
  grandLabel: { fontFamily: "Helvetica-Bold", fontSize: 12, color: ORANGE },
  grandValue: { fontFamily: "Helvetica-Bold", fontSize: 12, color: ORANGE },
  sectionTitle: {
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: MUTED,
    marginTop: 24,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottom: `1px solid ${BORDER}`,
  },
  description: {
    lineHeight: 1.5,
    color: DARK,
    marginBottom: 4,
  },
  specsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  specItem: {
    width: "48%",
    flexDirection: "row",
    paddingVertical: 4,
    borderBottom: `1px solid ${BORDER}`,
  },
  specLabel: { color: MUTED, width: 90, fontSize: 9 },
  specValue: { flex: 1, fontSize: 9 },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    fontSize: 8,
    color: MUTED,
    textAlign: "center",
    lineHeight: 1.4,
  },
  footerLink: { color: ORANGE },
});

function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents);
}

function formatInvoiceNumber(secondaryId: number): string {
  return `INV-${String(secondaryId).padStart(6, "0")}`;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function truncateDescription(desc: string, max: number): string {
  if (desc.length <= max) return desc;
  const cut = desc.slice(0, max);
  const lastBreak = Math.max(cut.lastIndexOf("\n\n"), cut.lastIndexOf("\n"));
  const trimTo = lastBreak > max * 0.6 ? lastBreak : cut.lastIndexOf(" ");
  return cut.slice(0, trimTo > 0 ? trimTo : max).trimEnd() + "…";
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
  const year = listing.itemAge ?? "—";
  const categoryName = listing.category?.name ?? "—";
  const invoiceNumber = formatInvoiceNumber(listing.secondaryId);
  const today = formatDate(new Date());
  const billToText = (billTo && billTo.trim()) || "[Recipient — fill in]";
  // Short-line list-style descriptions (ambulances) take more vertical space
  // per char than prose — use a tighter cap when line count is high.
  const rawDescription = listing.listingDescription ?? "";
  const lineCount = rawDescription.split("\n").length;
  const maxChars = lineCount > 10 ? 800 : 1400;
  const description = rawDescription
    ? truncateDescription(rawDescription, maxChars)
    : null;

  const specs: Array<[string, string]> = [];
  if (listing.itemBrand) specs.push(["Brand", listing.itemBrand]);
  if (listing.itemAge) specs.push(["Year", String(listing.itemAge)]);
  if (listing.vin) specs.push(["VIN", listing.vin]);
  if (listing.address?.state)
    specs.push(["Location", listing.address.state]);
  if (listing.deliveryMethod)
    specs.push(["Delivery", listing.deliveryMethod.replace(/_/g, " ")]);
  if (listing.isPickupAvailable != null)
    specs.push(["Pickup", listing.isPickupAvailable ? "Available" : "Not available"]);
  const dims = [
    listing.itemLength && `L ${listing.itemLength}"`,
    listing.itemWidth && `W ${listing.itemWidth}"`,
    listing.itemHeight && `H ${listing.itemHeight}"`,
  ]
    .filter(Boolean)
    .join(" × ");
  if (dims) specs.push(["Dimensions", dims]);

  return (
    <Document
      title={`Invoice ${invoiceNumber} — ${listing.listingTitle}`}
      author="Garage Technologies Inc."
    >
      <Page size="LETTER" style={styles.page}>
        <View style={styles.headerBar} fixed />
        <View style={styles.headerRow}>
          <Text style={styles.wordmark}>
            GARAGE<Text style={styles.wordmarkOrange}>.</Text>
          </Text>
          <Text style={styles.invoiceLabel}>INVOICE</Text>
        </View>
        <View style={styles.subHeaderRow}>
          <Text>{invoiceNumber}</Text>
          <Text>{today}</Text>
        </View>

        <View style={styles.partyBlock}>
          <View style={styles.partyCol}>
            <Text style={styles.partyLabel}>Bill to</Text>
            <Text style={styles.partyBody}>{billToText}</Text>
          </View>
          <View style={styles.partyCol}>
            <Text style={styles.partyLabel}>From</Text>
            <Text style={styles.partyBody}>
              Garage Technologies Inc.{"\n"}
              sales@withgarage.com{"\n"}
              shopgarage.com
            </Text>
          </View>
        </View>

        {heroImage ? (
          <Image style={styles.heroImage} src={heroImage} />
        ) : null}

        <View style={styles.tableHeader}>
          <Text style={styles.cellItem}>Item</Text>
          <Text style={styles.cellCategory}>Category</Text>
          <Text style={styles.cellYear}>Year</Text>
          <Text style={styles.cellQty}>Qty</Text>
          <Text style={styles.cellPrice}>Unit price</Text>
          <Text style={styles.cellTotal}>Total</Text>
        </View>
        <View style={styles.tableRow}>
          <View style={styles.cellItem}>
            <Text style={styles.itemTitle}>{listing.listingTitle}</Text>
            {listing.itemBrand ? (
              <Text style={styles.itemSub}>Brand: {listing.itemBrand}</Text>
            ) : null}
          </View>
          <Text style={styles.cellCategory}>{categoryName}</Text>
          <Text style={styles.cellYear}>{year}</Text>
          <Text style={styles.cellQty}>1</Text>
          <Text style={styles.cellPrice}>{formatUsd(price)}</Text>
          <Text style={styles.cellTotal}>{formatUsd(price)}</Text>
        </View>

        <View style={styles.totalsBlock}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatUsd(price)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalLabel}>Tax</Text>
            <Text style={styles.totalValue}>—</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalLabel}>Shipping</Text>
            <Text style={styles.totalValue}>To be quoted</Text>
          </View>
          <View style={styles.totalsRowFinal}>
            <Text style={styles.grandLabel}>Total due</Text>
            <Text style={styles.grandValue}>{formatUsd(price)}</Text>
          </View>
        </View>

        {description ? (
          <>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{description}</Text>
          </>
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

        <Text style={styles.footer} fixed>
          Prepared for board approval. Prices subject to change. Contact
          sales@withgarage.com for a final quote.{"\n"}
          {listingUrl ? (
            <Text style={styles.footerLink}>{listingUrl}</Text>
          ) : null}
        </Text>
      </Page>
    </Document>
  );
}
