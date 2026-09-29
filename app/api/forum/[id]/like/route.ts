import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  const { postId } = await params;
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db.query(
    "INSERT IGNORE INTO post_likes (user_id, post_id) VALUES (?, ?)",
    [session.user.id, postId],
  );

  return NextResponse.json({ liked: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  const { postId } = await params;
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db.query("DELETE FROM post_likes WHERE user_id = ? AND post_id = ?", [
    session.user.id,
    postId,
  ]);

  return NextResponse.json({ liked: false });
}
