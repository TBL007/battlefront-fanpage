"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { FC } from "react";
import { useSession } from "@/lib/authClient";
import {
  AccountIcon,
  ForumIcon,
  GalleryIcon,
  HomeIcon,
  type IconProps,
} from "./icons";
import styles from "@styles/layout.module.css";

interface NavEntry {
  href: string;
  label: string;
  Icon: FC<IconProps>;
}

export default function Nav() {
  const pathname = usePathname();
  const user = useSession().data?.user;

  const links: NavEntry[] = [
    { href: "/", label: "Home", Icon: HomeIcon },
    { href: "/forum", label: "Forum", Icon: ForumIcon },
    { href: "/gallery", label: "Gallery", Icon: GalleryIcon },
  ];

  if (user) {
    links.push({ href: "/profile", label: "My page", Icon: AccountIcon });
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className={`${styles.bar} ${styles.nav}`} aria-label="Main">
      <ul className={styles.navList}>
        {links.map(({ href, label, Icon }) => {
          const active = isActive(href);
          return (
            <li key={href} className={styles.navItem}>
              <Link
                href={href}
                className={active ? styles.navItemActive : undefined}
                aria-current={active ? "page" : undefined}
                aria-label={label}
                title={label}
              >
                <Icon size={22} />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}