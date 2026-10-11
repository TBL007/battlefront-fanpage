import type { Metadata } from "next";
import {
  ModeList,
  NewsList,
  SectionHeading,
  StatGrid,
} from "@components/blocks";
import { StatItem } from "../data/placeholder";
import styles from "@styles/about.module.css";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export const metadata: Metadata = {
  title: "About — Frontlinjen",
  description: "What Star Wars Battlefront II is, and what this community is.",
};

const GAME_FACTS: { label: string; value: string }[] = [
  { label: "Released", value: "2017" },
  { label: "Developer", value: "DICE" },
  { label: "Publisher", value: "Electronic Arts" },
  { label: "Platforms", value: "PC, PS4, Xbox One" },
];

export default async function About() {
  async function getUserCount(): Promise<number> {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS count FROM user",
    );
    return rows[0].count;
  }
  async function getPostCount(type: string): Promise<number> {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS count FROM posts where type = ?",
      [type],
    );
    return rows[0].count;
  }

  async function getActiveUserCount(): Promise<number> {
    const [rows] = await db.query<RowDataPacket[]>( // semi active
      "SELECT COUNT(DISTINCT userId) AS count FROM session WHERE expiresAt > NOW()",
    );
    return rows[0].count;
  }

  const COMMUNITY_STATS: Array<StatItem> = [
    { label: "Members", value: await getUserCount() },
    { label: "Forum threads", value: await getPostCount("forum") },
    { label: "Images", value: await getPostCount("gallery") },

    { label: "Active now", value: await getActiveUserCount() },
  ];

  return (
    <div className={styles.page}>
      <p className={styles.eyebrow}>
        <span className={styles.dot} aria-hidden="true" />
        About the game
      </p>

      <h1 className={styles.title}>Star Wars Battlefront II</h1>

      <p className={styles.lede}>
        Battlefront II is a team based shooter by DICE studios, published in
        2017, containing all three eras of the Star Wars universe. You fight as
        infantry, in vehicles, or as iconic heroes and villains.
      </p>

      <StatGrid items={COMMUNITY_STATS} />

      <div className={styles.factList}>
        {GAME_FACTS.map((fact) => (
          <div key={fact.label} className={styles.fact}>
            <span className={styles.factLabel}>{fact.label}</span>
            <span className={styles.factValue}>{fact.value}</span>
          </div>
        ))}
      </div>

      <div id="news">
        <SectionHeading
          title="News"
          actionLabel="All"
          actionHref="/about#news"
        />
        <NewsList />
      </div>

      <SectionHeading title="Game modes" />
      <ModeList />

      <p className={styles.disclaimer}>
        Frontlinjen is a fan project. Star Wars and Battlefront II are
        trademarks of Lucasfilm Ltd. and Electronic Arts Inc.
      </p>
    </div>
  );
}
