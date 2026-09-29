"use client";

import { useSession } from "@/lib/authClient";
import Image from "next/image";

import Link from "next/link";
import styles from "@styles/layout.module.css";
export default function Nav() {
  const user = useSession()?.data?.user;
  const links = [
    { href: "/", image: "/images/home.svg" },
    { href: "/forum", image: "/images/forum.svg" },
    { href: "/gallery", image: "/images/gallery.svg" },
    { href: "/profile", image: user?.image ?? "/images/account.svg" },
  ];

  return (
    <div className={`${styles.main} ${styles.nav}`}>
      {links.map((link) => (
        <Link href={link.href} key={link.href}>
          <Image
            src={link.image}
            width={48}
            height={48}
            alt={"nav-image-" + link.href}
          />
        </Link>
      ))}
    </div>
  );
}
