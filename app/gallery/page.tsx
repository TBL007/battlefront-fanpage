"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/lib/authClient";
import { useUploadThing } from "@/lib/uploadThing";
import { Avatar, EmptyState, LoadingBlock } from "@components/blocks";
import { PlusIcon } from "@components/icons";
import Button from "@components/button";
import { formatRelative } from "@/lib/format";
import { factionColor } from "@/lib/faction";
import styles from "@styles/gallery.module.css";

const MAX_TITLE = 200;

export default function Gallery() {
  const [items, setItems] = useState<Global.Post[]>();
  const [failed, setFailed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string>();
  const user = useSession().data?.user;

  // Kept pure so the initial fetch and the post-upload refresh share it.
  const fetchItems = useCallback(async () => {
    const res = await fetch("/api/forum?type=gallery");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as Global.Post[];
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetchItems()
      .then((next) => {
        if (!cancelled) setItems(next);
      })
      .catch((err) => {
        console.error("failed to load gallery", err);
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [fetchItems]);

  const { startUpload } = useUploadThing("imageUploader", {
    onUploadError: (err) => setError(err.message),
  });

  const upload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem("image") as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || uploading) return;

    setError(undefined);
    setUploading(true);

    // Fall back to the filename so a post always has a usable label.
    const trimmedTitle = title.trim();
    const fallbackTitle = file.name.replace(/\.[^.]+$/, "").slice(0, MAX_TITLE);
    const finalTitle = trimmedTitle || fallbackTitle || "Screenshot";

    try {
      const uploaded = await startUpload([file]);
      const url = uploaded?.[0]?.ufsUrl;
      if (!url) throw new Error("Upload did not return a URL");

      const res = await fetch("/api/forum/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: finalTitle,
          content: trimmedTitle || fallbackTitle || "",
          type: "gallery",
          image: url,
        }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error ?? "Failed to publish image");

      input.value = "";
      setTitle("");
      setItems(await fetchItems());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Gallery</h1>
      <p className={styles.hint}>
        Screenshots from the community. Like and comment on them just like in
        the forum.
      </p>

      {user ? (
        <form className={styles.upload} onSubmit={upload}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Title</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                items?.length
                  ? "e.g. Sunset over Jakku"
                  : "Name this screenshot (optional)"
              }
              maxLength={MAX_TITLE}
              className={styles.titleInput}
            />
          </label>

          <div className={styles.fileRow}>
            <input
              type="file"
              name="image"
              accept="image/*"
              required
              className={styles.file}
              aria-label="Choose a screenshot"
            />
            <Button type="submit" disabled={uploading}>
              <PlusIcon size={16} />
              {uploading ? "Uploading…" : "Upload image"}
            </Button>
          </div>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
        </form>
      ) : (
        <p className={styles.hint}>
          <Link href="/login">Log in</Link> to upload your own screenshots.
        </p>
      )}

      {failed ? (
        <EmptyState
          title="Could not load the gallery"
          hint="Check that the database is reachable and try again."
        />
      ) : !items ? (
        <LoadingBlock label="Loading gallery" />
      ) : items.length === 0 ? (
        <EmptyState
          title="No images yet"
          hint={
            user
              ? "Upload the first screenshot."
              : "Log in to upload the first screenshot."
          }
        />
      ) : (
        <ul className={styles.grid}>
          {items.map((item) => (
            <li key={item.id} className={styles.card}>
              <Link href={`/forum/${item.id}`} className={styles.cardArt}>
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    width={600}
                    height={400}
                    className={styles.cardImage}
                  />
                ) : (
                  <span className={styles.cardPlaceholder} />
                )}
              </Link>

              <div className={styles.cardBody}>
                <p className={styles.cardTitle}>{item.title}</p>
                <div className={styles.cardMeta}>
                  <Link
                    href={`/users/${item.user_id}`}
                    className={styles.cardAuthor}
                    style={{ color: factionColor(item.authorAllegiance) }}
                  >
                    <Avatar
                      src={item.authorImage}
                      name={item.authorName}
                      size={18}
                    />
                    <span>{item.authorName}</span>
                  </Link>
                  <time className={styles.cardDate}>
                    {formatRelative(item.created_at)}
                  </time>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}