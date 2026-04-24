import { StyleSheet } from "@react-pdf/renderer";

export const ORANGE = "#f97316";
export const ORANGE_SOFT = "#fff7ed";
export const DARK = "#1a1a1a";
export const MUTED = "#6b7280";
export const BORDER = "#e5e7eb";

export const styles = StyleSheet.create({
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
    marginBottom: 20,
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
    marginBottom: 20,
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
    maxHeight: 260,
    objectFit: "contain",
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
    marginTop: 14,
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
  specIconWrap: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
});
