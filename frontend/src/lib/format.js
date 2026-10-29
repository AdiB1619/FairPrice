/**
 * Indian Rupee (INR) and numerical formatting utilities.
 * Uses standard en-IN locale conventions.
 */

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('en-IN');

/**
 * Full INR currency string: e.g. 485000 -> "₹4,85,000"
 */
export function formatInr(num) {
  if (num === null || num === undefined || isNaN(num)) return '—';
  return inrFormatter.format(Math.round(num));
}

/**
 * Short Indian currency string for concise badges and charts.
 * e.g.
 *   75000   -> "₹75,000"
 *   485000  -> "₹4.85 L"
 *   12000000 -> "₹1.20 Cr"
 */
export function formatInrShort(num, precision = 2) {
  if (num === null || num === undefined || isNaN(num)) return '—';
  const val = Number(num);
  const abs = Math.abs(val);
  const sign = val < 0 ? '-' : '';

  if (abs >= 1_00_00_000) {
    const cr = (abs / 1_00_00_000).toFixed(precision);
    return `${sign}₹${cr} Cr`;
  }
  if (abs >= 1_00_000) {
    const lk = (abs / 1_00_000).toFixed(precision);
    return `${sign}₹${lk} L`;
  }
  return formatInr(val);
}

/**
 * Formats plain numbers with Indian grouping commas (e.g. 45000 -> "45,000")
 */
export function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return '—';
  return numberFormatter.format(num);
}

/**
 * Formats percentage difference with +/- prefix: e.g. 7.2 -> "+7.2%"
 */
export function formatPercentDiff(diff) {
  if (diff === null || diff === undefined || isNaN(diff)) return null;
  const prefix = diff > 0 ? '+' : '';
  return `${prefix}${Number(diff).toFixed(1)}%`;
}

