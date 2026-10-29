/**
 * Field — a labelled form control (input, select, or textarea).
 *
 * Props:
 *   label        {string}   — visible label
 *   id           {string}   — ties label to input; also used as name
 *   type         {string}   — "text" | "number" | "select" (default "text")
 *   options      {string[]} — required when type === "select"
 *   hint         {string}   — small helper text below the field
 *   required     {bool}
 *   ...rest      — passed through to <input> or <select>
 */
export default function Field({ label, id, type = 'text', options = [], hint, required, ...rest }) {
  const base =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm ' +
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ' +
    'bg-white disabled:bg-gray-100 disabled:cursor-not-allowed transition';

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>

      {type === 'select' ? (
        <select id={id} name={id} required={required} className={base} {...rest}>
          <option value="">Select…</option>
          {options.map(o => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      ) : (
        <input id={id} name={id} type={type} required={required} className={base} {...rest} />
      )}

      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  )
}

