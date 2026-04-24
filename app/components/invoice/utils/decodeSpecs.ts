import type { CategoryAttribute, DecodedSpec, Listing } from "@/lib/types";

// Match the website's visual cue: green check / red X instead of Yes / No.
// DetailsPage detects these exact strings and swaps in an SVG icon — plain
// text would fall back to the Helvetica glyph which Helvetica lacks.
const BOOL_YES = "✓";
const BOOL_NO = "✗";

function titleCase(s: string): string {
  return s
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w[0]!.toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/** Convert inches to feet-inches (e.g. 125 → 10' 5"). */
function formatInches(inches: number): string {
  const feet = Math.floor(inches / 12);
  const rem = Math.round(inches - feet * 12);
  if (rem === 0) return `${feet}'`;
  return `${feet}' ${rem}"`;
}

function formatValue(raw: string, inputType: string, label: string): string {
  const v = raw.trim();
  if (inputType === "BOOLEAN") {
    if (v === "true") return BOOL_YES;
    if (v === "false") return BOOL_NO;
    return v;
  }
  if (inputType === "NUMBER") {
    const n = Number(v);
    if (!Number.isFinite(n)) return v;
    const low = label.toLowerCase();
    if (low.includes("mileage") || low.includes("miles"))
      return `${n.toLocaleString("en-US")} miles`;
    if (low.includes("hours") || low.includes("hr"))
      return `${n.toLocaleString("en-US")} hours`;
    if (low.includes("gpm")) return `${n.toLocaleString("en-US")} gpm`;
    if (low.includes("gal")) return `${n.toLocaleString("en-US")} gal`;
    return n.toLocaleString("en-US");
  }
  // STRING: prettify machine-readable values.
  // "pumper-engine" → "Pumper (Engine)", "ambulance" → "Ambulance".
  if (v === "pumper-engine") return "Pumper (Engine)";
  if (/^[a-z0-9-]+$/.test(v) && v.includes("-")) return titleCase(v);
  if (/^[a-z][a-z\s]*$/.test(v)) return titleCase(v);
  return v;
}

/** Strip parenthetical unit hint from labels: "Pump size (gpm)" → "Pump size". */
function cleanLabel(label: string): string {
  return label.replace(/\s*\([^)]*\)\s*$/, "").trim();
}

/**
 * Merge universal listing fields and the per-category ListingAttribute[]
 * into a single, ordered spec list for the invoice details page.
 * - Universal specs (Category, Brand, Year, Location, Delivery, Pickup) are
 *   assigned negative `order` so they sort first.
 * - Category-specific attributes sort by their API-provided `order`.
 * - Attribute values that duplicate a universal (by case-insensitive match)
 *   are dropped in favor of the universal one.
 */
export function decodeSpecs(
  listing: Listing,
  attributes: CategoryAttribute[]
): DecodedSpec[] {
  const specs: DecodedSpec[] = [];
  const seenValues = new Set<string>();

  const pushUniversal = (
    label: string,
    value: string | null | undefined,
    order: number
  ) => {
    if (!value) return;
    specs.push({ label, value, order });
    seenValues.add(value.toLowerCase());
  };

  pushUniversal(
    "Listing ID",
    listing.secondaryId ? `#${listing.secondaryId}` : null,
    -120
  );
  pushUniversal("Category", listing.category?.name, -110);
  pushUniversal(
    "Model year",
    listing.itemAge ? String(listing.itemAge) : null,
    -100
  );
  pushUniversal("Location", listing.address?.state ?? null, -90);
  pushUniversal("VIN", listing.vin ?? null, -80);
  // itemBrand often duplicates the "Chassis" attribute — only include if no
  // Chassis attribute will decode for this listing. We check that below and
  // add Brand only as a fallback.

  if (listing.itemLength) {
    specs.push({
      label: "Length",
      value: formatInches(listing.itemLength),
      order: -70,
    });
  }
  if (listing.itemWidth) {
    specs.push({
      label: "Width",
      value: formatInches(listing.itemWidth),
      order: -65,
    });
  }
  if (listing.itemHeight) {
    specs.push({
      label: "Height",
      value: formatInches(listing.itemHeight),
      order: -60,
    });
  }

  if (listing.deliveryMethod) {
    specs.push({
      label: "Delivery",
      value: titleCase(listing.deliveryMethod.replace(/_/g, " ")),
      order: -50,
    });
  }
  if (listing.isPickupAvailable != null) {
    specs.push({
      label: "Pickup",
      value: listing.isPickupAvailable ? "Available" : "Not available",
      order: -40,
    });
  }
  if (listing.appraisedPrice) {
    specs.push({
      label: "Appraised value",
      value: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(listing.appraisedPrice),
      order: -30,
    });
  }

  // Decode ListingAttribute[] via the category-attribute mapping.
  const byId = new Map(attributes.map((a) => [a.id, a]));
  let sawChassis = false;
  for (const la of listing.ListingAttribute ?? []) {
    const meta = byId.get(la.categoryAttributeId);
    if (!meta) continue; // attribute removed or from a different category
    const rawLabel = meta.label;
    const label = cleanLabel(rawLabel);
    if (!la.value) continue;
    const formatted = formatValue(la.value, meta.inputType, rawLabel);
    if (!formatted) continue;
    // Drop duplicates of universal values (e.g. VIN also in attributes).
    if (seenValues.has(formatted.toLowerCase())) continue;
    if (label.toLowerCase() === "chassis") sawChassis = true;
    specs.push({ label, value: formatted, order: meta.order });
  }

  // Fallback: only show itemBrand if no Chassis attribute surfaced (they're
  // usually the same value — avoid duplication).
  if (!sawChassis && listing.itemBrand) {
    specs.push({ label: "Brand", value: listing.itemBrand, order: -85 });
  }

  specs.sort((a, b) => a.order - b.order);
  return specs;
}
