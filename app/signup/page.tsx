"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn, signUp, useSession } from "@/lib/authClient";
import { useUploadThing } from "@/lib/uploadThing";
import { useFilePreview } from "@/lib/useFilePreview";
import Button from "@components/button";
import styles from "@styles/login.module.css";

export default function Signup() {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const { preview, select: selectPreview } = useFilePreview();
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const user = useSession().data?.user;

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onUploadError: (err) => setError(err.message),
  });

  const signup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isUploading) return;

    setError(undefined);

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }
    if (password.length < 8) {
      return setError("Password must be at least 8 characters");
    }

    setIsSubmitting(true);

    try {
      let imageUrl: string | undefined;
      if (file) {
        const uploaded = await startUpload([file]);
        imageUrl = uploaded?.[0]?.ufsUrl;
      }

      const { error: signUpError } = await signUp.email({
        email,
        password,
        name: userName,
        image: imageUrl,
        callbackURL: "/",
      });

      if (signUpError) {
        setError(signUpError.message ?? "Could not create the account");
        setIsSubmitting(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsSubmitting(false);
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

  if (user) {
    return (
      <div className={styles.formPage}>
        <div className={styles.form}>
          <h1 className={styles.heading}>You already have an account</h1>
          <p className={styles.note}>
            Signed in as <strong>{user.name}</strong>.
          </p>
          <Link href="/profile" className={styles.link}>
            Go to your page
          </Link>
        </div>
      </div>
    );
  }

  const busy = isSubmitting || isUploading;

  return (
    <div className={styles.formPage}>
      <form onSubmit={signup} className={styles.form}>
        <h1 className={styles.heading}>Create an account</h1>

        <label className={styles.field}>
          <span>Name</span>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Your name"
            autoComplete="nickname"
            required
          />
        </label>

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
            placeholder="At least 8 characters"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>

        <label className={styles.field}>
          <span>Confirm password</span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat your password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>

        <label className={styles.field}>
          <span>Profile picture (optional)</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const next = e.target.files?.[0] ?? null;
              setFile(next);
              selectPreview(next);
            }}
            className={styles.filebtn}
          />
        </label>

        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Selected profile picture preview"
            width={80}
            height={80}
            className={styles.preview}
          />
        )}

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <Button type="submit" disabled={busy}>
          {isUploading
            ? "Uploading image…"
            : isSubmitting
              ? "Creating account…"
              : "Sign up"}
        </Button>

        <Button variant="quiet" onClick={discord} disabled={busy}>
          Continue with Discord
        </Button>

        <Link href="/login" className={styles.link}>
          Already have an account? Log in
        </Link>
      </form>
    </div>
  );
}