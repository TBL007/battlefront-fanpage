import Image from "next/image";
import Link from "next/link";
import splash from "@/public/images/splash.jpeg";
import { NewsList, SectionHeading, StatGrid } from "@components/blocks";
import styles from "@styles/home.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroArt}>
          <Image
            src={splash}
            alt="A Star Wars capital ship above a planet"
            fill
            priority
            sizes="(max-width: 560px) 100vw, 560px"
            className={styles.heroImage}
          />
          <p className={styles.heroWordmark}>Star Wars Battlefront II</p>
        </div>

        <div className={styles.heroBody}>
          <p className={styles.eyebrow}>
            The Frontline &mdash; for players, by players
          </p>
          <h1 className={styles.title}>
            Your base for
            <br />
            Battlefront 2
          </h1>
          <p className={styles.lede}>
            Discuss strategies, share screenshots, and find people to play with.
            No official connection to EA or DICE.
          </p>
          <div className={styles.actions}>
            <Link href="/forum" className={styles.solidCta}>
              Join our forum
            </Link>
            <Link href="/gallery" className={styles.outlineCta}>
              Gallery
            </Link>
          </div>
        </div>
      </section>

      <StatGrid />

      <SectionHeading title="News" actionLabel="All" actionHref="/about#news" />
      <NewsList />
    </div>
  );
}
