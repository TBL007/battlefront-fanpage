import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

import { ResultSetHeader, RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/api/forum/[id]">,
) {
  const { id } = await ctx.params;
  // Explicit headers: calling getSession() bare throws in a route handler.
  const session = await auth.api.getSession({ headers: req.headers });
  const viewerId = session?.user.id ?? null;

  const [posts] = await db.query<RowDataPacket[]>(
    `SELECT p.*,
       u.name       AS authorName,
       u.image      AS authorImage,
       u.allegiance AS authorAllegiance,
       (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) AS likes,
       EXISTS(
         SELECT 1 FROM post_likes pl
         WHERE pl.post_id = p.id AND pl.user_id = ?
       ) AS likedByMe
     FROM posts p
     JOIN user u ON u.id = p.user_id
     WHERE p.id = ?`,
    [viewerId, id],
  );

  if (!posts[0]) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const [comments] = await db.query<RowDataPacket[]>(
    `SELECT c.*,
       u.name       AS authorName,
       u.image      AS authorImage,
       u.allegiance AS authorAllegiance,
       (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c.id) AS likes,
       EXISTS(
         SELECT 1 FROM comment_likes cl
         WHERE cl.comment_id = c.id AND cl.user_id = ?
       ) AS likedByMe
     FROM comments c
     JOIN user u ON u.id = c.user_id
     WHERE c.post_id = ?
     ORDER BY c.created_at ASC`,
    [viewerId, id],
  );

  return NextResponse.json({
    ...posts[0],
    likes: Number(posts[0].likes),
    likedByMe: Boolean(posts[0].likedByMe),
    comments: comments.map((comment) => ({
      ...comment,
      likes: Number(comment.likes),
      likedByMe: Boolean(comment.likedByMe),
    })),
  });
}

export async function DELETE(
  req: NextRequest,
  ctx: RouteContext<"/api/forum/[id]">,
) {
  const { id } = await ctx.params;
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [result] = await db.execute<ResultSetHeader>(
    "DELETE FROM posts WHERE id = ? AND user_id = ?",
    [id, session.user.id],
  );
  if (!result.affectedRows)
    return NextResponse.json(
      { error: `Failed to delete post ${id} for user ${session.user.id}` },
      { status: 400 },
    );

  return NextResponse.json({ deleted: id });
}