import type { BillTo } from "@/lib/types";

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatInvoiceNumber(secondaryId: number): string {
  return String(secondaryId).padStart(7, "0");
}

export function formatDate(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
}

export interface RenderedBillTo {
  name: string;
  rest: string[];
}

export function renderBillToLines(billTo: BillTo | undefined): RenderedBillTo {
  if (!billTo) return { name: "[Recipient name]", rest: [] };
  const name = billTo.name?.trim() || "[Recipient name]";
  const rest: string[] = [];
  if (billTo.line1?.trim()) rest.push(billTo.line1.trim());
  if (billTo.line2?.trim()) rest.push(billTo.line2.trim());
  const city = billTo.city?.trim();
  const state = billTo.state?.trim();
  const zip = billTo.zip?.trim();
  const cityLine = [[city, state].filter(Boolean).join(", "), zip]
    .filter(Boolean)
    .join(" ");
  if (cityLine) rest.push(cityLine);
  return { name, rest };
}
