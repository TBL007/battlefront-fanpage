"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/authClient";
import { useUploadThing } from "@/lib/uploadThing";
import { useFilePreview } from "@/lib/useFilePreview";
import Button from "@components/button";
import { EmptyState } from "@components/blocks";
import styles from "@styles/create.module.css";

const MAX_TITLE = 200;
const MAX_CONTENT = 5000;

export default function CreatePost() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const user = session?.user;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const { preview, select: selectPreview } = useFilePreview();
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onUploadError: (err) => setError(err.message),
  });

  const onPickFile = (next: File | null) => {
    setFile(next);
    selectPreview(next);
  };

  // Signed-in users only — send everyone else to the login page.
  useEffect(() => {
    if (!isPending && !user) router.replace("/login");
  }, [isPending, user, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || isUploading) return;

    setError(undefined);

    if (!title.trim()) return setError("A title is required.");
    if (!content.trim()) return setError("Write something first.");

    setSubmitting(true);

    try {
      let imageUrl: string | undefined;
      if (file) {
        const uploaded = await startUpload([file]);
        imageUrl = uploaded?.[0]?.ufsUrl;
      }

      const res = await fetch("/api/forum/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          type: "forum",
          image: imageUrl,
        }),
      });

      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        return setError(payload.error ?? "Failed to publish the thread");
      }

      router.push(payload.id ? `/forum/${payload.id}` : "/forum");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isPending && !user) {
    return (
      <EmptyState
        title="You need an account to post"
        hint="Redirecting you to the login page…"
      />
    );
  }

  const busy = submitting || isUploading;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>New thread</h1>

      <form className={styles.form} onSubmit={submit}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="title">
            Title
          </label>
          <input
            id="title"
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What is this thread about?"
            maxLength={MAX_TITLE}
            required
          />
          <span className={styles.counter}>
            {title.length}/{MAX_TITLE}
          </span>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="content">
            Post
          </label>
          <textarea
            id="content"
            className={styles.textarea}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your loadout, a question, or a screenshot from your latest match."
            rows={10}
            maxLength={MAX_CONTENT}
            required
          />
          <span className={styles.counter}>
            {content.length}/{MAX_CONTENT}
          </span>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Screenshot (optional)</span>

          {preview && (
            <Image
              src={preview}
              alt="Selected screenshot preview"
              width={320}
              height={180}
              className={styles.preview}
              unoptimized
            />
          )}

          <input
            type="file"
            accept="image/*"
            className={styles.file}
            onChange={(e) => {
              setError(undefined);
              onPickFile(e.target.files?.[0] ?? null);
            }}
          />
        </div>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <div className={styles.actions}>
          <Button type="submit" disabled={busy}>
            {isUploading
              ? "Uploading image…"
              : submitting
                ? "Publishing…"
                : "Publish thread"}
          </Button>
          <Button variant="quiet" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}