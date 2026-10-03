"use client";

import { signIn, signUp } from "@/lib/authClient";
import { signUpEmail } from "better-auth/api";
import { useState } from "react";
import { useUploadThing } from "@/lib/uploadThing";
import Link from "next/link";
import styles from "@styles/login.module.css";
import Button from "../components/button";
import { useRouter } from "next/navigation";

export default function signup() {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFile(file);
  };

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      console.log("Upload done:", res);
    },
    onUploadError: (error) => {
      alert(`Upload ERROR! ${error.message}`);
    },
  });

  const signup = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let imageUrl: string | undefined;

      if (file) {
        const uploaded = await startUpload([file]);
        imageUrl = uploaded?.[0]?.ufsUrl;
      }

      if (password !== confirmPassword) return alert("Passwords do not match");
      if (password.length < 8) return alert("Password is not long enough");
      const { data, error } = await signUp.email(
        {
          email,
          password,
          name: userName,
          image: imageUrl,
          callbackURL: "/",
        },
        {
          onSuccess: () => {
            router.push("/");
            router.refresh();
          },
        },
      );
    } catch (err) {
      console.error(err);
      alert("Signup failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  signUpEmail();
  return (
    <div className={styles.formPage}>
      <form onSubmit={signup} className={styles.form}>
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="John Doe"
        />
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
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="confirm password"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className={styles.filebtn}
        />
        {file && (
          <img
            src={URL.createObjectURL(file)}
            alt="Preview"
            width={80}
            height={80}
          />
        )}
        <Button type="submit" disabled={isSubmitting || isUploading}>
          {isUploading
            ? "Uploading image..."
            : isSubmitting
              ? "Signing up..."
              : "Sign up"}
        </Button>
        <Button
          onClick={() =>
            signIn.social({
              provider: "discord",
              fetchOptions: {
                onSuccess: () => {
                  router.push("/");
                  router.refresh();
                },
              },
            })
          }
        >
          Discord
        </Button>
        <Link href="/login" className={styles.link}>
          Login
        </Link>
      </form>
    </div>
  );
}
