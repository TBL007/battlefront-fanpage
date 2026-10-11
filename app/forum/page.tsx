"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/authClient";
import { useFaction } from "@components/faction";
import {
  CategoryList,
  EmptyState,
  LoadingBlock,
  SectionHeading,
} from "@components/blocks";
import { PlusIcon } from "@components/icons";
import { formatDate } from "@/lib/format";
import { factionColor } from "@/lib/faction";
import styles from "@styles/forum.module.css";

export default function Forum() {
  const [posts, setPosts] = useState<Global.Post[]>();
  const [failed, setFailed] = useState(false);
  const user = useSession().data?.user;
  const { allegiance } = useFaction();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // `type=forum` keeps gallery entries (same table) out of the forum.
        const res = await fetch("/api/forum?type=forum");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: Global.Post[] = await res.json();
        if (!cancelled) setPosts(json);
      } catch (err) {
        console.error("failed to fetch forum posts", err);
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const heading = allegiance
    ? "Discuss with your fellow republicans and sisters-in-arms"
    : "Discuss with your fellow imperialists, brethren";

  // 3 placeholder pills per thread, mirroring the design.
  const tagFor = (index: number) => ["guide", "help", "clan"][index % 3];

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{heading}</h1>

      <div className={styles.headActions}>
        {user ? (
          <Link href="/forum/create" className={styles.createLink}>
            <PlusIcon size={16} />
            New thread
          </Link>
        ) : (
          <p className={styles.hint}>
            <Link href="/login">Log in</Link> to start a thread &mdash; or join
            via the menu at the top.
          </p>
        )}
      </div>

      <SectionHeading title="Categories" />
      {/* Placeholder rows: there is no categories table yet, so these are
          informational only until category ids are stored on posts. */}
      <CategoryList />

      <SectionHeading title="Recent threads" />

      {failed ? (
        <EmptyState
          title="Could not load the forum"
          hint="Check that the database is reachable and try again."
        />
      ) : !posts ? (
        <LoadingBlock label="Loading threads" />
      ) : posts.length === 0 ? (
        <EmptyState
          title="No threads yet"
          hint={
            user
              ? "Be the first to post something."
              : "Log in to start the first thread."
          }
        />
      ) : (
        <ul className={styles.threadList}>
          <li className={styles.threadHead} aria-hidden="true">
            <span>Thread subject</span>
            <span>Thread author</span>
          </li>

          {posts.map((post, index) => (
            <li key={post.id} className={styles.threadItem}>
              <div className={styles.threadMain}>
                <Link href={`/forum/${post.id}`} className={styles.threadTitle}>
                  {post.title}
                </Link>
                <div className={styles.threadTags}>
                  {[0, 1, 2].map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tagFor(index + tag)}
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.threadMeta}>
                <Link
                  href={`/users/${post.user_id}`}
                  className={styles.threadAuthor}
                  style={{ color: factionColor(post.authorAllegiance) }}
                >
                  {post.authorName}
                </Link>
                <time className={styles.threadDate}>
                  {formatDate(post.created_at)}
                </time>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}