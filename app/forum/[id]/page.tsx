"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "@/lib/authClient";
import { Avatar, EmptyState, LoadingBlock } from "@components/blocks";
import { ThumbUpIcon } from "@components/icons";
import Button from "@components/button";
import { formatDate } from "@/lib/format";
import { factionColor } from "@/lib/faction";
import styles from "@styles/post.module.css";

type CommentNode = Global.Comment & { replies: CommentNode[] };

/** Turns the flat comment list into the tree the `comment_id` column implies. */
function buildTree(comments: Global.Comment[]): CommentNode[] {
  const nodes = new Map<string, CommentNode>();
  comments.forEach((comment) =>
    nodes.set(comment.id, { ...comment, replies: [] }),
  );

  const roots: CommentNode[] = [];
  nodes.forEach((node) => {
    const parent = node.comment_id ? nodes.get(node.comment_id) : undefined;
    if (parent) parent.replies.push(node);
    else roots.push(node);
  });

  return roots;
}

/**
 * Like / unlike control.
 *
 * There is no dislike table in the schema, so this deliberately only ever sends
 * POST (like) or DELETE (unlike) — never anything else.
 *
 * The optimistic state is seeded from the props and never synced back to them;
 * callers pass a `key` derived from the server values instead, so a refetch
 * remounts the control with the correct numbers.
 */
function LikeButton({
  liked,
  count,
  disabled,
  disabledReason,
  onToggle,
  label,
}: {
  liked: boolean;
  count: number;
  disabled: boolean;
  disabledReason: string;
  onToggle: (next: boolean) => Promise<void>;
  label: string;
}) {
  const [optimisticLiked, setOptimisticLiked] = useState(liked);
  const [optimisticCount, setOptimisticCount] = useState(count);
  const [pending, setPending] = useState(false);

  const toggle = async () => {
    if (disabled || pending) return;

    const next = !optimisticLiked;
    setOptimisticLiked(next);
    setOptimisticCount((value) => value + (next ? 1 : -1));
    setPending(true);

    try {
      await onToggle(next);
    } catch {
      setOptimisticLiked(!next); // roll back to the server's truth
      setOptimisticCount((value) => value + (next ? -1 : 1));
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      className={`${styles.react} ${optimisticLiked ? styles.reactActive : ""}`}
      onClick={toggle}
      disabled={disabled || pending}
      aria-pressed={optimisticLiked}
      aria-label={
        optimisticLiked ? `Remove like from ${label}` : `Like ${label}`
      }
      title={disabled ? disabledReason : optimisticLiked ? "Unlike" : "Like"}
    >
      <ThumbUpIcon size={16} />
      <span className={styles.reactCount}>{optimisticCount}</span>
    </button>
  );
}

function CommentRow({
  comment,
  onToggleLike,
}: {
  comment: CommentNode;
  onToggleLike: (comment: Global.Comment, liked: boolean) => Promise<void>;
}) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const isOwn = currentUserId === comment.user_id;
  const canLike = Boolean(currentUserId) && !isOwn;

  return (
    <li className={styles.commentItem}>
      <article className={styles.comment}>
        <header className={styles.commentHead}>
          <Link
            href={`/users/${comment.user_id}`}
            className={styles.commentAuthor}
          >
            <Avatar
              src={comment.authorImage}
              name={comment.authorName}
              size={32}
            />
            <span
              className={styles.commentName}
              style={{ color: factionColor(comment.authorAllegiance) }}
            >
              {comment.authorName}
            </span>
          </Link>
          <time className={styles.commentDate}>
            {formatDate(comment.created_at)}
          </time>
        </header>

        <p className={styles.commentBody}>{comment.content}</p>

        <div className={styles.commentActions}>
          <LikeButton
            key={`${comment.id}-${comment.likedByMe ? 1 : 0}-${comment.likes ?? 0}`}
            liked={comment.likedByMe ?? false}
            count={comment.likes ?? 0}
            disabled={!canLike}
            disabledReason={
              isOwn ? "You cannot like your own comment" : "Log in to like"
            }
            label="comment"
            onToggle={(next) => onToggleLike(comment, next)}
          />
        </div>
      </article>

      {comment.replies.length > 0 && (
        <ul className={styles.commentChildren}>
          {comment.replies.map((reply) => (
            <CommentRow
              key={reply.id}
              comment={reply}
              onToggleLike={onToggleLike}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function PostPage(props: PageProps<"/forum/[id]">) {
  const router = useRouter();
  const params = props.params;

  const [post, setPost] = useState<Global.PostWithComments>();
  const [notFound, setNotFound] = useState(false);
  const [reply, setReply] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const load = useCallback(async () => {
    const { id } = await params;
    const res = await fetch(`/api/forum/${id}`);

    if (res.status === 404) throw new Error("not-found");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    return (await res.json()) as Global.PostWithComments;
  }, [params]);

  useEffect(() => {
    let cancelled = false;

    load()
      .then((data) => {
        if (!cancelled) setPost(data);
      })
      .catch((err) => {
        console.error("failed to load post", err);
        if (!cancelled) setNotFound(true);
      });

    return () => {
      cancelled = true;
    };
  }, [load]);

  const commentTree = useMemo(
    () => (post ? buildTree(post.comments ?? []) : []),
    [post],
  );

  const toggleCommentLike = useCallback(
    async (comment: Global.Comment, liked: boolean) => {
      const res = await fetch(`/api/forum/comments/${comment.id}/like`, {
        method: liked ? "POST" : "DELETE",
      });
      if (!res.ok) throw new Error("Failed to update like");
    },
    [],
  );

  const togglePostLike = useCallback(
    async (liked: boolean) => {
      if (!post) return;
      const res = await fetch(`/api/forum/${post.id}/like`, {
        method: liked ? "POST" : "DELETE",
      });
      if (!res.ok) throw new Error("Failed to update like");
    },
    [post],
  );

  const submitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !reply.trim() || submitting) return;

    setSubmitting(true);
    setError(undefined);

    try {
      const res = await fetch("/api/forum/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id, content: reply.trim() }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload.error ?? "Failed to post comment");
      }

      setReply("");
      setPost(await load()); // pull the thread again so it lands in place
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const removePost = async () => {
    if (!post) return;
    if (!confirm("Delete this thread? This cannot be undone.")) return;

    const res = await fetch(`/api/forum/${post.id}`, { method: "DELETE" });
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({}));
      return alert(error ?? "Failed to delete thread");
    }
    router.push("/forum");
  };

  if (notFound) {
    return (
      <EmptyState
        title="Thread not found"
        hint="It may have been deleted. Head back to the forum."
      />
    );
  }

  if (!post) return <LoadingBlock label="Loading thread" />;

  const isAuthor = currentUserId === post.user_id;
  const canLikePost = Boolean(currentUserId) && !isAuthor;

  return (
    <div className={styles.page}>
      <article className={styles.post}>
        <header className={styles.postHead}>
          <Link href={`/users/${post.user_id}`} className={styles.postAuthor}>
            <Avatar
              src={post.authorImage}
              name={post.authorName}
              size={32}
            />
            <span
              className={styles.postAuthorName}
              style={{ color: factionColor(post.authorAllegiance) }}
            >
              {post.authorName}
            </span>
          </Link>
          <time className={styles.postDate}>
            {formatDate(post.created_at)}
          </time>
        </header>

        <h1 className={styles.postTitle}>{post.title}</h1>
        {post.content && <p className={styles.postBody}>{post.content}</p>}

        {post.image_url && (
          <Image
            src={post.image_url}
            alt=""
            width={1200}
            height={800}
            className={styles.postImage}
          />
        )}

        <div className={styles.postActions}>
          <LikeButton
            key={`${post.id}-${post.likedByMe ? 1 : 0}-${post.likes ?? 0}`}
            liked={post.likedByMe ?? false}
            count={post.likes ?? 0}
            disabled={!canLikePost}
            disabledReason={
              isAuthor ? "You cannot like your own thread" : "Log in to like"
            }
            label="thread"
            onToggle={togglePostLike}
          />

          {isAuthor && (
            <Button variant="quiet" onClick={removePost}>
              Delete thread
            </Button>
          )}
        </div>
      </article>

      <section className={styles.comments}>
        <h2 className={styles.commentsTitle}>
          {post.comments?.length ?? 0}{" "}
          {post.comments?.length === 1 ? "reply" : "replies"}
        </h2>

        {commentTree.length === 0 ? (
          <EmptyState title="No replies yet" hint="Be the first to respond." />
        ) : (
          <ul className={styles.commentList}>
            {commentTree.map((comment) => (
              <CommentRow
                key={comment.id}
                comment={comment}
                onToggleLike={toggleCommentLike}
              />
            ))}
          </ul>
        )}

        {currentUserId ? (
          <form className={styles.replyForm} onSubmit={submitReply}>
            <label className={styles.replyLabel} htmlFor="reply">
              Add a reply
            </label>
            <textarea
              id="reply"
              className={styles.replyInput}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Share your thoughts"
              rows={4}
              maxLength={2000}
            />
            {error && <p className={styles.error}>{error}</p>}
            <Button type="submit" disabled={submitting || !reply.trim()}>
              {submitting ? "Posting…" : "Post reply"}
            </Button>
          </form>
        ) : (
          <p className={styles.signInPrompt}>
            <Link href="/login">Log in</Link> to join the discussion.
          </p>
        )}
      </section>
    </div>
  );
}