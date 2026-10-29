import RangeBar from './RangeBar.jsx'

// ── helpers ───────────────────────────────────────────────────────────────────

const inr = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n)

const VERDICTS = {
  good_deal: {
    label: '✅ Good Deal',
    bg: 'bg-green-50 border-green-200',
    badge: 'bg-green-100 text-green-800',
    note: 'The asking price is below the fair range. Double-check the car condition carefully — there may be a reason it\'s priced low.',
  },
  fair: {
    label: '✔️ Fair Price',
    bg: 'bg-blue-50 border-blue-200',
    badge: 'bg-blue-100 text-blue-800',
    note: 'The asking price is within the expected range for this type of car.',
  },
  overpriced: {
    label: '⚠️ Overpriced',
    bg: 'bg-red-50 border-red-200',
    badge: 'bg-red-100 text-red-800',
    note: 'The asking price is above the fair range. Consider negotiating or looking at other listings.',
  },
}

// ── component ─────────────────────────────────────────────────────────────────

/**
 * ResultCard — shows prediction output.
 *
 * Props:
 *   result  {object|null}  — API response from /api/predict
 *   asking  {number|null}  — the asking price the user entered
 */
export default function ResultCard({ result, asking }) {
  if (!result) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center text-gray-400">
        <p className="text-4xl mb-2">🚗</p>
        <p className="font-medium">Fill in the car details and click <br /><strong>Check Price</strong></p>
      </div>
    )
  }

  const v = result.verdict ? VERDICTS[result.verdict] : null

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* ── Estimated price ── */}
      <div className="px-6 pt-6 pb-4 bg-gradient-to-br from-blue-50 to-white">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
          Estimated fair price
        </p>
        <p className="text-4xl font-bold text-gray-900">
          {inr(result.estimated_price)}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Likely range: {inr(result.fair_range.low)} – {inr(result.fair_range.high)}
        </p>
      </div>

      <div className="px-6 py-4 space-y-4">
        {/* ── Range bar ── */}
        <RangeBar
          low={result.fair_range.low}
          high={result.fair_range.high}
          estimate={result.estimated_price}
          asking={asking || null}
        />

        {/* ── Verdict card ── */}
        {v && (
          <div className={`rounded-xl border p-4 ${v.bg}`}>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-sm font-bold px-2.5 py-0.5 rounded-full ${v.badge}`}>
                {v.label}
              </span>
              {result.difference_percent !== null && (
                <span className="text-sm font-semibold text-gray-700">
                  {result.difference_percent > 0 ? '+' : ''}
                  {result.difference_percent}% vs estimate
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-600">{v.note}</p>
          </div>
        )}

        {/* ── Asking price (no verdict) ── */}
        {asking && !v && (
          <p className="text-sm text-gray-500">
            Your asking price: {inr(asking)}
          </p>
        )}

        {/* ── Typical error disclaimer ── */}
        <div className="text-xs text-gray-400 bg-gray-50 rounded-lg px-4 py-3 space-y-1">
          <p>
            📏 Typical model error: about ±{inr(result.typical_error_inr)}
          </p>
          <p>
            Based on CarDekho <em>listing</em> prices — final negotiated prices may differ.
          </p>
        </div>
      </div>
    </div>
  )
}

