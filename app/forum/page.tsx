"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "@styles/forum.module.css";
import Link from "next/link";
export default function Forum() {
  const [posts, setPosts] = useState<Array<Global.Post>>();
  useEffect(() => {
    const fetchForum = async () => {
      try {
        const result = await fetch("/api/forum");
        if (!result.ok) {
          console.error("failed to fetch forum posts");
        }
        const json = await result.json();
        console.log(json);
        setPosts(json);
      } catch (err) {
        console.error(err);
      }
    };
    fetchForum();
    console.log(posts);
  }, []);
  const createPost = async () => {
    try {
      const res = await fetch("/api/forum/create", {
        method: "POST",
        body: JSON.stringify({
          title: "test",
          content: "this is a test post",
          type: "forum",
        }),
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
      console.log("posted");
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div>
      {posts?.map((post) => (
        <article key={post.id} className={styles.post}>
          <div className={styles.postHeader}>
            <Link href={`/forum/${post.id}`} className={styles.postLink}>
              {post.title}
            </Link>
            <Link
              href={`/users/${post.user_id}`}
              className={styles.author}
              style={{
                color: post.authorAllegiance
                  ? "var(--primary)"
                  : "var(--accent)",
              }}
            >
              {post.authorName}
            </Link>
          </div>
          <p>{post.content}</p>
        </article>
      ))}
    </div>
  );
}
