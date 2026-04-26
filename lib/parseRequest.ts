import { WARRANTY_DURATIONS, type BillTo, type WarrantyDuration, type WarrantyTier } from "./types";

export interface ParsedInvoiceRequest {
  ok: true;
  url: string;
  billTo?: BillTo;
  warranty?: { duration: WarrantyDuration; tier: WarrantyTier };
  email?: string;
}

export interface ParseError {
  ok: false;
  error: string;
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function strOrUndef(v: unknown): string | undefined {
  return typeof v === "string" && v.trim().length > 0 ? v.trim() : undefined;
}

function parseBillTo(v: unknown): BillTo | undefined {
  if (!isObject(v)) return undefined;
  const out: BillTo = {
    name: strOrUndef(v.name),
    line1: strOrUndef(v.line1),
    line2: strOrUndef(v.line2),
    city: strOrUndef(v.city),
    state: strOrUndef(v.state),
    zip: strOrUndef(v.zip),
  };

  const hasAny = Object.values(out).some((x) => x !== undefined);
  return hasAny ? out : undefined;
}

const WARRANTY_TIERS: readonly WarrantyTier[] = ["standard", "premium"];

function parseWarranty(
  v: unknown
): { duration: WarrantyDuration; tier: WarrantyTier } | undefined {
  if (!isObject(v)) return undefined;
  const duration = v.duration;
  const tier = v.tier ?? "standard";
  if (typeof duration !== "string") return undefined;
  if (!WARRANTY_DURATIONS.includes(duration as WarrantyDuration)) return undefined;
  if (typeof tier !== "string" || !WARRANTY_TIERS.includes(tier as WarrantyTier))
    return undefined;
  return {
    duration: duration as WarrantyDuration,
    tier: tier as WarrantyTier,
  };
}

export function parseInvoiceRequest(
  body: unknown
): ParsedInvoiceRequest | ParseError {
  if (!isObject(body)) return { ok: false, error: "Invalid body." };
  const url = strOrUndef(body.url);
  if (!url) return { ok: false, error: "Missing 'url' field." };
  return {
    ok: true,
    url,
    billTo: parseBillTo(body.billTo),
    warranty: parseWarranty(body.warranty),
    email: strOrUndef(body.email),
  };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function isValidEmail(s: string): boolean {
  return EMAIL_RE.test(s);
}
