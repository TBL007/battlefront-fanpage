"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { deleteUser, signOut, useSession } from "@/lib/authClient";
import { useFaction } from "./faction";
import Button from "./button";
import { Avatar } from "./blocks";
import { CloseIcon, InfoIcon, MenuIcon } from "./icons";
import styles from "@styles/layout.module.css";

export default function Header() {
  // The drawer stores *which route it was opened on* rather than a boolean, so
  // navigating away closes it without needing an effect to sync the two.
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const user = useSession().data?.user;
  const { allegiance, faction, toggleAllegiance, pending } = useFaction();
  const pathname = usePathname();
  const router = useRouter();

  const open = openedAt === pathname;
  const closeDrawer = () => setOpenedAt(null);
  const toggleDrawer = () => setOpenedAt(pathname);

  // Lock scrolling and allow Escape to dismiss while it is open.
  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          closeDrawer();
          router.push("/");
          router.refresh();
        },
      },
    });
  };

  const handleUserDelete = async () => {
    const confirmation = confirm(
      "Are you sure you want to delete your account? All data will be lost",
    );
    if (!confirmation) return;

    const response = await deleteUser();
    if (!response.data?.success) {
      return alert("account deletion failed");
    }
    handleSignOut();
  };

  const factionName = allegiance ? "Republic" : "Empire";

  return (
    <>
      <header className={`${styles.bar} ${styles.header}`}>
        <Link href="/" className={styles.brand} aria-label="Frontlinjen — home">
          <Image
            src={
              allegiance
                ? "/images/jedi-logo.png"
                : "/images/empire-logo.png"
            }
            alt=""
            width={36}
            height={36}
            className={styles.brandMark}
            priority
          />
        </Link>

        <button
          type="button"
          className={styles.iconButton}
          onClick={toggleDrawer}
          aria-label="Open menu"
          aria-expanded={open}
        >
          <MenuIcon size={22} />
        </button>
      </header>

      {open && (
        <>
          <button
            type="button"
            className={styles.scrim}
            aria-label="Close menu"
            onClick={closeDrawer}
          />

          <div
            className={styles.drawer}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <button
              type="button"
              className={styles.drawerClose}
              onClick={closeDrawer}
              aria-label="Close menu"
            >
              <CloseIcon size={16} />
            </button>

            <p className={styles.drawerLabel}>Account</p>

            {user ? (
              <>
                <Link href="/profile" className={styles.drawerUser}>
                  <Avatar src={user.image} name={user.name} size={36} />
                  <span>
                    <span className={styles.drawerUserName}>{user.name}</span>
                    <br />
                    <span className={styles.drawerUserMeta}>
                      View your profile
                    </span>
                  </span>
                </Link>
                <Button variant="quiet" block onClick={handleSignOut}>
                  Sign out
                </Button>
                <Button variant="quiet" block onClick={handleUserDelete}>
                  Delete account
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" className={styles.drawerNav}>
                  Log in
                </Link>
                <Link href="/signup" className={styles.drawerNav}>
                  Create an account
                </Link>
              </>
            )}

            <p className={styles.drawerLabel}>Faction</p>
            <div className={styles.facRow}>
              <span>{factionName}</span>
              <button
                type="button"
                className={styles.facSwitch}
                data-faction={faction}
                onClick={toggleAllegiance}
                disabled={!user || pending}
                aria-label={
                  user
                    ? `Switch to the ${
                        allegiance ? "Empire" : "Republic"
                      }. You are currently ${factionName}.`
                    : "Log in to pick a faction"
                }
                title={
                  user
                    ? "Switch faction"
                    : "Log in to pick a faction"
                }
              />
            </div>

            <p className={styles.drawerLabel}>Site</p>
            <Link
              href="/about"
              className={`${styles.drawerNav} ${
                pathname === "/about" ? styles.drawerNavCurrent : ""
              }`}
            >
              <InfoIcon size={16} />
              About the game
            </Link>
          </div>
        </>
      )}
    </>
  );
}