"use client";

import { signIn } from "@/lib/authClient";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "@/lib/authClient";
import styles from "@styles/login.module.css";
import Button from "@components/button";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const user = useSession().data?.user;

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setError(undefined);
    setSubmitting(true);

    const { error: signInError } = await signIn.email({
      email,
      password,
      rememberMe: remember,
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          router.refresh();
        },
      },
    });

    if (signInError) {
      setError("Wrong email or password");
      setSubmitting(false);
    }
  };

  const discord = () =>
    signIn.social({
      provider: "discord",
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          router.refresh();
        },
      },
    });

  return (
    <div className={styles.formPage}>
      {user ? (
        <div className={styles.form}>
          <h1 className={styles.heading}>You are signed in</h1>
          <p className={styles.note}>
            Signed in as <strong>{user.name}</strong>.
          </p>
          <Link href="/profile" className={styles.link}>
            Go to your page
          </Link>
          <Button variant="quiet" block onClick={() => router.push("/")}>
            Back to the forum
          </Button>
        </div>
      ) : (
        <form onSubmit={login} className={styles.form}>
          <h1 className={styles.heading}>Log in</h1>

          <label className={styles.field}>
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label className={styles.field}>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              autoComplete="current-password"
              required
            />
          </label>

          <span className={styles.aligner}>
            <input
              type="checkbox"
              id="remember"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <label htmlFor="remember">Keep me signed in</label>
          </span>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <Button type="submit" disabled={submitting}>
            {submitting ? "Logging in…" : "Log in"}
          </Button>

          <Button variant="quiet" onClick={discord} disabled={submitting}>
            Continue with Discord
          </Button>

          <Link href="/signup" className={styles.link}>
            Create an account
          </Link>
        </form>
      )}
    </div>
  );
}