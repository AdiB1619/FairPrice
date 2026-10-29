/**
 * API client — all fetch calls go through here.
 * Set VITE_API_URL in .env.local for production; dev uses the Vite proxy.
 */
const BASE = import.meta.env.VITE_API_URL ?? '';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const err = await res.json();
      if (Array.isArray(err.detail)) {
        detail = err.detail.map(e => e.msg || JSON.stringify(e)).join('; ');
      } else if (typeof err.detail === 'string') {
        detail = err.detail;
      }
    } catch { /* keep the default message */ }
    throw new Error(detail);
  }

  return res.json();
}

export const getOptions = ()     => request('/api/options');
export const getMetrics = ()     => request('/api/metrics');
export const predictPrice = (body) =>
  request('/api/predict', { method: 'POST', body: JSON.stringify(body) });

