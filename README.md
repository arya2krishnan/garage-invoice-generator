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

| Var              | Purpose                                                        | Required?                     |
| ---------------- | -------------------------------------------------------------- | ----------------------------- |
| `RESEND_API_KEY` | Send invoices by email via [Resend](https://resend.com) (free tier) | Only for the email button. Downloads work without it. |

The demo uses Resend's shared `onboarding@resend.dev` sender — no domain verification needed. For production, verify your own domain and update `SENDER` in `app/api/email-invoice/route.ts`.

## How it works

1. The user pastes a listing URL. The browser POSTs to `/api/invoice`.
2. The route extracts the UUID, fetches the listing from `https://garage-backend.onrender.com/listings/<uuid>`, and renders a PDF with `@react-pdf/renderer`.
3. The PDF streams back as `application/pdf`; the browser triggers a download.
4. If an email address is provided, the browser also POSTs to `/api/email-invoice`, which renders the same PDF and sends it as an attachment via Resend.

The invoice is vehicle-type agnostic: the `listingTitle` and `category.name` fields flow through untouched, so an ambulance listing renders an ambulance invoice with no special casing.

## Architecture

```
app/
  page.tsx                    # form UI
  api/
    invoice/route.ts          # POST → streams PDF
    email-invoice/route.ts    # POST → sends PDF via Resend
lib/
  Invoice.tsx                 # @react-pdf/renderer Document
  renderInvoicePdf.tsx        # shared render helper (fetches hero image + resizes)
  fetchListing.ts             # typed wrapper around Garage's listing API
  extractUuid.ts              # URL / bare-UUID → UUID
  rateLimit.ts                # in-memory IP sliding-window limiter
  types.ts                    # Listing types
```

## Tradeoffs / what I'd change with more time

- **Rate limiting is in-memory** — state is lost on serverless cold starts and isn't shared across instances. Plenty to stop casual abuse of a demo; upgrade to [Upstash Redis + `@upstash/ratelimit`](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview) for real scale.
- **Email sender is shared** — `onboarding@resend.dev` works out-of-the-box but lands in spam for some recipients. Verify a custom domain in Resend for production.
- **No listing-attribute decoding** — the API's `ListingAttribute[]` values are keyed by opaque UUIDs (e.g. "pump GPM: 1500"). Resolving would need a second endpoint or a cached mapping. The invoice renders the essentials (title, category, price, description, brand, year, VIN) without it.
- **Hero image only** — one image looks clean; embedding all 70+ bloats the PDF with little added value for procurement.
- **No tests** — the two pieces of actual logic (UUID regex, sliding-window limiter) are small; manual verification with the test listings + error cases is proportionate for a take-home.
- **Description truncation at ~1400 chars** — prevents multi-page overflow on verbose listings. Full description is always available via the listing URL printed in the footer.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- `@react-pdf/renderer` for PDF generation (React component model, no headless browser)
- `resend` for email delivery
- Deployed on Vercel
