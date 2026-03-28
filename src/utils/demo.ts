/** Demo mode helpers — masks sensitive data for demo users */

export const MASKED = "••••";
export const MASKED_CURRENCY = "—";
export const MASKED_NAME = "Fan #XXX";

export function isDemoUser(role?: string): boolean {
  return role === "demo";
}

export function maskCurrency(value: string | number, role?: string): string {
  if (!isDemoUser(role)) return typeof value === "number" ? value.toString() : value;
  return MASKED_CURRENCY;
}

export function maskName(name: string, role?: string): string {
  if (!isDemoUser(role)) return name;
  if (!name) return name;
  return `Fan #${name.slice(0, 3).toUpperCase()}`;
}

export function maskScore(score: string | number, role?: string): string {
  if (!isDemoUser(role)) return typeof score === "number" ? score.toString() : score;
  return MASKED;
}
