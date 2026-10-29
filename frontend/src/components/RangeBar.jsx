/**
 * RangeBar — visual horizontal bar showing the fair price range.
 *
 * Props:
 *   low        {number} — lower bound of fair range
 *   high       {number} — upper bound
 *   estimate   {number} — model's point estimate (always inside the bar)
 *   asking     {number|null} — seller's asking price (optional marker)
 */

// Format as ₹X.XL or ₹X,XX,XXX
function shortInr(n) {
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`
  return `₹${n.toLocaleString('en-IN')}`
}

export default function RangeBar({ low, high, estimate, asking }) {
  const span = high - low || 1

  const pct = (val) => Math.max(0, Math.min(100, ((val - low) / span) * 100))

  const estPct    = pct(estimate)
  const askPct    = asking != null ? pct(asking) : null

  // Determine asking marker colour
  let askColour = 'bg-gray-600'
  if (asking != null) {
    if (asking > high)      askColour = 'bg-red-500'
    else if (asking < low)  askColour = 'bg-green-500'
    else                    askColour = 'bg-blue-500'
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">Fair price range</p>

      {/* ── bar ── */}
      <div className="relative h-4 rounded-full bg-blue-100 overflow-visible">
        {/* range fill */}
        <div className="absolute inset-0 rounded-full bg-blue-200" />

        {/* estimate dot */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-md z-20"
          style={{ left: `${estPct}%` }}
          title={`Estimate: ${shortInr(estimate)}`}
        />

        {/* asking price marker */}
        {askPct != null && (
          <div
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-6 rounded-sm ${askColour} opacity-80 z-10`}
            style={{ left: `${askPct}%` }}
            title={`Asking: ${shortInr(asking)}`}
          />
        )}
      </div>

      {/* ── labels ── */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>{shortInr(low)}</span>
        <span className="text-blue-700 font-medium">◉ {shortInr(estimate)}</span>
        <span>{shortInr(high)}</span>
      </div>

      {asking != null && (
        <p className="text-xs text-gray-500">
          <span className={`inline-block w-2 h-2 rounded-sm mr-1 ${askColour}`} />
          Asking price: {shortInr(asking)}
        </p>
      )}
    </div>
  )
}

