/**
 * Faction colours for *identity* (usernames, avatar rings, faction badges).
 *
 * These deliberately use the raw faction colours rather than `--primary` /
 * `--accent`, which swap depending on which side the viewer is on. That swap
 * exists so a member's own controls always read in their own colour, but using
 * it for identity produced contradictions: on an Empire-themed page the header
 * logo was red while the member's name and "Empire" badge came out teal — the
 * same faction in two colours on one screen.
 *
 * Using the raw colours also matches the Figma, where the Empire author's name
 * is red on an Empire-themed page.
 *
 * `--primary` / `--accent` remain correct for buttons, active nav items and
 * anything else that represents the *viewer*.
 */
export function factionColor(allegiance: boolean | number | null | undefined) {
  return allegiance ? "var(--rebel)" : "var(--empire)";
}

export function factionName(allegiance: boolean | number | null | undefined) {
  return allegiance ? "Republic" : "Empire";
}