# Garage Invoice Generator

Paste a [shopgarage.com](https://www.shopgarage.com) listing URL and get a branded PDF invoice ready for your board. Works with any vehicle category — fire trucks, ambulances, equipment.

Built as a take-home assignment.

## Live demo

_Deploy link will go here after `vercel deploy`._

## Run locally

```bash
npm install
cp .env.example .env.local   # optional — only needed for email delivery
npm run dev                  # http://localhost:3000
```

Paste a listing URL like:

- `https://www.shopgarage.com/listing/2025-Toyne-Freightliner-4x4-Pumper-11653dfc-46ea-4c03-9f10-f9f6065909b1`
- `https://www.shopgarage.com/listing/061be6a0-d707-4bb7-b2c4-e6f8056fa783`

A bare UUID works too.

## Environment variables

| Var                | Purpose                                                             | Required?                                                                         |
| ------------------ | ------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `RESEND_API_KEY`   | Send invoices by email via [Resend](https://resend.com) (free tier) | Only for the email button. Downloads work without it.                             |
| `GARAGE_API_TOKEN` | Bearer token for the protected `/shipment/freight/quote` and `/warranty/quote` endpoints | Only for the estimated shipping + warranty line items. Base invoice works without it. |

The demo uses Resend's shared `onboarding@resend.dev` sender — no domain verification needed. For production, verify your own domain and update `SENDER` in `app/api/email-invoice/route.ts`.

## How it works

1. The user pastes a listing URL. The browser POSTs to `/api/invoice`.
2. The route extracts the UUID and fetches two endpoints in parallel:
   - `GET https://garage-backend.onrender.com/listings/<uuid>` — the listing itself (title, price, images, etc.)
   - `GET https://garage-backend.onrender.com/categories/<categoryId>/attributes` — the label+type mapping for this category's spec fields
3. The listing's `ListingAttribute[]` values (keyed by opaque UUIDs like `7d794d55-…`) are decoded through the category-attribute mapping and merged with universal fields (Category, Year, VIN, dimensions, etc.) into a single ordered spec sheet.
4. If the form includes a ZIP code, we also hit `POST /shipment/freight/quote` for a freight estimate. If a warranty duration is selected, we hit `POST /warranty/quote` for a squad/battalion price. Both endpoints require `GARAGE_API_TOKEN`; failures (missing token, 401, etc.) silently skip the line item so the base invoice still generates.
5. `@react-pdf/renderer` generates a two-part PDF: page 1 is the actual invoice (bill-to, meta, line items, totals, terms); page 2+ is the vehicle details — hero image + the decoded spec sheet. Estimated shipping / warranty rows are labeled "Estimated" with a disclaimer in the Terms block.
6. The PDF streams back as `application/pdf` and the browser triggers a download.
7. If an email address is provided, the browser also POSTs to `/api/email-invoice`, which renders the same PDF and sends it as an attachment via Resend.

The invoice is vehicle-type agnostic by construction: every label and value comes from the API. An ambulance shows Mileage, Runs without issue, Has siren system; a fire truck shows Pump size (gpm), Tank size (gal), Engine hours — no per-type special casing in the code.

### Why decode attributes instead of pasting the raw description

Sellers write free-form descriptions (bulleted lists, emoji, marketing copy). Dumping that into an invoice is ugly and inconsistent. Decoding `ListingAttribute[]` gives a structured, comparable spec sheet across every listing — the same information fire departments would read on the website, formatted for print.

## Architecture

```
app/
  page.tsx                    # form UI
  api/
    invoice/route.ts          # POST → streams PDF
    email-invoice/route.ts    # POST → sends PDF via Resend
lib/
  Invoice.tsx                 # @react-pdf/renderer Document (page 1 invoice + page 2 details)
  renderInvoicePdf.tsx        # fans out: hero image + attrs + shipping + warranty → Invoice
  fetchListing.ts             # fetchListing, fetchCategoryAttributes, fetchShippingQuote, fetchWarrantyQuote
  decodeSpecs.ts              # merge universal fields + decoded ListingAttribute[] → ordered spec list
  extractUuid.ts              # URL / bare-UUID → UUID
  parseRequest.ts             # narrow/validate the JSON body for both API routes
  rateLimit.ts                # in-memory IP sliding-window limiter
  types.ts                    # Listing / CategoryAttribute / DecodedSpec / BillTo / Warranty types
```

## Tradeoffs / what I'd change with more time

- **Rate limiting is in-memory** — state is lost on serverless cold starts and isn't shared across instances. Plenty to stop casual abuse of a demo; upgrade to [Upstash Redis + `@upstash/ratelimit`](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview) for real scale.
- **Email sender is shared** — `onboarding@resend.dev` works out-of-the-box but lands in spam for some recipients. Verify a custom domain in Resend for production.
- **Category-attribute mapping fetched per request** — stable metadata that rarely changes; trivial to cache in memory (or with `use cache`) once traffic matters.
- **Hero image only** — one image looks clean; embedding all 70+ bloats the PDF with little added value for procurement.
- **No tests** — the two pieces of actual logic (UUID regex, spec decoder) are small; manual verification with the test listings + error cases is proportionate for a take-home.
- **Raw description dropped** — the free-form seller-written description was too inconsistent to include on a paper invoice. The structured spec sheet covers the same essentials.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- `@react-pdf/renderer` for PDF generation (React component model, no headless browser)
- `resend` for email delivery
- Deployed on Vercel
