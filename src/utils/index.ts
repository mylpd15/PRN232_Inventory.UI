/**
 * Converts a date string (with or without time) to 'M/D/YYYY' format.
 * Example: '2025-07-20T01:28:47.04+07:00' or '7/20/2025, 1:28:47 AM' => '7/20/2025'
 */
export function formatDateOnly(dateStr: string | Date): string {
  const date = new Date(dateStr);
  // getMonth() is zero-based, so add 1
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}
