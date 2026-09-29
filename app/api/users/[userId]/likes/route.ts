import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;
  const session = await auth.api.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 400 });
  }

  const [likedPosts] = await db.query<RowDataPacket[]>(
    `SELECT p.*, pl.created_at AS likedAt
     FROM post_likes pl
     JOIN posts p ON p.id = pl.post_id
     WHERE pl.user_id = ?
     ORDER BY pl.created_at DESC`,
    [userId],
  );

  const [likedComments] = await db.query<RowDataPacket[]>(
    `SELECT c.*, cl.created_at AS likedAt
     FROM comment_likes cl
     JOIN comments c ON c.id = cl.comment_id
     WHERE cl.user_id = ?
     ORDER BY cl.created_at DESC`,
    [userId],
  );

  return NextResponse.json({ likedPosts, likedComments });
}
