import { WARRANTY_DURATIONS } from "@/lib/types";
import type { InvoiceFormState } from "./client";
import { inputClass, labelClass, sectionTitleClass } from "./styles";

interface Props {
  form: InvoiceFormState;
  update: <K extends keyof InvoiceFormState>(
    k: K,
    v: InvoiceFormState[K]
  ) => void;
  disabled: boolean;
}

export function WarrantySection({ form, update, disabled }: Props) {
  const wantsWarranty = form.warrantyDuration !== "";
  return (
    <section>
      <h2 className={sectionTitleClass}>
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
                e.target.value as InvoiceFormState["warrantyDuration"]
              )
            }
            className={inputClass}
            disabled={disabled}
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
                e.target.value as InvoiceFormState["warrantyTier"]
              )
            }
            className={inputClass}
            disabled={disabled || !wantsWarranty}
          >
            <option value="standard">Standard</option>
            <option value="premium">Premium</option>
          </select>
        </div>
      </div>
    </section>
  );
}
