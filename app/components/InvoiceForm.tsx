"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  buildPayload,
  downloadPdf,
  emailPdf,
  type InvoiceFormState,
} from "@/lib/invoiceClient";
import { BillToSection } from "./BillToSection";
import { WarrantySection } from "./WarrantySection";
import { StatusBanner, type Status } from "./StatusBanner";
import { inputClass, labelClass } from "./formStyles";

const INITIAL: InvoiceFormState = {
  url: "",
  name: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  zip: "",
  warrantyDuration: "",
  warrantyTier: "squad",
  email: "",
};

export function InvoiceForm() {
  const [form, setForm] = useState<InvoiceFormState>(INITIAL);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const busy = status.kind === "working";
  const wantsEmail = form.email.trim().length > 0;
  const wantsWarranty = form.warrantyDuration !== "";

  const update = <K extends keyof InvoiceFormState>(
    k: K,
    v: InvoiceFormState[K]
  ) => setForm((prev) => ({ ...prev, [k]: v }));

  const hint = useMemo(() => {
    const bits: string[] = [];
    if (form.zip.trim()) bits.push("freight quote");
    if (form.state.trim()) bits.push(`${form.state} sales tax`);
    if (wantsWarranty) bits.push(`${form.warrantyDuration} warranty`);
    if (bits.length === 0) return null;
    return `Will include ${bits.join(" + ")}.`;
  }, [form.zip, form.state, form.warrantyDuration, wantsWarranty]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.url.trim()) {
      setStatus({
        kind: "error",
        message: "Paste a listing URL to get started.",
      });
      return;
    }
    const payload = buildPayload(form);
    try {
      if (wantsEmail) {
        setStatus({ kind: "working", message: "Sending email…" });
        await emailPdf(payload);
        setStatus({ kind: "working", message: "Downloading PDF…" });
        await downloadPdf(payload);
        setStatus({
          kind: "success",
          message: `Sent to ${form.email.trim()} and downloaded.`,
        });
      } else {
        setStatus({ kind: "working", message: "Generating PDF…" });
        await downloadPdf(payload);
        setStatus({ kind: "success", message: "Invoice downloaded." });
      }
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "Something went wrong.",
      });
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <section>
        <label htmlFor="url" className={labelClass}>
          Listing URL
        </label>
        <input
          id="url"
          type="text"
          value={form.url}
          onChange={(e) => update("url", e.target.value)}
          placeholder="https://www.shopgarage.com/listing/..."
          className={inputClass}
          autoComplete="url"
          disabled={busy}
        />
      </section>

      <BillToSection form={form} update={update} disabled={busy} />
      <WarrantySection form={form} update={update} disabled={busy} />

      <section>
        <label htmlFor="email" className={labelClass}>
          Email to{" "}
          <span className="text-neutral-400">
            (optional — leave blank to download only)
          </span>
        </label>
        <input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          placeholder="chief@firedept.gov"
          className={inputClass}
          autoComplete="email"
          disabled={busy}
        />
      </section>

      <div className="space-y-3">
        {hint && (
          <p className="rounded-lg bg-orange-50 px-4 py-2 text-sm text-orange-900">
            {hint}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-brand-orange px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-brand-orange-hover disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {busy
            ? "Working…"
            : wantsEmail
            ? "Email + download invoice"
            : "Generate invoice"}
        </button>
        <StatusBanner status={status} />
      </div>
    </form>
  );
}
