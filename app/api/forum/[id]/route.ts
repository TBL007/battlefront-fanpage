import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

import { ResultSetHeader, RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  const { postId } = await params;
  const [posts] = await db.query<RowDataPacket[]>(
    `SELECT p.*,
     (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) AS likes
   FROM posts p
   WHERE p.id = ?`,
    [postId],
  );

  if (!posts[0]) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const [comments] = await db.query<RowDataPacket[]>(
    `SELECT c.*,
     (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c.id) AS likes
   FROM comments c
   WHERE c.post_id = ?`,
    [postId],
  );

  return NextResponse.json({ ...posts[0], comments });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  const { postId } = await params;
  const session = await auth.api.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [result] = await db.execute<ResultSetHeader>(
    "DELETE * FROM posts WHERE id = ? AND user_id = ?",
    [postId, session.user.id],
  );
  if (!result.affectedRows)
    return NextResponse.json(
      { error: `Failed to Delete post ${postId} from user ${session.user.id}` },
      { status: 400 },
    );

  return NextResponse.json({ deleted: postId });
}
