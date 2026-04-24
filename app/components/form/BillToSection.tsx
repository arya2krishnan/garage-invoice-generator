import { US_STATES } from "@/lib/usStates";
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

export function BillToSection({ form, update, disabled }: Props) {
  return (
    <section>
      <h2 className={sectionTitleClass}>Bill To</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="name" className={labelClass}>
            Name
          </label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Springfield Fire Department"
            className={inputClass}
            disabled={disabled}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="line1" className={labelClass}>
            Address line 1
          </label>
          <input
            id="line1"
            type="text"
            value={form.line1}
            onChange={(e) => update("line1", e.target.value)}
            placeholder="1234 Main Street"
            className={inputClass}
            disabled={disabled}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="line2" className={labelClass}>
            Address line 2{" "}
            <span className="text-neutral-400">(optional)</span>
          </label>
          <input
            id="line2"
            type="text"
            value={form.line2}
            onChange={(e) => update("line2", e.target.value)}
            placeholder="Suite 200"
            className={inputClass}
            disabled={disabled}
          />
        </div>
        <div>
          <label htmlFor="city" className={labelClass}>
            City
          </label>
          <input
            id="city"
            type="text"
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
            placeholder="Springfield"
            className={inputClass}
            disabled={disabled}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="state" className={labelClass}>
              State
            </label>
            <select
              id="state"
              value={form.state}
              onChange={(e) => update("state", e.target.value)}
              className={inputClass}
              disabled={disabled}
            >
              <option value="">—</option>
              {US_STATES.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.code}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="zip" className={labelClass}>
              ZIP
            </label>
            <input
              id="zip"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{5}(-[0-9]{4})?"
              value={form.zip}
              onChange={(e) => update("zip", e.target.value)}
              placeholder="62701"
              className={inputClass}
              disabled={disabled}
            />
          </div>
        </div>
      </div>
      <p className="mt-2 text-xs text-neutral-500">
        Providing a ZIP adds estimated freight shipping; providing a state adds
        estimated sales tax.
      </p>
    </section>
  );
}
