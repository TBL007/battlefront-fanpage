"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { signIn, signOut, useSession } from "@/lib/authClient";
import { useUploadThing } from "@/lib/uploadThing";
import { useFaction } from "@components/faction";
import { Avatar, EmptyState, LoadingBlock } from "@components/blocks";
import { DiscordIcon, GalleryIcon, InfoIcon } from "@components/icons";
import Button from "@components/button";
import { formatDate, formatRelative } from "@/lib/format";
import { factionColor, factionName } from "@/lib/faction";
import styles from "@styles/profile.module.css";

interface Props {
  userId: string;
  /** Extra controls rendered when this is the signed-in user */
  ownerPanel?: ReactNode;
}

// See lib/faction.ts for why identity uses the raw faction colours.

export default function UserProfile({ userId, ownerPanel }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const { allegiance, toggleAllegiance, pending } = useFaction();

  const [user, setUser] = useState<Global.PublicUser>();
  const [connections, setConnections] = useState<Global.UserConnections>();
  const [likes, setLikes] = useState<Global.LikedContent>();
  const [notFound, setNotFound] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string>();

  const isOwner = currentUserId === userId;

  const { startUpload } = useUploadThing("imageUploader", {
    onUploadError: (err) => setAvatarError(err.message),
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`/api/users/${userId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: Global.PublicUser = await res.json();
        if (!cancelled) setUser(json);
      } catch (err) {
        console.error("failed to load user", err);
        if (!cancelled) setNotFound(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`/api/users/${userId}/connections`);
        if (!res.ok) return;
        const json: Global.UserConnections = await res.json();
        if (!cancelled) setConnections(json);
      } catch (err) {
        console.error("failed to load connections", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Liked content is only visible to the member it belongs to.
  useEffect(() => {
    if (!isOwner) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`/api/users/${userId}/likes`);
        if (!res.ok) return;
        const json: Global.LikedContent = await res.json();
        if (!cancelled) setLikes(json);
      } catch (err) {
        console.error("failed to load likes", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOwner, userId]);

  const changeAvatar = async (file: File) => {
    if (uploading || !isOwner) return;

    setAvatarError(undefined);
    setUploading(true);

    try {
      const uploaded = await startUpload([file]);
      const url = uploaded?.[0]?.ufsUrl;
      if (!url) throw new Error("Upload did not return a URL");

      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: url }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error ?? "Failed to save picture");

      setUser((prev) => (prev ? { ...prev, image: url } : prev));

      // Refresh so the header/nav pick up the new picture too.
      router.refresh();
    } catch (err) {
      setAvatarError(
        err instanceof Error ? err.message : "Something went wrong",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSignOut = useCallback(async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          router.refresh();
        },
      },
    });
  }, [router]);

  if (notFound) {
    return (
      <EmptyState
        title="Member not found"
        hint="This account may have been deleted."
      />
    );
  }

  if (!user) return <LoadingBlock label="Loading profile" />;

  const color = factionColor(user.allegiance);
  const likedPosts = likes?.likedPosts ?? [];
  const likedComments = likes?.likedComments ?? [];
  const discordLinked = connections?.discord ?? false;
  const galleryCount = user.posts.filter(
    (post) => post.type === "gallery",
  ).length;

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div className={styles.avatarWrap} style={{ borderColor: color }}>
          <Avatar src={user.image} name={user.name} size={64} />

          {isOwner && (
            // A <label> wrapping the avatar makes the picture itself the
            // file-picker trigger, so you click the image to change it.
            <label
              className={styles.avatarOverlay}
              title={uploading ? "Uploading…" : "Change profile picture"}
            >
              <GalleryIcon size={18} />
              <input
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void changeAvatar(file);
                  // Reset so picking the same file twice still fires.
                  e.target.value = "";
                }}
              />
            </label>
          )}
        </div>

        <div className={styles.identity}>
          <h1 className={styles.name} style={{ color }}>
            {user.name}
          </h1>
          <p className={styles.sub}>
            Member since {formatDate(user.createdAt)}
          </p>
          <div className={styles.badges}>
            <span
              className={styles.facBadge}
              style={{ color, borderColor: color }}
            >
              {factionName(user.allegiance)}
            </span>

            {/* Discord profile link — only when the member connected one. */}
            {connections?.discord && connections.discordUserId && (
              <a
                className={styles.discordChip}
                href={`https://discord.com/users/${encodeURIComponent(connections.discordUserId)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open this member's Discord profile"
                title="Open Discord profile"
              >
                <DiscordIcon size={15} />
              </a>
            )}
          </div>
        </div>

        {isOwner && avatarError && (
          <p className={styles.panelError} role="alert">
            {avatarError}
          </p>
        )}
      </header>

      <dl className={styles.stats}>
        <div className={styles.stat}>
          <dd className={styles.statValue}>{user.posts.length}</dd>
          <dt className={styles.statLabel}>Posts</dt>
        </div>
        <div className={styles.stat}>
          <dd className={styles.statValue}>{user.comments.length}</dd>
          <dt className={styles.statLabel}>Replies</dt>
        </div>
        <div className={styles.stat}>
          <dd className={styles.statValue}>
            {isOwner ? likedPosts.length + likedComments.length : galleryCount}
          </dd>
          <dt className={styles.statLabel}>{isOwner ? "Liked" : "Images"}</dt>
        </div>
      </dl>

      {isOwner && (
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Your account</h2>

          <div className={styles.facRow}>
            <span>
              You are playing as the{" "}
              <strong style={{ color: factionColor(allegiance) }}>
                {factionName(allegiance)}
              </strong>
            </span>
            <Button
              variant="quiet"
              onClick={toggleAllegiance}
              disabled={pending}
            >
              {pending ? "Saving…" : "Switch"}
            </Button>
          </div>

          {/* Discord linking */}
          {connections ? (
            discordLinked ? (
              <p className={styles.connected}>
                <InfoIcon size={16} />
                Discord linked to this account
              </p>
            ) : (
              <Button
                variant="quiet"
                onClick={() =>
                  signIn.social({
                    provider: "discord",
                    fetchOptions: {
                      onSuccess: () => {
                        router.refresh();
                      },
                    },
                  })
                }
              >
                <DiscordIcon size={16} />
                Link your Discord account
              </Button>
            )
          ) : (
            <LoadingBlock label="Checking connections" />
          )}

          <Button variant="quiet" onClick={handleSignOut}>
            Sign out
          </Button>

          {ownerPanel}
        </section>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Posts</h2>

        {user.posts.length === 0 ? (
          <EmptyState
            title="No posts yet"
            hint={
              isOwner ? (
                <>
                  Start a <Link href="/forum/create">new thread</Link>.
                </>
              ) : (
                "This member has not posted anything yet."
              )
            }
          />
        ) : (
          <ul className={styles.feed}>
            {user.posts.map((post) => (
              <li key={post.id} className={styles.feedItem}>
                <span className={styles.feedKind}>
                  {post.type === "gallery" ? (
                    <>
                      <GalleryIcon size={12} /> Image
                    </>
                  ) : (
                    "Thread"
                  )}
                </span>
                <time className={styles.feedDate}>
                  {formatRelative(post.created_at)}
                </time>
                <Link href={`/forum/${post.id}`} className={styles.feedLink}>
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          {isOwner ? "Liked posts" : "Replies"}
        </h2>

        {isOwner ? (
          likedPosts.length === 0 ? (
            <EmptyState
              title="Nothing liked yet"
              hint="Threads you like will show up here."
            />
          ) : (
            <ul className={styles.feed}>
              {likedPosts.map((post) => (
                <li key={post.id} className={styles.feedItem}>
                  <time className={styles.feedDate}>
                    {formatRelative(post.likedAt)}
                  </time>
                  <Link href={`/forum/${post.id}`} className={styles.feedLink}>
                    {post.title}
                  </Link>
                </li>
              ))}
            </ul>
          )
        ) : user.comments.length === 0 ? (
          <EmptyState
            title="No replies yet"
            hint="This member has not replied to anything yet."
          />
        ) : (
          <ul className={styles.feed}>
            {user.comments.map((comment) => (
              <li key={comment.id} className={styles.feedItem}>
                <time className={styles.feedDate}>
                  {formatRelative(comment.created_at)}
                </time>
                <Link
                  href={`/forum/${comment.post_id}`}
                  className={styles.feedLink}
                >
                  {comment.content}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
