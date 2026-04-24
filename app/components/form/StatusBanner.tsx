export type Status =
  | { kind: "idle" }
  | { kind: "working"; message: string }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

export function StatusBanner({ status }: { status: Status }) {
  if (status.kind === "idle") return null;
  if (status.kind === "error") {
    return (
      <p
        role="alert"
        className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
      >
        {status.message}
      </p>
    );
  }
  if (status.kind === "working") {
    return (
      <p className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
        {status.message}
      </p>
    );
  }
  return (
    <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
      ✓ {status.message}
    </p>
  );
}
