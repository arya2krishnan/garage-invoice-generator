"use client";

import { useMemo, useState, type FormEvent } from "react";

type Status =
  | { kind: "idle" }
  | { kind: "working"; message: string }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

const WARRANTY_DURATIONS = [
  "6 months",
  "1 year",
  "5 years",
  "7 years",
  "10 years",
] as const;
type WarrantyDuration = (typeof WARRANTY_DURATIONS)[number];

const US_STATES: Array<{ code: string; name: string }> = [
  { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" }, { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" }, { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" },
  { code: "FL", name: "Florida" }, { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" }, { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" }, { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" }, { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" }, { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" }, { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" }, { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" }, { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" }, { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" }, { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" }, { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" }, { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" }, { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" }, { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" }, { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" }, { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" }, { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" }, { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" }, { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" }, { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" }, { code: "WY", name: "Wyoming" },
];

interface FormState {
  url: string;
  name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  zip: string;
  warrantyDuration: "" | WarrantyDuration;
  warrantyTier: "squad" | "battalion";
  email: string;
}

function buildPayload(f: FormState) {
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

async function downloadPdf(payload: ReturnType<typeof buildPayload>) {
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

async function emailPdf(payload: ReturnType<typeof buildPayload>) {
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

function triggerBrowserDownload(blob: Blob, filename: string) {
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
}

const inputClass =
  "w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-base placeholder:text-neutral-400 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/30 disabled:bg-neutral-50 disabled:text-neutral-500";

const labelClass = "mb-1.5 block text-sm font-medium text-brand-dark";

export default function Home() {
  const [form, setForm] = useState<FormState>({
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
  });
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const busy = status.kind === "working";
  const wantsEmail = form.email.trim().length > 0;
  const wantsWarranty = form.warrantyDuration !== "";

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const hint = useMemo(() => {
    const bits: string[] = [];
    if (form.zip.trim()) bits.push("freight quote");
    if (wantsWarranty) bits.push(`${form.warrantyDuration} warranty`);
    if (bits.length === 0) return null;
    return `Will include ${bits.join(" + ")}.`;
  }, [form.zip, form.warrantyDuration, wantsWarranty]);

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
    <div className="flex flex-1 flex-col">
      <header className="border-b border-neutral-200">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold tracking-widest">GARAGE</span>
            <span className="text-xl font-bold text-brand-orange">.</span>
            <span className="ml-3 text-sm text-neutral-500">
              Invoice generator
            </span>
          </div>
          <a
            href="https://www.shopgarage.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-neutral-500 hover:text-brand-dark"
          >
            shopgarage.com →
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Generate a PDF invoice
          </h1>
          <p className="mt-3 max-w-xl text-lg text-neutral-600">
            Paste any Garage listing URL — fire trucks, ambulances, equipment —
            and download a paper-ready invoice for your board. Optional freight
            shipping and warranty estimates included.
          </p>
        </div>

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

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand-orange">
              Bill To
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="name" className={labelClass}>
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Springfield Fire Department"
                  className={inputClass}
                  disabled={busy}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="line1" className={labelClass}>
                  Address line 1
                </label>
                <input
                  id="line1"
                  type="text"
                  value={form.line1}
                  onChange={(e) => update("line1", e.target.value)}
                  placeholder="1234 Main Street"
                  className={inputClass}
                  disabled={busy}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="line2" className={labelClass}>
                  Address line 2{" "}
                  <span className="text-neutral-400">(optional)</span>
                </label>
                <input
                  id="line2"
                  type="text"
                  value={form.line2}
                  onChange={(e) => update("line2", e.target.value)}
                  placeholder="Suite 200"
                  className={inputClass}
                  disabled={busy}
                />
              </div>
              <div>
                <label htmlFor="city" className={labelClass}>
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  placeholder="Springfield"
                  className={inputClass}
                  disabled={busy}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="state" className={labelClass}>
                    State
                  </label>
                  <select
                    id="state"
                    value={form.state}
                    onChange={(e) => update("state", e.target.value)}
                    className={inputClass}
                    disabled={busy}
                  >
                    <option value="">—</option>
                    {US_STATES.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.code}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="zip" className={labelClass}>
                    ZIP
                  </label>
                  <input
                    id="zip"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{5}(-[0-9]{4})?"
                    value={form.zip}
                    onChange={(e) => update("zip", e.target.value)}
                    placeholder="62701"
                    className={inputClass}
                    disabled={busy}
                  />
                </div>
              </div>
            </div>
            <p className="mt-2 text-xs text-neutral-500">
              Providing a ZIP adds an estimated freight shipping line to the
              invoice.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand-orange">
              Extended warranty{" "}
              <span className="text-neutral-400 normal-case">(optional)</span>
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="warrantyDuration" className={labelClass}>
                  Duration
                </label>
                <select
                  id="warrantyDuration"
                  value={form.warrantyDuration}
                  onChange={(e) =>
                    update(
                      "warrantyDuration",
                      e.target.value as FormState["warrantyDuration"]
                    )
                  }
                  className={inputClass}
                  disabled={busy}
                >
                  <option value="">No warranty</option>
                  {WARRANTY_DURATIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="warrantyTier" className={labelClass}>
                  Tier
                </label>
                <select
                  id="warrantyTier"
                  value={form.warrantyTier}
                  onChange={(e) =>
                    update(
                      "warrantyTier",
                      e.target.value as FormState["warrantyTier"]
                    )
                  }
                  className={inputClass}
                  disabled={busy || !wantsWarranty}
                >
                  <option value="squad">Squad (standard)</option>
                  <option value="battalion">Battalion (premium)</option>
                </select>
              </div>
            </div>
          </section>

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

            {status.kind === "error" && (
              <p
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
              >
                {status.message}
              </p>
            )}
            {status.kind === "working" && (
              <p className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
                {status.message}
              </p>
            )}
            {status.kind === "success" && (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                ✓ {status.message}
              </p>
            )}
          </div>
        </form>

        <div className="mt-16 rounded-lg border border-neutral-200 bg-neutral-50 p-5 text-sm text-neutral-600">
          <p className="mb-2 font-medium text-brand-dark">How it works</p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>
              Paste a URL from{" "}
              <a
                href="https://www.shopgarage.com"
                className="text-brand-orange hover:underline"
              >
                shopgarage.com
              </a>{" "}
              (any category — Engines, Ambulances, Equipment).
            </li>
            <li>
              We fetch listing details + the per-category attribute mapping and
              render a branded PDF invoice with a structured spec sheet.
            </li>
            <li>
              If you supply a ZIP and / or warranty, we call Garage&apos;s quote
              endpoints and add those as estimated line items.
            </li>
            <li>
              The PDF downloads to your browser; fill the email field to also
              receive it by email.
            </li>
          </ol>
        </div>
      </main>

      <footer className="border-t border-neutral-200">
        <div className="mx-auto max-w-3xl px-6 py-6 text-xs text-neutral-500">
          Built as a take-home for Garage. Not affiliated with Garage
          Technologies Inc.
        </div>
      </footer>
    </div>
  );
}
