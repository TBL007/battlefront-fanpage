const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * Formats a timestamp the way the design does: "01. Januar 2000".
 * Falls back to an em dash when the value is missing or unparseable.
 */
export function formatDate(value?: string | number | null): string {
  if (value === undefined || value === null || value === "") return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const day = String(date.getDate()).padStart(2, "0");
  const month = MONTHS[date.getMonth()];
  return `${day}. ${month} ${date.getFullYear()}`;
}

/** Compact relative time for activity feeds: "2 hours ago". */
export function formatRelative(value?: string | number | null): string {
  if (value === undefined || value === null || value === "") return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["week", 60 * 60 * 24 * 7],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
  ];

  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  for (const [unit, secondsPerUnit] of units) {
    if (Math.abs(seconds) >= secondsPerUnit) {
      return formatter.format(-Math.round(seconds / secondsPerUnit), unit);
    }
  }

  return "just now";
}

/** "4 128" — thin space as the thousands separator, matching the design. */
export function formatCount(value: number): string {
  return value.toLocaleString("en-US").replace(/,/g, "\u2009");
}