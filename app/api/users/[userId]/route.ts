import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT image,name,socials,createdAt,allegiance FROM user WHERE id = ?",
    [userId],
  );

  const [posts] = await db.query<RowDataPacket[]>(
    "SELECT * FROM posts WHERE userId = ?",
    [userId],
  );
  const [comments] = await db.query<RowDataPacket[]>(
    "SELECT * FROM comments WHERE userId = ?",
    [userId],
  );

  if (rows.length === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const user = rows[0];
  return NextResponse.json({
    name: user.name,
    image: user.image,
    socials: user.socials,
    createdAt: user.createdAt,
    allegiance: user.allegiance,
    posts: posts,
    comments: comments,
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 400 });
  }

  const [result] = await db.execute<ResultSetHeader>(
    "DELETE * FROM user WHERE id = ?",
    [userId],
  );
  if (!result.affectedRows)
    return NextResponse.json(
      { error: `Failed to Delete user ${userId}` },
      { status: 400 },
    );
  return NextResponse.json({ deleted: userId });
}
