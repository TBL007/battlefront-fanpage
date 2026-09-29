import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ResultSetHeader } from "mysql2";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    title?: string;
    content?: string;
    type?: string;
    image?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { title, content, type, image } = body;

  if (
    typeof title !== "string" ||
    title.trim().length === 0 ||
    title.length > 200
  ) {
    return NextResponse.json(
      { error: "Title is required (max 200 chars)" },
      { status: 400 },
    );
  }
  if (typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }
  if (type !== "forum" && type !== "gallery") {
    return NextResponse.json(
      { error: "Type must be 'forum' or 'gallery'" },
      { status: 400 },
    );
  }

  try {
    if (image) {
      const [result] = await db.execute<ResultSetHeader>(
        `INSERT INTO posts (user_id, type, title, content, image) VALUES (?, ?, ?, ?, ? )`,
        [session.user.id, type, title.trim(), content.trim(), image],
      );
      return NextResponse.json({ id: result.insertId }, { status: 201 });
    }

    const [result] = await db.execute<ResultSetHeader>(
      `INSERT INTO posts (user_id, type, title, content) VALUES (?, ?, ?, ? )`,
      [session.user.id, type, title.trim(), content.trim()],
    );

    return NextResponse.json({ id: result.insertId }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 },
    );
  }
}
