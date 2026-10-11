/*
 * Hard-coded placeholder content.
 *
 * There is no `news`, `categories` or `modes` table in the schema yet, so the
 * design's News / category / gamemode lists are rendered from the data below.
 * Swap these for API calls once those tables exist.
 */

export interface NewsItem {
  id: string;
  /** Already formatted for display, e.g. "01. Januar 2000" */
  date: string;
  title: string;
  excerpt: string;
}

export interface StatItem {
  label: string;
  value: string | number;
}

export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  threads: number;
}

export interface GameMode {
  id: string;
  name: string;
  description: string;
}

export const NEWS: NewsItem[] = [
  {
    id: "n1",
    date: "01. January 2000",
    title: "Community tournament: Galactic Assault",
    excerpt:
      "Sign-ups are open for the autumn 16-team tournament. Matches start on the 3rd.",
  },
  {
    id: "n2",
    date: "01. December 2000",
    title: "New guide: the best Heroes lineups",
    excerpt:
      "A member has put together an updated guide for Heroes vs Villains.",
  },
  {
    id: "n3",
    date: "01. November 2000",
    title: "Gallery favourites of the week",
    excerpt: "Five community screenshots that earned the most votes this week.",
  },
];

export const FORUM_CATEGORIES: ForumCategory[] = [
  {
    id: "c1",
    name: "General discussion",
    description: "The game, patches and the community",
    threads: 812,
  },
  {
    id: "c2",
    name: "Strategies and tips",
    description: "Class builds, maps and tactics",
    threads: 434,
  },
  {
    id: "c3",
    name: "Bugs and feedback",
    description: "Report bugs, suggest changes",
    threads: 156,
  },
  {
    id: "c4",
    name: "Fan content",
    description: "Art, videos and creative work",
    threads: 298,
  },
  {
    id: "c5",
    name: "Tournaments",
    description: "Organisation, teams and results",
    threads: 72,
  },
];

export const GAME_MODES: GameMode[] = [
  {
    id: "m1",
    name: "Galactic Assault",
    description: "Large 40-player battles across several phases.",
  },
  {
    id: "m2",
    name: "Heroes vs Villains",
    description: "4 against 4 with iconic characters.",
  },
  {
    id: "m3",
    name: "Starfighter Assault",
    description: "Space battles between starfighters and capital ships.",
  },
  {
    id: "m4",
    name: "Instant Action",
    description: "Solo or co-op against the AI, no matchmaking.",
  },
];

/** Tags shown as pills on the forum thread rows. Placeholder only. */
export const THREAD_TAGS = ["guide", "help", "clan", "screenshot"] as const;
