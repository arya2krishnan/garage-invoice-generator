import { Resend } from "resend";
import { extractUuid, InvalidInputError } from "@/lib/extractUuid";
import {
  fetchListing,
  ListingNotFoundError,
  ListingFetchError,
} from "@/lib/fetchListing";
import { renderInvoicePdf } from "@/lib/renderInvoicePdf";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const maxDuration = 30;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SENDER = "Garage Invoices <onboarding@resend.dev>";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`email:${ip}`, { limit: 3, windowMs: 60_000 });
  if (!rl.ok) {
    return Response.json(
      { error: `Rate limit exceeded. Try again in ${rl.retryAfterSeconds}s.` },
      {
        status: 429,
        headers: { "Retry-After": String(rl.retryAfterSeconds ?? 60) },
      }
    );
  }

  let body: { url?: string; billTo?: string; email?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { url, billTo, email } = body;
  if (typeof url !== "string") {
    return Response.json({ error: "Missing 'url' field." }, { status: 400 });
  }
  if (typeof email !== "string" || !EMAIL_RE.test(email)) {
    return Response.json(
      { error: "Enter a valid email address." },
      { status: 400 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY not set");
    return Response.json(
      { error: "Email service is not configured. Try downloading instead." },
      { status: 503 }
    );
  }

  try {
    const uuid = extractUuid(url);
    const listing = await fetchListing(uuid);
    const pdf = await renderInvoicePdf(listing, {
      billTo,
      listingUrl: url.startsWith("http") ? url : undefined,
    });

    const filename = `garage-invoice-${listing.secondaryId}.pdf`;
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: SENDER,
      to: email,
      subject: `Your Garage invoice for ${listing.listingTitle}`,
      html: `<p>Hi,</p><p>Attached is the PDF invoice for <strong>${escapeHtml(
        listing.listingTitle
      )}</strong> (${escapeHtml(
        listing.category?.name ?? "vehicle"
      )}) as requested.</p><p>Questions? Reply to this email or contact sales@withgarage.com.</p><p>— Garage</p>`,
      attachments: [{ filename, content: pdf }],
    });

    if (error) {
      console.error("resend error", error);
      return Response.json(
        { error: "Email send failed. Try downloading instead." },
        { status: 502 }
      );
    }

    return Response.json({ ok: true, id: data?.id ?? null });
  } catch (err) {
    if (err instanceof InvalidInputError) {
      return Response.json({ error: err.message }, { status: 400 });
    }
    if (err instanceof ListingNotFoundError) {
      return Response.json(
        { error: "Listing not found. Double-check the URL." },
        { status: 404 }
      );
    }
    if (err instanceof ListingFetchError) {
      return Response.json(
        { error: "Couldn't reach Garage's listing API. Try again." },
        { status: 502 }
      );
    }
    console.error("email-invoice route error", err);
    return Response.json({ error: "Failed to send invoice." }, { status: 500 });
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
