/** Formatting helpers for the command center. */

export const clamp = (n: number, min = 0, max = 100) =>
  Math.min(max, Math.max(min, n));

export const pct = (n: number) => `${Math.round(clamp(n))}%`;

export const usd = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

/** Truncate a hash/address for display: 0x1234…ABCD */
export const shortHash = (h?: string, lead = 6, tail = 4) => {
  if (!h) return "—";
  if (h.length <= lead + tail + 1) return h;
  return `${h.slice(0, lead)}…${h.slice(-tail)}`;
};

export const relativeTime = (ts: number) => {
  const diff = Date.now() - ts;
  const m = Math.round(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
};

/** Parse "50,000 USDC" → 50000 */
export const parseAmount = (s: string) => {
  const n = Number(s.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
};
