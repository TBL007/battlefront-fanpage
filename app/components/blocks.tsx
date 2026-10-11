import Image from "next/image";
import Link from "next/link";
import { FC, type ReactNode } from "react";
import { AccountIcon } from "./icons";
import styles from "@styles/blocks.module.css";
import {
  FORUM_CATEGORIES,
  GAME_MODES,
  NEWS,
  type ForumCategory,
  type GameMode,
  type NewsItem,
  type StatItem,
} from "@/app/data/placeholder";

// functions for small reusable blocks

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: number;
}

const initials = (name?: string | null) =>
  (name ?? "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

export const Avatar: FC<AvatarProps> = ({ src, name, size = 40 }) => (
  <span
    className={styles.avatar}
    style={{ width: size, height: size, flexShrink: 0 }}
  >
    {src ? (
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        className={styles.avatarImg}
      />
    ) : (
      <AccountIcon size={Math.round(size * 0.55)} />
    )}
    <span className={styles.srOnly}>{initials(name)}</span>
  </span>
);

interface SectionHeadingProps {
  title: string;
  actionLabel?: string;
  actionHref?: string;
}

export const SectionHeading: FC<SectionHeadingProps> = ({
  title,
  actionLabel,
  actionHref,
}) => (
  <div className={styles.sectionHead}>
    <h2 className={styles.sectionTitle}>{title}</h2>
    {actionLabel && actionHref && (
      <Link href={actionHref} className={styles.sectionAction}>
        {actionLabel}
      </Link>
    )}
  </div>
);

export const StatGrid: FC<{ items?: StatItem[] }> = ({ items }) => {
  if (!items?.length) return;
  return (
    <dl className={styles.statGrid}>
      {items.map((item) => (
        <div key={item.label} className={styles.statCell}>
          <dt className={styles.statLabel}>{item.label}</dt>
          <dd className={styles.statValue}>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
};

export const NewsList: FC<{ items?: NewsItem[] }> = ({ items = NEWS }) => (
  <ul className={styles.newsList}>
    {items.map((item) => (
      <li key={item.id} className={styles.newsCard}>
        <time className={styles.newsDate}>{item.date}</time>
        <h3 className={styles.newsTitle}>{item.title}</h3>
        <p className={styles.newsExcerpt}>{item.excerpt}</p>
      </li>
    ))}
  </ul>
);

export const ModeList: FC<{ items?: GameMode[] }> = ({
  items = GAME_MODES,
}) => (
  <ul className={styles.modeList}>
    {items.map((mode) => (
      <li key={mode.id} className={styles.modeRow}>
        <span className={styles.modeName}>{mode.name}</span>
        <span className={styles.modeDesc}>{mode.description}</span>
      </li>
    ))}
  </ul>
);

export const CategoryList: FC<{
  items?: ForumCategory[];
  onSelect?: (category: ForumCategory) => void;
}> = ({ items = FORUM_CATEGORIES, onSelect }) => (
  <ul className={styles.categoryList}>
    {items.map((category) => {
      const body = (
        <>
          <span className={styles.categoryIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M11.4697 2.46967C11.7626 2.17678 12.2374 2.17678 12.5303 2.46967L19.5303 9.46967C19.671 9.61032 19.75 9.80109 19.75 10V21C19.75 21.4142 19.4142 21.75 19 21.75H14C13.5858 21.75 13.25 21.4142 13.25 21V16.75H10.75V21C10.75 21.75 10.4142 21.75 10 21.75H5C4.58579 21.75 4.25 21.4142 4.25 21V10C4.25 9.80109 4.32902 9.61032 4.46967 9.46967L11.4697 2.46967ZM5.75 10.3107V20.25H9.25V16C9.25 15.5858 9.58579 15.25 10 15.25H14C14.4142 15.25 14.75 15.5858 14.75 16V20.25H18.25V10.3107L12 4.06066L5.75 10.3107Z" />
            </svg>
          </span>
          <span className={styles.categoryMain}>
            <span className={styles.categoryName}>{category.name}</span>
            <span className={styles.categoryDesc}>{category.description}</span>
          </span>
          <span className={styles.categoryCount}>
            <span className={styles.categoryNum}>{category.threads}</span>
            <span className={styles.categoryUnit}>Threads</span>
          </span>
        </>
      );

      return (
        <li key={category.id} className={styles.categoryItem}>
          {onSelect ? (
            <button
              type="button"
              className={styles.categoryButton}
              onClick={() => onSelect(category)}
            >
              {body}
            </button>
          ) : (
            <div className={styles.categoryButton}>{body}</div>
          )}
        </li>
      );
    })}
  </ul>
);

export const EmptyState: FC<{ title: string; hint?: ReactNode }> = ({
  title,
  hint,
}) => (
  <div className={styles.empty}>
    <p className={styles.emptyTitle}>{title}</p>
    {hint && <p className={styles.emptyHint}>{hint}</p>}
  </div>
);

export const LoadingBlock: FC<{ label?: string }> = ({ label = "Loading" }) => (
  <div className={styles.empty}>
    <p className={styles.emptyHint}>{label}…</p>
  </div>
);
