import type { WarrantyDuration, WarrantyTier } from "@/lib/types";

export interface InvoiceFormState {
  url: string;
  name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  zip: string;
  warrantyDuration: "" | WarrantyDuration;
  warrantyTier: WarrantyTier;
  email: string;
}

export interface InvoicePayload {
  url: string;
  billTo: {
    name?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  warranty?: { duration: WarrantyDuration; tier: WarrantyTier };
  email?: string;
}

export function buildPayload(f: InvoiceFormState): InvoicePayload {
  return {
    url: f.url.trim(),
    billTo: {
      name: f.name.trim() || undefined,
      line1: f.line1.trim() || undefined,
      line2: f.line2.trim() || undefined,
      city: f.city.trim() || undefined,
      state: f.state.trim() || undefined,
      zip: f.zip.trim() || undefined,
    },
    warranty:
      f.warrantyDuration === ""
        ? undefined
        : { duration: f.warrantyDuration, tier: f.warrantyTier },
    email: f.email.trim() || undefined,
  };
}

export async function downloadPdf(payload: InvoicePayload): Promise<void> {
  const res = await fetch("/api/invoice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: "Request failed." }));
    throw new Error(data.error ?? `Request failed (${res.status}).`);
  }
  const blob = await res.blob();
  const filename =
    parseFilename(res.headers.get("Content-Disposition")) ??
    "garage-invoice.pdf";
  triggerBrowserDownload(blob, filename);
}

export async function emailPdf(payload: InvoicePayload): Promise<void> {
  const res = await fetch("/api/email-invoice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: "Request failed." }));
    throw new Error(data.error ?? `Request failed (${res.status}).`);
  }
}

function parseFilename(disposition: string | null): string | undefined {
  if (!disposition) return undefined;
  const match = disposition.match(/filename="?([^"]+)"?/);
  return match?.[1];
}

function triggerBrowserDownload(blob: Blob, filename: string): void {
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
}
