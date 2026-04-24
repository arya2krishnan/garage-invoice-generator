import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";
import { HowItWorks } from "./components/HowItWorks";
import { InvoiceForm } from "./components/form/InvoiceForm";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
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
        <InvoiceForm />
        <HowItWorks />
      </main>
      <SiteFooter />
    </div>
  );
}
