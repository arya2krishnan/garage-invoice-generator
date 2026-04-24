export function HowItWorks() {
  return (
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
  );
}
