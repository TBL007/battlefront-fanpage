"use client";
import { signOut, useSession } from "@/lib/authClient";

import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "@styles/layout.module.css";
import Link from "next/link";
import { useState } from "react";
import Button from "./button";
export default function Header() {
  const [menu, setMenu] = useState(false);
  const user = useSession().data?.user;
  const [allegiance, setAllegiance] = useState<boolean | undefined>(
    () => user && user.allegiance,
  );

  const router = useRouter();
  const updateAllegiance = async () => {
    if (!user) return;

    try {
      const res = await fetch(`/api/users/${user.id}/allegiance`, {
        method: "POST",
      });

      if (!res.ok) {
        const { error } = await res
          .json()
          .catch(() => ({ error: "Request failed" }));

        if (res.status === 401) {
        }

        console.error(error);
        return;
      }

      setAllegiance((prev) => !prev);
    } catch (err) {
      console.error(err);
    }
  };
  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };
  return (
    <div data-faction={allegiance ? "republic" : "empire"}>
      <div className={`${styles.main} ${styles.header}`}>
        <Link href={"/"}>
          <Image
            src={
              user?.allegiance
                ? "/images/jedi-logo.png"
                : "/images/empire-logo.png"
            }
            width={64}
            height={64}
            alt="faction-image"
          />
        </Link>
        <Button onClick={() => setMenu((prev) => !prev)} surface>
          <Image
            src={"/images/MenuHamburger.svg"}
            width={48}
            height={48}
            alt="menu"
          />
        </Button>
      </div>
      {menu && (
        <ul className={styles.menu}>
          <li>{user?.name}</li>
          {!user && (
            <li>
              <Link href={"/login"} className="">
                Login
              </Link>
            </li>
          )}
          {user && (
            <>
              <li>
                <Button onClick={handleSignOut}>
                  <span className={styles.account}>Signout</span>
                </Button>
              </li>
              <li>
                <button
                  className={styles.facSwitch}
                  onClick={updateAllegiance}
                ></button>
              </li>
            </>
          )}
        </ul>
      )}
    </div>
  );
}
