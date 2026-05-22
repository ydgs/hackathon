/**
 * Lightweight classNames / cn helper.
 * Joins truthy string arguments — no external dependency needed.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
