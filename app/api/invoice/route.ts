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

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`invoice:${ip}`, { limit: 10, windowMs: 60_000 });
  if (!rl.ok) {
    return Response.json(
      { error: `Rate limit exceeded. Try again in ${rl.retryAfterSeconds}s.` },
      {
        status: 429,
        headers: { "Retry-After": String(rl.retryAfterSeconds ?? 60) },
      }
    );
  }

  let body: { url?: string; billTo?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { url, billTo } = body;
  if (typeof url !== "string") {
    return Response.json({ error: "Missing 'url' field." }, { status: 400 });
  }

  try {
    const uuid = extractUuid(url);
    const listing = await fetchListing(uuid);
    const pdf = await renderInvoicePdf(listing, {
      billTo,
      listingUrl: url.startsWith("http") ? url : undefined,
    });

    const filename = `garage-invoice-${listing.secondaryId}.pdf`;
    return new Response(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(pdf.byteLength),
      },
    });
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
    console.error("invoice route error", err);
    return Response.json(
      { error: "Failed to generate invoice." },
      { status: 500 }
    );
  }
}
