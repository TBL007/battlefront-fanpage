"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "@/lib/authClient";
import UserProfile from "@components/userProfile";
import { LoadingBlock } from "@components/blocks";
import styles from "@styles/profile.module.css";

export default function Profile() {
  const { data: session, isPending } = useSession();
  const user = session?.user;
  const router = useRouter();

  // "My page" is only meaningful when signed in.
  useEffect(() => {
    if (!isPending && !user) router.replace("/login");
  }, [isPending, user, router]);

  if (!user) return <LoadingBlock label="Loading your profile" />;

  return (
    <UserProfile
      userId={user.id}
      ownerPanel={
        <Link href="/forum/create" className={styles.panelLink}>
          Start a new thread
        </Link>
      }
    />
  );
}