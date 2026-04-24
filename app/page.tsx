"use client";

import { useState, type FormEvent } from "react";

type Status =
  | { kind: "idle" }
  | { kind: "working"; message: string }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

async function downloadPdf(url: string, billTo: string) {
  const res = await fetch("/api/invoice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, billTo: billTo || undefined }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: "Request failed." }));
    throw new Error(data.error ?? `Request failed (${res.status}).`);
  }
  const blob = await res.blob();
  const filename =
    parseFilename(res.headers.get("Content-Disposition")) ?? "garage-invoice.pdf";
  triggerBrowserDownload(blob, filename);
}

async function emailPdf(url: string, billTo: string, email: string) {
  const res = await fetch("/api/email-invoice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, billTo: billTo || undefined, email }),
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

export default function Home() {
  const [url, setUrl] = useState("");
  const [billTo, setBillTo] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const busy = status.kind === "working";
  const wantsEmail = email.trim().length > 0;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!url.trim()) {
      setStatus({ kind: "error", message: "Paste a listing URL to get started." });
      return;
    }

    try {
      if (wantsEmail) {
        setStatus({ kind: "working", message: "Sending email…" });
        await emailPdf(url, billTo, email);
        setStatus({ kind: "working", message: "Downloading PDF…" });
        await downloadPdf(url, billTo);
        setStatus({
          kind: "success",
          message: `Sent to ${email.trim()} and downloaded.`,
        });
      } else {
        setStatus({ kind: "working", message: "Generating PDF…" });
        await downloadPdf(url, billTo);
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
            <span className="ml-3 text-sm text-neutral-500">Invoice generator</span>
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
            and download a paper-ready invoice for your board.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="url"
              className="mb-1.5 block text-sm font-medium text-brand-dark"
            >
              Listing URL
            </label>
            <input
              id="url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.shopgarage.com/listing/..."
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-base placeholder:text-neutral-400 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
              autoComplete="url"
              disabled={busy}
            />
          </div>

          <div>
            <label
              htmlFor="billTo"
              className="mb-1.5 block text-sm font-medium text-brand-dark"
            >
              Bill to <span className="text-neutral-400">(optional)</span>
            </label>
            <textarea
              id="billTo"
              value={billTo}
              onChange={(e) => setBillTo(e.target.value)}
              placeholder={"Springfield Fire Department\n123 Main St\nSpringfield, IL 62701"}
              rows={3}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-base placeholder:text-neutral-400 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
              disabled={busy}
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-brand-dark"
            >
              Email to <span className="text-neutral-400">(optional — leave blank to download only)</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="chief@firedept.gov"
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-base placeholder:text-neutral-400 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
              autoComplete="email"
              disabled={busy}
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-brand-orange px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-brand-orange-hover disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {busy ? "Working…" : wantsEmail ? "Email + download invoice" : "Generate invoice"}
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
              We fetch the listing details from Garage&apos;s backend and render a
              branded PDF invoice.
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
