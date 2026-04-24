export function SiteHeader() {
  return (
    <header className="border-b border-neutral-200">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/garage-logo.svg" alt="Garage" className="h-6 w-auto" />
          <span className="hidden text-sm text-neutral-500 sm:inline">
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
  );
}
