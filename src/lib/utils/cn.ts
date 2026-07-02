/** Minimal className combiner — joins truthy class fragments.
 *  (No clsx/tailwind-merge dependency; we don't have conflicting utilities.) */
export type ClassValue = string | number | false | null | undefined;

export function cn(...parts: ClassValue[]): string {
  return parts.filter(Boolean).join(" ");
}
