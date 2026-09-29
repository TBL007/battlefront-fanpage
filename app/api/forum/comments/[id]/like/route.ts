import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ commentId: string }> },
) {
  const { commentId } = await params;
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db.query(
    "INSERT IGNORE INTO comment_likes (user_id, comment_id) VALUES (?, ?)",
    [session.user.id, commentId],
  );

  return NextResponse.json({ liked: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ commentId: string }> },
) {
  const { commentId } = await params;
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db.query(
    "DELETE FROM comment_likes WHERE user_id = ? AND comment_id = ?",
    [session.user.id, commentId],
  );

  return NextResponse.json({ liked: false });
}
