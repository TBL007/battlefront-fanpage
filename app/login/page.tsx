"use client";

import { signIn } from "@/lib/authClient";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useState } from "react";
import styles from "@styles/login.module.css";
import Button from "@components/button";
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const router = useRouter();
  const login = (e: any) => {
    e.preventDefault();
    signIn.email({
      email: email,
      password: password,
      fetchOptions: {
        onSuccess: () => {
          router.push("/"); // redirect to login page
        },
      },
    });
  };
  return (
    <div className={styles.formPage}>
      <form onSubmit={login} className={styles.form}>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="JohnDoe@gmail.com"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
        />

        <Button type="submit">Login</Button>
        <span className={styles.aligner}>
          <input
            type="checkbox"
            id="remember"
            checked={remember}
            onChange={(e) => setRemember(!remember)}
          />
          <label htmlFor="remember"> Remember me</label>
        </span>
        <Link href="/signup" className={styles.link}>
          Sign up
        </Link>
      </form>
    </div>
  );
}
